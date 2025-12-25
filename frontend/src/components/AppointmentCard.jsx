import { Phone, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const AppointmentCard = ({ appt, onStatusUpdate }) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                {/* Patient Info */}
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {appt.Patient.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{appt.Patient.name}</h3>
                        <p className="text-xs text-gray-500 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded mt-1">
                            Token #{appt.tokenNumber}
                        </p>
                    </div>
                </div>
                {/* Phone Button */}
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition">
                    <Phone className="w-5 h-5" />
                </button>
            </div>

            {/* Date & Location (Mock Location) */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">
                        {appt.date} • {appt.time}
                    </span>
                </div>
                <div className="text-xs text-gray-400 pl-7">
                    Patient Notes: {appt.notes || "No notes provided."}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition text-sm font-medium">
                    <MessageSquare className="w-4 h-4" /> Message
                </button>

                {appt.status === 'Scheduled' ? (
                    <button
                        onClick={() => onStatusUpdate(appt.id, 'Completed')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm font-medium shadow-lg shadow-indigo-200"
                    >
                        <CheckCircle className="w-4 h-4" /> Complete
                    </button>
                ) : (
                    <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
            ${appt.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
          `}>
                        {appt.status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
