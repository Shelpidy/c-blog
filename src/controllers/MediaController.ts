import express, { Router } from "express";

import { Op } from "sequelize";
import User from "../models/Users";
import Follow from "../models/Follows";
import Blog from "../models/Blogs";
import { runUpdateUserVerification } from "../events/producers";
import axios from "axios";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
    updateUserVerification,
} from "../utils";

type Verification = {
    verificationData: {
        verified: boolean;
        verificationRank: "low" | "medium" | "high";
    };
    userId: string;
};

let app = Router();
// Follow or unfollow a user

app.put("/follows", async (req: express.Request, res: express.Response) => {
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
            const followers = await Follow.findAndCountAll();
            if (followers.count > 5) {
                let verificationData: Verification = {
                    verificationData: {
                        verified: true,
                        verificationRank: "low",
                    },
                    userId: followingId,
                };

                await Promise.all([
                    await updateUserVerification(verificationData),
                    await runUpdateUserVerification(verificationData),
                ]);
            }
            return res
                .status(responseStatusCode.ACCEPTED)
                .json(
                    getResponseBody(
                        responseStatus.SUCCESS,
                        "Unfollowed successfully",
                        { data: { affectedRow, followed: false } }
                    )
                );
        }
        const newFollow = await Follow.create({
            followerId,
            followingId,
            createdAt: new Date(),
        });
        res.status(responseStatusCode.CREATED).json(
            getResponseBody(responseStatus.SUCCESS, "Followed Sucessfully", {
                data: { newFollow: newFollow, followed: true },
            })
        );
    } catch (err) {
        console.log(err);
        res.status(responseStatusCode.BAD_REQUEST).json(
            getResponseBody(responseStatus.ERROR, String(err))
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
                    ![...ids, userId].includes(user.getDataValue("userId"))
            );

            if (!users) {
                return res.status(responseStatusCode.NOT_FOUND).json({
                    status: responseStatus.ERROR,
                    message: `User with userId ${userId} does not exist`,
                });
            }

            let newUsers = await Promise.all(
                users.map(async (user) => {
                    let { data: statusData, status: chatResponseStatus } =
                        await axios.get(
                            `http://192.168.1.98:8080/user-status/proxy/${userId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${res.locals.token}`,
                                },
                            }
                        );
                    let lastSeenStatus =
                        (statusData?.online
                            ? "online"
                            : statusData?.lastSeen) ?? "";
                    console.log({ lastSeenStatus });
                    return {
                        ...user.dataValues,
                        fullName: user.getFullname(),
                        lastSeenStatus,
                    };
                })
            );

            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                data: newUsers,
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                data: String(err),
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
            ).map((obj) => obj.getDataValue("followerId"));

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
            let newUsers = await Promise.all(
                users.map(async (user) => {
                    let _following = await Follow.findOne({
                        where: {
                            [Op.and]: [
                                { followerId: userId },
                                { followingId: user.getDataValue("userId") },
                            ],
                        },
                    });
                    return {
                        ...user.dataValues,
                        fullName: user.getFullname(),
                        following: _following ? true : false,
                    };
                })
            );
            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                data: newUsers,
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: String(err),
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
            const _users = await User.findAll({
                where: { userId: ids },
                order: [["createdAt", "DESC"]],
            });

            let users = await Promise.all(
                _users.map(async (user) => {
                    return {
                        ...user.dataValues,
                        fullName: user.getFullname(),
                        following: true,
                    };
                })
            );

            if (!users) {
                return res.status(responseStatusCode.NOT_FOUND).json({
                    status: responseStatus.ERROR,
                    message: `User with userId ${userId} does not exist`,
                });
            }
            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                data: users,
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: String(err),
            });
        }
    }
);

// Get all likes and followed or followers that like that specific post
app.get(
    "/blogs/:blogId/follows/likes",
    async (req: express.Request, res: express.Response) => {
        const { blogId } = req.params;
        const { user: currentUserId } = res.locals;

        try {
            const likes = await Blog.findAll({
                where: { blogId },
            });

            const userIds = likes.map((like) => like.getDataValue("userId"));
            const getUserFollowingIds = (
                await Follow.findAll({
                    where: {
                        [Op.or]: [
                            { followerId: currentUserId },
                            { followingId: currentUserId },
                        ],
                    },
                })
            ).map((following) => following.getDataValue("followingId"));
            let setOne = new Set(userIds);
            let setTwo = new Set(getUserFollowingIds);
            const commonIds = new Array(
                ...new Set([...setOne].filter((data) => setTwo.has(data)))
            );
            let usersLiked = await User.findAll({
                where: { userId: [commonIds] },
            });

            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", {
                    data: {
                        likes,
                        sessionUsers: usersLiked,
                    },
                })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, String(err))
            );
        }
    }
);

export default app;
