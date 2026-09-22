const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
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
    department: {
        type: DataTypes.STRING,
        defaultValue: 'General Medicine'
    },
    designation: {
        type: DataTypes.STRING, // e.g., "Professor & Head of Department", "Associate Professor", "Assistant Professor"
        defaultValue: 'Professor'
    },
    specialization: {
        type: DataTypes.STRING,
        defaultValue: 'Clinical Medicine'
    },
    cabin: {
        type: DataTypes.STRING, // e.g., "Room 304, Academic Block A"
        defaultValue: 'Faculty Block Room 101'
    },
    phone: {
        type: DataTypes.STRING
    },
    bio: {
        type: DataTypes.TEXT,
        defaultValue: 'Faculty member specializing in clinical research, medical education, and student mentoring.'
    },
    maxMentees: {
        type: DataTypes.INTEGER,
        defaultValue: 6
    },
    officeHours: {
        type: DataTypes.STRING,
        defaultValue: 'Mon - Fri, 09:00 AM - 04:00 PM'
    },
    totalSlotsPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 6
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'faculty'
    }
});

module.exports = Doctor;
