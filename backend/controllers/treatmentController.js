const { Treatment, Patient, Doctor } = require('../models');

const transformTreatment = (treatment) => {
    const obj = treatment.toObject ? treatment.toObject() : treatment;
    return {
        ...obj,
        id: obj._id,
        Patient: obj.patientId,
        Doctor: obj.doctorId
    };
};

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

        res.status(201).json({ message: 'Treatment record created', treatment: transformTreatment(treatment) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating treatment record' });
    }
};

const getTreatmentsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.userId;

        const treatments = await Treatment.find({ patientId, doctorId })
            .sort({ date: -1 });

        res.status(200).json(treatments.map(transformTreatment));
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

        const treatment = await Treatment.findOne({ _id: id, doctorId });

        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }

        Object.assign(treatment, updates);
        await treatment.save();
        
        res.status(200).json({ message: 'Treatment updated', treatment: transformTreatment(treatment) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating treatment' });
    }
};

const deleteTreatment = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.userId;

        const deleted = await Treatment.findOneAndDelete({ _id: id, doctorId });

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
