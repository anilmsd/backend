
const Forms = require("../model/form.js");
const Form = require("./../model/createForm.js");
const Question=Form.Question;
const mongoose = require("mongoose");

// exports.getForm=async(req,res,next)=>{
//     const formId="6512a0d32b229de61f7cb795";
//     const form=await Form.findById(formId);
//     res.status(200).json({
//         status:"success",
//         form
//     })
// }

exports.getForm = async (req, res, next) => {
    try {
        const formId = "6512a0d32b229de61f7cb795";
        const form = await Form
            .findById(formId)
            .populate({
                path: 'questions.options.optionQuestion',
                ref: 'Question'
            });

        res.status(200).json({
            status: "success",
            form
        });
    } catch (error) {
        next(error);
    }
};


exports.createForm = async (req, res, next) => {

    const formName=req.body.formName;

    const createForm=await Forms.create({
        formName:formName
    });

    // const formId = "6513d62cd228b1a59342b411";
    // const { questionText, qtype, branching } = req.body;

    // const createForm = await Form.findById(formId);
    // const newQuestion = {
    //     questionText: questionText,
    //     qtype: qtype,
    //     branching: branching,
    //     options: []
    // }
    // createForm.questions.push(newQuestion);
    await createForm.save();
    res.status(200).json({
        status: "success",
        createForm
    })
}

exports.addOptioin = async (req, res, next) => {
    const formId = "6512a0d32b229de61f7cb795";
    const { questionId, optionText } = req.body;
    const form = await Form.findById(formId);

    const question = form.questions.find((c) => c._id.equals(questionId));
    const newOption = {
        optionText: optionText
    }

    question.options.push(newOption);
    await form.save();

    res.status(200).json({
        status: "success",
        form
    })

}


// exports.addBranching = async (req, res, next) => {
//     const formId = "6512a0d32b229de61f7cb795";
//     const {optionId, questionId } = req.body;
//     const form = await Form.findById(formId);

//     const optionQuestion = form.questions.options.find((c) => c._id.equals(optionId));
//     const newOption = {
//         optionQuestion: [questionId]
//     }

//     optionQuestion.optionQuestion.push(newOption);
//     await form.save();

//     res.status(200).json({
//         status: "success",
//         form
//     })

// }


exports.addBranching = async (req, res, next) => {
    try {
        const formId = "6512a0d32b229de61f7cb795";
        const { optionId, questionId } = req.body;
        const form = await Form.findById(formId);

        const question = form.questions.find((c) => c._id.equals(questionId));
         const option = form.questions.flatMap(q => q.options).find(o => o._id == optionId);
        if (!option) {
            return res.status(404).json({
                status: "error",
                message: "Option not found"
            });
        }


        const newQuestion={
            questionText:question.questionText,
            qtype:question.qtype,
            options:[]
        }
      

        option.optionQuestion.push(newQuestion);
        await form.save();

        res.status(200).json({
            status: "success",
            form
        });
    } catch (error) {
        next(error);
    }
};


