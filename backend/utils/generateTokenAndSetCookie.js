import jwt from "jsonwebtoken"


export const generateTokenAndSetCookie=(res,UserId)=>{
    const token =jwt.sign({UserId},process.env.JWT_SECRET,{
        expiresIn:"7d",
    })

    res.cookie("token",token,{
        httpOnly:true, //prevent XSS attacks
        secure:process.env.NODE_ENV ==="production",
        sameSite:"strict", //CRSf attack prevention
        maxAge: 7 * 24 * 60 * 60  *1000,
    })
    return token;
}