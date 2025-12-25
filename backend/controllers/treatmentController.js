const { Treatment, Patient, Doctor } = require('../models');

const createTreatment = async (req, res) => {
    try {
        const { patientId, diagnosis, prescription, notes, cost, date } = req.body;
        const doctorId = req.userId;

        const treatment = await Treatment.create({
            patientId,
            doctorId,
            diagnosis,
            prescription,
            notes,
            cost,
            date: date || new Date()
        });

        res.status(201).json({ message: 'Treatment record created', treatment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating treatment record' });
    }
};

const getTreatmentsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.userId;

        const treatments = await Treatment.findAll({
            where: { patientId, doctorId },
            order: [['date', 'DESC']]
        });

        res.status(200).json(treatments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching treatments' });
    }
};

const updateTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const doctorId = req.userId;

        const treatment = await Treatment.findOne({ where: { id, doctorId } });

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        await treatment.update(updates);
        res.status(200).json({ message: 'Treatment updated', treatment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating treatment' });
    }
};

const deleteTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.userId;

        const deleted = await Treatment.destroy({ where: { id, doctorId } });

        if (!deleted) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        res.status(200).json({ message: 'Treatment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting treatment' });
    }
};

module.exports = {
    createTreatment,
    getTreatmentsByPatient,
    updateTreatment,
    deleteTreatment
};
