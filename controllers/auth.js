const bcrypt = require("bcryptjs");
const User = require("../models/user");

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
      .then(() => res.redirect("/login"));
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};
