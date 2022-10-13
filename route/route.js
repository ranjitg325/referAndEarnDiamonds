const express = require('express');
const router = express.Router();

const usercontroller = require("../controllers/userController")

//****************** USER API *************************************
router.post("/userRegister",usercontroller.referalRegisterAndEarnCoins)
router.post("/loginUser", usercontroller.loginUser)


module.exports = router;