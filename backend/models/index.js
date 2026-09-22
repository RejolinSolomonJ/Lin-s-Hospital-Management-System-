const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');
const Student = require('./Student');
const Mentorship = require('./Mentorship');

module.exports = {
    Doctor,
    Faculty: Doctor,
    Patient,
    Student,
    Appointment,
    Treatment,
    Mentorship
};
