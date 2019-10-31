const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const uuidv4 = require('uuid/v4')

const graphqlHttp = require('./graphql')
const auth = require('./middleware/auth')
const exception = require('./exception')
const fileHelper = require('./util/file')

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

	if (req.method === 'OPTIONS') {
		return res.sendStatus(200)
	}

	next()
})

app.use(auth)

app.put('/post-image', (req, res, next) => {
	if (!req.isAuth) {
		throw exception.unauthenticated('Not Authenticated.')
	}

	if (!req.file) {
		return res.status(200).json({ message: 'No image provided' })
	}

	if (req.body.oldFilePath) {
		fileHelper.deleteFile(fileHelper.resolve(req.body.oldFilePath))
	}

	return res
		.status(201)
		.json({ message: 'File uploaded', filePath: req.file.path.replace('\\', '/') })
})

app.use('/graphql', graphqlHttp)

app.use((error, req, res, next) => {
	console.log(error)

	const { statusCode = 500, message, errors = [] } = error

	return res.status(statusCode).json({
		message,
		errors,
	})
})

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-complete-1dj8a.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		app.listen(process.env.PORT || 8080)
	})
  .catch(console.log)

