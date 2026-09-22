const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Doctor, Student } = require('../models');

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role = 'faculty',
            // Faculty specific fields
            department,
            designation,
            specialization,
            cabin,
            phone,
            bio,
            maxMentees,
            // Student specific fields
            rollNumber,
            year
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'student') {
            // Check if student email or roll number exists
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                return res.status(400).json({ message: 'A student account with this email already exists.' });
            }

            const existingRoll = rollNumber ? await Student.findOne({ rollNumber }) : null;
            if (existingRoll) {
                return res.status(400).json({ message: 'Roll Number is already registered in the university system.' });
            }

            const student = await Student.create({
                name,
                email,
                password: hashedPassword,
                rollNumber: rollNumber || `MED${Date.now().toString().slice(-5)}`,
                year: year || 'MBBS 1st Year',
                department: department || 'General Medicine',
                phone,
                role: 'student'
            });

            return res.status(201).json({
                message: 'Student account registered successfully. Please login.',
                user: { id: student.id, name: student.name, email: student.email, role: 'student' }
            });
        } else {
            // Faculty registration
            const existingDoctor = await Doctor.findOne({ email });
            if (existingDoctor) {
                return res.status(400).json({ message: 'A faculty account with this email already exists.' });
            }

            const faculty = await Doctor.create({
                name,
                email,
                password: hashedPassword,
                department: department || 'General Medicine',
                designation: designation || 'Professor',
                specialization: specialization || 'Clinical Medicine',
                cabin: cabin || 'Faculty Block',
                phone,
                bio,
                maxMentees: maxMentees || 6,
                totalSlotsPerDay: 6,
                role: 'faculty'
            });

            return res.status(201).json({
                message: 'Faculty member registered successfully. Please login.',
                user: { id: faculty.id, name: faculty.name, email: faculty.email, role: 'faculty' }
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user = null;
        let userRole = role;

        if (role === 'student') {
            user = await Student.findOne({ email });
            userRole = 'student';
        } else if (role === 'faculty') {
            user = await Doctor.findOne({ email });
            userRole = 'faculty';
        } else {
            // Role not explicitly provided: check Doctor first, then Student
            user = await Doctor.findOne({ email });
            if (user) {
                userRole = 'faculty';
            } else {
                user = await Student.findOne({ email });
                if (user) userRole = 'student';
            }
        }

        if (!user) {
            return res.status(404).json({ message: 'Account not found with provided email.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password. Please check your credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, role: userRole },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
                department: user.department,
                designation: user.designation,
                specialization: user.specialization,
                cabin: user.cabin,
                phone: user.phone,
                rollNumber: user.rollNumber,
                year: user.year,
                maxMentees: user.maxMentees,
                totalSlotsPerDay: user.totalSlotsPerDay || 6,
                officeHours: user.officeHours,
                bio: user.bio
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let user = null;
        if (userRole === 'student') {
            user = await Student.findById(userId, '-password');
        } else {
            user = await Doctor.findById(userId, '-password');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: { ...user.toObject(), role: userRole } });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

module.exports = { register, login, getMe };
