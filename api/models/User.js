const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    username: {type:String, required:true, unique:true},
    password: String,
    

}, { timestamps: true });


const userModel = mongoose.model('User', UserSchema);

module.exports = userModel;