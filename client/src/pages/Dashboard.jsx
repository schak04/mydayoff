import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    CalendarDays, CheckCircle, Clock, XCircle, Plus,
    DollarSign, Banknote, Receipt, BarChart2, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    LeaveStatusDonut,
    LeaveTypeBar,
    ReimbursementCategoryBar,
    LeaveActivityLine,
    TeamLeaveStatusBar,
} from '../components/AnalyticsCharts';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const ChartCard = ({ title, subtitle, icon, children }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-5">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [reimbSummary, setReimbSummary] = useState({ pending: 0, approved: 0, paid: 0, totalPaid: 0 });
    const [teamPendingCount, setTeamPendingCount] = useState(0);
    const [teamPendingClaimsCount, setTeamPendingClaimsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(0);

    // Raw data for charts
    const [myLeaves, setMyLeaves] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [teamLeaves, setTeamLeaves] = useState([]);

    const fetchAll = async () => {
        try {
            // Personal leaves
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaves/my`, { withCredentials: true });
            const leaves = res.data;
            setMyLeaves(leaves);
            const stats = leaves.reduce((acc, leave) => {
                acc.total++;
                acc[leave.status.toLowerCase()]++;
                return acc;
            }, { pending: 0, approved: 0, rejected: 0, total: 0 });
            setSummary(stats);

            // Personal reimbursements
            if (user?.role !== 'Admin') {
                const rRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reimbursements/my`, { withCredentials: true });
                const rData = rRes.data;
                setMyClaims(rData);
                const rStats = rData.reduce((acc, c) => {
                    if (c.status === 'Pending') acc.pending++;
                    if (c.status === 'Approved') acc.approved++;
                    if (c.status === 'Paid') { acc.paid++; acc.totalPaid += c.amount; }
                    return acc;
                }, { pending: 0, approved: 0, paid: 0, totalPaid: 0 });
                setReimbSummary(rStats);
            }

            // Team data for Manager / Admin
            if (user?.role === 'Manager' || user?.role === 'Admin') {
                const teamRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaves/team`, { withCredentials: true });
                setTeamLeaves(teamRes.data);
                setTeamPendingCount(teamRes.data.filter(l => l.status === 'Pending').length);

                const claimRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reimbursements/team`, { withCredentials: true });
                setTeamPendingClaimsCount(claimRes.data.filter(c => c.status === 'Pending').length);
            }
        } catch {
            // silently fail
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
        fetchAll();
    };

    useEffect(() => { fetchAll(); }, []);

    const leaveStats = [
        { label: 'Total Requests', value: summary.total, icon: <CalendarDays className="text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Pending', value: summary.pending, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Approved', value: summary.approved, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Rejected', value: summary.rejected, icon: <XCircle className="text-red-500" />, bg: 'bg-red-50 dark:bg-red-900/20' },
    ];

    const reimbStats = [
        { label: 'Pending Claims', value: reimbSummary.pending, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Approved Claims', value: reimbSummary.approved, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Paid Claims', value: reimbSummary.paid, icon: <Banknote className="text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Total Received', value: formatCurrency(reimbSummary.totalPaid), icon: <DollarSign className="text-teal-500" />, bg: 'bg-teal-50 dark:bg-teal-900/20' },
    ];

    if (loading) return <div className="flex justify-center items-center py-20">Loading dashboard...</div>;

    const isManagerOrAdmin = user?.role === 'Manager' || user?.role === 'Admin';
    const isEmployee = user?.role !== 'Admin';

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}!</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {user?.role === 'Admin'
                            ? "System is running smoothly. Use the panel below to manage the platform."
                            : "Here's an overview of your leave and reimbursement status."}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        id="refresh-btn"
                        onClick={handleRefresh}
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-sm"
                    >
                        <span>Refresh</span>
                    </button>
                    {isEmployee && (
                        <Link
                            to="/my-leaves"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/20"
                        >
                            <Plus size={20} />
                            <span>Apply for Leave</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Leave Stats (non-admin) ── */}
            {isEmployee && (
                <>
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Leave Overview</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {leaveStats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Reimbursement Stats ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reimbursement Overview</p>
                            <Link to="/my-reimbursements" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1">
                                <Receipt size={13} /><span>View All Claims</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {reimbStats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── Team Alerts ── */}
            {isManagerOrAdmin && (teamPendingCount > 0 || teamPendingClaimsCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamPendingCount > 0 && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-300">
                                    {user?.role === 'Admin' ? 'Organization Leave Requests' : 'Team Leave Requests'}
                                </h3>
                                <p className="text-primary-700 dark:text-primary-400">
                                    {teamPendingCount === 1 ? '1 pending leave request' : `${teamPendingCount} pending leave requests`} awaiting review.
                                </p>
                            </div>
                            <Link to="/team-requests"
                                className="bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-slate-700 px-5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap">
                                Review Leaves
                            </Link>
                        </div>
                    )}
                    {teamPendingClaimsCount > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">Pending Expense Claims</h3>
                                <p className="text-amber-700 dark:text-amber-400">
                                    {teamPendingClaimsCount === 1 ? '1 claim' : `${teamPendingClaimsCount} claims`} pending your approval.
                                </p>
                            </div>
                            <Link to="/team-requests"
                                className="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-slate-700 px-5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap">
                                Review Claims
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* ── ANALYTICS SECTION ── */}
            {myLeaves.length > 0 || myClaims.length > 0 || teamLeaves.length > 0 ? (
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart2 size={18} className="text-primary-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Analytics</h2>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">- visual breakdown of your activity</span>
                    </div>

                    {/* Employee charts */}
                    {isEmployee && myLeaves.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <ChartCard
                                title="Leave Status"
                                subtitle="Overall status distribution"
                                icon={<CheckCircle size={16} />}
                            >
                                <LeaveStatusDonut
                                    pending={summary.pending}
                                    approved={summary.approved}
                                    rejected={summary.rejected}
                                />
                            </ChartCard>

                            <ChartCard
                                title="Leave by Type"
                                subtitle="Count per leave category"
                                icon={<CalendarDays size={16} />}
                            >
                                <LeaveTypeBar leaves={myLeaves} />
                            </ChartCard>

                            <ChartCard
                                title="Activity Trend"
                                subtitle="Requests over last 6 months"
                                icon={<TrendingUp size={16} />}
                            >
                                <LeaveActivityLine leaves={myLeaves} />
                            </ChartCard>
                        </div>
                    )}

                    {/* Reimbursement chart */}
                    {isEmployee && myClaims.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <ChartCard
                                title="Claims by Category"
                                subtitle="Total amount claimed per category"
                                icon={<Receipt size={16} />}
                            >
                                <ReimbursementCategoryBar claims={myClaims} />
                            </ChartCard>

                            <ChartCard
                                title="Claim Status"
                                subtitle="Distribution across statuses"
                                icon={<DollarSign size={16} />}
                            >
                                <LeaveStatusDonut
                                    pending={reimbSummary.pending}
                                    approved={reimbSummary.approved + reimbSummary.paid}
                                    rejected={0}
                                />
                            </ChartCard>
                        </div>
                    )}

                    {/* Manager / Admin team charts */}
                    {isManagerOrAdmin && teamLeaves.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard
                                title="Team Leave Overview"
                                subtitle="Leave status breakdown per employee"
                                icon={<BarChart2 size={16} />}
                            >
                                <TeamLeaveStatusBar teamLeaves={teamLeaves} />
                            </ChartCard>

                            <ChartCard
                                title="Team Activity Trend"
                                subtitle="Team requests over last 6 months"
                                icon={<TrendingUp size={16} />}
                            >
                                <LeaveActivityLine leaves={teamLeaves} />
                            </ChartCard>
                        </div>
                    )}
                </div>
            ) : null}

            {/* ── Admin Panel Card ── */}
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
