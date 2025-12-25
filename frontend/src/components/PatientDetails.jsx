import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PatientDetails = ({ patient, onBack }) => {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'treatments'
    const [treatments, setTreatments] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);

    // Treatment Form State
    const [currentTreatment, setCurrentTreatment] = useState({
        diagnosis: '',
        prescription: '',
        notes: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Next Appointment State
    const [nextAppt, setNextAppt] = useState({ date: '', time: '' });

    const calculateFollowUp = (duration) => {
        const date = new Date();
        switch (duration) {
            case '1week':
                date.setDate(date.getDate() + 7);
                break;
            case '1month':
                date.setMonth(date.getMonth() + 1);
                break;
            case '3months':
                date.setMonth(date.getMonth() + 3);
                break;
            case '6months':
                date.setMonth(date.getMonth() + 6);
                break;
            default:
                break;
        }
        setNextAppt({ ...nextAppt, date: date.toISOString().split('T')[0] });
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'treatments') {
                const res = await axios.get(`http://localhost:5000/api/treatments/patient/${patient.id}`);
                setTreatments(res.data);
            } else {
                // Fetch patient appointments (assuming endpoint exists or filter all)
                // For now, allow Dashboard to pass appointments or fetch all and filter
                // Ideally, backend should support /api/appointments?patientId=...
                // We'll filter all appointments for now as we don't want to change backend appointment logic too much yet
                const res = await axios.get('http://localhost:5000/api/appointments');
                const patientAppts = res.data.filter(a => a.patientId === patient.id);
                setAppointments(patientAppts);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTreatment = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...currentTreatment, patientId: patient.id };

            if (isEditing) {
                await axios.put(`http://localhost:5000/api/treatments/${editId}`, payload);
                toast.success('Treatment updated');
            } else {
                await axios.post('http://localhost:5000/api/treatments', payload);
                toast.success('Treatment added');
            }

            // Automatic Appointment Booking
            if (nextAppt.date && nextAppt.time) {
                const appointmentPayload = {
                    patientName: patient.name,
                    patientPhone: patient.phone,
                    patientEmail: patient.email,
                    patientAge: patient.age,
                    date: nextAppt.date,
                    time: nextAppt.time,
                    notes: `Follow-up for: ${currentTreatment.diagnosis}`
                };
                try {
                    await axios.post('http://localhost:5000/api/appointments', appointmentPayload);
                    toast.success('Follow-up appointment booked!');
                } catch (apptError) {
                    console.error('Error booking follow-up:', apptError);
                    toast.error('Treatment saved, but failed to book appointment.');
                }
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save treatment');
        }
    };

    const handleDeleteTreatment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this treatment?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/treatments/${id}`);
            toast.success('Treatment deleted');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete treatment');
        }
    };

    const openEditModal = (treatment) => {
        setCurrentTreatment({
            diagnosis: treatment.diagnosis,
            prescription: treatment.prescription || '',
            notes: treatment.notes || '',
            cost: treatment.cost || '',
            date: treatment.date
        });
        setEditId(treatment.id);
        setIsEditing(true);
        setShowTreatmentModal(true);
    };

    const closeModal = () => {
        setShowTreatmentModal(false);
        setIsEditing(false);
        setEditId(null);
        setCurrentTreatment({
            diagnosis: '',
            prescription: '',
            notes: '',
            cost: '',
            date: new Date().toISOString().split('T')[0]
        });
        setNextAppt({ date: '', time: '' });
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-50 rounded-full transition text-gray-500 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
                        <div className="flex gap-3 text-sm text-gray-500 mt-1">
                            <span>Age: {patient.age || 'N/A'}</span>
                            <span>•</span>
                            <span>{patient.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-100 flex gap-6">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`py-4 font-medium text-sm transition relative ${activeTab === 'appointments' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Appointments
                    {activeTab === 'appointments' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('treatments')}
                    className={`py-4 font-medium text-sm transition relative ${activeTab === 'treatments' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Treatments
                    {activeTab === 'treatments' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'appointments' ? (
                    <div className="space-y-4">
                        {loading ? <p className="text-gray-500">Loading...</p> : (
                            appointments.length > 0 ? (
                                appointments.map(appt => (
                                    <div key={appt.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <div className="flex gap-4 items-center">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{appt.date} at {appt.time}</p>
                                                <p className="text-sm text-gray-500">Token: #{appt.tokenNumber} • Status: {appt.status}</p>
                                            </div>
                                        </div>
                                        {appt.notes && (
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {appt.notes}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-center py-10">No appointments found.</p>
                            )
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-700">Treatment History</h3>
                            <button
                                onClick={() => setShowTreatmentModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Treatment
                            </button>
                        </div>

                        <div className="space-y-4">
                            {loading ? <p className="text-gray-500">Loading...</p> : (
                                treatments.length > 0 ? (
                                    treatments.map(item => (
                                        <div key={item.id} className="p-5 rounded-xl border border-gray-100 hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{item.date}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteTreatment(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="font-bold text-lg text-gray-800 mb-1">{item.diagnosis}</h4>
                                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.prescription}</p>
                                            </div>

                                            {(item.notes || item.cost > 0) && (
                                                <div className="pt-3 border-t border-gray-100 flex gap-6 text-sm">
                                                    {item.notes && (
                                                        <div className="flex gap-2 text-gray-500">
                                                            <FileText className="w-4 h-4" />
                                                            <span>{item.notes}</span>
                                                        </div>
                                                    )}
                                                    {item.cost > 0 && (
                                                        <div className="font-medium text-gray-800">
                                                            Cost: ${item.cost}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-10">No treatment records found.</p>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Treatment Modal */}
            {showTreatmentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">{isEditing ? 'Edit Treatment' : 'New Treatment'}</h3>
                        <form onSubmit={handleSaveTreatment} className="space-y-4">
                            <input
                                placeholder="Diagnosis"
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                value={currentTreatment.diagnosis}
                                onChange={(e) => setCurrentTreatment({ ...currentTreatment, diagnosis: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Prescription..."
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition h-32 resize-none"
                                value={currentTreatment.prescription}
                                onChange={(e) => setCurrentTreatment({ ...currentTreatment, prescription: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={currentTreatment.date}
                                    onChange={(e) => setCurrentTreatment({ ...currentTreatment, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Cost"
                                    step="0.01"
                                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={currentTreatment.cost}
                                    onChange={(e) => setCurrentTreatment({ ...currentTreatment, cost: e.target.value })}
                                />
                            </div>
                            <textarea
                                placeholder="Additional Notes..."
                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition h-20 resize-none"
                                value={currentTreatment.notes}
                                onChange={(e) => setCurrentTreatment({ ...currentTreatment, notes: e.target.value })}
                            />

                            {/* Next Appointment Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="font-semibold text-gray-700 mb-3">Next Appointment</h4>
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    <button type="button" onClick={() => calculateFollowUp('1week')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 whitespace-nowrap">1 Week</button>
                                    <button type="button" onClick={() => calculateFollowUp('1month')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 whitespace-nowrap">1 Month</button>
                                    <button type="button" onClick={() => calculateFollowUp('3months')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 whitespace-nowrap">3 Months</button>
                                    <button type="button" onClick={() => calculateFollowUp('6months')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 whitespace-nowrap">6 Months</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={nextAppt.date}
                                        onChange={(e) => setNextAppt({ ...nextAppt, date: e.target.value })}
                                    />
                                    <input
                                        type="time"
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={nextAppt.time}
                                        onChange={(e) => setNextAppt({ ...nextAppt, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetails;
