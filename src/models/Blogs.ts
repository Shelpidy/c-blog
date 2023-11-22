import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class Blog extends Model {}

Blog.init(
    {
        blogId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
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
        title: {
            type: DataTypes.STRING,
        },
        images: { type: DataTypes.JSON },
        video: { type: DataTypes.STRING },
        shared: { type: DataTypes.BOOLEAN },
        url: {
            type: DataTypes.STRING,
        },
        summary: {
            type: DataTypes.STRING,
        },
        slug: {
            type: DataTypes.STRING,
        },
        text: {
            type: DataTypes.TEXT,
        },
        fromUserId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        fromBlogId: {
            type: DataTypes.UUID,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "Blog",
        tableName: "Blogs",
        underscored: false,
        timestamps: true,
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);

export default Blog;
