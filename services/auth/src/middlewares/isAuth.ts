import { Request, Response, NextFunction } from "express";
import jwt,  { JwtPayload } from "jsonwebtoken";
import { IUser } from "../model/user.js";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Please Login - No auth header" });
        return;
    }
        const token  = authHeader?.split(" ")[1];

        if(!token){
            res.status(401).json({ message: "Please Login - Token missing" });
        return;
        }

        const decodeValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if(!decodeValue || !decodeValue.user){
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = decodeValue.user as IUser;
        next();
        
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" }); 
  }
}

