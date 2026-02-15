import jwt from "jsonwebtoken";
import User from "../model/user.js";
import tryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";


export const loginUser = tryCatch(async (req, res) =>{
    const { code } = req.body;

    if(!code){
        return res.status(400).json({message: "Authorization code is required"});
    }

    const googleRes = await oauth2client.getToken(code)
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);


    const {email, name, image} = userRes.data;

    let user = await User.findOne({email})

    if(!user){
        user = await User.create({
            name,
            email,
            image: image || null,
        });
    }

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {
            expiresIn: "15d"
        });
    res.status(200).json({message: "Login successful", token, user})
})

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = tryCatch(async(req: AuthenticatedRequest, res) => {
    if(!req.user?._id) {
          return res.status(400).json({message: "User not authenticated"});
    }
    const { role } =  req.body as { role: Role };

    if(!allowedRoles.includes(role)) {
        return res.status(400).json({message: "Invalid role"});
    }

    const user = await User.findByIdAndUpdate(req.user._id, {role}, {new: true});

    if(!user){
        res.status(404).json({message: "User not found"});
        return;
    }

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {
        expiresIn: "15d"
    });
    res.status(200).json({message: "Role added successfully", token, user})
    }
)

export const myProfile = tryCatch(async(req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.status(200).json({message: "User profile", user})
})