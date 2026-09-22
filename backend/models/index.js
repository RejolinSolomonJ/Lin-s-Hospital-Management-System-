const sequelize = require('../config/database');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');
const Student = require('./Student');
const Mentorship = require('./Mentorship');

// Relationships: Doctor / Faculty & Patients
Doctor.hasMany(Patient, { foreignKey: 'doctorId' });
Patient.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Appointments
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Student.hasMany(Appointment, { foreignKey: 'studentId' });
Appointment.belongsTo(Student, { foreignKey: 'studentId' });

// Treatments
Patient.hasMany(Treatment, { foreignKey: 'patientId' });
Treatment.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(Treatment, { foreignKey: 'doctorId' });
Treatment.belongsTo(Doctor, { foreignKey: 'doctorId' });

// Mentorship Relationships
Doctor.hasMany(Mentorship, { foreignKey: 'facultyId', as: 'Mentorships' });
Mentorship.belongsTo(Doctor, { foreignKey: 'facultyId', as: 'Faculty' });

Student.hasMany(Mentorship, { foreignKey: 'studentId', as: 'Mentorships' });
Mentorship.belongsTo(Student, { foreignKey: 'studentId', as: 'Student' });

module.exports = {
    sequelize,
    Doctor,
    Faculty: Doctor, // Alias Doctor as Faculty for cleaner university semantics
    Patient,
    Student,
    Appointment,
    Treatment,
    Mentorship
};
