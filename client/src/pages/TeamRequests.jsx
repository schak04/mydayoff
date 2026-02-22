import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, Check, X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const TeamRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [decisionNote, setDecisionNote] = useState({});

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leaves/team`, { withCredentials: true });
            setRequests(res.data);
            setFilteredRequests(res.data);
        } catch (error) {
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Debounced search logic (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            let filtered = requests;

            if (searchTerm) {
                filtered = filtered.filter(req =>
                    req.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.employeeId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.reason.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (statusFilter !== 'All') {
                filtered = filtered.filter(req => req.status === statusFilter);
            }

            setFilteredRequests(filtered);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter, requests]);

    const handleDecision = async (id, action) => {
        try {
            const note = decisionNote[id] || '';
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/leaves/${id}/${action}`, { decisionNote: note }, { withCredentials: true });
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} leave`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle size={14} /> <span>Approved</span></span>;
            case 'Rejected':
                return <span className="flex items-center space-x-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle size={14} /> <span>Rejected</span></span>;
            default:
                return <span className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Clock size={14} /> <span>Pending</span></span>;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Team Requests</h1>
                <p className="text-slate-500 mt-1">Review and manage leave requests from your team members.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, type, or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    />
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                        <Filter size={16} />
                        <span>Filter:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full md:w-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    >
                        <option>All</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading team requests...</div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
                    No matching leave requests found.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Decision / Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{req.employeeId.name}</p>
                                            <p className="text-slate-500 text-xs">{req.employeeId.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-semibold text-slate-800">{req.type}</span>
                                                {req.halfDay && <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold uppercase">Half Day</span>}
                                            </div>
                                            <p className="text-slate-600 text-xs italic">"{req.reason}"</p>
                                            <p className="text-slate-500 mt-1 text-[11px] font-medium">
                                                {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.status === 'Pending' ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a note..."
                                                        className="block w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                                                        value={decisionNote[req._id] || ''}
                                                        onChange={(e) => setDecisionNote({ ...decisionNote, [req._id]: e.target.value })}
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDecision(req._id, 'approve')}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1"
                                                        >
                                                            <Check size={14} /> <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecision(req._id, 'reject')}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-1"
                                                        >
                                                            <X size={14} /> <span>Reject</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500">
                                                    <p className="font-medium">Decided at: {new Date(req.decidedAt).toLocaleDateString()}</p>
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
        </div>
    );
};

export default TeamRequests;
