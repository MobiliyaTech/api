const express = require("express");
const router = express.Router();
const auth = require("../../config/authMiddleware");
const CounselorController = require("../controllers/frontend/CounselorController");
const TestController = require("../controllers/frontend/TestsController");
const UserController = require("../controllers/userController");

// router.post('/profile-update', auth, CounselorController.CounselorProfileUpdate);

router.get("/counselor-list", CounselorController.getAllCounselor);
router.get("/counselor-details", CounselorController.counselorInfo);

// // New routes for categories and filtering counselors
// router.get("/categories", CounselorController.getAllCategories);

router.get("/categories", CounselorController.getAllCategories);
router.get("/counselor/:categoryHashid", CounselorController.getCounselorsByCategory);

router.get("/categories-with-tests", TestController.getCategoriesWithTests);
router.get("/test/:testHashId", TestController.fetchQuestionsByTest);
router.post("/pay-now", CounselorController.PayNow);
router.post("/verify-payment", CounselorController.VerifyPayment);
router.post("/book-now", CounselorController.BookingsInsert);

//routes for contactform
router.post("/contact-form", UserController.createContactForm);
router.get("/get-contact", UserController.getAllContactForms);

// Route for submitting a test
router.post("/submitTest", TestController.submitTest);

//time-slot fetch
router.get("/timeslot-fetch", CounselorController.timeslotFetch);

// Route to get user appointments
router.get("/getappointments", CounselorController.getUserAppointments);
router.get("/getUserTests", TestController.getUserTests);

module.exports = router;
