const mongoose = require('mongoose');
//mongodb+srv://hcAdmin:<password>@hc6231proj-zzwij.mongodb.net/test?retryWrites=true&w=majority


const userDiary = new mongoose.Schema({
    date: String,
    id: String,
    subject: String,
    context: String,
    user: String
});
const Diary = mongoose.model('Diary', userDiary);

const loginSchema = new mongoose.Schema({
    email:String, 
    password:String,
    diary: [{type:mongoose.Schema.Types.ObjectId, "ref":Diary}]
});

const User = mongoose.model('userLogin', loginSchema);


mongoose.connect('mongodb+srv://hcAdmin:chrssgtxdys@hc6231proj-zzwij.mongodb.net/WeeMoo?retryWrites=true&w=majority',{ useUnifiedTopology: true, useNewUrlParser: true})

module.exports = Diary;
module.exports = User;