import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Smile } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('faculty'); // 'faculty' or 'student'
    const [email, setEmail] = useState('dr.jenkins@dental.meduni.edu');
    const [password, setPassword] = useState('password123');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRoleSwitch = (selectedRole) => {
        setRole(selectedRole);
        if (selectedRole === 'faculty') {
            setEmail('dr.jenkins@dental.meduni.edu');
            setPassword('password123');
        } else {
            setEmail('alex.carter@student.dental.edu');
            setPassword('password123');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await login(email, password, role);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(`Welcome back, ${result.user?.name || (role === 'faculty' ? 'Professor' : 'Clinician')}!`);
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    const fillDemo = (demoEmail, demoRole) => {
        setRole(demoRole);
        setEmail(demoEmail);
        setPassword('password123');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-6">
            <div className="w-full max-w-xl">
                {/* University Header Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Lin's Dental Medical University & Hospital
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                        <span>DentalAcademic Portal</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base mt-2">
                        Dental Faculty Mentorship, Chair Occupancy & Patient Clinical Appointments
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10">
                    {/* Role Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('faculty')}
                            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                role === 'faculty'
                                    ? 'bg-white text-indigo-900 shadow-md shadow-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Stethoscope className={`w-4 h-4 ${role === 'faculty' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            Dental Faculty Preceptors
                        </button>

                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('student')}
                            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                role === 'student'
                                    ? 'bg-white text-indigo-900 shadow-md shadow-slate-200 font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            Dental Students (BDS / MDS)
                        </button>
                    </div>

                    {/* Role Context Hint */}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 text-xs text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        {role === 'faculty' ? (
                            <span>Signing in as <strong>Dental Faculty</strong>: Supervise student clinical procedures, view chair occupancy, and accept mentees.</span>
                        ) : (
                            <span>Signing in as <strong>Dental Student Clinician</strong>: Book patient procedures under mentor supervision, track chair occupancy, and manage clinical cases.</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                {role === 'faculty' ? 'Dental Faculty Email' : 'Dental Student Email'}
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === 'faculty' ? 'dr.jenkins@dental.meduni.edu' : 'student@dental.meduni.edu'}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition text-slate-800 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Password
                                </label>
                                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">Forgot?</span>
                            </div>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition text-slate-800 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition duration-200 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                'Authenticating...'
                            ) : (
                                <>
                                    <span>Sign In as {role === 'faculty' ? 'Dental Faculty' : 'Dental Student'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Logins Box */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                            Instant Dental Demo Logins
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDemo('dr.jenkins@dental.meduni.edu', 'faculty')}
                                className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition text-left cursor-pointer"
                            >
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <Stethoscope className="w-3.5 h-3.5 text-indigo-600" /> Dr. Sarah Jenkins
                                </span>
                                <span className="text-slate-500 text-[11px] mt-0.5">Faculty • Endodontics HOD</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillDemo('alex.carter@student.dental.edu', 'student')}
                                className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left cursor-pointer"
                            >
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Alex Carter
                                </span>
                                <span className="text-slate-500 text-[11px] mt-0.5">Student • Final Year BDS</span>
                            </button>
                        </div>
                    </div>

                    {/* Register link */}
                    <p className="mt-6 text-center text-xs text-slate-500">
                        New Dental Faculty or Student?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                            Register Dental Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
