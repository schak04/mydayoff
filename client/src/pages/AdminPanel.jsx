import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, User, UserCheck, Briefcase, Search, AlertCircle } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const ADMIN_API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;

    const fetchData = async () => {
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users`, { withCredentials: true });
            setUsers(res.data);
            setManagers(res.data.filter(u => u.role === 'Manager' || u.role === 'Admin'));
        } catch (err) {
            setError('Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.patch(`${ADMIN_API_URL}/users/${id}/role`, { role: newRole }, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleManagerChange = async (id, newManagerId) => {
        try {
            await axios.patch(`${ADMIN_API_URL}/users/${id}/manager`, { managerId: newManagerId }, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update manager');
        }
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Admin Panel</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage user roles and organizational structure.</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center space-x-3 rounded-r-lg shadow-sm">
                    <AlertCircle className="text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors duration-300">
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="hidden lg:flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5"><Shield size={16} /> <span>{users.filter(u => u.role === 'Admin').length} Admins</span></div>
                    <div className="flex items-center space-x-1.5"><Briefcase size={16} /> <span>{users.filter(u => u.role === 'Manager').length} Managers</span></div>
                    <div className="flex items-center space-x-1.5"><User size={16} /> <span>{users.filter(u => u.role === 'Employee').length} Employees</span></div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 font-medium">Loading user management...</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Information</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Manager</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className={`block w-full max-w-[140px] px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary-500 outline-none transition-colors
                                                  ${user.role === 'Admin' ? 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-800' :
                                                        user.role === 'Manager' ? 'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800' :
                                                            'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}
                                            >
                                                <option value="Admin">Admin</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Employee">Employee</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'Admin' ? (
                                                <span className="text-slate-400 text-xs italic">N/A (Self-Managed)</span>
                                            ) : (
                                                <select
                                                    value={user.managerId?._id || ''}
                                                    onChange={(e) => handleManagerChange(user._id, e.target.value)}
                                                    className="block w-full max-w-[200px] px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                                >
                                                    <option value="">No Manager</option>
                                                    {managers.filter(m => m._id !== user._id).map((m) => (
                                                        <option key={m._id} value={m._id}>
                                                            {m.name} ({m.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Administrative Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Platform Controls</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Manage global user settings, role assignments, and reporting structures.</p>
                    <div className="flex items-center space-x-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <UserCheck size={18} className="text-primary-400" />
                        <span>{users.length} Total Users Registered</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Leave Governance</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">You have full authority to override or handle any leave request in the organization.</p>
                    </div>
                    <Link
                        to="/team-requests"
                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl text-center transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Manage All Leave Requests</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
