const UserResponse = require('./../model/userResponse');
const Questions = require("./../model/question");
const Options = require("./../model/option");
const Reviewer1 = require("./../model/reviewer1Response");
const Reviewer2 = require("./../model/reviewer2");
const User = require("./../model/user");
const Excel = require('exceljs');
const Forms=require("./../model/form");
const fs = require('fs');
const path = require('path');

exports.submitResponse = async (req, res, next) => {
  const { formId, userId, jobId, candidateName, candidateEmail, partnerClient, endClient, responses } = req.body;

  try {
    const userResponse = await UserResponse.create({
      formId,
      userId,
      jobId,
      candidateName,
      candidateEmail,
      partnerClient,
      endClient,
      isUserSubmitted: true,
      responses
    });

    res.status(201).json({ message: 'Response saved successfully', userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error saving response', error: error.message });
  }
};

// exports.submitResponse = async (req, res, next) => {
//   const { formId, userId, jobId, candidateName, candidateEmail, partnerClient, endClient, responses } = req.body;

//   try {
//     const userResponse = await UserResponse.create({
//       formId,
//       userId,
//       jobId,
//       candidateName,
//       candidateEmail,
//       partnerClient,
//       endClient,
//       isUserSubmitted: true,
//       responses
//     });

//     const filePath = path.join(__dirname, 'responses.xlsx');
//     const workbook = new Excel.Workbook();
//     let sheet;

//     try {
//       await workbook.xlsx.readFile(filePath);
//       sheet = workbook.getWorksheet('Responses');
//     } catch (error) {
//       // File doesn't exist, create a new sheet
//       sheet = workbook.addWorksheet('Responses');

//       const form = await Forms
//         .findById(formId)
//         .populate({
//           path: 'questions',
//           populate: {
//             path: 'options',
//             populate: {
//               path: 'optionQuestion'
//             }
//           }
//         });

//       const questionsArray = form.questions;
//       sheet.addRow([...questionsArray.map(q => q.questionText)]);
//     }

//     const form = await Forms
//       .findById(formId)
//       .populate({
//         path: 'questions',
//         populate: {
//           path: 'options',
//           populate: {
//             path: 'optionQuestion'
//           }
//         }
//       });

//     if (!form) {
//       throw new Error(`Form with ID ${formId} not found`);
//     }

//     const questionsArray = form.questions;

//     const responseRow = questionsArray.map(q => {
//       const response = responses.find(r => r.questionId.toString() === q._id.toString());
//       if (response) {
//         const selectedOption = q.options.find(option => option._id.toString() === response.optionId);
//         return selectedOption ? selectedOption.optionText : response.answer || '';
//       }
//       return '';
//     });
    

//     sheet.addRow([...responseRow]);

//     await workbook.xlsx.writeFile(filePath);

//     res.status(201).json({ message: 'Response saved successfully', userResponse });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving response', error: error.message });
//   }
// };



exports.updateSubmitResponse = async (req, res, next) => {
  try {
    const userResponseId = req.params.userResponseId;
    const { questionId } = req.body;

    const updateResponse = await UserResponse.findById(userResponseId);

    if (!updateResponse) {
      return res.status(404).json({ message: 'UserResponse not found' });
    }

    let fileName = null;

    if (req.file) {
      fileName = req.file.filename;
    }

    // Add the new response object to the responses array
    // console.log(questionId, fileName);
    updateResponse.responses.push({ questionId, fileName });

    // Save the updated UserResponse
    await updateResponse.save();

    res.status(201).json({ message: 'Updated response', updateResponse });
    next();

  } catch (error) {
    res.status(500).json({ message: 'Error updating response', error: error.message });
    next(error);
  }
}


exports.getUserResponse = async (req, res, next) => {

  const { userId, jobId, candidateName } = req.body;

  try {
    const userResponse = await UserResponse.findOne({ userId, jobId, candidateName })
      .populate({
        path: 'responses',
        populate: [
          {
            path: 'questionId',
            model: Questions
          },
          {
            path: 'optionId',
            model: Options
          }
        ]
      })
    res.status(201).json({ userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}

exports.getLatestResponse = async (req, res, next) => {
  try {
    const reviewerId = req.body.reviewerId;

    const response = await Reviewer1.findOne({ Reviewer1: reviewerId }).sort({ createdAt: -1 });
    // console.log(response);
    if (response && !response.isReview1Submitted && response.userResponseId) {

      const latestResponse = await UserResponse.findById(response.userResponseId)
        .populate('responses.questionId')
        .populate('responses.optionId')
      return res.status(201).json({ latestResponse, userResponseId: response.userResponseId })

    }

    const latestResponse = await UserResponse.findOne({ isReviewer1: false }).sort({ createdAt: 1 })
      .populate('responses.questionId')
      .populate('responses.optionId');

    if (latestResponse) {
      latestResponse.isReviewer1 = true;
      latestResponse.Reviewer1 = reviewerId;
      await latestResponse.save();
      const assignUR_ID_To_Reviewer1 = await Reviewer1.create({
        userResponseId: latestResponse._id,
        Reviewer1: reviewerId

      })
      res.status(201).json({ latestResponse, userResponseId: latestResponse._id, });
    } else {
      res.status(201).json({ message: 'No Reviews Found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.getReviewer1LatestResponse = async (req, res, next) => {
  try {


    // console.log(req.body)
    const reviewerId = req.body.reviewerId;

    // console.log(reviewerId);
    const response = await Reviewer2.findOne({ Reviewer2: reviewerId }).sort({ createdAt: -1 });
    // console.log(response);
    if (response && !response.isReview2 && response.reviewer1ResponseId) {

      const latestR1Response = await Reviewer1.findById(response.reviewer1ResponseId)
        .populate('responses.questionId')
        .populate('responses.optionId');

      // console.log(latestR1Response);
      const userResponseId = latestR1Response.userResponseId;
      // console.log(userResponseId);
      response.userResponseId = userResponseId;
      await response.save();

      const userResponse = await UserResponse.findById(userResponseId)
        .populate('responses.questionId')
        .populate('responses.optionId')
        ;
      // console.log(userResponse);
      return res.status(201).json({ latestR1Response, reviewer1ResponseId: response.reviewer1ResponseId, userResponse })

    }


    const latestR1Response = await Reviewer1.findOne({ isReview2: false }).sort({ createdAt: 1 })
      .populate('responses.questionId')
      .populate('responses.optionId')
      ;


    if (latestR1Response) {
      latestR1Response.isReview2 = true;
      latestR1Response.Reviewer2 = reviewerId;
      await latestR1Response.save();
      const assignR1R2_ID_To_Reviewer2 = await Reviewer2.create({
        reviewer1ResponseId: latestR1Response._id,
        Reviewer2: reviewerId,
        userResponseId: latestR1Response.userResponseId

      })

      const userResponseId = latestR1Response.userResponseId;
      const userResponse = await UserResponse.findById(userResponseId)
        .populate('responses.questionId')
        .populate('responses.optionId')
        ;

      res.status(201).json({ latestR1Response, reviewer1ResponseId: latestR1Response._id, userResponse });
    } else {
      res.status(201).json({ message: 'No Reviews Found' });
    }



    // const userResponseId=latestR1Response.userResponseId;
    // const userResponse=await UserResponse.findById(userResponseId)
    // .populate('responses.questionId')
    // .populate('responses.optionId')
    // ;



    // res.status(201).json({userResponse ,latestR1Response });
  } catch (error) {
    res.status(500).json({ message: 'Error saving response', error: error.message });
  }
}



exports.reviewsCount = async (req, res, next) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const adjustedToDate = new Date(toDate);
    adjustedToDate.setHours(23, 59, 59, 999); // Set it to the end of the day

    const users = await User.find({ roles: "Recruiter" });

    const userData = [];

    for (const user of users) {
      const reviewsCount = await UserResponse.countDocuments({
        userId: user._id,
        isUserSubmitted: true,
        createdAt: { $gte: new Date(fromDate), $lte: adjustedToDate }
      });

      userData.push({
        name: user.name,
        email: user.email,
        reviewsCount: reviewsCount
      });
    }
    res.status(201).json({ userData });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Error getting counts of reviews', error: error.message });
  }
}


exports.viewReview = async (req, res, next) => {
  try {
    const userResponseId = req.query.uid;
    const reviewer1ResponseId = req.query.r1id;
    const reviewer2ResponseId = req.query.r2id;

    const userResponses = await UserResponse.findById(userResponseId)
      .populate('responses.questionId')
      .populate('responses.optionId')
      .populate('responses.adminOptionId')
      ;
    const reviewer1Responses = await Reviewer1.findById(reviewer1ResponseId)
      .populate('responses.questionId')
      .populate('responses.optionId')
      .populate('responses.adminOptionId');
    const reviewer2Responses = await Reviewer2.findById(reviewer2ResponseId)
      .populate('responses.questionId')
      .populate('responses.optionId')
      .populate('responses.adminOptionId');


    res.status(201).json({ userResponses, reviewer1Responses, reviewer2Responses });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Error getting counts of reviews', error: error.message });
  }
}


// exports.updateUserResponse = async (req, res) => {
//   const userResponseId = req.body.userRId;
//   const updatedResponses = req.body.responses;

//   const { jobId, candidateName, candidateEmail, partnerClient, endClient} = req.body;

//   console.log(req.body);

//   try {
//     const userResponse = await UserResponse.findById(userResponseId);
//     if (!userResponse) {
//       return res.status(404).json({ msg: 'User Response not found' });
//     }

//     if (jobId !== undefined && jobId !== '') {
//       userResponse.jobId = jobId;
//     }
//     if (candidateName !== undefined && candidateName !== '') {
//       userResponse.candidateName = candidateName;
//     }
//     if (candidateEmail !== undefined && candidateEmail !== '') {
//       userResponse.candidateEmail = candidateEmail;
//     }
//     if (partnerClient !== undefined && partnerClient !== '') {
//       userResponse.partnerClient = partnerClient;
//     }
//     if (endClient !== undefined && endClient !== '') {
//       userResponse.endClient = endClient;
//     }


//     updatedResponses.forEach(updatedResponse => {
//       const existingResponseIndex = userResponse.responses.findIndex(response =>
//         response.questionId.toString() === updatedResponse.questionId
//       );

//       if (existingResponseIndex !== -1) {
//         // Update admin option and answer if available
//         if (updatedResponse.adminOptionId || updatedResponse.adminAnswer) {
//           userResponse.responses[existingResponseIndex].adminOptionId = updatedResponse.adminOptionId;
//           userResponse.responses[existingResponseIndex].adminAnswer = updatedResponse.adminAnswer;
//         }
//       }
//     });

//     await userResponse.save();

//     res.json({ msg: 'User Response updated successfully' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Internal Server Error', error: err.message });
//   }
// };

function getExcelColumn(index) {
  let columnName = '';

  while (index >= 0) {
    columnName = String.fromCharCode(65 + (index % 26)) + columnName;
    index = Math.floor(index / 26) - 1;
  }

  return columnName;
}



exports.updateUserResponse = async (req, res) => {
  try {
    const userResponseId = req.body.userRId;
    const updatedResponses = req.body.responses;

    const { jobId, candidateName, candidateEmail, partnerClient, endClient, indexValue } = req.body;

    console.log(req.body);

    const userResponse = await UserResponse.findById(userResponseId);
    if (!userResponse) {
      return res.status(404).json({ msg: 'User Response not found' });
    }

    if (jobId !== undefined && jobId !== '') {
      userResponse.jobId = jobId;
    }
    if (candidateName !== undefined && candidateName !== '') {
      userResponse.candidateName = candidateName;
    }
    if (candidateEmail !== undefined && candidateEmail !== '') {
      userResponse.candidateEmail = candidateEmail;
    }
    if (partnerClient !== undefined && partnerClient !== '') {
      userResponse.partnerClient = partnerClient;
    }
    if (endClient !== undefined && endClient !== '') {
      userResponse.endClient = endClient;
    }

    const filePath = path.join(__dirname, 'responses.xlsx');

    // Load workbook and get the sheet
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('Responses');

    updatedResponses.forEach(updatedResponse => {
      const existingResponseIndex = userResponse.responses.findIndex(response =>
        response.questionId.toString() === updatedResponse.questionId
      );

      if (existingResponseIndex !== -1) {
        // Update admin option and answer if available
        if (updatedResponse.adminOptionId || updatedResponse.adminAnswer) {
          userResponse.responses[existingResponseIndex].adminOptionId = updatedResponse.adminOptionId;
          userResponse.responses[existingResponseIndex].adminAnswer = updatedResponse.adminAnswer;
        }

        if (sheet) {
          const row = sheet.getRow(indexValue+2);
          const column = getExcelColumn(existingResponseIndex); // Assuming existingResponseIndex is 0-based
          row.getCell(column).value = updatedResponse.adminOptionId || updatedResponse.adminAnswer;
        }
        
      }
    });

    await userResponse.save();

    await workbook.xlsx.writeFile(filePath);
    console.log('File updated successfully');

    res.json({ msg: 'User Response updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal Server Error', error: err.message });
  }
};



exports.updateReviewer1Response = async (req, res) => {
  const reviewer1ResponseId = req.body.Reviewer1Id;
  const updatedResponses = req.body.responses;
  const indexValue=req.body.indexValue;
  console.log(req.body);
  try {
    const userResponse = await Reviewer1.findById(reviewer1ResponseId);
    // console.log(userResponse);
    if (!userResponse) {
      return res.status(404).json({ msg: 'Reviewer 1 Response not found' });
    }

    const filePath = path.join(__dirname, 'responses.xlsx');

    // Load workbook and get the sheet
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('Responses');

    updatedResponses.forEach(updatedResponse => {
      const existingResponseIndex = userResponse.responses.findIndex(response =>
        response.questionId.toString() === updatedResponse.questionId
      );

      if (existingResponseIndex !== -1) {
        // Update admin option and answer if available
        if (updatedResponse.adminOptionId || updatedResponse.adminAnswer) {
          userResponse.responses[existingResponseIndex].adminOptionId = updatedResponse.adminOptionId;
          userResponse.responses[existingResponseIndex].adminAnswer = updatedResponse.adminAnswer;
        }

        if (sheet) {
          const row = sheet.getRow(indexValue+2);
          const column = getExcelColumn(existingResponseIndex+15); // Assuming existingResponseIndex is 0-based
          row.getCell(column).value = updatedResponse.adminOptionId || updatedResponse.adminAnswer;
        }
      }
    });

    await userResponse.save();
    await workbook.xlsx.writeFile(filePath);
    console.log('File updated successfully');

    res.json({ msg: 'Reviewer 1 Response updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Error', error: err.message });
  }
};


exports.updateReviewer2Response = async (req, res) => {
  const reviewer2ResponseId = req.body.Reviewer2Id;
  const updatedResponses = req.body.responses;
  const indexValue=req.body.indexValue;

  console.log(req.body);
  try {
    const userResponse = await Reviewer2.findById(reviewer2ResponseId);
    if (!userResponse) {
      return res.status(404).json({ msg: 'Reviewer 1 Response not found' });
    }


    const filePath = path.join(__dirname, 'responses.xlsx');

    // Load workbook and get the sheet
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet('Responses');

    updatedResponses.forEach(updatedResponse => {
      const existingResponseIndex = userResponse.responses.findIndex(response =>
        response.questionId.toString() === updatedResponse.questionId
      );

      if (existingResponseIndex !== -1) {
        // Update admin option and answer if available
        if (updatedResponse.adminOptionId || updatedResponse.adminAnswer) {
          userResponse.responses[existingResponseIndex].adminOptionId = updatedResponse.adminOptionId;
          userResponse.responses[existingResponseIndex].adminAnswer = updatedResponse.adminAnswer;
        }
        if (sheet) {
          const row = sheet.getRow(indexValue+2);
          const column = getExcelColumn(existingResponseIndex+24); // Assuming existingResponseIndex is 0-based
          console.log(column);
          row.getCell(column).value = updatedResponse.adminOptionId || updatedResponse.adminAnswer;
        }
      }
    });

    await userResponse.save();
    await workbook.xlsx.writeFile(filePath);
    console.log('File updated successfully');
    res.json({ msg: 'Reviewer 1 Response updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Error', error: err.message });
  }
};

exports.getAllReviews = async (req, res, next) => {
  const modelName = req.body.model;
  const userId = req.body.userId;

  try {
    const Model = require(`./../model/${modelName}`);

    const response = await Model.find({ userId: userId });
    res.status(201).json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.getOneUserResponse = async (req, res, next) => {

  try {

    const response = await UserResponse.findById(req.params.URID)
      .populate('responses.questionId')
      .populate('responses.optionId')
      .populate('responses.adminOptionId')
      ;
    res.status(201).json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}