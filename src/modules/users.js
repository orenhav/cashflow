const { default: mongoose } = require('mongoose')
const bcrypt = require('bcryptjs')
const validatoe = require('validator');
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

});

userSchema.methods.toJSON =  function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, "gthisismysecret")
    user.tokens = user.tokens.concat({ token })
    user.save();
    return token
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }


    next()
})


const User = mongoose.model("User", userSchema)



const login = async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken();
        res.send({ user  , token })
    } catch (error) {
        res.status(400).send(error.message)
    }
}

const allUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(400).send()
    }
}


const getUser = async (req, res) => {

    try {
        const user = req.user

        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(400).send()
    }
}

const me = async (req, res) => {
    res.send(req.user)
}
const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token

        })
        
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(401).send(error.message)
    }

}
const logoutAll = async (req, res) => {
    try {
        req.user.tokens =  []
        
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(401).send(error.message)
    }

}
const createUser = async (req, res) => {

    try {

        const user = new User(req.body)
        await user.save();
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const updateUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404).send()
        }
        const params = Object.keys(req.body)
        params.forEach(param => {
            user[param] = req.body[param]

        });
        // console.log(user)
        await user.save();

        res.status(200).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
}


const deleteUser = async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        user.deleteOne()
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error.message)
    }
}





module.exports = {
    User,
    me,
    allUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    login,
    logout,
    logoutAll
}
