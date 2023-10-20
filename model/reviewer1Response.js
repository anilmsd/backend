const mongoose = require('mongoose');
const Forms=require('./form');
const Questions=require('./question');
const Options=require('./option');
const User=require('./user');
const UserResponse=require('./userResponse');

const reviewer1ResponseSchema=new mongoose.Schema({
        userResponseId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserResponse' ,// Reference to the User model
            // required:true
        },
        isReview1Submitted:{
            type:Boolean,
            default:false
        },
        isReview2:{
          type:Boolean,
          default:false
      },
        Reviewer1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' ,// Reference to the User model
            // required:true
        },
        Reviewer2: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User' ,// Reference to the User model
          // required:true
      },
        responses: [{
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Questions', // Reference to the Question model
            //   required: true
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
            
            answer: String
          }],
          createdAt: {
            type: Date,
            default: Date.now
          },

},{ timestamps: true }
);

const Reviewer1 = mongoose.model('Reviewer1', reviewer1ResponseSchema);

module.exports = Reviewer1;