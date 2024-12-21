// routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Middleware
const checkNotAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? res.redirect("/") : next();

// Login and Registration
router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account/login",
    failureFlash: true,
  })
);

router.post("/register", checkNotAuthenticated, async (req, res) => {
  const { name, email, password, gender } = req.body;
  try {
    if (await User.findOne({ email })) {
      req.flash("error", "User with this email already exists.");
      return res.redirect("/register");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword, gender }).save();
    res.redirect("/account/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "Error during registration.");
    res.redirect("/register");
  }
});

// Logout
router.delete("/logout", (req, res, next) =>
  req.logOut((err) => (err ? next(err) : res.redirect("/")))
);

module.exports = router;