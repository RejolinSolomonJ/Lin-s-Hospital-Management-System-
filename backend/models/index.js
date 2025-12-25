const sequelize = require('../config/database');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');

// Relationships
Doctor.hasMany(Patient, { foreignKey: 'doctorId' });
Patient.belongsTo(Doctor, { foreignKey: 'doctorId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Patient.hasMany(Treatment, { foreignKey: 'patientId' });
Treatment.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(Treatment, { foreignKey: 'doctorId' });
Treatment.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = {
    sequelize,
    Doctor,
    Patient,
    Appointment,
    Treatment
};
