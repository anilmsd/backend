const mongoose = require('mongoose');
const Forms=require('./form');
const Questions=require('./question');
const Options=require('./option');
const User=require('./user');
const UserResponse=require('./userResponse');
const Reviewer1=require('./reviewer1Response');

const reviewer2ResponseSchema=new mongoose.Schema({
        reviewer1ResponseId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reviewer1' ,// Reference to the User model
            // required:true
        },
        userResponseId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserResponse' ,// Reference to the User model
          // required:true
      },
        isReview2:{
            type:Boolean,
            default:false
        },
        isReview2Submitted:{
          type:Boolean,
          default:false
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

const Reviewer2 = mongoose.model('Reviewer2', reviewer2ResponseSchema);

module.exports = Reviewer2;