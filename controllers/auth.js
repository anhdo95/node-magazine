const User = require('../models/user')

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn
  })
}

exports.postLogin = (req, res) => {
  User.findById('5dabf325aec3177108e89716')
    .then(user => {
      req.session.isLoggedIn = true
      req.session.user = user
      req.session.save(error => {
        error && console.error(error);
        res.redirect('/')
      })
    })
    .catch(console.error)
}

exports.postLogout = (req, res) => {
  req.session.destroy(error => {
    if (error) {
      return console.error(error);
    }
    res.redirect('/login')
  })
}