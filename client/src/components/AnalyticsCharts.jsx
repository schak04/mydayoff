import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Title,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Filler,
    Title
);

// ─── Shared chart defaults ───────────────────────────────────────────────────
const FONT_FAMILY = "'Inter', 'system-ui', sans-serif";

const tooltipPlugin = {
    backgroundColor: 'rgba(15,23,42,0.92)',
    titleColor: '#f8fafc',
    bodyColor: '#cbd5e1',
    padding: 12,
    cornerRadius: 10,
    titleFont: { family: FONT_FAMILY, size: 13, weight: 'bold' },
    bodyFont: { family: FONT_FAMILY, size: 12 },
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
//  LeaveStatusDonut - leave status breakdown (Pending / Approved / Rejected)
// ─────────────────────────────────────────────────────────────────────────────
export const LeaveStatusDonut = ({ pending, approved, rejected }) => {
    const total = pending + approved + rejected;

    const data = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [pending, approved, rejected],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
            hoverBackgroundColor: ['#d97706', '#059669', '#dc2626'],
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 18,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { family: FONT_FAMILY, size: 12, weight: '600' },
                    color: '#64748b',
                },
            },
            tooltip: { ...tooltipPlugin },
        },
    };

    return (
        <div className="relative" style={{ height: '220px' }}>
            <Doughnut data={data} options={options} />
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-18px' }}>
                <span className="text-3xl font-black text-slate-800 dark:text-white">{total}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  LeaveTypeBar - count of leaves per type
// ─────────────────────────────────────────────────────────────────────────────
export const LeaveTypeBar = ({ leaves }) => {
    const types = ['Sick', 'Casual', 'Family Emergency', 'Paternal', 'Maternal', 'Other'];
    const counts = types.map(t => leaves.filter(l => l.type === t).length);

    const data = {
        labels: types,
        datasets: [{
            label: 'Leaves',
            data: counts,
            backgroundColor: [
                'rgba(239,68,68,0.8)',
                'rgba(59,130,246,0.8)',
                'rgba(168,85,247,0.8)',
                'rgba(20,184,166,0.8)',
                'rgba(236,72,153,0.8)',
                'rgba(100,116,139,0.8)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { ...tooltipPlugin },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: FONT_FAMILY, size: 11, weight: '600' },
                    color: '#94a3b8',
                    maxRotation: 25,
                },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { family: FONT_FAMILY, size: 11 },
                    color: '#94a3b8',
                },
                grid: { color: 'rgba(148,163,184,0.1)' },
                border: { display: false },
            },
        },
    };

    return <div style={{ height: '220px' }}><Bar data={data} options={options} /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ReimbursementCategoryBar - total amount claimed per category
// ─────────────────────────────────────────────────────────────────────────────
export const ReimbursementCategoryBar = ({ claims }) => {
    const categories = ['Medical', 'Travel', 'Meal', 'Equipment', 'Training', 'Other'];
    const totals = categories.map(cat =>
        claims.filter(c => c.category === cat).reduce((s, c) => s + c.amount, 0)
    );

    const data = {
        labels: categories,
        datasets: [{
            label: 'Amount (₹)',
            data: totals,
            backgroundColor: [
                'rgba(244,63,94,0.8)',
                'rgba(14,165,233,0.8)',
                'rgba(249,115,22,0.8)',
                'rgba(139,92,246,0.8)',
                'rgba(20,184,166,0.8)',
                'rgba(100,116,139,0.8)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipPlugin,
                callbacks: {
                    label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: FONT_FAMILY, size: 11, weight: '600' }, color: '#94a3b8' },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: { family: FONT_FAMILY, size: 11 },
                    color: '#94a3b8',
                    callback: (v) => `₹${v.toLocaleString('en-IN')}`,
                },
                grid: { color: 'rgba(148,163,184,0.1)' },
                border: { display: false },
            },
        },
    };

    return <div style={{ height: '220px' }}><Bar data={data} options={options} /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
//  LeaveActivityLine - leave requests submitted over the last 6 months
// ─────────────────────────────────────────────────────────────────────────────
export const LeaveActivityLine = ({ leaves }) => {
    // Build last 6 month labels
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({ label: d.toLocaleString('default', { month: 'short', year: '2-digit' }), month: d.getMonth(), year: d.getFullYear() });
    }

    const counts = months.map(m =>
        leaves.filter(l => {
            const d = new Date(l.createdAt || l.startDate);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).length
    );

    const data = {
        labels: months.map(m => m.label),
        datasets: [{
            label: 'Requests',
            data: counts,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.12)',
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#6366f1',
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { ...tooltipPlugin },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: FONT_FAMILY, size: 11, weight: '600' }, color: '#94a3b8' },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { family: FONT_FAMILY, size: 11 }, color: '#94a3b8' },
                grid: { color: 'rgba(148,163,184,0.1)' },
                border: { display: false },
            },
        },
    };

    return <div style={{ height: '220px' }}><Line data={data} options={options} /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
//  TeamLeaveStatusBar - manager/admin: team leave status overview
// ─────────────────────────────────────────────────────────────────────────────
export const TeamLeaveStatusBar = ({ teamLeaves }) => {
    // Count by employee (top 6 by total)
    const byEmployee = {};
    teamLeaves.forEach(l => {
        const name = l.employeeId?.name || 'Unknown';
        if (!byEmployee[name]) byEmployee[name] = { Pending: 0, Approved: 0, Rejected: 0 };
        byEmployee[name][l.status] = (byEmployee[name][l.status] || 0) + 1;
    });

    const names = Object.keys(byEmployee).slice(0, 7);
    const data = {
        labels: names,
        datasets: [
            {
                label: 'Approved',
                data: names.map(n => byEmployee[n].Approved),
                backgroundColor: 'rgba(16,185,129,0.8)',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Pending',
                data: names.map(n => byEmployee[n].Pending),
                backgroundColor: 'rgba(245,158,11,0.8)',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Rejected',
                data: names.map(n => byEmployee[n].Rejected),
                backgroundColor: 'rgba(239,68,68,0.8)',
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { family: FONT_FAMILY, size: 11, weight: '600' },
                    color: '#64748b',
                },
            },
            tooltip: { ...tooltipPlugin },
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { family: FONT_FAMILY, size: 11 }, color: '#94a3b8', maxRotation: 20 },
                border: { display: false },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { stepSize: 1, font: { family: FONT_FAMILY, size: 11 }, color: '#94a3b8' },
                grid: { color: 'rgba(148,163,184,0.1)' },
                border: { display: false },
            },
        },
    };

    return <div style={{ height: '260px' }}><Bar data={data} options={options} /></div>;
};
