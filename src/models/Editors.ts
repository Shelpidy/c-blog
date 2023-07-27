import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class Editor extends Model {}

Editor.init(
    {
        editorId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
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
        modelName: "Editor",
        tableName: "Editors",
        underscored: false,
        timestamps: true,
    }
);

export default Editor;
