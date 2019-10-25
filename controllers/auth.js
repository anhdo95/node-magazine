const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')

const mailer = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: 'YOUR_SENDGRID_API_KEY'
  }
}));

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: req.flash('error')
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash('error')
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Email and password are invalid')
        res.redirect("/login");
      }

      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect("/");
            });
          }
          res.redirect("/login")
        })
        .catch(console.error)
    })
    .catch(err => {
      console.log(err)
      res.redirect("/login");
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email }).then(userDoc => {
    if (userDoc) {
      req.flash('error', 'Email exists already, please pick a different one.')
      return res.redirect("/signup");
    }

    return bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        return new User({
          email,
          password: hashedPassword
        }).save();
      })
      .then(() => {
        res.redirect("/login")

        const options = {
          to: email,
          from: 'shop@node-complete.com', // From your configured senders
          subject: 'Signup succeeded!',
          html: '<h1>You successfully signed up!</h1>'
        };

        return mailer.sendMail(options)
      })
      .catch(console.error)
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};
