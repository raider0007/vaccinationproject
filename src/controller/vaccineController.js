const vaccineSlotModel = require("../models/vaccineModel")



exports.vaccineSlot=async (req,res)=>{
    try{
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "request body is empty !!" })
    let vaccineSlot=await vaccineSlotModel.create(req.body)
    return res.status(201).send({status:true,message:"vaccineSlot created successfully",data:vaccineSlot})
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}