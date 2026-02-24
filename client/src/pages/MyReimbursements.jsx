import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    DollarSign, Plus, Clock, CheckCircle, XCircle, Banknote,
    AlertCircle, ChevronDown, ChevronUp, Trash2, Receipt
} from 'lucide-react';

const CATEGORIES = ['Medical', 'Travel', 'Meal', 'Equipment', 'Training', 'Other'];

const CATEGORY_COLORS = {
    Medical: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
    Travel: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
    Meal: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    Equipment: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
    Training: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
    Other: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_MAP = {
    Pending: { icon: <Clock size={13} />, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
    Approved: { icon: <CheckCircle size={13} />, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    Rejected: { icon: <XCircle size={13} />, cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
    Paid: { icon: <Banknote size={13} />, cls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' },
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const MyReimbursements = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [form, setForm] = useState({
        category: 'Medical',
        amount: '',
        description: '',
        receiptUrl: '',
        expenseDate: new Date().toISOString().split('T')[0],
    });

    const API = `${import.meta.env.VITE_API_BASE_URL}/reimbursements`;

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/my`, { withCredentials: true });
            setClaims(Array.isArray(res.data) ? res.data : []);
        } catch {
            setError('Failed to load claims.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClaims(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.amount || parseFloat(form.amount) < 1) {
            return setError('Amount must be at least ₹1.');
        }
        try {
            setSubmitting(true);
            await axios.post(API, { ...form, amount: parseFloat(form.amount) }, { withCredentials: true });
            toast.success('Claim submitted successfully!');
            setSuccess('Claim submitted successfully!');
            setShowForm(false);
            setForm({ category: 'Medical', amount: '', description: '', receiptUrl: '', expenseDate: new Date().toISOString().split('T')[0] });
            fetchClaims();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit claim.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        toast((t) => (
            <span className="flex items-center gap-3">
                Cancel this claim?
                <button onClick={() => { toast.dismiss(t.id); doCancel(id); }}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">Yes</button>
                <button onClick={() => toast.dismiss(t.id)}
                    className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">No</button>
            </span>
        ), { duration: 6000 });
    };

    const doCancel = async (id) => {
        try {
            await axios.delete(`${API}/${id}`, { withCredentials: true });
            toast.success('Claim cancelled.');
            fetchClaims();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel claim.');
        }
    };

    // Summary stats
    const stats = claims.reduce((acc, c) => {
        acc.total++;
        acc[c.status.toLowerCase()] = (acc[c.status.toLowerCase()] || 0) + 1;
        acc.totalAmount += c.amount;
        if (c.status === 'Paid') acc.totalPaid += c.amount;
        return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0, paid: 0, totalAmount: 0, totalPaid: 0 });

    const filtered = filterStatus === 'All' ? claims : claims.filter(c => c.status === filterStatus);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Reimbursements</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your expense claims.</p>
                </div>
                <button
                    id="toggle-claim-form"
                    onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-primary-500/20"
                >
                    {showForm ? <ChevronUp size={20} /> : <Plus size={20} />}
                    <span>{showForm ? 'Close Form' : 'New Claim'}</span>
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center space-x-3 rounded-r-lg">
                    <AlertCircle className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 flex items-center space-x-3 rounded-r-lg">
                    <CheckCircle className="text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{success}</p>
                </div>
            )}

            {/* Submit Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                        <h2 className="text-white font-bold text-lg flex items-center space-x-2">
                            <Receipt size={20} />
                            <span>Submit Expense Claim</span>
                        </h2>
                        <p className="text-primary-100 text-sm mt-0.5">Fill in the details of your expense below.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="claim-category"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Amount (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="claim-amount"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="e.g. 850"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                required
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Expense Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="claim-date"
                                type="date"
                                value={form.expenseDate}
                                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Receipt URL <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="claim-receipt"
                                type="url"
                                placeholder="https://..."
                                value={form.receiptUrl}
                                onChange={e => setForm({ ...form, receiptUrl: e.target.value })}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="claim-description"
                                rows={3}
                                placeholder="Briefly describe the expense..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                id="submit-claim-btn"
                                type="submit"
                                disabled={submitting}
                                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
                            >
                                {submitting ? 'Submitting...' : 'Submit Claim'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            {claims.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Claims', value: stats.total, icon: <Receipt size={20} className="text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Pending', value: stats.pending, icon: <Clock size={20} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Approved', value: stats.approved + stats.paid, icon: <CheckCircle size={20} className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Total Paid', value: formatCurrency(stats.totalPaid), icon: <Banknote size={20} className="text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                            <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center space-x-2">
                {['All', 'Pending', 'Approved', 'Rejected', 'Paid'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${filterStatus === s
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading your claims...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center">
                    <DollarSign size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No claims found.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Submit a new expense claim to get started.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filtered.map(claim => {
                                    const st = STATUS_MAP[claim.status] || STATUS_MAP.Pending;
                                    const catColor = CATEGORY_COLORS[claim.category] || CATEGORY_COLORS.Other;
                                    return (
                                        <tr key={claim._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${catColor}`}>
                                                    {claim.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">{claim.description}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                                                    Expense Date: {new Date(claim.expenseDate).toLocaleDateString('en-IN')}
                                                </p>
                                                {claim.decisionNote && (
                                                    <p className="text-xs text-slate-400 italic mt-0.5">Note: {claim.decisionNote}</p>
                                                )}
                                                {claim.receiptUrl && (
                                                    <a href={claim.receiptUrl} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs text-primary-500 hover:underline mt-0.5 block">
                                                        View Receipt ↗
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(claim.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${st.cls}`}>
                                                    {st.icon}
                                                    <span>{claim.status}</span>
                                                </span>
                                                {claim.paidAt && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Paid {new Date(claim.paidAt).toLocaleDateString('en-IN')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {claim.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleCancel(claim._id)}
                                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center space-x-1 text-xs font-semibold transition-colors"
                                                        title="Cancel claim"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Cancel</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">-</span>
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
        </div>
    );
};

export default MyReimbursements;
