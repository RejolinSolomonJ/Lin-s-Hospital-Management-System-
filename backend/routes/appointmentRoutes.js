const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateStatus, sendDailySummary } = require('../controllers/appointmentController');
const verifyToken = require('../middleware/auth');

// All routes here are protected
router.use(verifyToken);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.put('/:id', updateStatus);
router.post('/summary', sendDailySummary); // New route for triggering daily summary

module.exports = router;
