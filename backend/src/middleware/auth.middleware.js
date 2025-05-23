import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        //this jwt is in utils if i wrote x it would be req.cookies.x
        if(!token){
            return res.status(401).json({message:"Unauthorized- no token Provided"})
        }
        //in token thereis a userId we passed in token generateToken function
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized access"});
        }
        const user=await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        req.user=user;
        next();
    }
    catch(e){
       console.log("error in protect route middleware ",e.message);
       res.status(500).json({message:"Internal Server Error"});
    }
}

