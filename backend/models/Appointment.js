const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    tokenNumber: {
        type: Number,
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // HH:MM
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    sessionType: {
        type: String,
        default: 'Dental Consultation'
    },
    dentalProcedure: {
        type: String,
        default: 'Dental Consultation & Diagnosis'
    },
    toothNumber: {
        type: String
    },
    chairNumber: {
        type: String,
        default: 'Operatory Chair 01'
    },
    notes: {
        type: String
    },
    facultyFeedback: {
        type: String
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
