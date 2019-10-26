const express = require("express");
const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    check("email", "Please enter a valid email")
      .isEmail()
      .custom((email, { req }) => {
        return User.findOne({ email }).then(user => {
          if (!user) {
            return Promise.reject("Email and password are invalid");
          }

          return bcrypt
            .compare(req.body.password, user.password)
            .then(doMatch => {
              if (!doMatch) {
                return Promise.reject("Email and password are invalid");
              }
              req.user = user
            });
        });
      })
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email", "Please enter a valid email")
      .isEmail()
      .custom((email, { req }) => {
        return User.findOne({ email }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already, please pick a different one."
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post("/logout", isAuth, authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
