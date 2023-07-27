import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class BlogPost extends Model {}

BlogPost.init(
    {
        blogId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        lastUpdatedById: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            onUpdate: "CASCADE",
        },
        publishedById: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            onUpdate: "CASCADE",
        },
        title: {
            type: DataTypes.STRING,
        },
        tags: {
            type: DataTypes.JSON,
        },
        editors: {
            type: DataTypes.JSON,
        },
        url: {
            type: DataTypes.STRING,
        },
        summary: {
            type: DataTypes.STRING,
        },
        slug: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.TEXT,
        },
        imageUrl: {
            type: DataTypes.STRING,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        updatedAt: {
            type: DataTypes.DATE,
        },
        publishedAt: {
            type: DataTypes.DATE,
        },
        status: {
            type: DataTypes.ENUM("draft", "published"),
        },
    },
    {
        sequelize,
        modelName: "BlogPost",
        tableName: "BlogPosts",
        underscored: false,
        timestamps: true,
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);

export default BlogPost;
