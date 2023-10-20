const mongoose = require('mongoose');
const validator = require('validator');
const Questions=require('./../model/question');

const optionSchema = new mongoose.Schema({

    optionText: {
        type: String,
        required: [true, "A qustion should contain a option"]
    },
    questionId: {
        type: mongoose.Schema.ObjectId,
        ref: "Questions",
        required: [true, "Please provide question Id"]
    },
    optionQuestion:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Questions'
    }],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);


const Options = mongoose.model("Options", optionSchema);
module.exports = Options;