import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { useSocket } from '../context/SocketContext';
import MobileBottomNav from '../components/MobileBottomNav';
import { Plus, Search, Bell, Calendar as CalendarIcon, UserCheck, GraduationCap, Building2, Stethoscope, Clock, ShieldCheck, Smile, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import CalendarPanel from '../components/CalendarPanel';
import AppointmentCard from '../components/AppointmentCard';
import PatientDetails from '../components/PatientDetails';
import FacultyMenteesView from '../components/FacultyMenteesView';
import StudentPortalView from '../components/StudentPortalView';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { isConnected, lastEvent } = useSocket() || {};
    const isFaculty = user?.role === 'faculty';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showCalendarOnDesktop, setShowCalendarOnDesktop] = useState(true);

    // Current navigation view
    const [currentView, setCurrentView] = useState('dashboard');

    // Calendar & Filter states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Appointments & Faculty list
    const [appointments, setAppointments] = useState([]);
    const [facultiesList, setFacultiesList] = useState([]);
    const [activeMentor, setActiveMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state for creating an appointment
    const [newAppt, setNewAppt] = useState({
        facultyId: '',
        studentId: '',
        patientName: '',
        patientAge: '',
        patientGender: 'Female',
        patientPhone: '',
        dentalProcedure: 'Root Canal Treatment (RCT)',
        toothNumber: 'Tooth #16',
        chairNumber: 'Dental Chair 02',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        notes: ''
    });

    const [availableStudents, setAvailableStudents] = useState([]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/appointments`);
            setAppointments(res.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
            } else if (error.code === 'ERR_NETWORK') {
                toast.error('Cannot connect to university backend server.');
            }
            setLoading(false);
        }
    };

    const fetchFacultiesAndMentor = async () => {
        try {
            const [facRes, mentorRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/mentorship/faculties`),
                user?.role === 'student' ? axios.get(`${API_BASE_URL}/api/mentorship/my-mentor`) : Promise.resolve({ data: [] })
            ]);

            const faculties = facRes.data || [];
            setFacultiesList(faculties);

            const active = (mentorRes.data || []).find(m => m.status === 'Active')?.Faculty || faculties[0];
            setActiveMentor(active);

            // Pre-fill facultyId in form with active mentor
            if (active && user?.role === 'student') {
                setNewAppt(prev => ({ ...prev, facultyId: active.id }));
            }
        } catch (err) {
            console.error('Error fetching faculties/mentors:', err);
        }
    };

    const fetchStudentsForDropdown = async () => {
        if (!isFaculty) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/mentorship/faculty-mentees`);
            const studentList = (res.data || []).map(m => m.Student).filter(Boolean);
            setAvailableStudents(studentList);
        } catch (err) {
            console.error('Error fetching mentees for booking:', err);
        }
    };

    useEffect(() => {
        fetchAppointments();
        fetchFacultiesAndMentor();
        fetchStudentsForDropdown();
    }, [user?.id, user?.role]);

    // Real-time synchronization whenever any event is emitted across the system
    useEffect(() => {
        if (lastEvent) {
            fetchAppointments();
            fetchFacultiesAndMentor();
            if (isFaculty) fetchStudentsForDropdown();
        }
    }, [lastEvent]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newAppt,
                facultyId: newAppt.facultyId || activeMentor?.id || facultiesList[0]?.id
            };

            await axios.post(`${API_BASE_URL}/api/appointments`, payload);
            toast.success(
                isFaculty
                    ? 'Clinical appointment scheduled!'
                    : 'Patient dental appointment created under supervising mentor!'
            );
            setShowModal(false);
            setNewAppt({
                facultyId: activeMentor?.id || facultiesList[0]?.id || '',
                studentId: '',
                patientName: '',
                patientAge: '',
                patientGender: 'Female',
                patientPhone: '',
                dentalProcedure: 'Root Canal Treatment (RCT)',
                toothNumber: 'Tooth #16',
                chairNumber: 'Dental Chair 02',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                notes: ''
            });
            fetchAppointments();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create appointment');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status });
            toast.success('Session status updated');
            fetchAppointments();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const triggerDailySummary = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/appointments/summary`);
            toast.success(`Daily schedule summary dispatched (${res.data.count} sessions).`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to trigger daily summary');
        }
    };

    // Filter Logic for Appointments
    const filteredAppointments = appointments.filter(appt => {
        const matchesDate = !selectedDate || appt.date === selectedDate;
        const matchesStatus = filterStatus === 'All' || appt.status === filterStatus;
        return matchesDate && matchesStatus;
    });

    // Derive unique patients from appointments
    const filteredPatients = Array.from(new Set(appointments.map(a => a.Patient?.id)))
        .map(id => appointments.find(a => a.Patient?.id === id)?.Patient)
        .filter(p => p && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
            {/* Sidebar Navigation */}
            <Sidebar
                currentView={currentView}
                onViewChange={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Occupancy Calendar Panel (Rendered for BOTH Faculty and Dental Students) */}
            <CalendarPanel
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    if (window.innerWidth < 1024) setIsCalendarOpen(false);
                }}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                isOpen={isCalendarOpen}
                onClose={() => {
                    setIsCalendarOpen(false);
                    setShowCalendarOnDesktop(false);
                }}
                appointments={appointments}
                maxSlotsPerDay={isFaculty ? (user?.totalSlotsPerDay || 6) : 4}
                role={user?.role}
                showOnDesktop={currentView === 'dashboard' && showCalendarOnDesktop}
            />

            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-20 px-4 py-3 flex justify-between items-center border-b border-slate-200 shadow-sm">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl"
                    aria-label="Open Sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>
                <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" /> 
                    <span>Lin's Dental College</span>
                    <span
                        title={isConnected ? 'Real-time sync connected' : 'Connecting...'}
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-300/40' : 'bg-amber-400'}`}
                    />
                </div>
                <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="p-2 -mr-2 text-slate-700 hover:bg-slate-100 rounded-xl"
                    aria-label="Open Occupancy Calendar"
                >
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                </button>
            </div>

            {/* Main Content Area (Offset for 80px Sidebar + 340px Calendar Panel = 420px when calendar visible) */}
            <div className={`p-4 sm:p-6 lg:p-8 min-h-screen pt-18 lg:pt-8 pb-28 lg:pb-8 transition-all duration-300 ml-0 ${
                currentView === 'dashboard' && showCalendarOnDesktop ? 'lg:ml-[420px]' : 'lg:ml-20'
            }`}>
                {/* Top Banner / User Welcome */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200/80">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                isFaculty
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                                {isFaculty ? 'Dental Faculty Preceptor' : `Dental Student Clinician • ${user?.year || 'BDS'}`}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                {user?.department || 'Lin\'s Dental Medical University & Hospital'}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {isFaculty ? `Prof. ${user?.name}` : user?.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            {isFaculty
                                ? `${user?.designation || 'Faculty Member'} • ${user?.cabin || 'Dental Operatory Wing'}`
                                : `Roll No: ${user?.rollNumber || 'BDS-UNI'} • Department: ${user?.department || 'Conservative Dentistry & Endodontics'}`}
                        </p>
                    </div>

                    {/* Action buttons on top right */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                        {/* Real-time Status Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold">
                            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-amber-400'}`} />
                            <span className={isConnected ? 'text-slate-700' : 'text-slate-400'}>
                                {isConnected ? 'Live Real-Time' : 'Connecting...'}
                            </span>
                        </div>

                        {/* Desktop Calendar Toggle Button */}
                        {currentView === 'dashboard' && (
                            <button
                                onClick={() => setShowCalendarOnDesktop(prev => !prev)}
                                title={showCalendarOnDesktop ? "Hide Occupancy Calendar" : "Show Occupancy Calendar"}
                                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer"
                            >
                                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                                <span>{showCalendarOnDesktop ? 'Hide Calendar' : 'Show Calendar'}</span>
                            </button>
                        )}

                        {isFaculty ? (
                            <>
                                <div
                                    onClick={triggerDailySummary}
                                    className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition cursor-pointer relative group"
                                    title="Dispatch Daily Dental Clinic Summary"
                                >
                                    <Bell className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                                </div>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 text-xs sm:text-sm flex-1 sm:flex-none cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Schedule Session
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    if (activeMentor) {
                                        setNewAppt(prev => ({ ...prev, facultyId: activeMentor.id }));
                                    }
                                    setShowModal(true);
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 text-xs sm:text-sm flex-1 sm:flex-none cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> New Patient Appointment
                            </button>
                        )}
                    </div>
                </header>

                {/* =========================================
                    MAIN VIEWS DISPATCHER
                ========================================= */}
                {/* 1. Schedule & Occupancy View (Shared by both Faculty and Dental Student) */}
                {currentView === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                <span>{isFaculty ? 'Supervised Procedures & Consultations' : 'My Scheduled Patient Procedures'}</span>
                                {selectedDate && (
                                    <span className="text-xs font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                        {selectedDate}
                                    </span>
                                )}
                            </h2>
                            <span className="text-xs text-slate-500 font-semibold">
                                {filteredAppointments.length} patient cases listed
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {filteredAppointments.map(appt => (
                                <AppointmentCard
                                    key={appt.id}
                                    appt={appt}
                                    onStatusUpdate={updateStatus}
                                    currentRole={user?.role}
                                />
                            ))}

                            {filteredAppointments.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <CalendarIcon className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-base font-bold text-slate-700">No Patient Cases Found</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isFaculty
                                            ? 'No clinical consultations booked for the selected date.'
                                            : 'No patient appointments scheduled for this date. Click "New Patient Appointment" to book under your supervising mentor!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Faculty Mentees & Requests View */}
                {isFaculty && currentView === 'mentees' && (
                    <FacultyMenteesView
                        onScheduleSession={(student) => {
                            setNewAppt(prev => ({
                                ...prev,
                                studentId: student.id,
                                patientName: student.name
                            }));
                            setShowModal(true);
                        }}
                    />
                )}

                {/* 3. Clinical Patients Records View */}
                {isFaculty && currentView === 'patients' && (
                    selectedPatient ? (
                        <PatientDetails
                            patient={selectedPatient}
                            onBack={() => setSelectedPatient(null)}
                        />
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Hospital Patient Records</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Clinical dental patients treated in college operatory</p>
                                </div>
                                <div className="relative">
                                    <input
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none w-60"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 text-xs">
                                            <th className="pb-3 font-semibold pl-4">Patient Name</th>
                                            <th className="pb-3 font-semibold">Age</th>
                                            <th className="pb-3 font-semibold">Gender</th>
                                            <th className="pb-3 font-semibold">Contact</th>
                                            <th className="pb-3 font-semibold">Total Visits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-xs">
                                        {filteredPatients.map(patient => (
                                            <tr
                                                key={patient.id}
                                                className="group hover:bg-slate-50 transition cursor-pointer"
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <td className="py-4 pl-4 font-bold text-slate-800">{patient.name}</td>
                                                <td className="py-4 text-slate-500">{patient.age || '-'}</td>
                                                <td className="py-4 text-slate-500">{patient.gender || '-'}</td>
                                                <td className="py-4 text-slate-500">{patient.phone}</td>
                                                <td className="py-4 text-indigo-600 font-bold">
                                                    {appointments.filter(a => a.patientId === patient.id).length}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPatients.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-400">
                                                    No clinical patients recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}

                {/* 4. Student Mentorship & Faculty Directory Views */}
                {!isFaculty && (currentView === 'student-mentor' || currentView === 'find-faculty') && (
                    <StudentPortalView
                        currentSubView={currentView}
                        onNavigate={(view) => setCurrentView(view)}
                    />
                )}
            </div>

            {/* MODAL: BOOK APPOINTMENT (FOR DENTAL STUDENTS & FACULTY) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-extrabold text-slate-800 mb-1">
                            {isFaculty ? 'Schedule Consultation Session' : 'Book Dental Patient Appointment'}
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            {isFaculty
                                ? 'Book an operatory chair slot or assign a case to student mentee'
                                : 'Create appointment for your patient under your supervising faculty mentor'}
                        </p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            {/* IF DENTAL STUDENT: SUPERVISING FACULTY MENTOR DROPDOWN */}
                            {!isFaculty && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Supervising Dental Faculty Mentor <span className="text-indigo-600">*</span>
                                    </label>
                                    <select
                                        value={newAppt.facultyId}
                                        onChange={(e) => setNewAppt({ ...newAppt, facultyId: e.target.value })}
                                        className="w-full p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none"
                                        required
                                    >
                                        <option value="">-- Select Supervising Mentor from Dropdown --</option>
                                        {facultiesList.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} ({f.department}) {f.id === activeMentor?.id ? '★ (Your Active Mentor)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        This appointment will be supervised by the chosen faculty and visible on their schedule.
                                    </p>
                                </div>
                            )}

                            {/* Patient Info */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Patient Name <span className="text-indigo-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Patient Full Name"
                                    value={newAppt.patientName}
                                    onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 35"
                                        value={newAppt.patientAge}
                                        onChange={(e) => setNewAppt({ ...newAppt, patientAge: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                                    <select
                                        value={newAppt.patientGender}
                                        onChange={(e) => setNewAppt({ ...newAppt, patientGender: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    >
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 555-0000"
                                        value={newAppt.patientPhone}
                                        onChange={(e) => setNewAppt({ ...newAppt, patientPhone: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dental Procedure Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Dental Clinical Procedure <span className="text-indigo-600">*</span>
                                </label>
                                <select
                                    value={newAppt.dentalProcedure}
                                    onChange={(e) => setNewAppt({ ...newAppt, dentalProcedure: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                >
                                    <option value="Root Canal Treatment (RCT)">Root Canal Treatment (RCT) - Endodontics</option>
                                    <option value="Surgical Tooth Extraction">Surgical Tooth Extraction - Oral Surgery</option>
                                    <option value="Ultrasonic Scaling & Polishing">Ultrasonic Scaling & Polishing - Periodontics</option>
                                    <option value="Composite Tooth Filling & Restoration">Composite Tooth Filling & Restoration</option>
                                    <option value="Orthodontic Wire & Bracket Adjustment">Orthodontic Bracket & Wire Adjustment</option>
                                    <option value="Complete Denture Impression & Trial">Complete Denture Impression - Prosthodontics</option>
                                    <option value="Crown & Bridge Tooth Preparation">Crown & Bridge Tooth Preparation</option>
                                    <option value="Pediatric Pulpectomy">Pediatric Pulpectomy - Pedodontics</option>
                                    <option value="Dental Consultation & X-Ray Examination">Dental Consultation & X-Ray Examination</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tooth Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tooth #16, #24"
                                        value={newAppt.toothNumber}
                                        onChange={(e) => setNewAppt({ ...newAppt, toothNumber: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Operatory Chair</label>
                                    <select
                                        value={newAppt.chairNumber}
                                        onChange={(e) => setNewAppt({ ...newAppt, chairNumber: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    >
                                        <option value="Dental Chair 01">Dental Chair 01</option>
                                        <option value="Dental Chair 02">Dental Chair 02</option>
                                        <option value="Dental Chair 03">Dental Chair 03</option>
                                        <option value="Dental Chair 04">Dental Chair 04</option>
                                        <option value="Surgical Operatory Suite">Surgical Operatory Suite</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newAppt.date}
                                        onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                                    <select
                                        value={newAppt.time}
                                        onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    >
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:30">11:30 AM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:30">03:30 PM</option>
                                        <option value="16:30">04:30 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinical Diagnosis & Notes</label>
                                <textarea
                                    rows="2"
                                    value={newAppt.notes}
                                    onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                                    placeholder="Enter diagnosis, cavity classification, or operatory instructions..."
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-200"
                                >
                                    Confirm Patient Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation Bar (Touch-Optimized for Mobile/Tablet) */}
            <MobileBottomNav
                currentView={currentView}
                onViewChange={setCurrentView}
                onOpenCalendar={() => setIsCalendarOpen(true)}
                onOpenNewBooking={() => {
                    if (activeMentor && user?.role === 'student') {
                        setNewAppt(prev => ({ ...prev, facultyId: activeMentor.id }));
                    }
                    setShowModal(true);
                }}
                role={user?.role}
                isConnected={isConnected}
            />
        </div>
    );
};

export default Dashboard;
