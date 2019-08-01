const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const { rootDir } = require('./util/path')
const sequelize = require('./util/database')

const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const { get404 } = require('./controllers/error')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user
      next()
    })
    .catch(console.error)
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(get404)

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })

const getUser = (user) => {
  return user || User.create({
    name: "Richard",
    email: "admin@gmail.com"
  })
}

const getCart = (user) => {
  return user
    .getCart()
    .then(cart => {
      return cart || user.createCart({
        userId: user.id
      })
    })
    .catch(console.error)
}

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => User.findByPk(1))
  .then(getUser)
  .then(getCart)
  .then(() => app.listen(9000))
  .catch(console.error);

