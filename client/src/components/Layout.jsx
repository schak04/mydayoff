import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Calendar, Users, Shield, Menu, X, Sun, Moon, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const navItems = [
        { label: 'Dashboard', icon: <Home size={20} />, path: '/', roles: ['Employee', 'Manager', 'Admin'] },
        { label: 'My Leaves', icon: <Calendar size={20} />, path: '/my-leaves', roles: ['Employee', 'Manager'] },
        { label: 'My Claims', icon: <Wallet size={20} />, path: '/my-reimbursements', roles: ['Employee', 'Manager'] },
        { label: 'Team Requests', icon: <Users size={20} />, path: '/team-requests', roles: ['Manager', 'Admin'] },
        { label: 'Admin Panel', icon: <Shield size={20} />, path: '/admin', roles: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
                                MyDayOff
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-6">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
                                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="md:hidden flex items-center space-x-4">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-slate-500 dark:text-slate-400"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-slate-600 dark:text-slate-400 hover:text-primary-600"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                            <div className="pt-4 pb-1 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center px-5">
                                    <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user?.name}</div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-auto text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                        © 2026 MyDayOff. All rights reserved.
                    </p>
                    <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-1">
                        Built by Saptaparno Chakraborty
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
