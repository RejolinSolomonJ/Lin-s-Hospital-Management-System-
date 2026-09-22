import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Stethoscope, Mail, Lock, User, Phone, Sparkles } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('student'); // 'faculty' or 'student'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        // Dental Faculty
        department: 'Dept. of Conservative Dentistry & Endodontics',
        designation: 'Professor',
        specialization: 'Endodontics & Rotary Micro-Dentistry',
        cabin: 'Dental Block A, Operatory 402',
        maxMentees: 6,
        // Dental Student
        rollNumber: '',
        year: 'Final Year BDS (Clinical Intern)'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await register({ ...formData, role });
        setIsSubmitting(false);

        if (result.success) {
            toast.success(result.message || 'Dental account registered successfully! Please login.');
            navigate('/login');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-6">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Lin's Dental Medical University & Hospital
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Create Dental University Account
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Register for clinical rotations, dental mentor supervision & chair-side scheduling
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
                    <button
                        type="button"
                        onClick={() => setRole('faculty')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            role === 'faculty'
                                ? 'bg-white text-indigo-900 shadow-md font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Stethoscope className={`w-4 h-4 ${role === 'faculty' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        Dental Faculty Preceptor
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            role === 'student'
                                ? 'bg-white text-indigo-900 shadow-md font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        Dental Student (BDS / MDS)
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={role === 'faculty' ? 'Dr. Robert Vance' : 'David Kumar'}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">University Dental Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={role === 'faculty' ? 'faculty@dental.meduni.edu' : 'student@dental.meduni.edu'}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    {role === 'faculty' ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dental Specialty Dept.</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    >
                                        <option value="Dept. of Conservative Dentistry & Endodontics">Conservative Dentistry & Endodontics</option>
                                        <option value="Dept. of Oral & Maxillofacial Surgery">Oral & Maxillofacial Surgery</option>
                                        <option value="Dept. of Orthodontics & Dentofacial Orthopedics">Orthodontics & Dentofacial Orthopedics</option>
                                        <option value="Dept. of Periodontology & Implantology">Periodontology & Implantology</option>
                                        <option value="Dept. of Prosthodontics & Crown Bridge">Prosthodontics & Crown Bridge</option>
                                        <option value="Dept. of Pediatric & Preventive Dentistry">Pediatric & Preventive Dentistry</option>
                                        <option value="Dept. of Oral Medicine & Radiology">Oral Medicine & Radiology</option>
                                        <option value="Dept. of Oral Pathology & Microbiology">Oral Pathology & Microbiology</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Academic Designation</label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    >
                                        <option value="Professor & Head of Department">Professor & HOD</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Assistant Professor / Reader">Assistant Professor / Reader</option>
                                        <option value="Senior Clinical Tutor">Senior Clinical Tutor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Operatory Cabin / Room</label>
                                    <input
                                        type="text"
                                        name="cabin"
                                        value={formData.cabin}
                                        onChange={handleChange}
                                        placeholder="e.g. Dental Block A, Room 402"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Mentees</label>
                                    <input
                                        type="number"
                                        name="maxMentees"
                                        value={formData.maxMentees}
                                        onChange={handleChange}
                                        min="1"
                                        max="20"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dental Student Roll No / ID</label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. BDS2022-034"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dental Degree Year</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                                    >
                                        <option value="BDS 1st Year (Pre-clinical)">BDS 1st Year (Pre-clinical)</option>
                                        <option value="BDS 2nd Year (Pre-clinical Operatory)">BDS 2nd Year (Pre-clinical Operatory)</option>
                                        <option value="BDS 3rd Year Clinician">BDS 3rd Year Clinician</option>
                                        <option value="Final Year BDS (Clinical Intern)">Final Year BDS (Clinical Intern)</option>
                                        <option value="Compulsory Rotatory Dental Intern (CRRI)">Compulsory Rotatory Dental Intern (CRRI)</option>
                                        <option value="MDS 1st Year Postgraduate Resident">MDS 1st Year Resident</option>
                                        <option value="MDS 2nd/3rd Year Resident">MDS 2nd/3rd Year Resident</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition duration-200 shadow-lg shadow-indigo-200 mt-6 cursor-pointer disabled:opacity-70"
                    >
                        {isSubmitting ? 'Creating Dental Account...' : `Register as ${role === 'faculty' ? 'Dental Faculty Preceptor' : 'Dental Student Clinician'}`}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Already registered in the dental hospital?{' '}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                        Sign In Here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
