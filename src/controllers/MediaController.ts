import express from "express";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { Op } from "sequelize";
import User from "../models/Users";
import Follow from "../models/Follows";
import Blog from "../models/Blogs";

export default function mediaController(app: express.Application) {


    // Follow or unfollow a user

    app.put("/follows", async (req:express.Request, res:express.Response) => {
        const { followerId, followingId } = req.body;
        try {
            const follow = await Follow.findOne({
                where: { followerId, followingId },
            });

            if (follow) {
                let affectedRow = await Follow.destroy({
                    where: { followerId, followingId },
                });
                if (affectedRow < 1) {
                    return res
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json(
                            getResponseBody(
                                responseStatus.UNPROCESSED,
                                "Fail to unfollow"
                            )
                        );
                }
                return res
                    .status(responseStatusCode.ACCEPTED)
                    .json(
                        getResponseBody(
                            responseStatus.SUCCESS,
                            "Unfollowed successfully",
                            {item:{ affectedRow, followed: false }}
                        )
                    );
            }
            const newFollow = await Follow.create({
                followerId,
                followingId,
                createdAt: new Date(),
            });
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    "Followed Sucessfully",
                    {item:{newFollow: newFollow, followed: true }}
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR,String(err))
            );
        }
    });

    /////////////////////////// GET USERS UNFOLLOWED /////////////////////////////
    app.get(
        "/follows/unfollowing/:userId",
        async (req: express.Request, res: express.Response) => {
            const { userId } = req.params;
            try {
                let ids = (
                    await Follow.findAll({
                        where: { followerId: userId },
                    })
                ).map((obj) => obj.getDataValue("followingId"));

                console.log([...ids, userId]);
                const users = (
                    await User.findAll({
                        order: [["createdAt", "DESC"]],
                    })
                ).filter(
                    (user) =>
                        ![...ids, Number(userId)].includes(
                            user.getDataValue("userId")
                        )
                );
                if (!users) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with userId ${userId} does not exist`,
                    });
                }
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    items: users,
                });
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    item:String(err),
                });
            }
        }
    );

    /////////// GET USER FOLLOWERS ////////////////////

    app.get(
        "/follows/followers/:userId",
        async (req: express.Request, res: express.Response) => {
            const { userId } = req.params;
            try {
                let ids = (
                    await Follow.findAll({
                        where: { followingId: userId },
                    })
                ).map(obj => obj.getDataValue("followerId"));

                console.log([...ids]);
                const users = (
                    await User.findAll({
                        order: [["createdAt", "DESC"]],
                    })
                ).filter((user) => [...ids].includes(user.getDataValue("userId")));
                if (!users) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with userId ${userId} does not exist`,
                    });
                }
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    items: users,
                });
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message:String(err),
                });
            }
        }
    );

    /////////////////////////// GET USERS FOLLOWED /////////////////////////////
    app.get(
        "/follows/followings/:userId",
        async (req: express.Request, res: express.Response) => {
            const { userId } = req.params;

            try {
                let ids = (
                    await Follow.findAll({
                        where: { followerId: userId },
                    })
                ).map((obj) => obj.getDataValue("followingId"));
                //   console.log(ids)
                const users = await User.findAll({
                    where: { userId: ids},
                    order: [["createdAt", "DESC"]],
                });
                if (!users) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with userId ${userId} does not exist`,
                    });
                }
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    items: users,
                });
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message:String(err),
                });
            }
        }
    );

  
    // Get all likes and followed or followers that like that specific post
    app.get(
        "/blogs/:blogId/follows/likes",
        async (req:express.Request, res:express.Response) => {
            const { blogId} = req.params;
            const {user:currentUserId} = res.locals;

            try {
                const likes = await Blog.findAll({
                    where: { blogId },
                });

                const userIds = likes.map(like =>
                    like.getDataValue("userId")
                );
                const getUserFollowingIds = (
                    await Follow.findAll({
                        where:{[Op.or]:[ { followerId: currentUserId }, { followingId: currentUserId }]},
                    })
                ).map((following) => following.getDataValue("followingId"));
                let setOne = new Set(userIds);
                let setTwo = new Set(getUserFollowingIds);
                const commonIds = new Array(
                    ...new Set([...setOne].filter((item) => setTwo.has(item)))
                );
                let usersLiked = await User.findAll({
                    where: { userId: [commonIds] },
                });

                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {item:{
                        likes,
                        sessionUsers: usersLiked,
                    }})
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR,String(err))
                );
            }
        }
    );

    }