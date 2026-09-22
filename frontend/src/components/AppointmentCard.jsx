import { Phone, Clock, CheckCircle, GraduationCap, Stethoscope, User, MapPin } from 'lucide-react';

const AppointmentCard = ({ appt, onStatusUpdate, currentRole = 'faculty' }) => {
    const isStudentViewer = currentRole === 'student';

    const patientName = appt.Patient?.name || (appt.Student ? appt.Student.name : 'Patient');
    const patientInitial = patientName.charAt(0).toUpperCase();
    const patientDetails = appt.Patient
        ? `Age: ${appt.Patient.age || 'N/A'} • ${appt.Patient.gender || 'Patient'} • ${appt.Patient.phone || ''}`
        : (appt.Student ? `${appt.Student.rollNumber} • ${appt.Student.year}` : 'Clinical Consultation');

    const procedure = appt.dentalProcedure || appt.sessionType || 'Dental Clinical Procedure';
    const supervisingFacultyName = appt.Doctor?.name ? `Dr. ${appt.Doctor.name}` : null;
    const studentClinicianName = appt.Student?.name;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Header: Patient Info & Token */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base shadow-sm">
                            {patientInitial}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-extrabold text-slate-800 text-base">{patientName}</h3>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                {patientDetails}
                            </p>
                        </div>
                    </div>

                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        Token #{appt.tokenNumber}
                    </span>
                </div>

                {/* Dental Procedure & Tooth Number */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 mb-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-900">
                            {procedure}
                        </span>
                        {appt.toothNumber && appt.toothNumber !== 'N/A' && (
                            <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                {appt.toothNumber}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{appt.date} • {appt.time}</span>
                        {appt.chairNumber && (
                            <span className="text-slate-400 text-[11px]">({appt.chairNumber})</span>
                        )}
                    </div>

                    {/* Supervisor or Clinician Attribution */}
                    <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 flex flex-col gap-0.5">
                        {supervisingFacultyName && (
                            <span className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3 text-indigo-600" />
                                <span>Supervising Mentor: <strong>{supervisingFacultyName}</strong></span>
                            </span>
                        )}
                        {!isStudentViewer && studentClinicianName && (
                            <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-blue-600" />
                                <span>Student Clinician: <strong>{studentClinicianName}</strong></span>
                            </span>
                        )}
                    </div>
                </div>

                {appt.notes && (
                    <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 mb-3">
                        <span className="font-bold text-slate-400 block text-[10px] uppercase">Clinical Notes:</span>
                        {appt.notes}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 mt-2">
                {appt.status === 'Scheduled' ? (
                    <button
                        onClick={() => onStatusUpdate(appt.id, 'Completed')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs font-bold shadow-md shadow-indigo-200"
                    >
                        <CheckCircle className="w-4 h-4" /> Mark Completed
                    </button>
                ) : (
                    <div className={`flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-bold ${
                        appt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                        {appt.status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
