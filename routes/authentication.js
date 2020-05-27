const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db  = promise.promisifyAll(require('../db'));
const bcrypt = require('bcryptjs');
const passport = require('passport');

// As per the HTML5 Specification
const emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


routes.get('/',(req,res)=> {
    res.render('register');
});

routes.get('/login',(req,res)=>{
    res.render('login');
})

routes.post('/register', (req,res)=>{
    let {username,password,confirmPassword,email} = req.body;
    let err = null;
    if(!username || !password || !confirmPassword || !email) {
        err  = 'kindly fill all details'
        res.render('register',{'err': err});
    }
    if(err===null && !emailRegExp.test(email)){
        err = 'please enter the correct email address';
        res.render('register',{'err':err});
    }
    if(err===null && password !==  confirmPassword) {
        err = 'password do not matches'
        res.render('register',{'err':err,'username':username,'email':email});
    }
    if(err === null) {
        db.queryAsync("SELECT name FROM atithi WHERE name = $1",[username])
        .then(function(result) {
            if(result.rows.length != 0){
                err = "User already exist try sign in instead";
                res.render('register',{'err':err});
            }
            else{
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        db.queryAsync("INSERT INTO atithi(name,email,password) VALUES($1,$2,$3)",[username,email,password])
                        .then(function() {
                            req.flash('success_message','Registered successfully... Login to continue..')
                            res.redirect('/login');
                        })
                        .catch(function(err){
                            console.log(err);
                        })
                    });
                });
            }
        })
        .catch(function(err) {
            console.log(err);
        })
    }
})



routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect: '/login',
        successRedirect: '/home',
        failureFlash: true,
    })(req,res,next);
})

routes.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
})


routes.get('/home', (req,res)=>{
    console.log(req.user);
    res.render('home',{'user':req.user});
})

module.exports = routes;
