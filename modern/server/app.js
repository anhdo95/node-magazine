const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const uuidv4 = require('uuid/v4')

const graphqlHttp = require('./graphql')
const { MONGODB_URI } = require('./secret/config')

const app = express()

app.use(bodyParser.json())
app.use(
	multer({
		storage: multer.diskStorage({
			destination(req, file, cb) {
				cb(null, 'images')
			},
			filename(req, file, cb) {
				cb(null, `${uuidv4()}-${file.originalname}`)
			},
		}),
		fileFilter(req, file, cb) {
			const allowedExtensions = ['image/png', 'image/jpg', 'image/jpeg']

			cb(null, allowedExtensions.includes(file.mimetype))
		},
	}).single('image')
)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  next()
})

app.use('/graphql', graphqlHttp)

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
