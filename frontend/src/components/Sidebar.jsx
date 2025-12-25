import { LayoutDashboard, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', icon: Calendar },
        { id: 'patients', icon: Users },
        { id: 'settings', icon: Settings },
    ];

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
                w-20 bg-white h-screen border-r border-gray-200 flex flex-col items-center py-8 
                fixed left-0 top-0 z-50 transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}>
                <div className="mb-10 text-indigo-600 bg-indigo-50 p-2 rounded-xl">
                    <LayoutDashboard className="w-6 h-6" />
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full px-3">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`p-3 rounded-xl transition duration-200 mx-auto w-full flex justify-center
                  ${currentView === item.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'}
                `}
                        >
                            <item.icon className="w-5 h-5" />
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="mt-auto p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </>
    );
};

export default Sidebar;
