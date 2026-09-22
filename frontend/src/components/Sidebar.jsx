import { Calendar, Users, GraduationCap, Compass, LogOut, Stethoscope, UserCheck } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const isFaculty = user?.role === 'faculty';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menu items tailored to user role
    const facultyMenuItems = [
        { id: 'dashboard', label: 'Occupancy & Schedule', icon: Calendar },
        { id: 'mentees', label: 'My Mentees & Requests', icon: GraduationCap },
        { id: 'patients', label: 'Clinical Patients', icon: Users },
    ];

    const studentMenuItems = [
        { id: 'dashboard', label: 'Clinical Chair Schedule', icon: Calendar },
        { id: 'student-mentor', label: 'My Supervising Mentor', icon: UserCheck },
        { id: 'find-faculty', label: 'Dental Faculty Directory', icon: Compass },
    ];

    const menuItems = isFaculty ? facultyMenuItems : studentMenuItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                w-20 bg-slate-900 h-screen border-r border-slate-800 flex flex-col items-center py-6 
                fixed left-0 top-0 z-50 transition-transform duration-300 shadow-xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}>
                {/* University Emblem */}
                <div
                    title="Lin's Dental College & Hospital"
                    className="mb-8 w-11 h-11 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 cursor-pointer"
                >
                    {isFaculty ? (
                        <Stethoscope className="w-5 h-5 text-white" />
                    ) : (
                        <GraduationCap className="w-6 h-6 text-white" />
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 flex flex-col gap-4 w-full px-3">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                title={item.label}
                                onClick={() => {
                                    onViewChange(item.id);
                                    if (onClose) onClose();
                                }}
                                className={`p-3.5 rounded-2xl transition duration-200 mx-auto w-full flex justify-center group relative cursor-pointer ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                                }`}
                            >
                                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                                {/* Tooltip on hover */}
                                <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none items-center border border-slate-700">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Badge & Logout */}
                <div className="flex flex-col items-center gap-3 w-full px-3">
                    <div
                        title={`${user?.name} (${isFaculty ? 'Dental Faculty' : 'Dental Student'})`}
                        className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-extrabold text-indigo-400 uppercase"
                    >
                        {user?.name ? user.name.charAt(0) : (isFaculty ? 'F' : 'S')}
                    </div>

                    <button
                        title="Sign Out"
                        onClick={handleLogout}
                        className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
