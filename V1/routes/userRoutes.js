const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/register', UserController.userRegister);
router.post('/login', UserController.getWeb_Login);
router.post('/userlogin', UserController.user_Login);
router.post("/reset-password", UserController.resetPassword);
router.post('/check-email-existence', UserController.checkEmailExistence);
router.post("/reset-user-password", UserController.resetPasswordForFrontend
);
router.post("/google", UserController.user_GoogleLogin);






router.get('/test', (req, res) => {
    console.log("test");
    res.send("Test endpoint hit!");
});

module.exports = router;