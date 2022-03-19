const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const validatoe = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

/**
 * Clean user before outout
 * @returns
 */
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

/**
 * generate auth token
 * @returns token
 */
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id.toString() }, "gthisismysecret");
  user.tokens = user.tokens.concat({ token });
  user.save();
  return token;
};

/**
 * Search user be username and passowrd
 * @param {*} username
 * @param {*} password
 * @returns  user
 */
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

/**
 * hash password before save
 */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
