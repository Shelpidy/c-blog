import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class Like extends Model {}

Like.init(
    {
        likeId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        refId: {
            type: DataTypes.UUID,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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
        modelName: "Like",
        tableName: "Likes",
        underscored: false,
        timestamps: true,
    }
);

export default Like;
