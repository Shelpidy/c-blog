import {Request,Response,NextFunction} from "express"

export default (request:Request,response:Response,next:NextFunction)=>{
   let {apiAccessKey} = request.headers
   if(apiAccessKey === 'schoolall'){
     next()
   }else{
    next()
   }
}