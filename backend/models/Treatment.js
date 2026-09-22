const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    diagnosis: {
        type: String,
        required: true
    },
    prescription: {
        type: String
    },
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    cost: {
        type: Number,
        default: 0.00
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    }
}, { timestamps: true });

const Treatment = mongoose.model('Treatment', treatmentSchema);
module.exports = Treatment;
