const express = require('express')
const app = express()
const shortid = require('shortid')


//--------Morgan Logger --------------------
const morgan = require('morgan')
//app.use(morgan('combined'))

//--------Body Parser ----------------------
const bodyParser = require("body-parser")
// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
	extended: true
}))

//--------Serve static resource -------------

app.use('/public', express.static('public'))

//--------Server Index ----------------------
const serveIndex = require('serve-index')
const index = serveIndex('public', {'icons': true})

app.use('/public', index)

//---------View Template Engine -------------
const nunjucks = require('nunjucks')
nunjucks.configure('views', {
	autoescape: true,
	cache: false,
	express: app,
	watch: true
})
app.engine('html', nunjucks.render)
app.set('view engine', 'html')

//-----------------CSurf --------------------
const csrf = require('csurf')

const csrfProtection = csrf({ cookie: true })



//-----------------UPLOAD --------------------
const multer = require('multer')
//app.upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, shortid.generate() + '-' + file.originalname)
		//cb(null, file.originalname)
	}
})

function fileFilter(req, file, cb) {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true)
	} else {
		cb(new Error(file.mimetype + ' is not accepted'))
	}
}

app.upload = multer({storage: storage, fileFilter: fileFilter})
//------------ Custom Middleware --------------

//Demo a simple middle ware
const myLogger = function (req, res, next) {
	console.log('LOGGED')
	next()
}

app.use(myLogger)
// myLogger must be placed before router

//------------Response Time--------------------
const responseTime = require('response-time')
app.use(responseTime(function (req, res, time) {
	console.log(time, req.url)
}))


//------------Set up router --------------------
require('./router')(app)


const server = app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
})


//------------Error Handling Middleware----------
app.use(function (err, req, res, next) {
	console.error(err.stack)
	res.status(500).send('Error: ' + err.message)
})

module.exports = server