const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const { rootDir } = require('./util/path')
const { mongooseConnect } = require('./util/database')

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
  User.findById('5dabf325aec3177108e89716')
    .then(user => {
      req.user = user
      next()
    })
    .catch(console.error)
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

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