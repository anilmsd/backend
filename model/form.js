const mongoose=require('mongoose');
const validator=require('validator');
const Question=require('./question');
const formSchema=new mongoose.Schema({
    formName:{
        type:String,
    },
    formCreationDate:{
        type:Date,
        default:Date.now
    },
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }

);

formSchema.virtual('questions', {
    ref: 'Questions',
    foreignField:'formId',
    localField: '_id'
  });



const Forms=mongoose.model("Forms",formSchema);
module.exports=Forms;