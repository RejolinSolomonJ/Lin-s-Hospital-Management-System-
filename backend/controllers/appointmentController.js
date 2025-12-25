const { Appointment, Patient, Doctor } = require('../models');
const { sendEmail, sendSMS } = require('../services/notificationService');
const { Op } = require('sequelize');

const createAppointment = async (req, res) => {
    try {
        const { patientName, patientPhone, patientEmail, patientAge, date, time, notes } = req.body;
        const doctorId = req.userId; // From middleware

        // 1. Find or Create Patient
        let patient = await Patient.findOne({ where: { phone: patientPhone, doctorId } });

        if (!patient) {
            patient = await Patient.create({
                name: patientName,
                phone: patientPhone,
                email: patientEmail,
                age: patientAge,
                doctorId
            });
        } else {
            // Update age if provided and different
            if (patientAge && patient.age !== patientAge) {
                patient.age = patientAge;
                await patient.save();
            }
        }

        // 2. Prevent Double Booking
        const conflict = await Appointment.findOne({
            where: {
                doctorId,
                date,
                time,
                status: ['Scheduled']
            }
        });

        if (conflict) {
            return res.status(409).json({ message: 'Time slot already booked' });
        }

        // 3. Calculate Token Number (Daily Sequence per Doctor)
        const existingAppointmentsCount = await Appointment.count({
            where: {
                doctorId,
                date
            }
        });
        const tokenNumber = existingAppointmentsCount + 1;

        // 4. Create Appointment
        const appointment = await Appointment.create({
            doctorId,
            patientId: patient.id,
            date,
            time,
            tokenNumber,
            notes,
            status: 'Scheduled'
        });

        // 5. Notifications
        sendSMS(patientPhone, `Appointment confirmed with Dr. ${req.userId}. Token: ${tokenNumber}, Date: ${date}, Time: ${time}.`);
        if (patientEmail) {
            sendEmail(patientEmail, 'Appointment Confirmation', `Your appointment is scheduled for ${date} at ${time}. Token: ${tokenNumber}`);
        }
        // sendEmail('doctor@system.com', 'New Appointment', `New appointment with ${patientName}. Token: ${tokenNumber}, Date: ${date}.`);

        res.status(201).json({ message: 'Appointment created successfully', appointment });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating appointment' });
    }
};

const getAppointments = async (req, res) => {
    try {
        const doctorId = req.userId;
        const appointments = await Appointment.findAll({
            where: { doctorId },
            include: [{ model: Patient }]
        });
        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const doctorId = req.userId;

        const appointment = await Appointment.findOne({ where: { id, doctorId } });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        // Trigger daily summary check if needed (mock)

        res.status(200).json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating appointment' });
    }
};

const sendDailySummary = async (req, res) => {
    try {
        const doctorId = req.userId;
        const today = new Date().toISOString().split('T')[0];

        const appointments = await Appointment.findAll({
            where: { doctorId, date: today },
            include: [{ model: Patient }]
        });

        const summaryText = appointments.map(a =>
            `Token ${a.tokenNumber}: ${a.Patient.name} at ${a.time} (${a.status})`
        ).join('\n');

        sendEmail('doctor@system.com', `Daily Appointment Summary - ${today}`,
            `You have ${appointments.length} appointments today:\n\n${summaryText}`
        );

        res.status(200).json({ message: 'Daily summary sent', count: appointments.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending summary' });
    }
};

module.exports = { createAppointment, getAppointments, updateStatus, sendDailySummary };
