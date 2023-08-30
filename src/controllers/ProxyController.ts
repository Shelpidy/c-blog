import { Router,Request,Response} from "express"
import { getResponseBody, responseStatus, responseStatusCode } from "../utils/utils"
import Follow from "../models/Follows"
import Like from "../models/Likes"
import Blog from "../models/Blogs"

const router = Router()

router.get("/follows/proxy/f-f/:userId",async(req:Request,res:Response)=>{
    try{
        let {userId} = req.params;

        let {rows:blogs,count:totalBlogs} = await Blog.findAndCountAll({where:{userId}})

        let postIds = await Promise.all((blogs).map(blog => blog.getDataValue("blogId")))

        let {count:totalLikes} = await Like.findAndCountAll({where:{refId:postIds}})

        let followers = await Follow.findAndCountAll({
            where: { followingId: userId },
        });

        let followings = await Follow.findAndCountAll({
            where: { followerId: userId },
        });

        res.status(responseStatusCode.OK).json({
            status: responseStatus.SUCCESS,
            data: {followers,followings,totalPosts:totalBlogs,totalLikes},
        });

    }catch(err) {
        console.log(err);
        res.status(responseStatusCode.BAD_REQUEST).json(
            getResponseBody(responseStatus.ERROR,String(err))
        );
    }

})

export default router