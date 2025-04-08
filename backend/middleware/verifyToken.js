import jwt from "jsonwebtoken";
export const verifyToken=(req,res,next)=>{
    const token = req.cookies.token
    // console.log("token:-",token)
    if(!token){
        return res.status(401).json({success:false,message:"Unauthorized - no token provided"});
    }    
    try{
const decoded =  jwt.verify(token,process.env.JWT_SECRET)
console.log("decode token :-",decoded)
if(!decoded.UserId){
    return res.status(401).json({success:false,message:"Unauthorized - Invalid token"});
}
req.userID=decoded.UserId;
console.log(req.userID)
next();
}
    catch(error){
    console.log("Error in verification",error);
    return res.status(500).json({success:false,message:"Server error"});
    
    }
}