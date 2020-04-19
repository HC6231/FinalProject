//express set up
const express = require('express');
const app = express();
const path = require('path');
const publicPath = path.resolve(__dirname,'../');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
//db setup 
require('./db')

//passport config
require('./passport_config')(passport);


const mongoose = require('mongoose');
const loginInfo = mongoose.model('userLogin');

//bycrypt setup
const bcrypt = require('bcrypt');


app.set('view engine', 'hbs');
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret key',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/',function(req,res){
    console.log('Up and running')
    res.render('login');
})

app.post('/',function (req, res, next) {
    passport.authenticate('local',{
        successRedirect:'/main',
        failureRedirect:'/',
        failureFlash: true})
        (req,res,next);
});


app.get('/register',function(req,res){
    res.render('register');
});

// Done
app.post('/register',function(req,res){
    checkExist(req.body.userName, result=>{
        if(result){
            req.flash('info','User Existed');
            res.render('register',{message: req.flash('info')});           
        }
        if(!result){
            if(req.body.userName == '' || req.body.userPsd ==''){
                req.flash('info','Something is missing');
                res.render('register',{message: req.flash('info')});
            }
            else if(req.body.userPsd != req.body.confirmPsd){
                req.flash('info',"Password doesn't match, please confirm.")
                res.render('register',{message: req.flash('info')});
            }
            else{
                const hashedPassword = bcrypt.hashSync(req.body.userPsd,10);
                saveRegInfo(req.body.userName,hashedPassword);
                res.redirect('main');
            }
        }
    })
});

app.get('/main',function(req,res){
    res.render('main');
});


app.get('/mydiary',function(req,res){
    res.send('This page is for the main function of the project');
});

function checkExist(query, cb){
    loginInfo.findOne({email: query}, function(err,user){
        if(user !== null){
            cb(true);
        }
        else{
            cb(false);
        }
    })
}

async function saveRegInfo(email, password){
    const insert = new loginInfo({
        email: email,
        password: password
    })
    insert.save(function(err){
        if(err)(console.log(err));
    })
}


let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}
app.listen(port)