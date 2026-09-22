import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import { useSocket } from '../context/SocketContext';
import {
    GraduationCap,
    Clock,
    CheckCircle,
    XCircle,
    UserCheck,
    Mail,
    Phone,
    Calendar,
    MessageSquare,
    AlertCircle,
    Search,
    BookOpen
} from 'lucide-react';

const FacultyMenteesView = ({ onScheduleSession }) => {
    const { lastEvent } = useSocket() || {};
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'pending', 'active'
    const [selectedMenteeForNotes, setSelectedMenteeForNotes] = useState(null);
    const [notesText, setNotesText] = useState('');

    const fetchMentees = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/mentorship/faculty-mentees`);
            setMentees(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching mentees:', error);
            toast.error('Failed to load mentees and requests');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentees();
    }, []);

    // Real-time synchronization
    useEffect(() => {
        if (lastEvent?.type === 'new_mentorship_request' || lastEvent?.type === 'mentorship_status_updated') {
            fetchMentees();
        }
    }, [lastEvent]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/mentorship/status/${id}`, { status });
            toast.success(`Mentorship request marked as ${status}`);
            fetchMentees();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        if (!selectedMenteeForNotes) return;
        try {
            await axios.put(`${API_BASE_URL}/api/mentorship/status/${selectedMenteeForNotes.id}`, {
                facultyNotes: notesText
            });
            toast.success('Mentorship guidance notes updated!');
            setSelectedMenteeForNotes(null);
            fetchMentees();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save notes');
        }
    };

    const pendingRequests = mentees.filter(m => m.status === 'Pending');
    const activeMentees = mentees.filter(m => m.status === 'Active');

    const filteredMentees = mentees.filter(m => {
        const matchesSearch =
            m.Student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.Student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.Student?.year?.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedTab === 'pending') return matchesSearch && m.status === 'Pending';
        if (selectedTab === 'active') return matchesSearch && m.status === 'Active';
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Mentees</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{activeMentees.length} Students</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{pendingRequests.length} Waiting</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mentorships</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{mentees.length} Records</h3>
                    </div>
                </div>
            </div>

            {/* Pending Requests Alert Banner if any */}
            {pendingRequests.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-amber-900">
                                You have {pendingRequests.length} new medical student mentorship request(s)!
                            </p>
                            <p className="text-xs text-amber-700">
                                Students have selected you as their clinical/academic mentor. Review below to accept.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedTab('pending')}
                        className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl transition whitespace-nowrap shadow-sm shadow-amber-200"
                    >
                        Review Requests
                    </button>
                </div>
            )}

            {/* Controls Bar: Search & Filter Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            selectedTab === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        All Students ({mentees.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            selectedTab === 'active' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Active ({activeMentees.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            selectedTab === 'pending' ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Pending Requests ({pendingRequests.length})
                    </button>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search student or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition"
                    />
                </div>
            </div>

            {/* Mentees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                {filteredMentees.map(mentorship => {
                    const student = mentorship.Student;
                    const isPending = mentorship.status === 'Pending';
                    const isActive = mentorship.status === 'Active';

                    return (
                        <div
                            key={mentorship.id}
                            className={`bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                                isPending ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
                            }`}
                        >
                            {/* Student Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base shadow-sm">
                                        {student?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-base">{student?.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                {student?.rollNumber}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                {student?.year}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <span
                                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : isPending
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {mentorship.status}
                                </span>
                            </div>

                            {/* Department & Contact */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                                <div className="flex items-center gap-1.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate">{student?.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 truncate">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate">{student?.phone || 'Not provided'}</span>
                                </div>
                            </div>

                            {/* Mentorship Goals submitted by student */}
                            <div className="mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Student's Mentorship Focus / Goals:
                                </span>
                                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 leading-relaxed italic">
                                    "{mentorship.goals || 'No specific goals provided.'}"
                                </p>
                            </div>

                            {/* Faculty Notes if exists */}
                            {mentorship.facultyNotes && (
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                                        Faculty Preceptor Notes:
                                    </span>
                                    <p className="text-xs text-slate-700 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60 leading-relaxed">
                                        {mentorship.facultyNotes}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {isPending ? (
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleStatusUpdate(mentorship.id, 'Active')}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Accept Mentee
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(mentorship.id, 'Declined')}
                                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-200"
                                    >
                                        <XCircle className="w-4 h-4" /> Decline
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => onScheduleSession(student)}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
                                    >
                                        <Calendar className="w-3.5 h-3.5" /> Book Session
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMenteeForNotes(mentorship);
                                            setNotesText(mentorship.facultyNotes || '');
                                        }}
                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Advice Notes
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredMentees.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-slate-700">No Mentees Found</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            {searchTerm ? 'No matches for your search term.' : 'When students select you as their mentor, they will appear here.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for Adding Guidance Notes */}
            {selectedMenteeForNotes && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                            Add Mentorship Guidance Notes
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Mentee: {selectedMenteeForNotes.Student?.name} ({selectedMenteeForNotes.Student?.rollNumber})
                        </p>

                        <form onSubmit={handleSaveNotes} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Preceptor Advice / Clinical Rotation Notes
                                </label>
                                <textarea
                                    rows="4"
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                    placeholder="Enter academic recommendations, journal club reading assignments, clinical feedback..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMenteeForNotes(null)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-200"
                                >
                                    Save Guidance Notes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyMenteesView;
