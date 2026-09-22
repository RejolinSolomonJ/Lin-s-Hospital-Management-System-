const bcrypt = require('bcrypt');
const { Doctor, Student, Mentorship, Appointment, Patient } = require('../models');

const seedData = async () => {
    try {
        const defaultPassword = await bcrypt.hash('password123', 10);

        // Seed Dental Faculties
        let drJenkins = await Doctor.findOne({ email: 'dr.jenkins@dental.meduni.edu' });
        if (!drJenkins) {
            drJenkins = await Doctor.create({
                name: 'Dr. Sarah Jenkins',
                email: 'dr.jenkins@dental.meduni.edu',
                password: defaultPassword,
                department: 'Dept. of Conservative Dentistry & Endodontics',
                designation: 'Professor & Head of Department',
                specialization: 'Endodontics & Rotary Micro-Dentistry',
                cabin: 'Dental Block A, Operatory 402',
                phone: '+1 (555) 234-8901',
                bio: 'Senior Endodontist with 18+ years supervising BDS/MDS clinical root canal treatments and microscopic apexogenesis.',
                maxMentees: 6,
                totalSlotsPerDay: 6,
                officeHours: 'Mon - Fri, 09:00 AM - 04:00 PM',
                role: 'faculty'
            });
        }

        let drChen = await Doctor.findOne({ email: 'dr.chen@dental.meduni.edu' });
        if (!drChen) {
            drChen = await Doctor.create({
                name: 'Dr. Marcus Chen',
                email: 'dr.chen@dental.meduni.edu',
                password: defaultPassword,
                department: 'Dept. of Oral & Maxillofacial Surgery',
                designation: 'Associate Professor',
                specialization: 'Surgical Extractions, Impactions & Trauma',
                cabin: 'Surgical Operatory Wing, Room 210',
                phone: '+1 (555) 345-6789',
                bio: 'Oral surgeon guiding clinical dental interns through complex surgical extractions, cyst enucleations, and dental implant placement.',
                maxMentees: 5,
                totalSlotsPerDay: 5,
                officeHours: 'Tue - Sat, 10:00 AM - 05:00 PM',
                role: 'faculty'
            });
        }

        let drRostova = await Doctor.findOne({ email: 'dr.rostova@dental.meduni.edu' });
        if (!drRostova) {
            drRostova = await Doctor.create({
                name: 'Dr. Elena Rostova',
                email: 'dr.rostova@dental.meduni.edu',
                password: defaultPassword,
                department: 'Dept. of Orthodontics & Dentofacial Orthopedics',
                designation: 'Assistant Professor',
                specialization: 'Fixed Orthodontic Appliances & Clear Aligners',
                cabin: 'Orthodontic Clinic, Lab 105',
                phone: '+1 (555) 987-6543',
                bio: 'Orthodontic mentor supervising wire bending, bracket placement, and cephalometric analysis for undergraduate and resident dental students.',
                maxMentees: 4,
                totalSlotsPerDay: 4,
                officeHours: 'Mon - Thu, 08:30 AM - 03:30 PM',
                role: 'faculty'
            });
        }

        let drPatel = await Doctor.findOne({ email: 'dr.patel@dental.meduni.edu' });
        if (!drPatel) {
            drPatel = await Doctor.create({
                name: 'Dr. Kenneth Patel',
                email: 'dr.patel@dental.meduni.edu',
                password: defaultPassword,
                department: 'Dept. of Periodontology & Implantology',
                designation: 'Associate Professor',
                specialization: 'Ultrasonic Scaling, Flap Surgery & Bone Grafts',
                cabin: 'Periodontics Clinic, Room 301',
                phone: '+1 (555) 444-8902',
                bio: 'Periodontist overseeing dental scaling quotas, deep curettage, and regenerative periodontal surgery training.',
                maxMentees: 5,
                totalSlotsPerDay: 5,
                officeHours: 'Mon - Fri, 09:00 AM - 04:00 PM',
                role: 'faculty'
            });
        }

        // Seed Dental Students
        let studentAlex = await Student.findOne({ email: 'alex.carter@student.dental.edu' });
        if (!studentAlex) {
            studentAlex = await Student.create({
                name: 'Alex Carter',
                email: 'alex.carter@student.dental.edu',
                password: defaultPassword,
                rollNumber: 'BDS2021-018',
                year: 'Final Year BDS (Clinical Intern)',
                department: 'Endodontics & Restorative',
                phone: '+1 (555) 777-1234',
                role: 'student'
            });
        }

        let studentMaya = await Student.findOne({ email: 'maya.patel@student.dental.edu' });
        if (!studentMaya) {
            studentMaya = await Student.create({
                name: 'Maya Patel',
                email: 'maya.patel@student.dental.edu',
                password: defaultPassword,
                rollNumber: 'BDS2022-045',
                year: 'BDS 3rd Year Clinician',
                department: 'Oral Surgery & Periodontics',
                phone: '+1 (555) 777-5678',
                role: 'student'
            });
        }

        let studentLucas = await Student.findOne({ email: 'lucas.kim@student.dental.edu' });
        if (!studentLucas) {
            studentLucas = await Student.create({
                name: 'Lucas Kim',
                email: 'lucas.kim@student.dental.edu',
                password: defaultPassword,
                rollNumber: 'MDS2024-007',
                year: 'MDS 1st Year Postgraduate Resident',
                department: 'Orthodontics & Dentofacial Orthopedics',
                phone: '+1 (555) 777-9012',
                role: 'student'
            });
        }

        // Seed Mentorship relationship
        // Alex Carter selected Dr. Sarah Jenkins (Approved)
        const existingMentorship1 = await Mentorship.findOne({
            studentId: studentAlex._id, facultyId: drJenkins._id
        });
        if (!existingMentorship1) {
            await Mentorship.create({
                studentId: studentAlex._id,
                facultyId: drJenkins._id,
                status: 'Active',
                goals: 'Complete 30 rotary endodontic molar cases and receive guidance on post & core crowns.',
                academicYear: '2025-2026',
                facultyNotes: 'Approved for clinical molar RCT cases under direct operatory supervision.'
            });
        }

        // Maya Patel requested Dr. Sarah Jenkins (Pending)
        const existingMentorship2 = await Mentorship.findOne({
            studentId: studentMaya._id, facultyId: drJenkins._id
        });
        if (!existingMentorship2) {
            await Mentorship.create({
                studentId: studentMaya._id,
                facultyId: drJenkins._id,
                status: 'Pending',
                goals: 'Seeking preceptor for pre-clinical to clinical endodontic transition and rubber dam placement.',
                academicYear: '2025-2026'
            });
        }

        // Seed Clinical Dental Patients
        let patientDavid = await Patient.findOne({ phone: '+1 (555) 123-9988' });
        if (!patientDavid) {
            patientDavid = await Patient.create({
                name: 'David Miller',
                age: 38,
                gender: 'Male',
                phone: '+1 (555) 123-9988',
                email: 'david.miller@gmail.com',
                studentId: studentAlex._id,
                doctorId: drJenkins._id
            });
        }

        let patientSophia = await Patient.findOne({ phone: '+1 (555) 321-7766' });
        if (!patientSophia) {
            patientSophia = await Patient.create({
                name: 'Sophia Gonzalez',
                age: 24,
                gender: 'Female',
                phone: '+1 (555) 321-7766',
                email: 'sophia.g@gmail.com',
                studentId: studentAlex._id,
                doctorId: drJenkins._id
            });
        }

        // Seed Sample Patient Appointments (Today)
        const today = new Date().toISOString().split('T')[0];

        const existingAppt1 = await Appointment.findOne({
            studentId: studentAlex._id, date: today, time: '10:00'
        });
        if (!existingAppt1) {
            await Appointment.create({
                doctorId: drJenkins._id,
                studentId: studentAlex._id,
                patientId: patientDavid._id,
                tokenNumber: 1,
                date: today,
                time: '10:00',
                status: 'Scheduled',
                sessionType: 'Root Canal Treatment (RCT)',
                dentalProcedure: 'Root Canal Treatment (RCT)',
                toothNumber: 'Tooth #16 (Maxillary Right 1st Molar)',
                chairNumber: 'Dental Operatory Chair 02',
                notes: 'Irreversible pulpitis on #16. Canal instrumentation and biomechanical prep.',
                facultyFeedback: 'Verify working length with radiograph before obturation.'
            });
        }

        const existingAppt2 = await Appointment.findOne({
            studentId: studentAlex._id, date: today, time: '11:30'
        });
        if (!existingAppt2) {
            await Appointment.create({
                doctorId: drJenkins._id,
                studentId: studentAlex._id,
                patientId: patientSophia._id,
                tokenNumber: 2,
                date: today,
                time: '11:30',
                status: 'Scheduled',
                sessionType: 'Composite Restoration',
                dentalProcedure: 'Composite Tooth Filling & Restoration',
                toothNumber: 'Tooth #24 (Maxillary Left 1st Premolar)',
                chairNumber: 'Dental Operatory Chair 02',
                notes: 'Class II mesio-occlusal carious lesion. Etching, bonding, and shade A2 resin.'
            });
        }

        console.log('Lin\'s Dental College & Hospital database seeded successfully!');
    } catch (error) {
        console.error('Error seeding dental university data:', error);
    }
};

module.exports = seedData;
