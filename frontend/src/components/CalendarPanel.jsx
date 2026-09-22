import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Activity, Clock, UserCheck, ShieldCheck, X } from 'lucide-react';

const CalendarPanel = ({
    selectedDate,
    onDateSelect,
    filterStatus,
    onFilterChange,
    isOpen,
    onClose,
    appointments = [],
    maxSlotsPerDay = 4,
    role = 'faculty',
    showOnDesktop = true
}) => {
    const isStudent = role === 'student';
    const [displayDate, setDisplayDate] = useState(new Date());

    const currentMonthName = displayDate.toLocaleString('default', { month: 'long' });
    const currentYear = displayDate.getFullYear();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentYear, displayDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentYear, displayDate.getMonth());

    const dates = [];
    for (let i = 0; i < firstDay; i++) {
        dates.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        dates.push(i);
    }

    const formatDate = (day) => {
        if (!day) return null;
        const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        return `${currentYear}-${month}-${d}`;
    };

    // Calculate date-wise occupancy from appointments
    const occupancyByDate = useMemo(() => {
        const map = {};
        appointments.forEach(appt => {
            if (!appt.date) return;
            if (appt.status === 'Cancelled') return;
            if (!map[appt.date]) {
                map[appt.date] = { count: 0, appointments: [] };
            }
            map[appt.date].count += 1;
            map[appt.date].appointments.push(appt);
        });
        return map;
    }, [appointments]);

    const handleDateClick = (day) => {
        if (!day) return;
        const formatted = formatDate(day);
        if (selectedDate === formatted) {
            onDateSelect(null);
        } else {
            onDateSelect(formatted);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + offset, 1);
        setDisplayDate(newDate);
    };

    const jumpToToday = () => {
        const today = new Date();
        setDisplayDate(today);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        onDateSelect(`${yyyy}-${mm}-${dd}`);
    };

    // Calculate selected date occupancy info
    const selectedOccupancy = useMemo(() => {
        if (!selectedDate) return null;
        const info = occupancyByDate[selectedDate] || { count: 0, appointments: [] };
        const capacity = maxSlotsPerDay || (isStudent ? 4 : 6);
        const percent = Math.min(100, Math.round((info.count / capacity) * 100));
        let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        let statusText = 'Available';

        if (percent >= 100) {
            badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            statusText = 'Fully Booked';
        } else if (percent >= 50) {
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
            statusText = 'Moderate Occupancy';
        } else if (percent > 0) {
            badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
            statusText = 'Light Occupancy';
        }

        return {
            booked: info.count,
            available: Math.max(0, capacity - info.count),
            percent,
            statusText,
            badgeColor,
            appointments: info.appointments,
            capacity
        };
    }, [selectedDate, occupancyByDate, maxSlotsPerDay, isStudent]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                w-[85vw] max-w-[340px] lg:w-[340px] bg-white h-full border-r border-slate-200 p-5 
                fixed top-0 z-40 overflow-y-auto transition-transform duration-300 shadow-2xl lg:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                left-0 lg:left-20 ${showOnDesktop ? 'lg:translate-x-0 lg:block' : 'lg:-translate-x-full lg:hidden'}
            `}>
                {/* Header Title */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-indigo-600" />
                            {isStudent ? 'Dental Chair Occupancy' : 'Faculty Schedule & Slots'}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {isStudent ? 'Patient Appointments & Quota' : 'Occupancy & Consultation Slots'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={jumpToToday}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                            Today
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Close / Collapse Calendar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="font-bold text-slate-800 text-sm">
                        {currentMonthName} {currentYear}
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-5">
                    {days.map(day => (
                        <div key={day} className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1">
                            {day}
                        </div>
                    ))}
                    {dates.map((date, index) => {
                        const dateStr = formatDate(date);
                        const isSelected = selectedDate === dateStr;
                        const occ = dateStr ? occupancyByDate[dateStr] : null;
                        const count = occ ? occ.count : 0;
                        const capacity = maxSlotsPerDay || (isStudent ? 4 : 6);
                        const occPercent = Math.min(100, Math.round((count / capacity) * 100));

                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={`min-h-[46px] p-1 flex flex-col items-center justify-start rounded-xl text-xs transition cursor-pointer relative ${
                                    !date ? 'invisible pointer-events-none' : ''
                                } ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200'
                                        : date
                                        ? 'text-slate-700 hover:bg-slate-100'
                                        : ''
                                }`}
                            >
                                <span className={`text-[12px] leading-tight ${isSelected ? 'text-white' : ''}`}>
                                    {date}
                                </span>

                                {/* Occupancy Indicators */}
                                {date && (
                                    <div className="mt-1 w-full flex justify-center">
                                        {count > 0 ? (
                                            <span
                                                className={`text-[9px] px-1 py-0.2 rounded font-extrabold tracking-tight ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : occPercent >= 100
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : occPercent >= 50
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                {occPercent}%
                                            </span>
                                        ) : (
                                            <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-slate-200'}`}></span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Occupancy Legend */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>0-50% Free</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Full</span>
                    </div>
                </div>

                {/* Selected Day Occupancy Detail Card */}
                {selectedOccupancy && (
                    <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 rounded-2xl p-4 border border-indigo-100/80 mb-5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-700">
                                {selectedDate}
                            </span>
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${selectedOccupancy.badgeColor}`}>
                                {selectedOccupancy.statusText}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    selectedOccupancy.percent >= 100
                                        ? 'bg-rose-500'
                                        : selectedOccupancy.percent >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-indigo-600'
                                }`}
                                style={{ width: `${selectedOccupancy.percent}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-xs mt-3">
                            <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                    {isStudent ? 'Patient Slots' : 'Booked Slots'}
                                </span>
                                <span className="font-extrabold text-slate-800 text-sm">
                                    {selectedOccupancy.booked} / {selectedOccupancy.capacity}
                                </span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Available</span>
                                <span className="font-extrabold text-emerald-600 text-sm">
                                    {selectedOccupancy.available} Slots
                                </span>
                            </div>
                        </div>

                        {/* Occupied Patient / Session List Preview */}
                        {selectedOccupancy.appointments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    {isStudent ? 'Your Patient Cases Today:' : 'Scheduled Procedures / Cases:'}
                                </p>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                    {selectedOccupancy.appointments.map(a => {
                                        const pName = a.Patient ? a.Patient.name : 'Patient';
                                        return (
                                            <div key={a.id} className="text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                                                <div className="flex items-center justify-between font-bold text-slate-700">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-indigo-500" /> {a.time}
                                                    </span>
                                                    <span className="text-indigo-600 font-semibold truncate max-w-[110px]">
                                                        {a.dentalProcedure || a.sessionType}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                                                    <span className="font-medium">Patient: {pName}</span>
                                                    {isStudent && a.Doctor && (
                                                        <span className="text-slate-400 truncate max-w-[90px]">
                                                            Sup: Dr. {a.Doctor.name.split(' ').pop()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Filter Status Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status Filter</h3>
                        {filterStatus !== 'All' && (
                            <button
                                onClick={() => onFilterChange('All')}
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {['All', 'Scheduled', 'Completed', 'Cancelled'].map(status => (
                            <label
                                key={status}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold transition ${
                                    filterStatus === status
                                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={() => onFilterChange(status)}
                            >
                                <span>{status === 'All' ? 'All Cases' : status}</span>
                                {filterStatus === status && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default CalendarPanel;
