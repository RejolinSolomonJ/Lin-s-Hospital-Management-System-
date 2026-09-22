const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rollNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    year: {
        type: DataTypes.STRING, // e.g. "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year", "Final Year", "Intern/Resident"
        allowNull: false,
        defaultValue: 'MBBS 2nd Year'
    },
    department: {
        type: DataTypes.STRING, // e.g. "Cardiology", "Surgery", "Pediatrics", "Internal Medicine"
        defaultValue: 'Clinical Medicine'
    },
    phone: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'student'
    }
});

module.exports = Student;
