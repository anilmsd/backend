const express=require("express");
const router=express.Router();
const form=require("./../controller/form.js");
const question=require("./../controller/question.js");
const user=require("./../controller/user.js");
const userResponse=require("./../controller/userResponse.js");
const reviewer=require("./../controller/reviewerResponse.js");


router.post("/createForm",form.createForm);
router.get("/getForm/:formId",question.getForm);
router.post("/createQuestion",question.createQuestion);
router.post("/addOption",question.addOptioin);
router.post("/addBranching",question.addBranching);

//roles check

router.get("/checkRoles/:userId/:role",user.restrictTo);

//form routes
router.post("/submitResponse",userResponse.submitResponse);
// router.post("/updateSubmitResponse/:userResponseId",userResponse.updateSubmitResponse);

router.post("/getUserResponse",userResponse.getUserResponse);
router.post("/getLatestResponse",userResponse.getLatestResponse);


//user
router.post("/login",user.login);
router.post("/createUser",user.createUser);


//Reviewer1 routes
router.get("/getR1Questions",reviewer.getReviewer1Questions);
router.post("/submitR1Response",reviewer.submitReviewer1Response);
router.get("/getOneUserResponse/:URID",userResponse.getOneUserResponse);


//get all reviews
router.post("/getAllReviews",userResponse.getAllReviews);


//Reviewer2 routes
router.post("/getR2LatestResponse",userResponse.getReviewer1LatestResponse);
router.get("/getR2Questions",reviewer.getReviewer2Questions);
router.post("/submitR2Response",reviewer.submitReviewer2Response);


//admin
router.get("/getAllReviewsForAdmin",reviewer.getAllReviewsForAdmin);
router.get("/reviewsCount",userResponse.reviewsCount);
router.get("/viewReview",userResponse.viewReview);
router.post("/updateResponseByAdmin",userResponse.updateUserResponse);
router.post("/updateR1ResponseByAdmin",userResponse.updateReviewer1Response);
router.post("/updateR2ResponseByAdmin",userResponse.updateReviewer2Response);
router.get('/downloadxlsheet', reviewer.downloadResponses);
module.exports=router;