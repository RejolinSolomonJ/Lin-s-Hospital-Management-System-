const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Active', 'Declined', 'Completed'],
        default: 'Pending'
    },
    goals: {
        type: String
    },
    academicYear: {
        type: String,
        default: '2025-2026'
    },
    facultyNotes: {
        type: String
    }
}, { timestamps: true });

const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
module.exports = Mentorship;
