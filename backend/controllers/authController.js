const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Doctor } = require('../models');

const register = async (req, res) => {
    try {
        const { name, email, password, specialization, phone } = req.body;

        // Check if doctor exists
        const existingDoctor = await Doctor.findOne({ where: { email } });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Email already currently in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create doctor
        const doctor = await Doctor.create({
            name,
            email,
            password: hashedPassword,
            specialization,
            phone
        });

        res.status(201).json({ message: 'Doctor registered successfully', doctorId: doctor.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ where: { email } });
        if (!doctor) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, doctor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '24h'
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            doctor: { id: doctor.id, name: doctor.name, email: doctor.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { register, login };
