import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
email:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true
},
name:{
    type:String,
    required:true
},
lastLogin:{
    type:Date,
    default:Date.now
},
isVerified:{
     type:Boolean,
     default:false
},
resetPasswordToken:String,
resetPasswordExpiresAt:Date,
verificationToken:String,
verificationTokenExpiresAt:Date,

},{timestamps:true});

//created and updated at will be added in to the document --> timestamps:true

export const User = mongoose.model("User",userSchema);