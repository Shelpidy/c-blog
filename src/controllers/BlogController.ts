import express,{Router} from "express";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { v4 } from "uuid";
import { Op } from "sequelize";
import User from "../models/Users";
import Blog from "../models/Blogs";
import Like from "../models/Likes";
import Comment from "../models/Comments";
import Share from "../models/Shares";
import { HTMLScrapper } from "../services/services";
import Follow from "../models/Follows";

type Verification = {verificationData:{verified:boolean,verificationRank:"low"|"medium"|"high"},userId:string}

    let app = Router()
    ///////////////// GET A SINGLE POST DATA BY blogId ////////////////////////////

    app.get(
        "/blogs/:blogId/",
        async (req: express.Request, res: express.Response) => {
            const { blogId } = req.params;
            const { userId } = res.locals;
            try {
                const post = await Blog.findOne({
                    where: { blogId },
                });

                if (!post) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `Post with id ${blogId} does not exist`,
                    });
                }
               
                let likes = await Like.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
            
                let shares = await Share.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
                let comments = await Comment.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
                let createdBy = await User.findOne({
                    where: { userId: post.getDataValue("userId") },
                });

                let ownedBy = await User.findOne({
                    where: { userId: post.getDataValue("fromUserId") },
                });
            
                // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                let liked = likes.rows.some(
                    (like) => like.getDataValue("userId") == userId
                );
                let returnPost = {
                    blog:post.dataValues,
                    liked,
                    likesCount: likes.count,
                    sharesCount: shares.count,
                    commentsCount:comments.count, 
                    createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                    ownedBy:{...ownedBy?.dataValues,fullName:ownedBy?.getFullname()} || null
                };
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: returnPost,
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

    /////////////////// GET ALL USER POSTS /////////////

    app.get(
        "/blogs/users/:userId",
        async (req: express.Request, res: express.Response) => {
            try {
                const { userId } = req.params;
                const { pageNumber = 1, numberOfRecords = 100} = req.query;
                let numRecs = Number(numberOfRecords);
                let start = (Number(pageNumber) - 1) * numRecs;
                const posts = await Blog.findAll({
                    where: { userId },
                    order: [["createdAt", "DESC"]],
                    limit: numRecs,
                    offset: start
                });
                let returnPosts = await Promise.all(
                    posts.map(async (post) => {
                        let likes = await Like.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let shares = await Share.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let comments = await Comment.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: post.getDataValue("userId") },
                        });

                        let ownedBy = await User.findOne({
                            where: { userId: post.getDataValue("fromUserId") },
                        });
                    
                        // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                        let liked = likes.rows.some(
                            (like) => like.getDataValue("userId") == userId
                        );
                        return {
                            blog:post.dataValues,
                            liked,
                            likesCount: likes.count,
                            sharesCount: shares.count,
                            commentsCount:comments.count, 
                            createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                            ownedBy:{...ownedBy?.dataValues,fullName:ownedBy?.getFullname()} || null
                        };
                    })
                );
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: returnPosts,
                });
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    data: err,
                });
            }
        }
    );

     /////////////////// GET ALL POST BY A USER SESSION /////////////

     app.get(
        "/sessions/blogs",
        async (req: express.Request, res: express.Response) => {
           
            try {
                const { userId} = res.locals;
                console.log({userId})
                const { pageNumber = 1, numberOfRecords = 100} = req.query;
                let numRecs = Number(numberOfRecords);
                let start = (Number(pageNumber) - 1) * numRecs;
        
                let ids = (
                    await Follow.findAll({
                        where:{[Op.or]:[{ followerId: userId },{followingId:userId}]},
                    })
                ).map((obj) => obj.getDataValue("followingId"));
                //   console.log(ids)
                const posts = await Blog.findAll({
                    where: { userId: [...ids, userId] },
                    order: [["createdAt", "DESC"]],
                    limit:numRecs,
                    offset:start
                });

                // if (!posts) {
                //     return res.status(responseStatusCode.NOT_FOUND).json({
                //         status: responseStatus.ERROR,
                //         message: `Post with userId ${userId} does not exist`,
                //     });
                // }
                let returnPosts = await Promise.all(
                    posts.map(async (post) => {
                        let likes = await Like.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let shares = await Share.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let comments = await Comment.findAndCountAll({
                            where: { refId: post.getDataValue("blogId") },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: post.getDataValue("userId") },
                        });

                        let ownedBy = await User.findOne({
                            where: { userId: post.getDataValue("fromUserId") },
                        });
                    
                        // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                        let liked = likes.rows.some(
                            (like) => like.getDataValue("userId") == userId
                        );
                        return {
                            blog:post.dataValues,
                            liked,
                            likesCount: likes.count,
                            sharesCount: shares.count,
                            commentsCount:comments.count, 
                            createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                            ownedBy:{...ownedBy?.dataValues,fullName:ownedBy?.getFullname()} || null
                        };
                    })
                );
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    data: returnPosts,
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

    // Get all posts

    app.get("/blogs/", async (req, res) => {
        try {
            const { userId } = res.locals;
            const { pageNumber = 1, numberOfRecords = 100 } = req.query;
            let numRecs = Number(numberOfRecords);
            let start = (Number(pageNumber) - 1) * numRecs;
            const posts = await Blog.findAll({
                order: [["createdAt", "DESC"]],
                limit: numRecs,
                offset: start,
            });
            let returnPosts = await Promise.all(
                posts.map(async (post) => {
                    let likes = await Like.findAndCountAll({
                        where: { refId: post.getDataValue("blogId") },
                    });
                    let shares = await Share.findAndCountAll({
                        where: { refId: post.getDataValue("blogId") },
                    });
                    let comments = await Comment.findAndCountAll({
                        where: { refId: post.getDataValue("blogId") },
                    });
                    let createdBy = await User.findOne({
                        where: { userId: post.getDataValue("userId") },
                    });

                    let ownedBy = await User.findOne({
                        where: { userId: post.getDataValue("fromUserId") },
                    });
                
                    // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                    let liked = likes.rows.some(
                        (like) => like.getDataValue("userId") == userId
                    );
                    return {
                        blog:post.dataValues,
                        liked,
                        likesCount: likes.count,
                        sharesCount: shares.count,
                        commentsCount:comments.count, 
                        createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                        ownedBy:{...ownedBy?.dataValues,fullName:ownedBy?.getFullname()} || null
                    };
                })
            );
            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                data: returnPosts,
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: String(err),
            });
        }
    });

    // Add a new post

    app.post("/blogs", async (req, res) => {
        try {
            const postObj = req.body;
            console.log({htmlContent:postObj.text})
            let htmlScrapper = new HTMLScrapper();
           
            let summary = await htmlScrapper.getSummary({html:postObj.text});
            let slug = v4();
            const { userId } = res.locals;

            const modifiedPostObj = {
                ...postObj,
                summary,
                slug,
                userId,
            };
            const post = await Blog.create(modifiedPostObj);
            res.status(responseStatusCode.CREATED).json({
                status: responseStatus.SUCCESS,
                message: "Successfully added a post",
                data:post
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: String(err),
            });
        }
    });

    // Update a post
    app.put("/blogs/:blogId", async (req, res) => {
        try {
            let blogId = req.params.blogId;
            const { userId } = res.locals;
            var updatedPostObj;
            const postObj = req.body;
            let htmlScrapper = new HTMLScrapper();
           
            const post = await Blog.findByPk(blogId);
            if (!post) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Post with blogId ${blogId} does not exist`
                        )
                    );
            }
            if(postObj.text){
                let summary = await htmlScrapper.getSummary({html: postObj.content });
                updatedPostObj = {
                    ...postObj,
                    summary,
                    userId,
                };

            }else{
                updatedPostObj = {
                ...postObj,
                userId,
            };

            }
            
            const affectedRow = await Blog.update(updatedPostObj, {
                where: { blogId },
            });
            let updatedBlog = await Blog.findByPk(blogId)
            res.status(responseStatusCode.ACCEPTED).json({
                status: responseStatus.SUCCESS,
                data:updatedBlog?.dataValues || {},
                affectedRow
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: String(err),
            });
        }
    });


    // Delete a post
    app.delete("/blogs/:blogId", async (req, res) => {
        const { blogId } = req.params;

        try {
            const post = await Blog.findByPk(blogId);
            if (!post) {
                return res.status(responseStatusCode.NOT_FOUND).json({
                    status: responseStatus.ERROR,
                    message: "Post not found",
                });
            }
            await post.destroy();
            await Comment.destroy({ where: { refId: blogId } });
            await Like.destroy({ where: { refId: blogId } });
            await Share.destroy({ where: { refId: blogId } });
            res.status(responseStatusCode.DELETED).json(
                getResponseBody(responseStatus.SUCCESS, "", {
                    message: "Successfully deleted a blog",
                })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    // Remove and add a like from a post or unlike a post

    app.put("/blogs/:blogId/likes/", async (req, res) => {
        try {
            const { userId } = res.locals;
            const blogId = req.params.blogId;
            const like = await Like.findOne({
                where: { userId, refId: blogId },
            });

            const likes = await Like.findAndCountAll({
                where: { refId: blogId },
            });

            if (like) {
                let affectedRow = await Like.destroy({
                    where: { userId, refId: blogId },
                });
                if (affectedRow < 1) {
                    return res
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json(
                            getResponseBody(
                                responseStatus.UNPROCESSED,
                                "Fail to unlike a post"
                            )
                        );
                }
                return res
                    .status(responseStatusCode.ACCEPTED)
                    .json(
                        getResponseBody(
                            responseStatus.SUCCESS,
                            "unliked a post successfully",
                            {
                                data: {
                                    affectedRow,
                                    liked: false,
                                    likesCount: likes.count - 1,
                                },
                            }
                        )
                    );
            }
            const newLike = await Like.create({
                userId,
                refId: blogId,
                createdAt: new Date(),
            });
            res.status(responseStatusCode.ACCEPTED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    "Liked a post sucessfully",
                    {
                        data: {
                            affectedRow: 1,
                            liked: true,
                            likesCount: likes.count + 1,
                        },
                    }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    ////////////  Get all Likes for a post /////////////////

    app.get("/blogs/:blogId/likes", async (req, res) => {
        try {
            const { blogId } = req.params;
            const likes = await Like.findAndCountAll({
                where: { refId: blogId },
            });

            const users = await Promise.all(
                likes.rows.map(async (like) => {
                    let user = await User.findOne({
                        where: { userId: like.getDataValue("userId") },
                    });
                    return {
                        likedAt: like.getDataValue("createdAt"),
                        likedBy: user?.dataValues,
                    };
                })
            );

            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", { data: users })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    ///////////////  Change status of a given blog ///////////////////



    // COMMENTS SECTION

    // Get all comments for a specific post
    app.get(
        "/blogs/:blogId/comments/",
        async (req, res) => {
           
            try {
                const {blogId} = req.params
                const { pageNumber = 1, numberOfRecords = 100 } = req.query;
                let { userId } = res.locals;
                let numRecs = Number(numberOfRecords);
                let start = (Number(pageNumber) - 1) * numRecs;
                const comments = await Comment.findAll({
                    where: { refId: blogId },
                    order: [["createdAt", "DESC"]],
                    limit: numRecs,
                    offset: start,
                });

                if (comments.length < 1) {
                    return res
                        .status(responseStatusCode.OK)
                        .json(getResponseBody(responseStatus.SUCCESS, "", []));
                }

                const _comments = await Promise.all(
                    comments.map(async (comment) => {
                        let replies = await Comment.findAndCountAll({
                            where: { refId: comment.getDataValue('commentId') },
                        });
                        let likes = await Like.findAndCountAll({
                            where: { refId:comment.getDataValue('commentId') },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: comment.getDataValue("userId") },
                        });
                        let liked = likes.rows.some(
                            (like) => like.getDataValue("userId") == comment.getDataValue("userId")
                        );
                        return {
                            ...comment.dataValues,
                            repliesCount: replies.count,
                            likesCount: likes.count,
                            createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                            liked,
                        };
                    })
                );
                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        data: _comments,
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                );
            }
        }
    );

    // Add a new comment to a post
    app.post("/blogs/:blogId/comments/", async (req, res) => {
        try {
            const { content } = req.body;
            let { userId } = res.locals;
            let blogId = req.params.blogId;
            const comment = await Comment.create({
                userId,
                content,
                refId: blogId,
            });
            let replies = await Comment.findAndCountAll({
                where: { refId: comment.getDataValue("commentId")},
            });
            let likes = await Like.findAndCountAll({
                where: { refId: comment.getDataValue("commentId")},
            });
            let createdBy = await User.findOne({
                where: { userId: comment.getDataValue("userId") },
            });
            let liked = likes.rows.some(
                (like) => like.getDataValue("userId") === comment.getDataValue("userId")
            );
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added a comment to blogId = ${blogId}`,
                    { data:{
                        ...comment.dataValues,
                        repliesCount: replies.count,
                        likesCount: likes.count,
                        createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                        liked,
                    } }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    // Delete a comment ///////////////////////
    app.delete(
        "/comments/:commentId",
        async (req: express.Request, res: express.Response) => {
            const { commentId } = req.params;
            try {
                const comment = await Comment.findByPk(commentId);
                if (!comment) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `Comment with Id ${commentId} does not exist`,
                    });
                }
                await comment.destroy();
                await Comment.destroy({ where: { refId: commentId } });
                await Like.destroy({ where: { refId: commentId } });
                res.status(responseStatusCode.DELETED).json(
                    getResponseBody(
                        responseStatus.SUCCESS,
                        "Successfully deleted a comment"
                    )
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                );
            }
        }
    );

    // Update a comment  or a reply
    app.put("/comments/:commentId", async (req, res) => {
        const { content } = req.body;
        const commentId = req.params.commentId;
        try {
            const comment = await Comment.findByPk(commentId)
            if(!comment){
                return res
                    .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                    .json(
                        getResponseBody(
                            responseStatus.UNPROCESSED,
                            "Comment with given commentId does not exist"
                        )
                    );

            }
            const affectedRow = await Comment.update(
                { content },
                { where: { commentId } }
            );
            if (affectedRow[0] < 1) {
                return res
                    .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                    .json(
                        getResponseBody(
                            responseStatus.UNPROCESSED,
                            "Fail to update a comment"
                        )
                    );
            }
            res.status(responseStatusCode.ACCEPTED).json(
                getResponseBody(responseStatus.SUCCESS, "Update successfully", {
                   data:{...comment.dataValues,content:content},
                   affectedRow,
                })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    ///////// Remove/add a comment or a reply like //////////////////////////////

    app.put("/comments/:commentId/likes/", async (req, res) => {
        const { userId } = res.locals;
        const commentId = req.params.commentId;
        try {
            const like = await Like.findOne({
                where: { userId, refId: commentId },
            });

            const likes = await Like.findAndCountAll({
                where: { refId: commentId },
            });

            if (like) {
                let affectedRow = await Like.destroy({
                    where: { userId, refId: commentId },
                });
                if (affectedRow < 1) {
                    return res
                        .status(responseStatusCode.UNPROCESSIBLE_ENTITY)
                        .json(
                            getResponseBody(
                                responseStatus.UNPROCESSED,
                                "Fail to unlike a comment"
                            )
                        );
                }
                return res
                    .status(responseStatusCode.ACCEPTED)
                    .json(
                        getResponseBody(
                            responseStatus.SUCCESS,
                            "unliked a comment successfully",
                            {
                                data: {
                                    affectedRow,
                                    liked: false,
                                    likesCount: likes.count - 1,
                                },
                            }
                        )
                    );
            }
            const newLike = await Like.create({
                userId,
                refId: commentId,
                createdAt: new Date(),
            });
            res.status(responseStatusCode.ACCEPTED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    "Liked a comment sucessfully",
                    {data:{
                        affectedRow: 1,
                        liked: true,
                        likesCount: likes.count + 1,
                    }}
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    //////////////// Get all likes for a comment or a reply ///////////////////////

    app.get("/comments/:commentId/likes", async (req, res) => {
        const { commentId } = req.params;
        try {
            const likes = await Like.findAndCountAll({
                where: { refId: commentId },
            });

            const users = await Promise.all(
                likes.rows.map(async (like) => {
                    let user = await User.findOne({
                        where: { userId: like.getDataValue("userId") },
                    });
                    return {
                        likedAt: like.getDataValue("createdAt"),
                        likedBy: user?.dataValues,
                    };
                })
            );

            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", { data: users })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    /////////////////////////////////////////// REPLY SECTION /////////////////////////////

    // Get all replies
    app.get(
        "/comments/:commentId/",
        async (req, res) => {
            const {commentId} = req.params
            const { pageNumber = 1, numberOfRecords = 100 } = req.query;
            let { userId } = res.locals;
            let numRecs = Number(numberOfRecords);
            let start = (Number(pageNumber) - 1) * numRecs;

            try {
                const comments = await Comment.findAll({
                    where: { refId: commentId },
                    order: [["createdAt", "DESC"]],
                    limit: numRecs,
                    offset: start,
                });

                if (comments.length < 1) {
                    return res
                        .status(responseStatusCode.OK)
                        .json(getResponseBody(responseStatus.SUCCESS, "",{data:[]}));
                }

                const _comments = await Promise.all(
                    comments.map(async (comment) => {
                        let replies = await Comment.findAndCountAll({
                            where: { refId: comment.getDataValue("commentId")},
                        });
                        let likes = await Like.findAndCountAll({
                            where: { refId: comment.getDataValue("commentId")},
                        });
                        let createdBy = await User.findOne({
                            where: { userId: comment.getDataValue("userId") },
                        });
                        let liked = likes.rows.some(
                            (like) => like.getDataValue("userId") === comment.getDataValue("userId")
                        );
                        return {
                            ...comment.dataValues,
                            repliesCount: replies.count,
                            likesCount: likes.count,
                            createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                            liked,
                        };
                    })
                );
                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        data: _comments,
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                );
            }
        }
    );

    ///////// add a new reply to a comment////

    app.post("/comments/:commentId/replies", async (req, res) => {
        try {
            const { content } = req.body;
            const { commentId } = req.params;
            const { userId } = res.locals;
            const reply = await Comment.create({
                refId: commentId,
                userId,
                content,
            });
            let replies = await Comment.findAndCountAll({
                where: { refId: reply.getDataValue("commentId")},
            });
            let likes = await Like.findAndCountAll({
                where: { refId: reply.getDataValue("commentId")},
            });
            let createdBy = await User.findOne({
                where: { userId: reply.getDataValue("userId") },
            });
            let liked = likes.rows.some(
                (like) => like.getDataValue("userId") === reply.getDataValue("userId")
            );
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added a reply to commentId = ${commentId}`,
                    { data:{
                        ...reply.dataValues,
                        repliesCount: replies.count,
                        likesCount: likes.count,
                        createdBy:{...createdBy?.dataValues,fullName:createdBy?.getFullname()},
                        liked,
                    }}
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    /////////////////////////// BLOGGER SECTION //////////////////////////////////

    /////////////   Add a blogger or user /////////////////////
    interface CreateUserType {
        firstName: string;
        middleName?: string;
        lastName: string;
        profileImage?: string;
        password: string;
        pinCode?: string;
        gender: string;
        accountNumber?: string | null;
        dob: string;
        email: string;
      }

    app.post("/bloggers", async (req, res) => {
        try {
            const data:Partial<CreateUserType> = req.body;
            const user = await User.create(data);
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added an User`,
                    { data: user.dataValues }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: String(err) })
            );
        }
    });

    ////////////////////// Get All Bloggers or Users ////////////////////

    app.get(
        "/bloggers",
        async (req: express.Request, res: express.Response) => {
            try {
                const { pageNumber = 1, numberOfRecords = 100 } = req.query;
                let numRecs = Number(numberOfRecords);
                let start = (Number(pageNumber) - 1) * numRecs;
                const users = await User.findAll({
                    offset:start,
                    limit:numRecs
                
                });
               
                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        data: users.map((user) => {
                            return {
                                ...user.dataValues,
                                fullName: user.getFullname(),
                            };
                        }),
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                );
            }
        }
    );


        ////////////////////// Get a blogger by blogId ////////////////////

        app.get(
            "/bloggers/:userId",
            async (req: express.Request, res: express.Response) => {
                try {
                    const userId = req.params.userId
                    const blogger = await User.findOne({
                       where:{userId}
        
                    });
    
                    res.status(responseStatusCode.OK).json(
                        getResponseBody(responseStatus.SUCCESS, "", {
                            data:blogger,
                        })
                    );
                } catch (err) {
                    console.log(err);
                    res.status(responseStatusCode.BAD_REQUEST).json(
                        getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                    );
                }
            }
        );

    //////////////////// Delete a Blogger or User //////////////////

    app.delete(
        "/bloggers/:userId",
        async (req: express.Request, res: express.Response) => {
            const { userId } = req.params;
            try {
                const user = await User.findByPk(userId);
                if (!user) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `User with Id ${userId} does not exist`,
                    });
                }
                await user.destroy();
                res.status(responseStatusCode.DELETED).json(
                    getResponseBody(
                        responseStatus.SUCCESS,
                        "Successfully deleted a User"
                    )
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: String(err) })
                );
            }
        }
    );

    export default app

    // Add a new like to a post
    //   app.post("/blogs/likes", async (req, res) => {
    //     const { commentId, userId } = req.body;

    //     try {
    //       const like = await Like.create({
    //         blogId,
    //         userId,
    //         createdAt: new Date(),
    //       });
    //        res.status(responseStatusCode.CREATED).json(getResponseBody(responseStatus.SUCCESS,"",like));
    //     } catch (err) {
    //       console.log(err);
    //        res.status(responseStatusCode.BAD_REQUEST).json(getResponseBody(responseStatus.ERROR,"",err));
    //     }
    //   });

