const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Treatment = sequelize.define('Treatment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    diagnosis: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prescription: {
        type: DataTypes.TEXT
    },
    notes: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.DATEONLY, // Or DATE if you want time
        defaultValue: DataTypes.NOW
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Patients',
            key: 'id'
        }
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id'
        }
    }
});

module.exports = Treatment;
