import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(0);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaves/my`, { withCredentials: true });
            const leaves = res.data;
            const stats = leaves.reduce((acc, leave) => {
                acc.total++;
                acc[leave.status.toLowerCase()]++;
                return acc;
            }, { pending: 0, approved: 0, rejected: 0, total: 0 });
            setSummary(stats);
        } catch (error) {
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        const now = Date.now();
        if (now - lastRefresh < 2000) {
            alert('Please wait 2 seconds between refreshes.');
            return;
        }
        setLastRefresh(now);
        setLoading(true);
        fetchLeaves();
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const stats = [
        { label: 'Total Requests', value: summary.total, icon: <CalendarDays className="text-blue-500" />, bg: 'bg-blue-50' },
        { label: 'Pending', value: summary.pending, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
        { label: 'Approved', value: summary.approved, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50' },
        { label: 'Rejected', value: summary.rejected, icon: <XCircle className="text-red-500" />, bg: 'bg-red-50' },
    ];

    if (loading) return <div className="flex justify-center items-center py-20">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}!</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Here's an overview of your leave status.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleRefresh}
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-sm"
                    >
                        <span>Refresh Analytics</span>
                    </button>
                    <Link
                        to="/my-leaves"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Plus size={20} />
                        <span>Apply for Leave</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${stat.bg} dark:bg-opacity-10`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user?.role === 'Manager' && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-primary-900 dark:text-primary-300">Manage Your Team</h3>
                        <p className="text-primary-700 dark:text-primary-400">You have pending leave requests from your team members.</p>
                    </div>
                    <Link
                        to="/team-requests"
                        className="bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-slate-700 px-5 py-2 rounded-lg font-semibold transition-all"
                    >
                        Review Team Requests
                    </Link>
                </div>
            )}

            {user?.role === 'Admin' && (
                <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">System Administration</h3>
                        <p className="text-slate-400">Manage users, roles, and organizational structure.</p>
                    </div>
                    <Link
                        to="/admin"
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2 rounded-lg font-semibold transition-all"
                    >
                        Access Admin Panel
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
