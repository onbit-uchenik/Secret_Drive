const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');   
const promise = require('bluebird');
const db = promise.promisifyAll(require('./db'));
const logger = require('morgan');
const authentication = require('./routes/authentication');
const addon = require('./build/Release/addon.node');
const passport = require('passport');
const strategy = require('./strategy');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const config = require('./config');
const createNewTeam = require('./routes/createNewTeam');



const app = express();
const server = http.createServer(app); 
const io = socketio(server);           

const port = process.env.PORT || 3456;

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser(config.cookie.secret));
app.use(session({
	secret : config.session.secret,
    maxAge : 3600000,
    resave : true,
    saveUninitialized : true,
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//setting the passport local strategy..

strategy.x(passport);

app.use(express.static(path.join(__dirname,'/public/css')));
app.use(express.static(path.join(__dirname,'/public/js')))

app.use(function(req,res,next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})

const checkAuthenticated  = function(req,res,next) {
    if(req.isAuthenticated()) {
        res.set('Cache-control','no-cache, private, no-store, must-revalidate, post-check=0,pre-check=0');
        return next();
    }
    else {
        res.redirect('/login');
    }
}


app.get('/',authentication);
app.get('/login',authentication);
app.post('/register',authentication);
app.post('/login',authentication);
app.get('/home',checkAuthenticated,authentication);
app.get('/createNewTeam',checkAuthenticated,createNewTeam);
app.post('/createNewTeam',checkAuthenticated,createNewTeam);
app.get('/logout',checkAuthenticated,authentication);

server.on('close', () => {
	console.log('Closed express server')

	db.pool.end(() => {
		console.log('Shut down connection pool')
	})
})

console.log(`Server started at http://localhost:${port}/`);
server.listen(port);
