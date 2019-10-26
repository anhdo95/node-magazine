const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const User = require("../models/user");
// const { SENDGRID_API_KEY }  = require('../util/constant');

const hoursToMilliseconds = hours => {
  return hours * 60 * 60 * 1000;
};

const mailer = nodemailer.createTransport(
  sgTransport({
    auth: {
      // api_key: SENDGRID_API_KEY
    }
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    error: undefined,
    input: {
      email: '',
      password: ''
    }
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    error: undefined,
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      input: {
        email: req.body.email,
        password: req.body.password,
      },
      error: errors.array()[0]
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = req.user;
  return req.session.save(err => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      error: errors.array()[0]
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      return new User({
        email,
        password: hashedPassword
      }).save();
    })
    .then(() => {
      res.redirect("/login");

      const options = {
        to: email,
        from: "shop@node-complete.com", // From your configured senders
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>"
      };

      return mailer.sendMail(options);
    })
    .catch(error => {
      error = new Error(error)
      error.httpStatusCode = 500
      next(error)
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error")
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.error(error);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email })
      .then(user => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + hoursToMilliseconds(2);
        return user.save();
      })
      .then(() => {
        res.redirect("/");

        const options = {
          to: email,
          from: "shop@node-complete.com",
          subject: "Reset Password",
          html: `
            <p>You requested a password reset</p>
            <p>
              Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password
            </p>
          `
        };

        console.log("options :", options);

        return mailer.sendMail(options);
      })
      .catch(console.error);
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token: resetToken } = req.params;

  User.findOne({
    resetToken,
    resetTokenExpiration: { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      return res.redirect("/login");
    }

    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Update A New Password",
      userId: user._id,
      passwordToken: resetToken
    });
  });
};

exports.postNewPassword = (req, res, next) => {
  const { userId, passwordToken, newPassword } = req.body;
  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        return res.redirect("/login");
      }

      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashPassword => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      if (result) {
        return res.redirect("/login");
      }
    })
    .catch(console.error);
};
