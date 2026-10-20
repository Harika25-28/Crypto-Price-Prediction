import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Coins, LayoutDashboard, TrendingUp, Info, HelpCircle, User, LogOut, Shield, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Base nav items for everyone
    let navItems = [
        { name: 'Home', path: '/', icon: Coins },
        { name: 'About', path: '/about', icon: Info },
        { name: 'Support', path: '/support', icon: HelpCircle },
    ];

    if (token) {
        if (role === 'admin') {
            navItems.splice(1, 0, { name: 'Admin Dashboard', path: '/admin', icon: Shield });
        } else if (role === 'management') {
            navItems.splice(1, 0, { name: 'Management Portal', path: '/management', icon: Briefcase });
        } else {
            navItems.splice(1, 0, { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });
            navItems.splice(2, 0, { name: 'Prediction', path: '/prediction', icon: TrendingUp });
        }
        navItems.push({ name: 'Models', path: '/models', icon: TrendingUp });
    } else {
        navItems.push({ name: 'Login', path: '/login', icon: User });
    }

    return (
        <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <Coins className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold text-royal-gold animate-shimmer">
                            CryptoPulse
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "text-primary border-b-2 border-primary rounded-none"
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {token && (
                            <div className="flex items-center ml-4 pl-4 border-l border-border space-x-4">
                                <div className="text-sm font-medium text-foreground hidden lg:block">
                                    <span className="text-muted-foreground mr-1">Welcome,</span>
                                    <span className="capitalize">{user?.username || 'User'}</span>
                                    <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full capitalize border border-border">{role}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {token && (
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-md text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-card border-b border-border"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {token && (
                                <div className="px-3 py-2 text-sm text-muted-foreground mb-2 border-b border-border/50 pb-3">
                                    Signed in as <span className="font-semibold text-foreground capitalize">{user?.username || 'User'}</span> ({role})
                                </div>
                            )}
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
