import express,{Router,Request,Response} from "express"
import { responseStatusCode } from "../utils/utils"

const router:Router = express.Router()

///////////////////// GET ALL BLOG POSTS /////////////////////////

router.get("/blogs",async(request:Request,response:Response)=>{
    try{
        let blogs:Blog[] = []
        return response.sendStatus(responseStatusCode.OK).json({
            items:blogs
        })
    }catch(err){
        return response.sendStatus(responseStatusCode.BAD_REQUEST).json({
            message:"Error"
        })
    } 
})

///////////////////// GET A SINGLE BLOG POST BY BLOGID /////////////////////////

router.get("/blogs/blogId",async(request:Request,response:Response)=>{
    try{
        let blog:Partial<Blog>= {}
        return response.sendStatus(responseStatusCode.OK).json({...blog
        })
    }catch(err){
        return response.sendStatus(responseStatusCode.BAD_REQUEST).json({
            message:"Error"
        })
    }
   
})

export default router