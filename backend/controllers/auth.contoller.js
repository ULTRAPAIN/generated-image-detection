import bcryptjs from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import {sendVerificationEmail} from '../mailtrap/emails.js'
import { sendWelcomeEmail } from '../mailtrap/emails.js';
import { sendPasswordResetEmail } from '../mailtrap/emails.js';
import { sendResetSuccessEmail } from '../mailtrap/emails.js';
import {User} from '../models/user.model.js';
import { log } from "console";
import { json } from "stream/consumers";
import { STATUS_CODES } from "http";

export const signup=async(req,res)=>{
    const {email, password, name} = req.body;

try {
    if(!email || !password || !name){
        throw new Error("All fields are required");
    }
const userAlreadyExists = await User.findOne({email});
if(userAlreadyExists){
    return res.status(400).json({success:false,message:"User already exists"});
}

const hashedPassword =await bcryptjs.hash(password,10);
//123456 to  $12_98(*)#% like this format
const verificationCode =  generateVerificationCode();
const user = new User ({
    email,
    password:hashedPassword,
    name,
    verificationToken:verificationCode,
    verificationTokenExpiresAt:Date.now() + 24 * 60 * 60 * 1000 //24hrs
})

await user.save(); //save the New user to the database

//Lets create a token for the verified User, that registers in to the Database
//JWT
generateTokenAndSetCookie(res,User._id)
 await sendVerificationEmail(user.email,verificationCode);
res.status(201).json({success:true,message:"User created Successfully",user:{
    ...user._doc,
    password:undefined
}})

} catch (error) {
    res.status(400).json({success:false,message:error.message})
}
}

export const verifyEmail=async (req,res)=>{
    // - - - - - - 
    const {code}=req.body;
    try {
        const user = await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt:{$gt:Date.now()}
        })
        if(!user){
            return res.status(400).json({success:false,message:"Invalid or expired verification code"})
        }
        user.isVerified=true;
        user.verificationToken=undefined;
        user.verificationTokenExpiresAt=undefined;
        await user.save()
        await sendWelcomeEmail(user.email,user.name);
        res.status(200).json({success:true,message:"Email Verified successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
    });
    } catch (error) {
        console.error("Error in Email verification",error);
        res.status(500).json({success:false,message:error});
    }
}
export const login=async(req,res)=>{
   const {email,password}=req.body;
   try {
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({success:false,message:"Invalid credentials"});
    }
    const isPasswordValid =  await bcryptjs.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({success:false,message:"Invalid Password"})
    }
    generateTokenAndSetCookie(res,user._id);
    user.lastLogin = new Date();
    await user.save();
    res.status(200).json({
        success:true,
        message:"Logged in successfully",
        user:{
            ...user._doc,
            password:undefined,
        },
    });
   } catch (error) {
    console.log("Error in login",error);
    res.status({success:false,message:error.message})
   }
}
export const logout=async(req,res)=>{
    res.clearCookie("token")
    res.status(200).json({success:true,message:"Logged out successfully"})
}

export const forgotPassword = async (req,res) => {
    const {email}=req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status({success:false,message:"User not Found"});
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now()+1*60*60*1000 //1hour
        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt=resetTokenExpiresAt;
        await user.save();

        //send email

        await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({success:true,message:"Password Reset link sent to your email"});
    } catch (error) {
        console.log("Error in forgot password",error);
        res.status(400).json({success:false,message:error.message});
    }
}

export const resetPassword =  async (req,res) => {
    try {
       const {token}=req.params 
       const {password}=req.body;
       const user = await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpiresAt:{$gt:Date.now()},
       })
       if(!user){
        res.status(400).json({success:false,message:"Invalid or expired reset token"});
       }

       //update the password
        const hashedPassword = await bcryptjs.hash(password,10);
        user.password=hashedPassword;
        user.resetPasswordExpiresAt=undefined;
        user.resetPasswordToken=undefined;
        await user.save();
        await sendResetSuccessEmail(user.email);
        res.status(200).json({success:true,message:"Password reset successfully"})
    } catch (error) {
        console.log("Error in reset Password",error);
        res.status(400).json({success:false,message:error});
    }
    
}

export const  checkAuth = async (req,res) => {
    try {
        console.log("User ID received in checkAuth:", req.userID);
        const user = await User.findById(req.userID);
        if(!user){
            return res.status(400).json({success:false,message:"User not found"});
        }
        res.status(200).json({
            success:true,
            user:{
                ...user._doc,
                password:undefined
            }
        })
    } catch (error) {
        console.log("Error in checkAuth",error);
        res.status(400).json({success:false,message:error});
    }
}