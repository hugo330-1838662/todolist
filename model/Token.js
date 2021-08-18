'use strict'

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Token', {
        id: {
            type: DataTypes.STRING(32),
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            },
            allowNull: false
        },
        expDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: false
    });
}