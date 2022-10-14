const express = require('express');
const router = express.Router();

const usercontroller = require("../controllers/userController")

//****************** USER API *************************************
router.post("/userRegister",usercontroller.registerAndEarn)
//router.post("/loginUser", usercontroller.loginUser)
router.get("/checkReferralPoint", usercontroller.checkReferralPoint)
router.put("/redeemPoints", usercontroller.redeemPoints)
router.post("/referalAfterLogin", usercontroller.applyReferalCodeAfterLogin)
router.get("/getReferralCode", usercontroller.showMyReferalCode)

module.exports = router;