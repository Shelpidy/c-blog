import { Request, Response, NextFunction } from "express";
import { jwtDecode } from "../utils/Utils";

export default async (request: Request, response: Response, next: NextFunction) => {
    let { authorization } = request.headers;
    let accessToken = authorization?.split(" ")[1];
  
    if (accessToken) {
       let decodedData = await jwtDecode(accessToken)
       console.log("Decoded Access Key",decodedData)
       console.log(decodedData)
        response.locals = {
            userId:decodedData?.userId,
        };
        next();
    } else {
        response.locals = {
            userId: "myUserId",
        };
        next();
    }
};
