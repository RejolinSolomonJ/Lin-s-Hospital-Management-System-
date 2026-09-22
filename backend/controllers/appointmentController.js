const { Appointment, Patient, Doctor, Student } = require('../models');
const { sendEmail, sendSMS } = require('../services/notificationService');

const transformAppointment = (appt) => {
    const obj = appt.toObject ? appt.toObject() : appt;
    // Map populated fields to uppercase keys for frontend compatibility
    return {
        ...obj,
        id: obj._id,
        Doctor: obj.doctorId,
        Student: obj.studentId,
        Patient: obj.patientId
    };
};

const createAppointment = async (req, res) => {
    try {
        const {
            facultyId, // Supervising Dental Faculty Mentor ID
            studentId: reqStudentId,
            patientName,
            patientPhone,
            patientEmail,
            patientAge,
            patientGender = 'Not Specified',
            dentalProcedure,
            toothNumber,
            chairNumber = 'Operatory Chair 01',
            date,
            time,
            notes,
            sessionType
        } = req.body;

        const userId = req.userId;
        const userRole = req.userRole;

        let effectiveFacultyId = facultyId;
        let effectiveStudentId = null;
        let effectivePatientId = null;

        // 1. If created by a Dental Student for a patient under a supervising mentor
        if (userRole === 'student') {
            effectiveStudentId = userId;
            if (!facultyId) {
                return res.status(400).json({ message: 'Please select a supervising Dental Faculty Mentor from the dropdown.' });
            }
            effectiveFacultyId = facultyId;

            // Find or Create Patient
            if (patientName) {
                const phone = patientPhone || '0000000000';
                let patient = await Patient.findOne({ name: patientName, phone });
                if (!patient) {
                    patient = await Patient.create({
                        name: patientName,
                        phone,
                        email: patientEmail,
                        age: patientAge ? parseInt(patientAge) : null,
                        gender: patientGender,
                        studentId: effectiveStudentId,
                        doctorId: effectiveFacultyId
                    });
                }
                effectivePatientId = patient._id;
            }
        } else {
            // Created by Faculty
            effectiveFacultyId = userId;
            if (reqStudentId) {
                effectiveStudentId = reqStudentId;
            }
            if (patientName) {
                const phone = patientPhone || '0000000000';
                let patient = await Patient.findOne({ name: patientName, phone, doctorId: effectiveFacultyId });
                if (!patient) {
                    patient = await Patient.create({
                        name: patientName,
                        phone,
                        email: patientEmail,
                        age: patientAge ? parseInt(patientAge) : null,
                        gender: patientGender,
                        doctorId: effectiveFacultyId
                    });
                }
                effectivePatientId = patient._id;
            }
        }

        const procedureName = dentalProcedure || sessionType || 'Dental Clinical Procedure';

        // 2. Prevent Double Booking for the same student clinician at the same date & time
        if (effectiveStudentId) {
            const studentConflict = await Appointment.findOne({
                studentId: effectiveStudentId,
                date,
                time,
                status: 'Scheduled'
            });
            if (studentConflict) {
                return res.status(409).json({ message: `You already have a patient procedure scheduled on ${date} at ${time}.` });
            }
        }

        // 3. Prevent Double Booking for the supervising faculty at the same slot
        const facultyConflict = await Appointment.findOne({
            doctorId: effectiveFacultyId,
            date,
            time,
            status: 'Scheduled'
        });
        if (facultyConflict) {
            return res.status(409).json({ message: `Dr. is already supervising an appointment at ${time} on ${date}. Please select another time.` });
        }

        // 4. Calculate Daily Token Number for this clinic on this date
        const existingCount = await Appointment.countDocuments({
            doctorId: effectiveFacultyId,
            date
        });
        const tokenNumber = existingCount + 1;

        // 5. Create Appointment
        const appointment = await Appointment.create({
            doctorId: effectiveFacultyId,
            studentId: effectiveStudentId,
            patientId: effectivePatientId,
            date,
            time,
            tokenNumber,
            sessionType: procedureName,
            dentalProcedure: procedureName,
            toothNumber: toothNumber || 'N/A',
            chairNumber: chairNumber || 'Chair 01',
            notes: notes || '',
            status: 'Scheduled'
        });

        // 6. Notifications
        if (patientPhone) {
            sendSMS(patientPhone, `Lin's Dental Clinic: Appointment confirmed for ${patientName} on ${date} at ${time}. Procedure: ${procedureName}. Token: #${tokenNumber}.`);
        }

        const populated = await Appointment.findById(appointment._id)
            .populate('patientId')
            .populate('studentId', 'name rollNumber year department email')
            .populate('doctorId', 'name department designation cabin');

        const transformedPopulated = transformAppointment(populated);

        // 7. Emit real-time Socket.IO event to all clients / devices
        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('new_appointment', {
                    appointment: transformedPopulated,
                    doctorId: effectiveFacultyId,
                    studentId: effectiveStudentId,
                    message: `New clinical appointment scheduled: ${patientName || 'Patient'} (${procedureName})`
                });
            }
        } catch (socketErr) {
            console.error('Socket emission error:', socketErr);
        }

        res.status(201).json({
            message: 'Patient clinical appointment scheduled under faculty mentor supervision!',
            appointment: transformedPopulated
        });
    } catch (error) {
        console.error('Error creating patient appointment:', error);
        res.status(500).json({ message: error.message || 'Error creating appointment' });
    }
};

const getAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let query = {};
        if (userRole === 'student') {
            query = { studentId: userId };
        } else {
            query = { doctorId: userId };
        }

        const appointments = await Appointment.find(query)
            .populate('patientId')
            .populate('studentId', 'name rollNumber year department email phone')
            .populate('doctorId', 'name department designation cabin email phone')
            .sort({ date: 1, time: 1 });

        res.status(200).json(appointments.map(transformAppointment));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

const getOccupancyCalendar = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let maxSlotsPerDay = 6;
        let query = {};
        let profileInfo = {};

        if (userRole === 'student') {
            maxSlotsPerDay = 4; // Daily student clinical dental chair quota
            query = { studentId: userId, status: 'Scheduled' };
            const student = await Student.findById(userId);
            profileInfo = {
                id: student?._id,
                name: student?.name,
                role: 'student',
                year: student?.year,
                maxSlotsPerDay
            };
        } else {
            const facultyId = req.query.facultyId || userId;
            const faculty = await Doctor.findById(facultyId);
            maxSlotsPerDay = faculty?.totalSlotsPerDay || 6;
            query = { doctorId: facultyId, status: 'Scheduled' };
            profileInfo = {
                id: faculty?._id,
                name: faculty?.name,
                role: 'faculty',
                department: faculty?.department,
                designation: faculty?.designation,
                maxSlotsPerDay
            };
        }

        const rawAppointments = await Appointment.find(query)
            .populate('patientId', 'name age gender phone')
            .populate('studentId', 'name rollNumber year')
            .populate('doctorId', 'name department cabin');

        const appointments = rawAppointments.map(transformAppointment);

        const dateMap = {};
        appointments.forEach(appt => {
            if (!dateMap[appt.date]) {
                dateMap[appt.date] = [];
            }
            dateMap[appt.date].push(appt);
        });

        const occupancySummary = {};
        Object.keys(dateMap).forEach(date => {
            const count = dateMap[date].length;
            const percent = Math.min(100, Math.round((count / maxSlotsPerDay) * 100));
            let status = 'Available';
            if (percent >= 100) status = 'Full';
            else if (percent >= 60) status = 'High';
            else if (percent > 0) status = 'Moderate';

            occupancySummary[date] = {
                date,
                bookedSlots: count,
                maxSlots: maxSlotsPerDay,
                availableSlots: Math.max(0, maxSlotsPerDay - count),
                occupancyPercent: percent,
                occupancyStatus: status,
                appointments: dateMap[date]
            };
        });

        res.status(200).json({
            profile: profileInfo,
            occupancy: occupancySummary
        });
    } catch (error) {
        console.error('Error generating occupancy calendar:', error);
        res.status(500).json({ message: 'Error calculating occupancy calendar' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, facultyFeedback } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        const whereCondition = userRole === 'student'
            ? { _id: id, studentId: userId }
            : { _id: id, doctorId: userId };

        const appointment = await Appointment.findOne(whereCondition);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }

        if (status) appointment.status = status;
        if (facultyFeedback) appointment.facultyFeedback = facultyFeedback;
        await appointment.save();

        // Emit real-time update
        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('appointment_status_updated', {
                    appointment: transformAppointment(appointment),
                    appointmentId: id,
                    status: appointment.status,
                    message: `Appointment status updated to ${appointment.status}`
                });
            }
        } catch (socketErr) {
            console.error('Socket emission error:', socketErr);
        }

        res.status(200).json({ message: 'Appointment status updated', appointment: transformAppointment(appointment) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating appointment' });
    }
};

const sendDailySummary = async (req, res) => {
    try {
        const doctorId = req.userId;
        const today = new Date().toISOString().split('T')[0];

        const rawAppointments = await Appointment.find({ doctorId, date: today })
            .populate('patientId')
            .populate('studentId');

        const appointments = rawAppointments.map(transformAppointment);

        const summaryText = appointments.map(a => {
            const patientName = a.Patient ? a.Patient.name : 'Patient';
            const studentName = a.Student ? ` [Clinician: ${a.Student.name}]` : '';
            return `Token #${a.tokenNumber}: ${patientName} at ${a.time} - ${a.dentalProcedure || a.sessionType}${studentName} (${a.status})`;
        }).join('\n');

        sendEmail('faculty@dental.meduni.edu', `Daily Dental Clinic Schedule - ${today}`,
            `You have ${appointments.length} clinical appointments and procedures scheduled today:\n\n${summaryText}`
        );

        res.status(200).json({ message: 'Daily clinical summary sent', count: appointments.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending summary' });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getOccupancyCalendar,
    updateStatus,
    sendDailySummary
};
