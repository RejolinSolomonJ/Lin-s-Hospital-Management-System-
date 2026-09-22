const { Mentorship, Student, Doctor, Appointment } = require('../models');

// 1. Get all faculties for students to browse and select
const getAllFaculties = async (req, res) => {
    try {
        const faculties = await Doctor.findAll({
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Mentorship,
                    as: 'Mentorships',
                    attributes: ['id', 'status', 'studentId']
                }
            ]
        });

        // Compute active mentee count and occupancy for each faculty
        const facultiesWithStats = faculties.map(fac => {
            const json = fac.toJSON();
            const activeMenteesCount = (json.Mentorships || []).filter(m => m.status === 'Active').length;
            const pendingRequestsCount = (json.Mentorships || []).filter(m => m.status === 'Pending').length;
            const maxMentees = json.maxMentees || 6;
            const availableSlots = Math.max(0, maxMentees - activeMenteesCount);

            return {
                ...json,
                activeMenteesCount,
                pendingRequestsCount,
                availableSlots,
                isFull: activeMenteesCount >= maxMentees
            };
        });

        res.status(200).json(facultiesWithStats);
    } catch (error) {
        console.error('Error fetching faculties:', error);
        res.status(500).json({ message: 'Error retrieving university faculty list' });
    }
};

// 2. Student selects a faculty as their mentor
const selectMentor = async (req, res) => {
    try {
        const studentId = req.userId; // From JWT
        const { facultyId, goals, academicYear } = req.body;

        if (!facultyId) {
            return res.status(400).json({ message: 'Please choose a faculty member to select as mentor.' });
        }

        const faculty = await Doctor.findByPk(facultyId);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty member not found.' });
        }

        // Check if student already has a pending or active mentorship with this faculty
        const existing = await Mentorship.findOne({
            where: { studentId, facultyId }
        });

        if (existing) {
            if (existing.status === 'Active') {
                return res.status(400).json({ message: `${faculty.name} is already your active mentor.` });
            }
            if (existing.status === 'Pending') {
                return res.status(400).json({ message: `You already have a pending mentorship request with ${faculty.name}.` });
            }
            // If declined or completed, allow re-requesting
            existing.status = 'Pending';
            existing.goals = goals || existing.goals;
            existing.academicYear = academicYear || existing.academicYear;
            await existing.save();

            try {
                const io = req.app.get('io');
                if (io) {
                    io.emit('new_mentorship_request', {
                        mentorship: existing,
                        facultyId,
                        studentId,
                        message: `Mentorship request resubmitted to ${faculty.name}`
                    });
                }
            } catch (socketErr) {
                console.error('Socket error:', socketErr);
            }

            return res.status(200).json({ message: `Mentorship request resubmitted to ${faculty.name}!`, mentorship: existing });
        }

        // Check faculty capacity
        const activeCount = await Mentorship.count({
            where: { facultyId, status: 'Active' }
        });

        if (activeCount >= (faculty.maxMentees || 6)) {
            return res.status(400).json({
                message: `${faculty.name} has reached maximum mentee capacity (${faculty.maxMentees} students).`
            });
        }

        const mentorship = await Mentorship.create({
            studentId,
            facultyId,
            status: 'Pending',
            goals: goals || 'Student mentorship & academic guidance request',
            academicYear: academicYear || '2025-2026'
        });

        const populatedMentorship = await Mentorship.findByPk(mentorship.id, {
            include: [
                { model: Student, as: 'Student', attributes: ['id', 'name', 'rollNumber', 'year', 'department', 'email'] },
                { model: Doctor, as: 'Faculty', attributes: ['id', 'name', 'department', 'designation', 'cabin'] }
            ]
        });

        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('new_mentorship_request', {
                    mentorship: populatedMentorship || mentorship,
                    facultyId,
                    studentId,
                    message: `New mentorship request submitted to ${faculty.name}`
                });
            }
        } catch (socketErr) {
            console.error('Socket error:', socketErr);
        }

        res.status(201).json({
            message: `Mentorship request successfully sent to ${faculty.name}! It is now visible on their faculty portal.`,
            mentorship: populatedMentorship || mentorship
        });
    } catch (error) {
        console.error('Error selecting mentor:', error);
        res.status(500).json({ message: error.message || 'Error selecting mentor' });
    }
};

// 3. Faculty views all assigned mentees and requests
const getFacultyMentees = async (req, res) => {
    try {
        const facultyId = req.userId; // Faculty ID from token

        const mentees = await Mentorship.findAll({
            where: { facultyId },
            include: [
                {
                    model: Student,
                    as: 'Student',
                    attributes: { exclude: ['password'] }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(mentees);
    } catch (error) {
        console.error('Error fetching faculty mentees:', error);
        res.status(500).json({ message: 'Error retrieving mentees list' });
    }
};

// 4. Faculty updates mentorship status (Approve, Decline, Complete)
const updateMentorshipStatus = async (req, res) => {
    try {
        const facultyId = req.userId;
        const { id } = req.params; // Mentorship ID
        const { status, facultyNotes } = req.body;

        const mentorship = await Mentorship.findOne({
            where: { id, facultyId },
            include: [{ model: Student, as: 'Student', attributes: ['name', 'email'] }]
        });

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship record not found' });
        }

        if (status) mentorship.status = status;
        if (facultyNotes !== undefined) mentorship.facultyNotes = facultyNotes;
        await mentorship.save();

        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('mentorship_status_updated', {
                    mentorship,
                    facultyId,
                    studentId: mentorship.studentId,
                    status: mentorship.status,
                    message: `Mentorship request status updated to ${mentorship.status}`
                });
            }
        } catch (socketErr) {
            console.error('Socket error:', socketErr);
        }

        res.status(200).json({
            message: `Mentorship status updated to ${mentorship.status}`,
            mentorship
        });
    } catch (error) {
        console.error('Error updating mentorship status:', error);
        res.status(500).json({ message: 'Error updating mentorship status' });
    }
};

// 5. Student checks their assigned mentor
const getStudentMentor = async (req, res) => {
    try {
        const studentId = req.userId;

        const mentorships = await Mentorship.findAll({
            where: { studentId },
            include: [
                {
                    model: Doctor,
                    as: 'Faculty',
                    attributes: { exclude: ['password'] }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(mentorships);
    } catch (error) {
        console.error('Error fetching student mentor:', error);
        res.status(500).json({ message: 'Error fetching mentorship details' });
    }
};

module.exports = {
    getAllFaculties,
    selectMentor,
    getFacultyMentees,
    updateMentorshipStatus,
    getStudentMentor
};
