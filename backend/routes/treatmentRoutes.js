const express = require('express');
const router = express.Router();
const { createTreatment, getTreatmentsByPatient, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.post('/', createTreatment);
router.get('/patient/:patientId', getTreatmentsByPatient);
router.put('/:id', updateTreatment);
router.delete('/:id', deleteTreatment);

module.exports = router;
