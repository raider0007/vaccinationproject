const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    name: {
         type: String,                 
          required: true,              //Field is mandatory
          trim:true                    //Remove the all spaces between the word
         },
    phoneNumber: 
    { type: String,
         required: true ,
         unique:true                   //Must be unique
        },
    password:{
        type:String,
        required:true
    },
    age: { 
        type: Number,
         required: true
         },
    pincode: {
         type: Number,
          required: true
         },
    aadhar_No: { type: String,
         required: true           
          ,unique:true           
        },
    Vaccination_status:{
        type :String,
        enum:["none","firstDose","secondDose"],
        default:"none"
    },
    isDeleted:{
        type:Boolean,
        default:false
    }


}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)  //Here "model" use for wrapping the Schema
