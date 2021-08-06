'use strict'

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        taskName: {
            type: DataTypes.STRING(25), 
            allowNull: false
        }, 
        // dayId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        //     foreignKey: true
        // },
        time: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        complete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: true, 
        createdAt: false,
        raw: true
        // other options
    })
};