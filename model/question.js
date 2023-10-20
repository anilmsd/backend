const mongoose = require("mongoose");
const validator=require('validator');
const Forms=require('./../model/form');
const Option=require('./../model/option');

const questionSchema = new mongoose.Schema({
    formId:{
        type:mongoose.Schema.ObjectId,
        ref:'Forms',
        required:[true,"Please provide the FormId"]
    },
    questionText:{
        type:String,
        required:[true,"Please provide the Question"]
    },
    questionType:{
        type:String,
        required:[true,"Please provide the QuestionType"]
    },
    branching:{
        type:Boolean,
        default:false
    },
    isReviewer1Questions:{
      type:Boolean,
      default:false
    },
    isReviewer2Questions:{
      type:Boolean,
      default:false
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }

);

  // Virtual populate
// here the logic is it will populate the questions where categoryID is equal to that particular category
questionSchema.virtual('options', {
    ref: 'Options',
    foreignField:'questionId',
    localField: '_id'
  });

const Questions = mongoose.model("Questions", questionSchema);
module.exports = Questions;
