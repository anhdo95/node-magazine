const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const feedRoutes = require('./routes/feed')
const { MONGODB_URI } = require('./secret/config')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  next()
})

app.use('/feed', feedRoutes)

app.use((error, req, res, next) => {
  console.log(error)

  const { statusCode = 500, message, errors = [] } = error

  return res.status(statusCode).json({
    message, errors
  })
})

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(8080)
  })
  .catch(console.log)
