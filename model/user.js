const mongoose=require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    // role: {
    //     type: String,
    //     enum: ['Admin', 'Recruiter', 'Review1' ,'Review2'],
    //     default: 'Recruiter'
    // },
    roles: [
        {
            type: String,
            enum: ['Admin', 'Recruiter', 'Review1', 'Review2']
        }
    ],
    password: {
        type: String,
        minlength: 8,
        required: [true, "plase provide a password"],
        select: false 
    },


});

const User=mongoose.model('User',userSchema);
module.exports=User;