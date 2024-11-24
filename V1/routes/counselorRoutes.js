const express = require("express");
const router = express.Router();
const auth = require("../../config/authMiddleware");
const CounselorController = require("../controllers/admin/CounselorController");

router.post('/profile-update', auth, CounselorController.CounselorProfileUpdate);

router.get("/counselor-info", auth, CounselorController.counselorInfo);

router.get('/getpassword', auth, CounselorController.getPassword);
router.post('/change_password', auth, CounselorController.ChangePassword);

router.get(
    "/getAppointmentsCount",
    auth,
    CounselorController.getAppointmentCount
  );

  router.get(
    "/details-count",
    auth,
    CounselorController.getDetailsCount
  );



module.exports = router;



