const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tokenNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING, // YYYY-MM-DD
        allowNull: false
    },
    time: {
        type: DataTypes.STRING, // HH:MM
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
        defaultValue: 'Scheduled'
    },
    sessionType: {
        type: DataTypes.STRING, // e.g. 'Root Canal Treatment (RCT)', 'Dental Extraction', etc.
        defaultValue: 'Dental Consultation'
    },
    dentalProcedure: {
        type: DataTypes.STRING,
        defaultValue: 'Dental Consultation & Diagnosis'
    },
    toothNumber: {
        type: DataTypes.STRING, // e.g. 'Tooth #16', 'Upper Anterior'
        allowNull: true
    },
    chairNumber: {
        type: DataTypes.STRING, // e.g. 'Chair 04, Endodontics Clinic'
        defaultValue: 'Operatory Chair 01'
    },
    notes: {
        type: DataTypes.TEXT
    },
    facultyFeedback: {
        type: DataTypes.TEXT
    },
    doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Doctors', // Supervising Faculty Mentor
            key: 'id'
        }
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Patients',
            key: 'id'
        }
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Students', // Treating Dental Student Clinician
            key: 'id'
        }
    }
});

module.exports = Appointment;
