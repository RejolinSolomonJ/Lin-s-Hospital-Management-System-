import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Bell, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import CalendarPanel from '../components/CalendarPanel';
import AppointmentCard from '../components/AppointmentCard';
import PatientDetails from '../components/PatientDetails';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext); // Get logout function
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null); // New state for selected patient
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);

    // ... (keep New Appointment State as is, lines 26-35 are inside the ... in previous context but I'll be careful not to overwrite them if I don't touch them. Wait, I should not use '...' in replacement)

    // New Appointment State
    const [newAppt, setNewAppt] = useState({
        patientName: '',
        patientAge: '',
        patientPhone: '',
        patientEmail: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        notes: ''
    });

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/appointments');
            setAppointments(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
            } else if (error.code === 'ERR_NETWORK') {
                toast.error('Cannot connect to server. Is the backend running?');
            } else {
                toast.error('Failed to load appointments');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/appointments', newAppt);
            toast.success('Appointment created!');
            setShowModal(false);
            setNewAppt({
                patientName: '',
                patientAge: '',
                patientPhone: '',
                patientEmail: '',
                date: new Date().toISOString().split('T')[0],
                time: '',
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
            await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
            toast.success('Status updated');
            fetchAppointments();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const triggerDailySummary = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/appointments/summary');
            toast.success(`Summary sent! ${res.data.count} appointments included.`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to send summary');
        }
    };

    // Filter Logic
    const filteredAppointments = appointments.filter(appt => {
        // If no date selected, show all (or match logic appropriately). 
        // Assuming appt.date is YYYY-MM-DD string from backend.
        const matchesDate = !selectedDate || appt.date === selectedDate;
        const matchesStatus = filterStatus === 'All' || appt.status === filterStatus;
        return matchesDate && matchesStatus;
    });

    // Derive unique patients from appointments
    const filteredPatients = Array.from(new Set(appointments.map(a => a.Patient?.id)))
        .map(id => {
            return appointments.find(a => a.Patient?.id === id)?.Patient;
        })
        .filter(p => p && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <Sidebar
                currentView={currentView}
                onViewChange={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <CalendarPanel
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                    setSelectedDate(date);
                    if (window.innerWidth < 1024) setIsCalendarOpen(false);
                }}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />

            {/* Mobile Header Toggles */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-20 px-4 py-3 flex justify-between items-center shadow-sm">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>
                <div className="font-bold text-lg text-gray-800">Lin's Clinic</div>
                <button onClick={() => setIsCalendarOpen(true)} className="p-2 -mr-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="ml-0 lg:ml-[25rem] p-4 lg:p-8 min-h-screen pt-20 lg:pt-8 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 capitalize">
                            {currentView === 'dashboard' ? 'Appointments' : currentView}
                        </h1>
                        <p className="text-sm lg:text-base text-gray-500 mt-1">Welcome back, Dr. {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        {/* Daily Notification Trigger */}
                        <div
                            onClick={triggerDailySummary}
                            className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition cursor-pointer relative group hidden lg:block"
                            title="Send Daily Summary"
                        >
                            <Bell className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gray-900 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-200 flex-1 lg:flex-none text-sm lg:text-base"
                        >
                            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">New Appointment</span><span className="sm:hidden">New</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                {currentView === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
                        {filteredAppointments.map(appt => (
                            <AppointmentCard key={appt.id} appt={appt} onStatusUpdate={updateStatus} />
                        ))}
                        {filteredAppointments.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-lg font-medium">No appointments found</p>
                                <p className="text-sm">Try adjusting your filters or date.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'patients' && (
                    selectedPatient ? (
                        <PatientDetails
                            patient={selectedPatient}
                            onBack={() => setSelectedPatient(null)}
                        />
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Patient List</h3>
                                <div className="relative">
                                    <input
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 text-sm">
                                            <th className="pb-3 font-medium pl-4">Name</th>
                                            <th className="pb-3 font-medium">Age</th>
                                            <th className="pb-3 font-medium">Phone</th>
                                            <th className="pb-3 font-medium">Email</th>
                                            <th className="pb-3 font-medium">Visits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredPatients.map(patient => (
                                            <tr
                                                key={patient.id}
                                                className="group hover:bg-gray-50 transition cursor-pointer"
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <td className="py-4 pl-4 font-medium text-gray-800">{patient.name}</td>
                                                <td className="py-4 text-gray-500">{patient.age || '-'}</td>
                                                <td className="py-4 text-gray-500">{patient.phone}</td>
                                                <td className="py-4 text-gray-500">{patient.email || '-'}</td>
                                                <td className="py-4 text-gray-400 text-sm">{appointments.filter(a => a.patientId === patient.id).length}</td>
                                            </tr>
                                        ))}
                                        {filteredPatients.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-400">No patients found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}

                {currentView === 'settings' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                        <h3 className="text-2xl font-bold mb-6">Settings</h3>

                        <div className="space-y-6">
                            <div className="pb-6 border-b border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-4">Notifications</h4>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-600">Daily Email Summary</span>
                                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                        <input type="checkbox" className="peer absolute w-0 h-0 opacity-0" defaultChecked />
                                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-200 rounded-full transition-all duration-200 peer-checked:bg-indigo-600"></span>
                                        <span className="absolute content-[''] h-4 w-4 bg-white rounded-full bottom-1 left-1 transition-all duration-200 peer-checked:translate-x-6"></span>
                                    </div>
                                </label>
                            </div>

                            <div className="pb-6 border-b border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-4">Security</h4>
                                <button className="text-indigo-600 font-medium hover:underline">Change Password</button>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-4">System</h4>
                                <p className="text-sm text-gray-500">Version 1.0.0</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">New Appointment</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                placeholder="Patient Name"
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={newAppt.patientName}
                                onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Age"
                                    type="number"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={newAppt.patientAge}
                                    onChange={(e) => setNewAppt({ ...newAppt, patientAge: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={newAppt.patientPhone}
                                    onChange={(e) => setNewAppt({ ...newAppt, patientPhone: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                placeholder="Email (Optional)"
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={newAppt.patientEmail}
                                onChange={(e) => setNewAppt({ ...newAppt, patientEmail: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={newAppt.date}
                                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={newAppt.time}
                                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                                    required
                                />
                            </div>
                            <textarea
                                placeholder="Notes..."
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition h-20 resize-none"
                                value={newAppt.notes}
                                onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                            />
                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
