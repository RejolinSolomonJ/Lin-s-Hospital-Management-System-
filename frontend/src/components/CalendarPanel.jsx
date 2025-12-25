import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPanel = ({ selectedDate, onDateSelect, filterStatus, onFilterChange, isOpen, onClose }) => {
    const [displayDate, setDisplayDate] = useState(new Date());

    const currentMonthName = displayDate.toLocaleString('default', { month: 'long' });
    const currentYear = displayDate.getFullYear();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate days in month and padding
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentYear, displayDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentYear, displayDate.getMonth());

    const dates = [];
    // Add empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        dates.push(null);
    }
    // Add actual dates
    for (let i = 1; i <= daysInMonth; i++) {
        dates.push(i);
    }

    // Format date as YYYY-MM-DD
    const formatDate = (day) => {
        if (!day) return null;
        const month = (displayDate.getMonth() + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        return `${currentYear}-${month}-${d}`;
    };

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
        const newDate = new Date(displayDate.setMonth(displayDate.getMonth() + offset));
        setDisplayDate(new Date(newDate));
    };

    const changeYear = (event) => {
        const newYear = parseInt(event.target.value);
        const newDate = new Date(displayDate.setFullYear(newYear));
        setDisplayDate(new Date(newDate));
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden glass"
                    onClick={onClose}
                />
            )}

            <div className={`
                w-80 bg-white h-full border-r border-gray-200 p-6 
                fixed top-0 z-40 overflow-y-auto transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                left-0 lg:left-20 lg:translate-x-0 lg:block
            `}>
                {/* Full Year Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                    <div className="flex gap-2 items-center">
                        <span className="font-bold text-gray-800">{currentMonthName}</span>
                        <input
                            type="number"
                            value={currentYear}
                            onChange={changeYear}
                            className="w-16 p-1 text-sm border rounded bg-transparent font-bold text-gray-800 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-8">
                    {days.map(day => (
                        <div key={day} className="text-center text-xs text-gray-400 font-medium">{day}</div>
                    ))}
                    {dates.map((date, index) => {
                        const dateStr = formatDate(date);
                        const isSelected = selectedDate === dateStr;
                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={`h-8 w-8 flex items-center justify-center rounded-full text-sm transition
                   ${!date ? 'invisible' : 'cursor-pointer'}
                   ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : date ? 'text-gray-700 hover:bg-gray-50' : ''}
                 `}
                            >
                                {date}
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Filter Status</h3>
                        {filterStatus !== 'All' && (
                            <button
                                onClick={() => onFilterChange('All')}
                                className="text-xs text-indigo-600 font-medium hover:underline"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {['Scheduled', 'Completed', 'Cancelled'].map(status => (
                            <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => onFilterChange(status)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition
                 ${filterStatus === status
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'border-gray-300 group-hover:border-indigo-400'}
               `}>
                                    {filterStatus === status && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className={`transition ${filterStatus === status ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {status}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalendarPanel;
