const {isValidObjectId}=require("mongoose")
const userModel = require("../models/userModel")
const {verify}=require("jsonwebtoken")


exports.authentication=(req,res,next)=>{
    try{  
  let token =req.headers.authorization
  if(!token) return res.status(400).send({status:false,message:"token is mandatory!"})
  token=token.slice(7)
  verify(token,`${process.env.SECREAT_KEY}`,(err,decodedToken)=>{
    if(err){ return res.status(401).send({status:false,message:err.message})}
    req.id=decodedToken.userId
    next()
  })
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}

exports.authorisation=async (req,res,next)=>{
    try{
    const {userId}=req.params
    if(!isValidObjectId(userId)) return res.status(400).send({status:false,message:"please provide valid userId"})
    let user=await userModel.findOne({_id:userId,isDeleted:false})
    if(!user) return res.status(404).send({status:false,message:"user not exists!!"})
    if(user._id.toString()!=req.id){
        return res.status(403).send({status:false,message:"unauthorised person!!"})
    }
    if(user.Vaccination_status=="secondDose"){
        return res.status(400).send({status:false,message:`${user.name} have already completed two dose of vaccination`})
    }
    req.user=user
    next()
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}