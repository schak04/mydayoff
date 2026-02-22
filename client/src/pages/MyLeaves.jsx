import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'Casual',
        reason: '',
        halfDay: false,
    });

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaves/my`, { withCredentials: true });
            setLeaves(res.data);
        } catch (error) {
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/leaves`, formData, { withCredentials: true });
            setFormData({
                startDate: '',
                endDate: '',
                type: 'Casual',
                reason: '',
                halfDay: false,
            });
            fetchLeaves();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setFormLoading(false);
        }
    };

    const cancelLeave = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/leaves/${id}`, { withCredentials: true });
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel leave');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle size={14} /> <span>Approved</span></span>;
            case 'Rejected':
                return <span className="flex items-center space-x-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14} /> <span>Rejected</span></span>;
            default:
                return <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock size={14} /> <span>Pending</span></span>;
        }
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
                            <Calendar className="text-primary-600 dark:text-primary-400" />
                            <span>Apply for Leave</span>
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start space-x-3">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        required
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                    >
                                        <option>Sick</option>
                                        <option>Casual</option>
                                        <option>Family Emergency</option>
                                        <option>Paternal</option>
                                        <option>Maternal</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                                    <textarea
                                        name="reason"
                                        required
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows="3"
                                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                                        placeholder="Briefly explain your reason..."
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="halfDay"
                                        name="halfDay"
                                        checked={formData.halfDay}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary-600 dark:text-primary-400 border-slate-300 dark:border-slate-700 rounded focus:ring-primary-500 bg-white dark:bg-slate-800"
                                    />
                                    <label htmlFor="halfDay" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                        Half-day request
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20"
                            >
                                {formLoading ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
                        <span>My Leave History</span>
                    </h2>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading leaves...</div>
                    ) : leaves.length === 0 ? (
                        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
                            No leave requests found.
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type / Reason</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dates</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {leaves.map((leave) => (
                                            <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-900 dark:text-white">{leave.type}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={leave.reason}>{leave.reason}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                    </p>
                                                    {leave.halfDay && <span className="text-xs text-primary-500 dark:text-primary-400 font-medium tracking-tight">Half Day</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(leave.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {leave.status === 'Pending' && (
                                                        <button
                                                            onClick={() => cancelLeave(leave._id)}
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                            title="Cancel Request"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyLeaves;
