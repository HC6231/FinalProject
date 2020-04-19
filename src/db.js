const mongoose = require('mongoose');
//mongodb+srv://hcAdmin:<password>@hc6231proj-zzwij.mongodb.net/test?retryWrites=true&w=majority

const loginSchema = new mongoose.Schema({
    email:String, 
    password:String
})



const User = mongoose.model('userLogin', loginSchema);


mongoose.connect('mongodb+srv://hcAdmin:chrssgtxdys@ds227555.mlab.com:27555/heroku_5tf98rhr',{ useUnifiedTopology: true, useNewUrlParser: true})

module.exports = User;


