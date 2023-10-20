const Questions = require('./../model/question');
const mongoose = require('mongoose');
const Options = require('./../model/option');
const Forms = require('./../model/form');



exports.getForm = async (req, res, next) => {
  try {
    const formId = req.params.formId; 
    // console.log(formId);
    const form = await Forms
      .findById(formId)
      .populate({
        path: 'questions',
        populate: {
          path: 'options',
          populate:{
            path:'optionQuestion'
          }
        }
      });

    // Filter questions with isReviewer1Questions === false
    const filteredQuestions = form.questions.filter(question => !question.isReviewer1Questions && !question.isReviewer2Questions );

    // Create a new object with filtered questions
    const filteredForm = {
      status: "success",
      form: {
        ...form.toObject(),
        questions: filteredQuestions
      }
    };

    return res.json(filteredForm);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}



exports.createQuestion = async (req, res, next) => {
  const { formId, questionText, questionType, branching } = req.body;
  const newQuestion = await Questions.create(req.body);

  res.status(200).json({
    status: "success",
    newQuestion: newQuestion,
  });
};


exports.addOptioin = async (req, res, next) => {
  const newOption = await Options.create(req.body);
  res.status(200).json({
    status: "success",
    newOption
  })

}


exports.addBranching = async (req, res, next) => {
  try {

    const { optionId, questionId } = req.body;
    const option = await Options.findById(optionId);
    // console.log(option);
    if (!option) {
      return res.status(404).json({
        status: "error",
        message: "Option not found"
      });
    }
    option.optionQuestion.push(questionId);
    await option.save();

    res.status(200).json({
      status: "success",
      option
    });
  } catch (error) {
    next(error);
  }
};