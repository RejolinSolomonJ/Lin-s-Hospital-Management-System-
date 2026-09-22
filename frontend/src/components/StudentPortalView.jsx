import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import { useSocket } from '../context/SocketContext';
import {
    GraduationCap,
    Stethoscope,
    Compass,
    Calendar,
    Clock,
    UserCheck,
    CheckCircle2,
    Building2,
    Mail,
    Phone,
    BookOpen,
    Plus,
    Search,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

const StudentPortalView = ({ currentSubView = 'student-mentor', onNavigate }) => {
    const { lastEvent } = useSocket() || {};
    const [faculties, setFaculties] = useState([]);
    const [myMentorships, setMyMentorships] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [searchFaculty, setSearchFaculty] = useState('');

    // Modal state for selecting mentor
    const [selectedFacultyForRequest, setSelectedFacultyForRequest] = useState(null);
    const [goalsInput, setGoalsInput] = useState('');
    const [isSubmittingMentor, setIsSubmittingMentor] = useState(false);

    // Modal state for booking session
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        facultyId: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        sessionType: 'Comprehensive Clinical Case Discussion',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [facRes, mentorRes, apptRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/mentorship/faculties`),
                axios.get(`${API_BASE_URL}/api/mentorship/my-mentor`),
                axios.get(`${API_BASE_URL}/api/appointments`)
            ]);

            setFaculties(facRes.data || []);
            setMyMentorships(mentorRes.data || []);
            setMyAppointments(apptRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading student data:', error);
            toast.error('Failed to load student portal data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Real-time synchronization
    useEffect(() => {
        if (lastEvent) {
            fetchData();
        }
    }, [lastEvent]);

    // Get active mentor or first pending
    const activeMentorship = myMentorships.find(m => m.status === 'Active') || myMentorships[0];
    const activeFaculty = activeMentorship?.Faculty;

    // Handle Select Mentor Submit
    const handleSelectMentor = async (e) => {
        e.preventDefault();
        if (!selectedFacultyForRequest) return;

        setIsSubmittingMentor(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/mentorship/select`, {
                facultyId: selectedFacultyForRequest.id,
                goals: goalsInput,
                academicYear: '2025-2026'
            });
            toast.success(res.data?.message || 'Mentorship request submitted successfully!');
            setSelectedFacultyForRequest(null);
            setGoalsInput('');
            fetchData();
            if (onNavigate) onNavigate('student-mentor');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit mentorship request');
        } finally {
            setIsSubmittingMentor(false);
        }
    };

    // Handle Book Mentoring Session Submit
    const handleBookSession = async (e) => {
        e.preventDefault();
        try {
            const targetFacultyId = bookingData.facultyId || activeFaculty?.id;
            if (!targetFacultyId) {
                toast.error('Please choose a faculty mentor for your session.');
                return;
            }

            await axios.post(`${API_BASE_URL}/api/appointments`, {
                ...bookingData,
                facultyId: targetFacultyId
            });

            toast.success('Mentoring consultation session scheduled!');
            setShowBookModal(false);
            fetchData();
            if (onNavigate) onNavigate('student-sessions');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to book session');
        }
    };

    const departments = ['All', ...new Set(faculties.map(f => f.department).filter(Boolean))];

    const filteredFaculties = faculties.filter(fac => {
        const matchesDept = selectedDepartment === 'All' || fac.department === selectedDepartment;
        const matchesQuery =
            fac.name.toLowerCase().includes(searchFaculty.toLowerCase()) ||
            fac.specialization?.toLowerCase().includes(searchFaculty.toLowerCase()) ||
            fac.department?.toLowerCase().includes(searchFaculty.toLowerCase());
        return matchesDept && matchesQuery;
    });

    return (
        <div className="space-y-6">
            {/* SUB-VIEW 1: MY ASSIGNED MENTOR */}
            {currentSubView === 'student-mentor' && (
                <div className="space-y-6">
                    {activeFaculty ? (
                        <>
                            {/* Mentor Profile Banner */}
                            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                    <div className="flex items-start sm:items-center gap-5">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white text-2xl font-black">
                                            {activeFaculty.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                                                    {activeMentorship.status === 'Active' ? 'Assigned Faculty Mentor' : 'Mentorship Request Pending'}
                                                </span>
                                                <span className="text-xs text-slate-400">• Academic Year 2025-2026</span>
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl font-extrabold">{activeFaculty.name}</h2>
                                            <p className="text-indigo-300 text-sm font-semibold">{activeFaculty.designation} — {activeFaculty.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                setBookingData(prev => ({ ...prev, facultyId: activeFaculty.id }));
                                                setShowBookModal(true);
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition text-xs shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4" /> Book Consultation Slot
                                        </button>
                                        <button
                                            onClick={() => onNavigate && onNavigate('find-faculty')}
                                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl transition text-xs border border-white/10 flex items-center justify-center gap-1.5"
                                        >
                                            <Compass className="w-4 h-4" /> Change Mentor
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Details Bar */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-indigo-400" />
                                        <span>Cabin: {activeFaculty.cabin || 'Faculty Block Room 101'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>Hours: {activeFaculty.officeHours || 'Mon-Fri 09:00 AM - 04:00 PM'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-indigo-400" />
                                        <span className="truncate">{activeFaculty.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mentorship Focus & Preceptor Feedback */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Your Mentorship Objectives:
                                    </h4>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic leading-relaxed">
                                        "{activeMentorship.goals || 'Academic guidance, exam preparation, and clinical clinical case discussions.'}"
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                                        Mentor Guidance & Advising Notes:
                                    </h4>
                                    <p className="text-sm text-slate-700 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 leading-relaxed">
                                        {activeMentorship.facultyNotes || 'No specific clinical notes assigned yet. Schedule a session to establish your mentorship curriculum.'}
                                    </p>
                                </div>
                            </div>

                            {/* Upcoming Sessions with this Mentor */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-extrabold text-slate-800">
                                        Scheduled Mentoring Sessions
                                    </h3>
                                    <span className="text-xs text-slate-400 font-semibold">
                                        {myAppointments.length} total sessions
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {myAppointments.map(appt => (
                                        <div
                                            key={appt.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    #{appt.tokenNumber}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">
                                                        {appt.sessionType || 'Mentorship Session'}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span><Clock className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />{appt.date} at {appt.time}</span>
                                                        <span>• Dr. {appt.Doctor?.name}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                                                    appt.status === 'Completed'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : appt.status === 'Cancelled'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {myAppointments.length === 0 && (
                                        <div className="py-12 text-center text-slate-400">
                                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs font-semibold">No mentoring consultations scheduled yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* No Mentor Assigned Banner */
                        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800">
                                Select Your Medical Faculty Mentor
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Every medical student is paired with a clinical professor or faculty preceptor for academic guidance, clinical rotations, and research mentoring.
                            </p>
                            <button
                                onClick={() => onNavigate && onNavigate('find-faculty')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-xs shadow-lg shadow-indigo-200 inline-flex items-center gap-2"
                            >
                                Browse Faculty Directory <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* SUB-VIEW 2: BROWSE & SELECT FACULTY */}
            {currentSubView === 'find-faculty' && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                University Faculty Directory
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Explore professors across departments and select your official faculty mentor
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Search by name, department, specialty..."
                                value={searchFaculty}
                                onChange={(e) => setSearchFaculty(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Department Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDepartment(dept)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                    selectedDepartment === dept
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {/* Faculties Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredFaculties.map(fac => {
                            const isMyCurrentMentor = myMentorships.some(
                                m => m.facultyId === fac.id && (m.status === 'Active' || m.status === 'Pending')
                            );
                            const currentStatus = myMentorships.find(m => m.facultyId === fac.id)?.status;

                            return (
                                <div
                                    key={fac.id}
                                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Avatar & Department */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
                                                {fac.name.charAt(0)}
                                            </div>
                                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                                                fac.isFull
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {fac.isFull ? 'Capacity Full' : `${fac.availableSlots} Slots Available`}
                                            </span>
                                        </div>

                                        <h3 className="font-extrabold text-slate-900 text-lg">{fac.name}</h3>
                                        <p className="text-xs font-bold text-indigo-600 mb-1">{fac.designation}</p>
                                        <p className="text-xs text-slate-500 font-medium mb-3">{fac.department}</p>

                                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3 mb-4 leading-relaxed">
                                            {fac.bio || 'Preceptor dedicated to student medical education and clinical research.'}
                                        </p>

                                        <div className="space-y-1.5 text-[11px] text-slate-500 mb-5">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{fac.cabin}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate">{fac.officeHours}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div>
                                        {isMyCurrentMentor ? (
                                            <div className={`w-full py-2.5 text-center rounded-xl text-xs font-bold border ${
                                                currentStatus === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {currentStatus === 'Active' ? '✓ Your Active Mentor' : '⏳ Request Pending Review'}
                                            </div>
                                        ) : (
                                            <button
                                                disabled={fac.isFull}
                                                onClick={() => setSelectedFacultyForRequest(fac)}
                                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                                                    fac.isFull
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                                                }`}
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Select as My Mentor
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SUB-VIEW 3: MY SESSIONS */}
            {currentSubView === 'student-sessions' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            My Mentoring & Clinical Sessions
                        </h2>
                        <button
                            onClick={() => setShowBookModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-indigo-200 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Book New Session
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                        {myAppointments.map(appt => (
                            <div
                                key={appt.id}
                                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                            Token #{appt.tokenNumber}
                                        </span>
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {appt.sessionType || 'Mentorship Session'}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        With: <strong>Dr. {appt.Doctor?.name}</strong> ({appt.Doctor?.department})
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Date: {appt.date} • Time: {appt.time} • Cabin: {appt.Doctor?.cabin || 'Office'}
                                    </p>
                                    {appt.notes && (
                                        <p className="text-xs text-slate-600 italic mt-1">
                                            Notes: "{appt.notes}"
                                        </p>
                                    )}
                                </div>

                                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                                    appt.status === 'Completed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {appt.status}
                                </span>
                            </div>
                        ))}

                        {myAppointments.length === 0 && (
                            <div className="py-12 text-center text-slate-400">
                                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-semibold">No appointments scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: SELECT MENTOR FORM */}
            {selectedFacultyForRequest && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                {selectedFacultyForRequest.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-800">
                                    Select as Your Faculty Mentor
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedFacultyForRequest.name} • {selectedFacultyForRequest.department}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSelectMentor} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Your Goals & Statement of Interest
                                </label>
                                <textarea
                                    rows="4"
                                    value={goalsInput}
                                    onChange={(e) => setGoalsInput(e.target.value)}
                                    placeholder="Explain your academic goals, research interests, or areas where you would like mentorship from this faculty member..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <span>Once submitted, this mentorship request will be visible directly on Dr. {selectedFacultyForRequest.name}'s faculty portal for review.</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFacultyForRequest(null)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingMentor}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-200 disabled:opacity-60"
                                >
                                    {isSubmittingMentor ? 'Submitting...' : 'Confirm Mentor Selection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: BOOK SESSION */}
            {showBookModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                            Book Mentoring Consultation
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Schedule a slot with your professor or faculty preceptor
                        </p>

                        <form onSubmit={handleBookSession} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Faculty Mentor</label>
                                <select
                                    value={bookingData.facultyId || activeFaculty?.id || ''}
                                    onChange={(e) => setBookingData({ ...bookingData, facultyId: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    required
                                >
                                    {activeFaculty && (
                                        <option value={activeFaculty.id}>
                                            {activeFaculty.name} ({activeFaculty.department}) - Active Mentor
                                        </option>
                                    )}
                                    {faculties
                                        .filter(f => f.id !== activeFaculty?.id)
                                        .map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} - {f.department}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={bookingData.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                                    <select
                                        value={bookingData.time}
                                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
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
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session Type</label>
                                <select
                                    value={bookingData.sessionType}
                                    onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                >
                                    <option value="Mentorship Session">Mentorship Session (One-on-One)</option>
                                    <option value="Clinical Guidance">Clinical Guidance & Rotation Prep</option>
                                    <option value="Academic Review">Academic Review & Exam Prep</option>
                                    <option value="Case Study Discussion">Case Study & Research Review</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Discussion Topic</label>
                                <textarea
                                    rows="2"
                                    value={bookingData.notes}
                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                    placeholder="What would you like to review in this session?"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBookModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-200"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPortalView;
