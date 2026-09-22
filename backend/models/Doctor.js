const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        default: 'General Medicine'
    },
    designation: {
        type: String,
        default: 'Professor'
    },
    specialization: {
        type: String,
        default: 'Clinical Medicine'
    },
    cabin: {
        type: String,
        default: 'Faculty Block Room 101'
    },
    phone: {
        type: String
    },
    bio: {
        type: String,
        default: 'Faculty member specializing in clinical research, medical education, and student mentoring.'
    },
    maxMentees: {
        type: Number,
        default: 6
    },
    officeHours: {
        type: String,
        default: 'Mon - Fri, 09:00 AM - 04:00 PM'
    },
    totalSlotsPerDay: {
        type: Number,
        default: 6
    },
    role: {
        type: String,
        default: 'faculty'
    }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
