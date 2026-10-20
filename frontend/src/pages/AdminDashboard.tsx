import React, { useEffect, useState } from 'react';
import { getAdminUsers, getAdminMetrics } from '../api/rbac';
import { Users, ShieldCheck, DatabaseZap } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [trainingState, setTrainingState] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersData, metricsData] = await Promise.all([
                    getAdminUsers(),
                    getAdminMetrics()
                ]);
                setUsers(usersData);
                setMetrics(metricsData);
            } catch (err) {
                console.error("Failed to load admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTrainModel = async (coinSymbol: string) => {
        setTrainingState(prev => ({ ...prev, [coinSymbol]: true }));
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/train/${coinSymbol}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh metrics after training
            const newMetrics = await getAdminMetrics();
            setMetrics(newMetrics);
            alert(`Successfully trained models for ${coinSymbol}!`);
        } catch (error: any) {
            alert(`Failed to train ${coinSymbol}: ${error.response?.data?.detail || error.message}`);
        } finally {
            setTrainingState(prev => ({ ...prev, [coinSymbol]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    Super Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage platform users and trigger system-wide AI model retraining.</p>
            </div>

            {/* Admin Actions / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">System Status</p>
                            <p className="text-2xl font-bold text-green-500">Healthy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Management Section */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold flex items-center">
                        <DatabaseZap className="mr-2 h-5 w-5 text-primary" />
                        AI Model Management
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Trigger pipeline retraining using the latest uploaded datasets.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">Asset (Symbol)</th>
                                <th className="px-6 py-4 font-medium">Current RMSE</th>
                                <th className="px-6 py-4 font-medium">Trained On</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {['bitcoin', 'solana', 'binancecoin'].map((coin) => {
                                const currentMeta = metrics.find(m => m.coin_symbol === coin);
                                const isTraining = trainingState[coin];

                                return (
                                    <tr key={coin} className="hover:bg-accent/30 transition-colors">
                                        <td className="px-6 py-4 font-medium capitalize">{coin}</td>
                                        <td className="px-6 py-4 font-mono">{currentMeta ? currentMeta.rmse.toFixed(4) : 'Not Trained'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{currentMeta ? new Date(currentMeta.last_trained).toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleTrainModel(coin)}
                                                disabled={isTraining}
                                                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                            >
                                                {isTraining ? 'Training...' : 'Retrain Pipeline'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Registered Users
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Full Name</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.length > 0 ? users.map((u) => (
                                <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground">#{u.id}</td>
                                    <td className="px-6 py-4 font-medium">{u.email}</td>
                                    <td className="px-6 py-4">{u.full_name || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground uppercase tracking-wider">
                                            {u.role}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No regular users registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
