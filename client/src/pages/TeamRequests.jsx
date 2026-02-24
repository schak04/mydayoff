import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Search, Filter, Check, X, CheckCircle, XCircle, Clock,
    AlertCircle, Banknote, DollarSign, CalendarDays, Receipt
} from 'lucide-react';

const CATEGORY_COLORS = {
    Medical: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
    Travel: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
    Meal: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    Equipment: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
    Training: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
    Other: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const TeamRequests = () => {
    const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' | 'claims'

    // ── Leaves state ──
    const [requests, setRequests] = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [errorLeaves, setErrorLeaves] = useState(null);
    const [decisionNote, setDecisionNote] = useState({});

    // ── Claims state ──
    const [claims, setClaims] = useState([]);
    const [loadingClaims, setLoadingClaims] = useState(true);
    const [claimSearch, setClaimSearch] = useState('');
    const [claimFilter, setClaimFilter] = useState('All');
    const [errorClaims, setErrorClaims] = useState(null);
    const [claimNote, setClaimNote] = useState({});

    const LEAVES_API = `${import.meta.env.VITE_API_BASE_URL}/leaves`;
    const CLAIMS_API = `${import.meta.env.VITE_API_BASE_URL}/reimbursements`;

    // ── Fetch ──
    const fetchLeaves = async () => {
        try {
            setLoadingLeaves(true);
            const res = await axios.get(`${LEAVES_API}/team`, { withCredentials: true });
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setErrorLeaves(error.response?.data?.message || error.message || 'Failed to load requests.');
        } finally {
            setLoadingLeaves(false);
        }
    };

    const fetchClaims = async () => {
        try {
            setLoadingClaims(true);
            const res = await axios.get(`${CLAIMS_API}/team`, { withCredentials: true });
            setClaims(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setErrorClaims(error.response?.data?.message || error.message || 'Failed to load claims.');
        } finally {
            setLoadingClaims(false);
        }
    };

    useEffect(() => { fetchLeaves(); fetchClaims(); }, []);

    // ── Leave actions ──
    const handleLeaveDecision = async (id, action) => {
        try {
            const note = decisionNote[id] || '';
            await axios.patch(`${LEAVES_API}/${id}/${action}`, { decisionNote: note }, { withCredentials: true });
            toast.success(`Leave ${action}d successfully.`);
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} leave`);
        }
    };

    // ── Claim actions ──
    const handleClaimDecision = async (id, action) => {
        try {
            const note = claimNote[id] || '';
            await axios.patch(`${CLAIMS_API}/${id}/${action}`, { decisionNote: note }, { withCredentials: true });
            toast.success(`Claim ${action}d successfully.`);
            fetchClaims();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} claim`);
        }
    };

    // ── Status badges ──
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle size={14} /> <span>Approved</span></span>;
            case 'Rejected': return <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14} /> <span>Rejected</span></span>;
            case 'Paid': return <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Banknote size={14} /> <span>Paid</span></span>;
            default: return <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock size={14} /> <span>Pending</span></span>;
        }
    };

    // ── Filtered data ──
    const filteredLeaves = requests.filter(req => {
        if (statusFilter !== 'All' && req.status !== statusFilter) return false;
        if (searchTerm) {
            const emp = req.employeeId || {};
            const q = searchTerm.toLowerCase();
            if (!(emp.name || '').toLowerCase().includes(q) && !(emp.email || '').toLowerCase().includes(q) &&
                !(req.type || '').toLowerCase().includes(q) && !(req.reason || '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const filteredClaims = claims.filter(c => {
        if (claimFilter !== 'All' && c.status !== claimFilter) return false;
        if (claimSearch) {
            const emp = c.employeeId || {};
            const q = claimSearch.toLowerCase();
            if (!(emp.name || '').toLowerCase().includes(q) && !(c.category || '').toLowerCase().includes(q) &&
                !(c.description || '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // Badge counts
    const pendingLeaves = requests.filter(r => r.status === 'Pending').length;
    const pendingClaims = claims.filter(c => c.status === 'Pending').length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Requests Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Review and manage leave and expense requests from your team.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    id="tab-leaves"
                    onClick={() => setActiveTab('leaves')}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'leaves'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <CalendarDays size={16} />
                    <span>Leave Requests</span>
                    {pendingLeaves > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingLeaves}</span>
                    )}
                </button>
                <button
                    id="tab-claims"
                    onClick={() => setActiveTab('claims')}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'claims'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Receipt size={16} />
                    <span>Expense Claims</span>
                    {pendingClaims > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingClaims}</span>
                    )}
                </button>
            </div>

            {/* ─── LEAVES TAB ─── */}
            {activeTab === 'leaves' && (
                <>
                    {errorLeaves && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center space-x-3 rounded-r-lg">
                            <AlertCircle className="text-red-500" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{errorLeaves}</p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, type, or reason..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                <Filter size={16} />
                                <span>Filter:</span>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="block w-full md:w-40 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                            </select>
                        </div>
                    </div>

                    {loadingLeaves ? (
                        <div className="text-center py-20 text-slate-500">Loading leave requests...</div>
                    ) : filteredLeaves.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                            No matching leave requests found.
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Decision / Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {filteredLeaves.filter(req => req.employeeId).map((req) => (
                                            <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white">{req.employeeId.name}</p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{req.employeeId.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{req.type}</span>
                                                        {req.halfDay && <span className="text-[10px] bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded font-bold uppercase">Half Day</span>}
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-xs italic">"{req.reason}"</p>
                                                    <p className="text-slate-500 dark:text-slate-500 mt-1 text-[11px] font-medium">
                                                        {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                                <td className="px-6 py-4">
                                                    {req.status === 'Pending' ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Add a note..."
                                                                className="block w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                                value={decisionNote[req._id] || ''}
                                                                onChange={e => setDecisionNote({ ...decisionNote, [req._id]: e.target.value })}
                                                            />
                                                            <div className="flex space-x-2">
                                                                <button onClick={() => handleLeaveDecision(req._id, 'approve')}
                                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1">
                                                                    <Check size={14} /> <span>Approve</span>
                                                                </button>
                                                                <button onClick={() => handleLeaveDecision(req._id, 'reject')}
                                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1">
                                                                    <X size={14} /> <span>Reject</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-slate-500">
                                                            <p className="font-medium">Decided at: {req.decidedAt ? new Date(req.decidedAt).toLocaleDateString() : 'N/A'}</p>
                                                            {req.decisionNote && <p className="italic mt-1">Note: {req.decisionNote}</p>}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ─── CLAIMS TAB ─── */}
            {activeTab === 'claims' && (
                <>
                    {errorClaims && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center space-x-3 rounded-r-lg">
                            <AlertCircle className="text-red-500" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{errorClaims}</p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, category, or description..."
                                value={claimSearch}
                                onChange={e => setClaimSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                <Filter size={16} />
                                <span>Filter:</span>
                            </div>
                            <select
                                value={claimFilter}
                                onChange={e => setClaimFilter(e.target.value)}
                                className="block w-full md:w-40 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option>All</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                                <option>Paid</option>
                            </select>
                        </div>
                    </div>

                    {loadingClaims ? (
                        <div className="text-center py-20 text-slate-500">Loading expense claims...</div>
                    ) : filteredClaims.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                            No matching expense claims found.
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Claim Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                        {filteredClaims.filter(c => c.employeeId).map((claim) => {
                                            const catColor = CATEGORY_COLORS[claim.category] || CATEGORY_COLORS.Other;
                                            return (
                                                <tr key={claim._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900 dark:text-white">{claim.employeeId.name}</p>
                                                        <p className="text-slate-500 dark:text-slate-400 text-xs">{claim.employeeId.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${catColor}`}>{claim.category}</span>
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate italic">"{claim.description}"</p>
                                                        <p className="text-slate-500 dark:text-slate-500 mt-1 text-[11px] font-medium">
                                                            {new Date(claim.expenseDate).toLocaleDateString('en-IN')}
                                                        </p>
                                                        {claim.decisionNote && <p className="text-xs text-slate-400 italic mt-0.5">Note: {claim.decisionNote}</p>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(claim.amount)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                                                    <td className="px-6 py-4">
                                                        {claim.status === 'Pending' ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add a note..."
                                                                    className="block w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                                    value={claimNote[claim._id] || ''}
                                                                    onChange={e => setClaimNote({ ...claimNote, [claim._id]: e.target.value })}
                                                                />
                                                                <div className="flex space-x-2">
                                                                    <button onClick={() => handleClaimDecision(claim._id, 'approve')}
                                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1">
                                                                        <Check size={14} /> <span>Approve</span>
                                                                    </button>
                                                                    <button onClick={() => handleClaimDecision(claim._id, 'reject')}
                                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1">
                                                                        <X size={14} /> <span>Reject</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-slate-500">
                                                                <p className="font-medium">Decided: {claim.decidedAt ? new Date(claim.decidedAt).toLocaleDateString() : 'N/A'}</p>
                                                                {claim.paidAt && <p className="mt-0.5">Paid: {new Date(claim.paidAt).toLocaleDateString('en-IN')}</p>}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TeamRequests;
