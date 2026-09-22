const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    year: {
        type: String,
        required: true,
        default: 'MBBS 2nd Year'
    },
    department: {
        type: String,
        default: 'Clinical Medicine'
    },
    phone: {
        type: String
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        default: 'student'
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
