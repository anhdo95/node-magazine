const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const { rootDir } = require('./util/path')
const { mongooseConnect } = require('./util/database')
const { MONGODB_URI } = require('./util/constant')

const User = require('./models/user')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const { get404 } = require('./controllers/error')

const app = express()
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(rootDir, 'public')))
app.use(session({
  secret: 'My secret',
  resave: false,
  saveUninitialized: false,
  store
}))
app.use((req, res, next) => {
  if (!req.session.user) return next()


  User.findById(req.session.user._id)
  .then(user => {
      req.user = user
      next()
    })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(get404)

mongooseConnect(() => {
  User.findOne()
    .then(user => {
      if (!user) {
        new User({
          name: 'Richard Do',
          email: 'richarddo@test.com',
          cart: {
            items: []
          }
        }).save()
      }
    })

  app.listen(3000)
})