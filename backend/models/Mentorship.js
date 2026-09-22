const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mentorship = sequelize.define('Mentorship', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Students',
            key: 'id'
        }
    },
    facultyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Doctors', // Maps to Doctor/Faculty table
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Active', 'Declined', 'Completed'),
        defaultValue: 'Pending'
    },
    goals: {
        type: DataTypes.TEXT, // Goals or motivation submitted by student
        allowNull: true
    },
    academicYear: {
        type: DataTypes.STRING,
        defaultValue: '2025-2026'
    },
    facultyNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Mentorship;
