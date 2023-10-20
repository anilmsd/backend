// const mongoose=require("mongoose");

// const optionSchema=new mongoose.Schema({
//     optionText:String,
//     optionQuestion: [{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Question'
//     }]
// })

// const Option =mongoose.model("Option",optionSchema);
// module.exports=Option;

// const questionSchema=new mongoose.Schema({
//     questionText:String,
//     qtype:String,
//     branching:{
//         type:Boolean,
//         default:false
//     },
//     options:[optionSchema]

// })

// const Question =mongoose.model("Question",questionSchema);
// module.exports=Question;

// const formSchema=new mongoose.Schema({
//     formName:{
//         type:String,
//         required:true,
//     },
//     questions:[questionSchema]

// })

// const Form=mongoose.model("Form",formSchema);
// module.exports=Form;