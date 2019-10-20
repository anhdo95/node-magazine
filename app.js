const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const { rootDir } = require('./util/path')
const { mongoConnect } = require('./util/database')

const User = require('./models/user')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const { get404 } = require('./controllers/error')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
  User.findById('5dab2a2c031aad318c0853d0')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id)
      next()
    })
    .catch(console.error)
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(get404)

mongoConnect(() => {
  app.listen(3000)
})