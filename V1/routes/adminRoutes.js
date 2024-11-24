const express = require("express");
const router = express.Router();
const auth = require("../../config/authMiddleware");
const AdminController = require("../controllers/admin/AdminController")
const CounselorController = require("../controllers/admin/CounselorController");
const TestController = require("../controllers/admin/TestsController");
const TimeSlotController = require("../controllers/admin/TimeSlotController")
const BookingsController = require("../controllers/admin/BookingController");
const EnquriryController = require("../controllers/admin/AdminController");

// Fetch Admin Info
router.get('/admin-info', auth, EnquriryController.fetchAdminInfo);


//insert counselor and fetch counselors
router.get("/users", auth, AdminController.getAllUsers);

router.get("/counselors", auth, CounselorController.getAllCounselor);
router.post("/counselor-insert", auth, CounselorController.CounselorInsert);
router.delete("/counselor-delete/:hashid", auth, CounselorController.CounselorDelete);
router.delete("/admin/counselorcategory-delete/:hashid", auth, CounselorController.CounselorCategoryDelete);



router.post("/counselor-update", auth, CounselorController.UpdateCounselor);



//councelor-categories

router.post("/categories-insert", auth, CounselorController.CategoriesInsert);
router.get("/categories", auth, CounselorController.getAllCategories);
router.get("/categories/:hashid", auth, CounselorController.getCategoryById);

router.put("/categories-update/:hashid", auth, CounselorController.CategoriesUpdate); 


//test
router.post("/testcategories-insert", auth, TestController.TestCategoriesInsert);
router.get("/get-testcategories", auth, TestController.getAllTestCategories);
//routes/admin/Tests.js

router.get("/get-testcategories/:hashid", auth, TestController.getTestCategoryById);
router.put("/testcategories-update/:hashid", auth, TestController.updateTestCategory);
router.delete("/testcategories-delete/:hashid", auth, TestController.deleteTestCategoryById);


router.post("/testname-insert", auth, TestController.insertTest);
router.get("/get-test/:test_hashid", auth, TestController.getTestDetails);
router.put("/testname-update/:test_hashid", auth, TestController.updateTestName),
router.delete("/delete/:test_hashid", auth, TestController.deleteTest);


router.get("/get-testlist", auth, TestController.getAllTestList);
router.get('/testby-category/:categoryHashId', TestController.getTestsByCategory);
router.post('/add-question', TestController.addQuestionWithOptions);

router.delete("/delete-question/:questionHashId", auth, TestController.deleteQuestion);


// router.post('/add-option', auth, TestController.addQuestion);


router.get("/testname-get", auth, TestController.getTestsByCategory);


// Fetch all questions by test
router.get('/fetch-questions/:testHashId', auth, TestController.fetchQuestionsByTest);

// Update question with options
router.put('/update-question', auth, TestController.updateQuestionWithOptions);

//get test result
router.get("/test-result/:test_hashid", auth, TestController.getUserTestResult);



//time slots routes 

router.post('/timeslot-insert', auth, TimeSlotController.timeslotInsert)
router.get("/timeslot-fetch", auth, TimeSlotController.timeslotFetch);
router.delete("/timeslot-delete", auth, TimeSlotController.timeslotDelete);

// Route to fetch bookings for a specific counselor
router.get('/bookings', auth, BookingsController.getAppointments);
router.get('/bookings/details/:appointmentHashId', auth, BookingsController.getAppointmentDetails);
router.put('/bookings/:bookingHashId/complete', auth, BookingsController.markBookingAsCompleted);
router.get('/bookings/:bookingHashId/status' , auth, BookingsController.getBookingStatus);
router.get('/bookings/completed', auth, BookingsController.getCompletedAppointments);



router.post('/suggested-test-insert', auth, BookingsController.insertSuggestedTest);
router.get('/suggested-tests/:bookingId', BookingsController.getSuggestedTests);
router.put("/meeting-link/:bookingHashId", BookingsController.updateMeetingLink);
router.get('/meeting-link/:bookingHashId', BookingsController.getMeetingLink);
router.delete('/suggested-tests/:testHashId', BookingsController.deleteSuggestedTest);




//enquiry Routes
router.get('/enquiry', auth, EnquriryController.getAllInquiries);
router.delete("/enquiry/:hashid", auth, EnquriryController.deleteInquiry);


module.exports = router;
