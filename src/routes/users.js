const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../modules/users");

router.route("/login").post(async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.route("logout").post(auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.route("/logoutAll").post(auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.route("/").get(auth, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send();
  }
});

router.route("/me").get(auth, async (req, res) => {
  res.send(req.user);
});

router.route("/").post(async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.route("/me").patch(auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).send();
    }
    const params = Object.keys(req.body);
    params.forEach((param) => {
      user[param] = req.body[param];
    });
    // console.log(user)
    await user.save();

    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.route("/").delete(auth, async (req, res) => {
  try {
    const user = req.user;
    user.deleteOne();
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
