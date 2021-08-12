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
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        dueTime: {
            type: DataTypes.TIME,
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
        timestamps: false, 
        raw: true
        // other options
    })
};