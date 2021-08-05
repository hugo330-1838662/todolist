'use strict'

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Weekday', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    })
}