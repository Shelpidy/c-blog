import express from "express";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { v4 } from "uuid";

import { Op } from "sequelize";
import User from "../models/Users";
import BlogPost from "../models/BlogPosts";
import Like from "../models/Likes";
import Comment from "../models/Comments";
import Share from "../models/Shares";
import { HTMLScrapper } from "../services/services";
import Editor from "../models/Editors";

export default function mediaController(app: express.Application) {
    ///////////////// GET A SINGLE POST DATA BY blogId ////////////////////////////

    app.get(
        "/blogs/:blogId/",
        async (req: express.Request, res: express.Response) => {
            const { blogId } = req.params;
            const { userId } = res.locals;
            try {
                const post = await BlogPost.findOne({
                    where: { blogId },
                });

                if (!post) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `Post with id ${blogId} does not exist`,
                    });
                }
                let comments = await Comment.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
                let likes = await Like.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
                let shares = await Share.findAndCountAll({
                    where: { refId: post.getDataValue("blogId") },
                });
                let createdBy = await User.findOne({
                    where: { refId: post.getDataValue("userId") },
                });
                let publishedBy = await User.findOne({
                    where: { userId: post.getDataValue("publishedById") },
                });
                let lastUpdatedBy = await User.findOne({
                    where: { userId: post.getDataValue("lastUpdateById") },
                });
                let editors = await User.findAll({
                    where: { userId: [post.getDataValue("editors")] },
                });
                // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                let likedByMe = likes.rows.some(
                    (like) => like.getDataValue("userId") == userId
                );
                let returnPost = {
                    blogId: post.getDataValue("blogId"),
                    slug: post.getDataValue("slug"),
                    title: post.getDataValue("title"),
                    imageUrl: post.getDataValue("imageUrl"),
                    content: post.getDataValue("content"),
                    summary: post.getDataValue("summary"),
                    url: post.getDataValue("url"),
                    status: post.getDataValue("status"),
                    tags: post.getDataValue("tags"),
                    createdAt: post.getDataValue("createdAt"),
                    updatedAt: post.getDataValue("updatedAt"),
                    publishedAt: post.getDataValue("publishedAt"),
                    likedByMe,
                    commentsCount: comments.count,
                    likesCount: likes.count,
                    sharesCount: shares.count,
                    createdBy,
                    publishedBy,
                    lastUpdatedBy,
                    editors: {
                        items: editors,
                    },
                };
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    item: returnPost,
                });
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json({
                    status: responseStatus.ERROR,
                    message: err,
                });
            }
        }
    );

    /////////////////// GET ALL USER POSTS /////////////

    app.get(
        "/blogs/users/:pageNumber/:numberOfRecords",
        async (req: express.Request, res: express.Response) => {
            try {
                const { userId } = res.locals;
                const { pageNumber, numberOfRecords } = req.params;
                let numRecs = Number(numberOfRecords);
                let start = (Number(pageNumber) - 1) * numRecs;
                const posts = await BlogPost.findAll({
                    where: { userId },
                    order: [["createdAt", "DESC"]],
                    limit: numRecs,
                    offset: start,
                });
                let returnPosts = await Promise.all(
                    posts.map(async (post) => {
                        let likes = await Like.findAndCountAll({
                            where: { blogId: post.getDataValue("blogId") },
                        });
                        let shares = await Share.findAndCountAll({
                            where: { blogId: post.getDataValue("blogId") },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: post.getDataValue("userId") },
                        });
                        let editors = await User.findAll({
                            where: { userId: [post.getDataValue("editors")] },
                        });
                        // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                        let likedByMe = likes.rows.some(
                            (like) => like.getDataValue("userId") == userId
                        );
                        return {
                            blogId: post.getDataValue("blogId"),
                            slug: post.getDataValue("slug"),
                            title: post.getDataValue("title"),
                            imageUrl: post.getDataValue("imageUrl"),
                            summary: post.getDataValue("summary"),
                            tags: post.getDataValue("tags"),
                            createdAt: post.getDataValue("createdAt"),
                            updatedAt: post.getDataValue("updatedAt"),
                            likedByMe,
                            likesCount: likes.count,
                            sharesCount: shares.count,
                            createdBy,
                            editors: {
                                items: editors,
                            },
                        };
                    })
                );
                res.status(responseStatusCode.OK).json({
                    status: responseStatus.SUCCESS,
                    items: returnPosts,
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

    // Get all posts

    app.get("/blogs/:pageNumber/:numberOfRecords", async (req, res) => {
        try {
            const { userId } = res.locals;
            const { pageNumber, numberOfRecords } = req.params;
            let numRecs = Number(numberOfRecords);
            let start = (Number(pageNumber) - 1) * numRecs;
            const posts = await BlogPost.findAll({
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
                    let createdBy = await User.findOne({
                        where: { userId: post.getDataValue("userId") },
                    });
                    let editors = await User.findAll({
                        where: { userId: [post.getDataValue("editors")] },
                    });
                    // let secondUser = await User.findOne({where:{id:post.getDataValue("fromId")}})
                    let likedByMe = likes.rows.some(
                        (like) => like.getDataValue("userId") == userId
                    );
                    return {
                        blogId: post.getDataValue("blogId"),
                        slug: post.getDataValue("slug"),
                        title: post.getDataValue("title"),
                        imageUrl: post.getDataValue("imageUrl"),
                        summary: post.getDataValue("summary"),
                        tags: post.getDataValue("tags"),
                        createdAt: post.getDataValue("createdAt"),
                        updatedAt: post.getDataValue("updatedAt"),
                        likedByMe,
                        likesCount: likes.count,
                        sharesCount: shares.count,
                        createdBy,
                        editors: {
                            items: editors,
                        },
                    };
                })
            );
            res.status(responseStatusCode.OK).json({
                status: responseStatus.SUCCESS,
                items: returnPosts,
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: err,
            });
        }
    });

    // Add a new post

    app.post("/blogs", async (req, res) => {
        try {
            const postObj: {
                title: string;
                content: string;
                status: string;
                tags: string[];
            } = req.body;
            console.log({htmlContent:postObj.content})
            let htmlScrapper = new HTMLScrapper({ html:postObj.content});
            let imageUrl = await htmlScrapper.getImageSrc();
            let summary = await htmlScrapper.getSummary();

            let slug = v4();
            const { userId } = res.locals;

            const modifiedPostObj = {
                ...postObj,
                summary,
                imageUrl,
                slug,
                userId,
            };
            const post = await BlogPost.create(modifiedPostObj);
            res.status(responseStatusCode.CREATED).json({
                status: responseStatus.SUCCESS,
                message: "Successfully added a post",
                items:post
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: err,
            });
        }
    });

    // Update a post
    app.put("/blogs/:blogId", async (req, res) => {
        try {
            let blogId = req.params.blogId;
            const { userId } = res.locals;
            const postObj: {
                title: string;
                content: string;
                status: string;
                tags: string[];
                slug: string;
            } = req.body;
            let htmlScrapper = new HTMLScrapper({ html: postObj.content });
            let summary = await htmlScrapper.getSummary();
            let imageUrl = await htmlScrapper.getImageSrc();
            const post = await BlogPost.findByPk(blogId);
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
            const updatedPostObj = {
                ...postObj,
                summary,
                imageUrl,
                userId,
            };
            const newPost = await BlogPost.update(updatedPostObj, {
                where: { blogId },
            });
            res.status(responseStatusCode.ACCEPTED).json({
                status: responseStatus.SUCCESS,
                items: {
                    affectedRow: newPost,
                },
            });
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message: err,
            });
        }
    });

    // Delete a post
    app.delete("/blogs/:blogId", async (req, res) => {
        const { blogId } = req.params;

        try {
            const post = await BlogPost.findByPk(blogId);
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
                getResponseBody(responseStatus.ERROR, "", { message: err })
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
                                items: {
                                    affectedRow,
                                    likedByMe: false,
                                    likeCounts: likes.count - 1,
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
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    "Liked a post sucessfully",
                    {
                        items: {
                            affectedRow: 1,
                            likedByMe: true,
                            likeCounts: likes.count + 1,
                        },
                    }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
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
                getResponseBody(responseStatus.SUCCESS, "", { items: users })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    ///////////////  Change status of a given blog ///////////////////

    //////////////////// Get all Editors of a blog post /////////////////////

    app.get("/blogs/:blogId/editors", async (req, res) => {
        const { blogId } = req.params;

        try {
            const editors = await Editor.findAndCountAll({
                where: { blogId },
            });

            const users = await Promise.all(
                editors.rows.map(async (editor) => {
                    let user = await User.findOne({
                        where: { userId: editor.getDataValue("userId") },
                    });
                    return user?.dataValues;
                })
            );

            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", { items: users })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    // COMMENTS SECTION

    // Get all comments for a specific post
    app.get(
        "/blogs/:blogId/comments/:pageNumber/:numberOfRecords",
        async (req, res) => {
            const { blogId, pageNumber, numberOfRecords } = req.params;
            let { userId } = res.locals;
            let numRecs = Number(numberOfRecords);
            let start = (Number(pageNumber) - 1) * numRecs;

            try {
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
                            where: { refId: blogId },
                        });
                        let likes = await Like.findAndCountAll({
                            where: { refId: blogId },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: comment.getDataValue("userId") },
                        });
                        let likedByMe = likes.rows.some(
                            (like) => like.getDataValue("userId") == userId
                        );
                        return {
                            ...comment.dataValues,
                            repliesCount: replies.count,
                            likesCount: likes.count,
                            createdBy,
                            likedByMe,
                        };
                    })
                );
                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        items: _comments,
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: err })
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
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added a comment to blogId = ${blogId}`,
                    { items: comment.dataValues }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
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
                    getResponseBody(responseStatus.ERROR, "", { message: err })
                );
            }
        }
    );

    // Update a comment  or a reply
    app.put("/comments/:commentId", async (req, res) => {
        const { content } = req.body;
        const commentId = req.params.commentId;
        try {
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
                    items: {
                        affectedRow,
                    },
                })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
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
                                items: {
                                    affectedRow,
                                    likedByMe: false,
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
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    "Liked a comment sucessfully",
                    {
                        affectedRow: 1,
                        likedByMe: true,
                        likesCount: likes.count + 1,
                    }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
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
                getResponseBody(responseStatus.SUCCESS, "", { items: users })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    /////////////////////////////////////////// REPLY SECTION /////////////////////////////

    // Get all replies
    app.get(
        "/comments/:commentId/:pageNumber/:numberOfRecords",
        async (req, res) => {
            const { commentId, pageNumber, numberOfRecords } = req.params;
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
                        .json(getResponseBody(responseStatus.SUCCESS, "", []));
                }

                const _comments = await Promise.all(
                    comments.map(async (comment) => {
                        let replies = await Comment.findAndCountAll({
                            where: { refId: commentId },
                        });
                        let likes = await Like.findAndCountAll({
                            where: { refId: commentId },
                        });
                        let createdBy = await User.findOne({
                            where: { userId: comment.getDataValue("userId") },
                        });
                        let likedByMe = likes.rows.some(
                            (like) => like.getDataValue("userId") == userId
                        );
                        return {
                            ...comment.dataValues,
                            repliesCount: replies.count,
                            likesCount: likes.count,
                            createdBy,
                            likedByMe,
                        };
                    })
                );
                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        items: _comments,
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: err })
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
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added a reply to commentId = ${commentId}`,
                    { items: reply }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    /////////////////////// EDITORS SECTIONS //////////////////////////////

    /////////////   Add an editor /////////////////////

    app.post("/editors/", async (req, res) => {
        try {
            const { userId } = req.body;
            const editor = await Editor.create({
                userId,
            });
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added an editor`,
                    { items: editor.dataValues }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    ////////////////////// Get All editors ////////////////////

    app.get("/editors", async (req: express.Request, res: express.Response) => {
        try {
            const editors = await Editor.findAll();
            let useEditors = await Promise.all(
                editors.map(async (editor) => {
                    let user = await User.findOne({
                        where: { userId: editor.getDataValue("userId") },
                    });
                    return {
                        editorId: editor.getDataValue("editorId"),
                        ...user?.dataValues,
                    };
                })
            );
            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", {
                    items: useEditors,
                })
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    //////////////////// Delete an editor //////////////////

    app.delete(
        "/editors/:editorId",
        async (req: express.Request, res: express.Response) => {
            const { editorId } = req.params;
            try {
                const editor = await Editor.findByPk(editorId);
                if (!editor) {
                    return res.status(responseStatusCode.NOT_FOUND).json({
                        status: responseStatus.ERROR,
                        message: `Editor with Id ${editorId} does not exist`,
                    });
                }
                await editor.destroy();
                res.status(responseStatusCode.DELETED).json(
                    getResponseBody(
                        responseStatus.SUCCESS,
                        "Successfully deleted a Editor"
                    )
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: err })
                );
            }
        }
    );

    /////////////////////////// BLOGGER SECTION //////////////////////////////////

    /////////////   Add a blogger or user /////////////////////

    app.post("/bloggers", async (req, res) => {
        try {
            const {displayName,profilePicture} = req.body;
            const user = await User.create( {displayName,profilePicture});
            res.status(responseStatusCode.CREATED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Successsfully added an User`,
                    { items: user.dataValues }
                )
            );
        } catch (err) {
            console.log(err);
            res.status(responseStatusCode.BAD_REQUEST).json(
                getResponseBody(responseStatus.ERROR, "", { message: err })
            );
        }
    });

    ////////////////////// Get All Bloggers or Users ////////////////////

    app.get(
        "/bloggers",
        async (req: express.Request, res: express.Response) => {
            try {
                const users = await User.findAll();

                res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        items: users,
                    })
                );
            } catch (err) {
                console.log(err);
                res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.ERROR, "", { message: err })
                );
            }
        }
    );

    //////////////////// Delete a Blogger or User //////////////////

    app.delete(
        "/blogger/:userId",
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
                    getResponseBody(responseStatus.ERROR, "", { message: err })
                );
            }
        }
    );

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
}
