//express set up
const express = require('express');
const app = express();
const path = require('path');
const publicPath = path.resolve(__dirname, '../');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
//DB START HERE
require('./db')

//Passport Strategy Set Up
require('./passport_config')(passport);

//Import Models
const loginInfo = mongoose.model('userLogin');
const userDiary = mongoose.model('Diary');

//avoid method confusion
mongoose.set('useFindAndModify', false);

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


//route handler
app.get('/', function (req, res) {
    res.render('login');
})

app.post('/', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/main',
        failureRedirect: '/',
        failureFlash: true
    })
        (req, res, next);
});


app.get('/register', function (req, res) {
    res.render('register');
});


app.post('/register', function (req, res) {
    checkExist(req.body.userName, result => {
        if (result) {
            req.flash('info', 'User Existed');
            res.render('register', { message: req.flash('info') });
        }
        if (!result) {
            if (req.body.userName == '' || req.body.userPsd == '') {
                req.flash('info', 'Something is missing');
                res.render('register', { message: req.flash('info') });
            }
            else if (req.body.userPsd != req.body.confirmPsd) {
                req.flash('info', "Password doesn't match, please confirm.")
                res.render('register', { message: req.flash('info') });
            }
            else {
                const hashedPassword = bcrypt.hashSync(req.body.userPsd, 10);
                saveRegInfo(req.body.userName, hashedPassword);
                res.redirect('/main');
            }
        }
    })
});


app.get('/main', checkAuthenticated, function (req, res) {
    res.render('main');
});


app.post('/main', async function (req, res) {
    const today = getToday();
    //console.log(today);
    const userInput = JSON.stringify(req.body);
    const inputObj = JSON.parse(userInput);
    inputObj.date = today;
    const user = req.user;
    //push saved diary into user information via objID
    const savedDiary = await saveDiary(inputObj.date, inputObj.subject, inputObj.context, user._id);
    const updatedUser = await loginInfo.findOneAndUpdate({ _id: savedDiary.user }, { $push: { diary: savedDiary._id } });
    req.flash('info', 'User Existed');
    res.redirect('/main');
});


app.get('/record', checkAuthenticated, async function (req, res) {
    // const userInfo = await loginInfo.find();
    // console.log("This is the user info");
    // console.log(req.user.diary);
    const record = req.user.diary;
    const allRecord = await userDiary.find({ _id: { $in: record } });
    console.log({ allRecord });
    res.render('record', { allRecord });
});

app.post('/delete',async function(req,res){
    console.log(req.body.recordID);
    const deleteID = req.body.recordID;
    userDiary.findOneAndRemove({_id:deleteID},function(err){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send();
    });
    loginInfo.update({$pull:{'diary':deleteID}},function(err){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send();
    })
    res.redirect('/record');
});


app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//helper function
function getToday() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    return today;
}


function checkExist(query, cb) {
    loginInfo.findOne({ email: query }, function (err, user) {
        if (user !== null) {
            cb(true);
        }
        else {
            cb(false);
        }
    })
}


async function saveRegInfo(email, password) {
    const insert = new loginInfo({
        email: email,
        password: password
    })
    insert.save(function (err) {
        if (err) (console.log(err));
    })
}


async function saveDiary(date, subject, context, user) {
    try {
        const insertDiary = new userDiary({
            date: date,
            id: `#${subject}`,
            subject: subject,
            context: context,
            user: user
        })
        const saved = await insertDiary.save();
        return saved;
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
}


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

//START THE SERVER
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port)


//git push heroku master  --> push to Heroku Server