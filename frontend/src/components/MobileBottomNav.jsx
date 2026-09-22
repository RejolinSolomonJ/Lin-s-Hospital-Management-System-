import { Calendar, Users, GraduationCap, Compass, Plus, Activity, UserCheck, Wifi, WifiOff } from 'lucide-react';

const MobileBottomNav = ({
    currentView,
    onViewChange,
    onOpenCalendar,
    onOpenNewBooking,
    role = 'faculty',
    isConnected = true
}) => {
    const isFaculty = role === 'faculty';

    const navItems = isFaculty
        ? [
            { id: 'dashboard', label: 'Schedule', icon: Calendar },
            { id: 'calendar_toggle', label: 'Occupancy', icon: Activity, isCalendar: true },
            { id: 'new_booking', label: 'New', icon: Plus, isAction: true },
            { id: 'mentees', label: 'Mentees', icon: GraduationCap },
            { id: 'patients', label: 'Patients', icon: Users }
        ]
        : [
            { id: 'dashboard', label: 'Procedures', icon: Calendar },
            { id: 'calendar_toggle', label: 'Chairs', icon: Activity, isCalendar: true },
            { id: 'new_booking', label: 'Book Case', icon: Plus, isAction: true },
            { id: 'student-mentor', label: 'My Mentor', icon: UserCheck },
            { id: 'find-faculty', label: 'Directory', icon: Compass }
        ];

    return (
        <nav
            aria-label="Mobile Navigation"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-inset-bottom"
        >
            <div className="flex items-center justify-around max-w-md mx-auto relative">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    // Center Primary Action Button (New Appointment)
                    if (item.isAction) {
                        return (
                            <button
                                key={item.id}
                                onClick={onOpenNewBooking}
                                aria-label="Book new clinical appointment"
                                className="relative -top-4 flex flex-col items-center group cursor-pointer"
                            >
                                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/50 border-3 border-slate-900 active:scale-95 transition transform">
                                    <Plus className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 mt-0.5 tracking-tight">
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    // Calendar Drawer Toggle Button
                    if (item.isCalendar) {
                        return (
                            <button
                                key={item.id}
                                onClick={onOpenCalendar}
                                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-slate-400 hover:text-indigo-400 active:scale-95 cursor-pointer min-w-[54px]"
                            >
                                <div className="relative">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    {isConnected && (
                                        <span
                                            title="Real-Time Connected"
                                            className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse"
                                        />
                                    )}
                                </div>
                                <span className="text-[10px] font-medium mt-1">
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    // Standard Nav Item
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 cursor-pointer min-w-[54px] ${
                                isActive
                                    ? 'text-indigo-400 font-bold'
                                    : 'text-slate-400 hover:text-slate-200 font-medium'
                            }`}
                        >
                            <div className="relative">
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 stroke-[2.5]' : 'text-slate-400'}`} />
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]" />
                                )}
                            </div>
                            <span className="text-[10px] mt-1 tracking-tight">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
