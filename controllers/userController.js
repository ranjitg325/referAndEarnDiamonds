const userModel = require("../models/userModel")
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");

exports.registerAndEarn = async (req, res) => {
  try {
    let { name, email, password, applyReferalCode } = req.body
    const dataExist = await userModel.findOne({ email: email });
    if (dataExist) {
      return res.status(400).send({ message: "email already in use" });
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
      return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
    }
    if (!applyReferalCode) {
      //   const referalCode = Math.random().toString(36).substring(2, 7)

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const newUser = { name, email, password }
      const userData = await userModel.create(newUser);
      return res.status(201).send({ message: "User signup successfully", data: userData });
    } else {
      const applyReferalCode = req.body.applyReferalCode
      const userReferCode = await userModel.findOne({ referalCode: applyReferalCode })
      if (!userReferCode) {
        return res.status(400).send({ message: "Invalid referal code" });
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let newUser = ({ name, email, password, applyReferalCode })
      const userData = await userModel.create(newUser);

      await userModel.updateMany({ referalCode: applyReferalCode }, { $inc: { referalPoint: 100 } })
      await userModel.findOneAndUpdate({ _id: userData }, { $inc: { referalPoint: 100 }, $set: { isClicked: true } })
      return res.status(201).send({ message: "User signup successfully", data: userData });
    }
  }
  catch (err) {
    console.log(err)
  }
}

exports.checkReferralPoint = async (req, res) => {
  try {
    const userId = req.body.userId;
    const userData = await userModel.findOne({ _id: userId }).select("referalPoint")
    return res.status(200).send({ message: "total referred points", data: userData });
  } catch (err) {
    return res.status(500).send(err.message);
  };
}


exports.redeemPoints = async (req, res) => {
  try {
    const userId = req.body.userId;
    const diamondAmount = req.body.diamondAmount;
    const userData = await userModel.findOne({ _id: userId }).select("referalPoint")
    if (userData.referalPoint < diamondAmount) {
      return res.status(200).send({ message: "you dont't have enough diamond to redeem" });
    }
    const user = await userModel.findOneAndUpdate({ _id: userId }, { $inc: { referalPoint: -diamondAmount } }, { new: true })
    return res.status(200).send({ message: "diamond redeemed successfully", data: user });
  } catch (err) {
    return res.status(500).send(err.message);
  };
}

exports.applyReferalCodeAfterLogin = async (req, res) => {
  try {
    const userId = req.body.userId;
    const applyReferalCode = req.body.applyReferalCode;
    const userReferCode = await userModel.findOne({ referalCode: applyReferalCode })
    if (!userReferCode) {
      return res.status(400).send({ message: "Invalid referral code" });
    }
    const userData = await userModel.findOneAndUpdate({ _id: userId }, { $set: { applyReferalCode: applyReferalCode } }, { new: true })
    
    if (userData.referalCode === applyReferalCode) {
      return res.status(400).send({ message: "you can't apply your own referral code" });
    }

    if (userData.isClicked === false) {
      await userModel.updateMany({ referalCode: applyReferalCode }, { $inc: { referalPoint: 100 } })
      await userModel.findOneAndUpdate({ _id: userId }, { $inc: { referalPoint: 100 }, $set: { isClicked: true } })
    }else{
      return res.status(400).send({ message: "you already used the benefit of referral code" });
    }

    return res.status(200).send({ message: "referral code applied successfully", data: userData });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

exports.showMyReferalCode = async (req, res) => {
  try {
    const userId = req.body.userId;
    const userData = await userModel.findOne({ _id: userId }).select("referalCode")
    return res.status(200).send({ message: "your referral code", data: userData });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

