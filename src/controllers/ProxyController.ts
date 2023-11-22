import { Router, Request, Response } from "express";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import Follow from "../models/Follows";
import Like from "../models/Likes";
import Blog from "../models/Blogs";
import User from "../models/Users";
import { Op } from "sequelize";
import Share from "../models/Shares";
import Comment from "../models/Comments";
import axios from "axios";

const router = Router();

router.get("/search", async (req: Request, res: Response) => {
    try {
        const searchTerm: string = req.query.q?.toString().toLowerCase() || "";
        let userId = res.locals.userId;
        // Your logic to search for users based on searchTerm
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.iLike]: `%${searchTerm}%` } },
                    { lastName: { [Op.iLike]: `%${searchTerm}%` } },
                    { middleName: { [Op.iLike]: `%${searchTerm}%` } },
                    { email: { [Op.iLike]: `%${searchTerm}%` } },
                    { gender: { [Op.iLike]: `%${searchTerm}%` } },
                    { dob: { [Op.iLike]: `%${searchTerm}%` } },
                    { bio: { [Op.iLike]: `%${searchTerm}%` } },
                ],
            },
        });

        let newUsers = users.map((user) => {
            return {
                ...user.dataValues,
                fullName: user.getFullname(),
            };
        });

        // Your logic to search for blogs based on searchTerm
        const blogs = await Blog.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${searchTerm}%` } },
                    { summary: { [Op.iLike]: `%${searchTerm}%` } },
                    { text: { [Op.iLike]: `%${searchTerm}%` } },
                    {
                        userId: {
                            [Op.in]: users.map((user) =>
                                user.getDataValue("userId")
                            ),
                        },
                    },
                ],
            },
        });

        let newBlogs = await Promise.all(
            blogs.map(async (blog) => {
                let likes = await Like.findAndCountAll({
                    where: { refId: blog.getDataValue("blogId") },
                });
                let shares = await Share.findAndCountAll({
                    where: { refId: blog.getDataValue("blogId") },
                });
                let comments = await Comment.findAndCountAll({
                    where: { refId: blog.getDataValue("blogId") },
                });
                let createdBy = await User.findOne({
                    where: { userId: blog.getDataValue("userId") },
                });

                let ownedBy = await User.findOne({
                    where: { userId: blog.getDataValue("fromUserId") },
                });

                // let secondUser = await User.findOne({where:{id:blog.getDataValue("fromId")}})
                let liked = likes.rows.some(
                    (like) => like.getDataValue("userId") == userId
                );

                let reposted = shares.rows.some(
                    (share) => share.getDataValue("userId") == userId
                );
                let { data: statusData, status: chatResponseStatus } =
                    await axios.get(
                        `http://192.168.1.98:8080/user-status/proxy/${blog.getDataValue(
                            "userId"
                        )}`,
                        {
                            headers: {
                                Authorization: `Bearer ${res.locals.token}`,
                            },
                        }
                    );

                let lastSeenStatus =
                    (statusData?.data.online
                        ? "online"
                        : statusData?.data.lastSeen) ?? "";
                console.log({ lastSeenStatus });
                return {
                    blog: blog.dataValues,
                    liked,
                    reposted,
                    likesCount: likes.count,
                    sharesCount: shares.count,
                    commentsCount: comments.count,
                    createdBy: {
                        ...createdBy?.dataValues,
                        fullName: createdBy?.getFullname(),
                        lastSeenStatus,
                    },
                    ownedBy:
                        {
                            ...ownedBy?.dataValues,
                            fullName: ownedBy?.getFullname(),
                        } || null,
                };
            })
        );

        res.status(responseStatusCode.OK).json({
            status: responseStatus.SUCCESS,
            users: newUsers,
            blogs: newBlogs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get(
    "/follows/proxy/f-f/:userId",
    async (req: Request, res: Response) => {
        try {
            let { userId } = req.params;

            let { rows: blogs, count: totalBlogs } = await Blog.findAndCountAll(
                { where: { userId } }
            );

            let postIds = await Promise.all(
                blogs.map((blog) => blog.getDataValue("blogId"))
            );

            let { count: totalLikes } = await Like.findAndCountAll({
                where: { refId: postIds },
            });

            let followers = await Follow.findAndCountAll({
                where: { followingId: userId },
            });

            let followings = await Follow.findAndCountAll({
                where: { followerId: userId },
            });

            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                data: {
                    followers,
                    followings,
                    totalPosts: totalBlogs,
                    totalLikes,
                },
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, String(err))
            );
        }
    }
);

export default router;
