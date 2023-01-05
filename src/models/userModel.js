const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    phoneNumber: { type: String, required: true ,unique:true},
    password:{type:String,required:true},
    age: { type: Number, required: true },
    pincode: { type: Number, required: true },
    aadhar_No: { type: String, required: true ,unique:true},
    Vaccination_status:{
        type :String,
        enum:["none","firstDose","secondDose"],
        default:"none"
    },
    isDeleted:{type:Boolean,default:false}


}, { timestamps: true })

module.exports = mongoose.model("User-2", userSchema)