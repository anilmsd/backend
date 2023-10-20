const UserResponse = require('./../model/userResponse');
const Questions = require("./../model/question");
const Options = require("./../model/option");
const Reviewer1 = require("./../model/reviewer1Response");
const Reviewer2 = require('../model/reviewer2');
const Excel = require('exceljs');
const Forms = require("./../model/form");
const fs = require('fs');
const path = require('path');


exports.getReviewer1Questions = async (req, res, next) => {

    try {
        const Reviewer1Questions = await Questions.find({ isReviewer1Questions: true }).populate('options');

        res.status(201).json({ Reviewer1Questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getReviewer2Questions = async (req, res, next) => {

    try {
        const Reviewer2Questions = await Questions.find({ isReviewer2Questions: true }).populate('options');

        res.status(201).json({ Reviewer2Questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}




exports.submitReviewer1Response = async (req, res, next) => {
    try {
        const { userResponseId, responses } = req.body;
        // console.log(responses);

        const reviewer1Responses = await Reviewer1.findOne({ userResponseId: userResponseId });

        for (const response of responses) {
            reviewer1Responses.responses.push(response);
        }
        reviewer1Responses.isReview1Submitted = true;
        await reviewer1Responses.save();

        res.status(201).json({ reviewer1Responses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// exports.submitReviewer2Response = async (req, res, next) => {
//     try {
//         const { reviewer1ResponseId, responses } = req.body;

//         const reviewer2Responses = await Reviewer2.findOne({ reviewer1ResponseId: reviewer1ResponseId });
//         for (const response of responses) {
//             reviewer2Responses.responses.push(response);
//         }
//         reviewer2Responses.isReview2Submitted = true;
//         reviewer2Responses.isReview2 = true;

//         await reviewer2Responses.save();

//         res.status(201).json({ reviewer2Responses });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


// exports.getAllReviewsForAdmin = async (req, res, next) => {
//     try {
//         const reviewer2Responses = await Reviewer2.find();
//         const userResponses = [];
//         const reviewer1Responses = [];
//         for (const response of reviewer2Responses) {
//             const userResponseId = response.userResponseId;
//             const reviewer1ResponseId = response.reviewer1ResponseId;
//             const userResponse = await UserResponse.findById(userResponseId).select('userId candidateName').populate('userId');
//             const reviewer1Response = await Reviewer1.findById(reviewer1ResponseId).select('Reviewer2').populate('Reviewer2');
//             userResponses.push(userResponse);
//             reviewer1Responses.push(reviewer1Response);
//         }
//         res.status(201).json({ reviewer2Responses, userResponses, reviewer1Responses });

//         // res.status(201).json({ reviewer2Responses});

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


exports.submitReviewer2Response = async (req, res, next) => {
    try {
        const { reviewer1ResponseId, responses } = req.body;
        // console.log(responses);

        const reviewer2Responses = await Reviewer2.findOne({ reviewer1ResponseId: reviewer1ResponseId });
        for (const response of responses) {
            reviewer2Responses.responses.push(response);
        }
        reviewer2Responses.isReview2Submitted = true;
        reviewer2Responses.isReview2 = true;

        await reviewer2Responses.save();

        const userResponses = await UserResponse.findById(reviewer2Responses.userResponseId).select('responses');
        const reviewer1Responses = await Reviewer1.findById(reviewer1ResponseId).select('responses');

        const filePath = path.join(__dirname, 'responses.xlsx');
        const workbook = new Excel.Workbook();
        let sheet;


        try {
            await workbook.xlsx.readFile(filePath);
            sheet = workbook.getWorksheet('Responses');
        } catch (error) {
            // File doesn't exist, create a new sheet
            sheet = workbook.addWorksheet('Responses');

            const form = await Forms
                .findById("6513effb670f5328b6dd023d")
                .populate({
                    path: 'questions',
                    populate: {
                        path: 'options',
                        populate: {
                            path: 'optionQuestion'
                        }
                    }
                });

            const questionsArray = form.questions;
            sheet.addRow([...questionsArray.map(q => q.questionText)]);
        }

        const form = await Forms
            .findById("6513effb670f5328b6dd023d")
            .populate({
                path: 'questions',
                populate: {
                    path: 'options',
                    populate: {
                        path: 'optionQuestion'
                    }
                }
            });

        if (!form) {
            throw new Error(`Form with ID  not found`);
        }

        const questionsArray = form.questions;

        const responseRow = questionsArray.map(q => {
            const userResponse = userResponses.responses.find(r => r.questionId.toString() === q._id.toString());
            const reviewer1Response = reviewer1Responses.responses.find(r => r.questionId.toString() === q._id.toString());
            const response = responses.find(r => r.questionId.toString() === q._id.toString());
        
            let finalResponse = '';
        
            if (response) {
                const selectedOption = q.options.find(option => option._id.toString() === response.optionId.toString());
                finalResponse += selectedOption ? selectedOption.optionText : response.answer || '';
            }
        
            if (userResponse) {
                const selectedOption = q.options.find(option => option._id.toString() === userResponse.optionId.toString());
                console.log(selectedOption);
                finalResponse += selectedOption ? selectedOption.optionText : userResponse.answer || '';
            }
        
            if (reviewer1Response) {
                const selectedOption = q.options.find(option => option._id.toString() === reviewer1Response.optionId.toString());
                finalResponse += selectedOption ? selectedOption.optionText : reviewer1Response.answer || '';
            }
        
            if (finalResponse === '') {
                console.log(`No response found for question with ID: ${q._id}`);
            }
        
            return finalResponse;
        });
        

        console.log(responseRow);
        sheet.addRow([...responseRow]);

        await workbook.xlsx.writeFile(filePath);



        res.status(201).json({ reviewer2Responses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getAllReviewsForAdmin = async (req, res, next) => {
    try {
        const reviewer2Responses = await Reviewer2.find({ isReview2Submitted: true });

        const formattedResponses = await Promise.all(reviewer2Responses.map(async (response) => {
            const userResponseId = response.userResponseId;
            const reviewer1ResponseId = response.reviewer1ResponseId;

            const [userResponse, reviewer1Response] = await Promise.all([
                UserResponse.findById(userResponseId).select('userId candidateName jobId partnerClient endClient').populate('userId'),
                Reviewer1.findById(reviewer1ResponseId).select('Reviewer2').populate('Reviewer2')
            ]);

            return {
                ...response.toObject(),
                userResponses: userResponse,
                reviewer1Responses: reviewer1Response
            };
        }));

        res.status(201).json({ formattedResponses });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



exports.downloadResponses = (req, res) => {
  const filePath = path.join(__dirname, 'responses.xlsx'); // Adjust the file path accordingly
  res.download(filePath, 'responses.xlsx', (err) => {
    if (err) {
      // Handle the error, for example, log it and send an error response
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('File downloaded successfully');
    }
  });
};
