const mongoose = require('mongoose');
const Forms=require('./form');
const Questions=require('./question');
const Options=require('./option');
const User=require('./user');
const userResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forms', // Reference to the Form model
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  jobId:String,
  candidateName:String,
  candidateEmail:String,
  partnerClient:String,
  endClient:String,

  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questions', // Reference to the Question model
      // required: true
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Options' // Reference to the Option model
    },

    adminOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Options' 
    },
    adminAnswer:String,


    answer: String ,
    fileName:String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isReviewer1:{
    type:Boolean,
    default:false
  },
  isUserSubmitted:{
    type:Boolean,
    default:false
  },
  Reviewer1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' ,// Reference to the User model
    // required:true
  },
  
},{ timestamps: true }
);

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

module.exports = UserResponse;
