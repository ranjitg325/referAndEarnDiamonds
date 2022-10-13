const userModel=require("../models/userModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.referalRegisterAndEarnCoins=async(req,res)=>{
  try{
    let { name, email, password, referalCode,referalPoint} = req.body
    const dataExist = await userModel.findOne({ email: email });
    if (dataExist){
      return res.status(400).send({ message: "email already in use" });
    }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
      return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
  }
    if(!referalCode){
      const referalCode = Math.random().toString(36).substring(2, 7)

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password,salt);

      const newUser = { name, email, password, referalCode }
            const userData = await userModel.create(newUser);
            return res.status(201).send({ message: "User signup successfully", data: userData });
    }else{
      const referalCode=req.body.referalCode
      const userReferCode = await userModel.findOne({referalCode: referalCode })
      if(!userReferCode){
        return res.status(400).send({ message: "Invalid referal code" });
      }
    
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password,salt);

      let newUser = ({ name, email, password, referalCode,referalPoint} )
      const userData = await userModel.create(newUser);
      await userModel.updateMany({referalCode: referalCode }, { $inc: { referalPoint: 100 } })
      return res.status(201).send({ message: "User signup successfully", data: userData });
    }
  }
  catch(err){
    console.log(err)
  }
}

exports.loginUser = async (req,res) =>{
  try{
      const userEmail = req.body.email;
      const userPassword = req.body.password;
      const userData = await userModel.findOne({email:userEmail});
      if(userData){
          const {_id,name,password} = userData;
          const validPassword = await bcrypt.compare(userPassword,password);
          if(!validPassword){
              return res.status(400).send({message:"Invalid Password"});
          };
          let payload = {userId:_id,email:userEmail};
          const generatedToken = jwt.sign(payload, "authorization", {   
              expiresIn: "10080m",
            });
          res.header("jwt-token",generatedToken);
          return res.status(201).send({message:`${name} You are logged in`,token:generatedToken});
      }else{
          return res.status(400).send({message:"Invalid credentials"});
      };
  }catch(err){
      return res.status(400).send(err.message);
  };
}