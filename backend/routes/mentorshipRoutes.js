const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
    getAllFaculties,
    selectMentor,
    getFacultyMentees,
    updateMentorshipStatus,
    getStudentMentor
} = require('../controllers/mentorshipController');

// Public / Authenticated route to view faculty directory
router.get('/faculties', getAllFaculties);

// Protected routes
router.use(verifyToken);

router.post('/select', selectMentor);
router.get('/faculty-mentees', getFacultyMentees);
router.put('/status/:id', updateMentorshipStatus);
router.get('/my-mentor', getStudentMentor);

module.exports = router;
