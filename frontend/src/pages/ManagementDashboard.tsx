import { useEffect, useState } from 'react';
import { getManagementHistory, getManagementUsers } from '../api/rbac';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Activity, TrendingUp, BarChart3, Database, Zap,
    ArrowUpRight, ArrowDownRight, Clock, Target, Filter, Users, Crown, Star
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { format } from 'date-fns';

const USD_TO_INR = 83.5;
const formatINR = (usd: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(usd * USD_TO_INR);

const COIN_LABELS: Record<string, string> = {
    bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana',
    cardano: 'Cardano', binancecoin: 'Binance',
};
const COIN_COLORS: Record<string, string> = {
    bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff',
    cardano: '#0033ad', binancecoin: '#f0b90b',
};
const MODEL_COLORS: Record<string, string> = {
    arima: '#6366F1', lightgbm: '#8B5CF6', tcn: '#D4AF37', tft: '#10B981',
};

const MODELS = ['arima', 'lightgbm', 'tcn', 'tft'];
const COINS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin'];

interface ModelMeta {
    coin_symbol: string;
    model_name: string;
    rmse: number;
    mae: number;
    mape: number;
    precision: number;
    recall: number;
    f1_score: number;
    samples_count: number;
    last_trained: string;
}

const KPICard = ({ title, value, sub, icon: Icon, color }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5"
    >
        <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}22` }}>
            <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
            <p className="text-2xl font-extrabold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
    </motion.div>
);

const ManagementDashboard = () => {
    const [allModels, setAllModels] = useState<ModelMeta[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState('arima');
    const [filterCoin, setFilterCoin] = useState('all');
    const [updatingPlan, setUpdatingPlan] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [perfData, histData, usersData] = await Promise.all([
                    axios.get('http://localhost:8000/api/models/performance').then(r => r.data),
                    getManagementHistory(0, 200),
                    getManagementUsers(),
                ]);
                setAllModels(perfData);
                setHistory(histData);
                setUsersList(usersData);
            } catch (err) {
                console.error('Failed to load management data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // ── Compute KPIs ───────────────────────────────────────────────
    const totalCoins = new Set(allModels.map(m => m.coin_symbol)).size;
    const totalModels = allModels.length;
    const totalUsers = usersList.length;
    const avgF1 = allModels.length > 0
        ? (allModels.reduce((s, m) => s + (m.f1_score || 0), 0) / allModels.length * 100).toFixed(1)
        : '—';
    const avgMape = allModels.length > 0
        ? (allModels.reduce((s, m) => s + (m.mape || 0), 0) / allModels.length).toFixed(2)
        : '—';

    const planCounts = {
        free: usersList.filter(u => !u.subscription_plan || u.subscription_plan === 'free').length,
        pro: usersList.filter(u => u.subscription_plan === 'pro').length,
        elite: usersList.filter(u => u.subscription_plan === 'elite').length,
        enterprise: usersList.filter(u => u.subscription_plan === 'enterprise').length,
    };

    const handlePlanChange = async (userId: number, newPlan: string) => {
        setUpdatingPlan(userId);
        try {
            // Optimistic update
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, subscription_plan: newPlan } : u));
        } finally {
            setUpdatingPlan(null);
        }
    };

    const PLAN_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
        free:       { bg: 'bg-gray-500/15',    text: 'text-gray-300',   icon: null,  label: 'Free' },
        pro:        { bg: 'bg-cyan-500/15',     text: 'text-cyan-400',   icon: Star,  label: 'Pro' },
        elite:      { bg: 'bg-purple-500/15',   text: 'text-purple-400', icon: Zap,   label: 'Elite' },
        enterprise: { bg: 'bg-amber-500/15',    text: 'text-amber-400',  icon: Crown, label: 'Enterprise' },
    };

    // ── Model F1 Comparison by Coin (bar chart) ───────────────────
    const modelBarData = COINS.map(coin => {
        const row: any = { coin: COIN_LABELS[coin] ?? coin };
        MODELS.forEach(model => {
            const entry = allModels.find(m => m.coin_symbol === coin && m.model_name === model);
            row[model] = entry ? parseFloat((entry.f1_score * 100).toFixed(1)) : 0;
        });
        return row;
    }).filter(row => MODELS.some(m => row[m] > 0));

    // ── Radar: selected model across coins ────────────────────────
    const radarData = COINS.map(coin => {
        const entry = allModels.find(m => m.coin_symbol === coin && m.model_name === selectedModel);
        return {
            coin: COIN_LABELS[coin] ?? coin,
            precision: entry ? Math.round(entry.precision * 100) : 0,
            recall: entry ? Math.round(entry.recall * 100) : 0,
            f1: entry ? Math.round(entry.f1_score * 100) : 0,
        };
    });

    // ── Prediction trend (line chart) ────────────────────────────
    const trendData = history
        .filter(h => filterCoin === 'all' || h.coin_symbol === filterCoin)
        .slice(-30)
        .map(h => ({
            date: format(new Date(h.timestamp), 'MMM dd HH:mm'),
            price: Math.round(h.predicted_price * USD_TO_INR),
            coin: h.coin_symbol,
        }));

    // ── Filtered history table ────────────────────────────────────
    const filteredHistory = history.filter(h => filterCoin === 'all' || h.coin_symbol === filterCoin);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                    Management Dashboard
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Comprehensive overview of AI model performance, prediction analytics, and system health.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                <KPICard title="Monitored Assets" value={totalCoins} sub="Cryptocurrencies" icon={Database} color="#7C3AED" />
                <KPICard title="Trained Models" value={totalModels} sub={`${MODELS.length} model types`} icon={Zap} color="#06b6d4" />
                <KPICard title="Total Users" value={totalUsers} sub={`${planCounts.pro} Pro · ${planCounts.enterprise} Enterprise`} icon={Users} color="#818cf8" />
                <KPICard title="Avg F1-Score" value={`${avgF1}%`} sub="All models combined" icon={Target} color="#10b981" />
                <KPICard title="Avg MAPE" value={`${avgMape}%`} sub="Mean absolute % error" icon={Activity} color="#f59e0b" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Model F1 Multi-coin Bar Chart */}
                <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" /> F1-Score by Coin & Model
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={modelBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="coin" tick={{ fill: '#888', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} unit="%" />
                            <Tooltip
                                contentStyle={{ background: '#0a0a0c', border: '1px solid #1f2937', borderRadius: 8 }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(v: any) => [`${v}%`]}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            {MODELS.map(model => (
                                <Bar key={model} dataKey={model} name={model.toUpperCase()} fill={MODEL_COLORS[model]} radius={[6, 6, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar: 1 model, all coins */}
                <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Model Deep-Dive</h2>
                        <div className="flex gap-1">
                            {MODELS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedModel(m)}
                                    className="px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
                                    style={{
                                        background: selectedModel === m ? MODEL_COLORS[m] + '33' : 'transparent',
                                        color: selectedModel === m ? MODEL_COLORS[m] : '#888',
                                        border: `1px solid ${selectedModel === m ? MODEL_COLORS[m] : 'transparent'}`
                                    }}
                                >{m}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={210}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="coin" tick={{ fill: '#888', fontSize: 10 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} />
                            <Radar name="Precision" dataKey="precision" stroke={MODEL_COLORS[selectedModel]} fill={MODEL_COLORS[selectedModel]} fillOpacity={0.2} />
                            <Radar name="F1" dataKey="f1" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Accuracy Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-bold">Model Performance Summary</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/40">
                            <tr>
                                <th className="px-5 py-3">Asset</th>
                                <th className="px-5 py-3">Model</th>
                                <th className="px-5 py-3">Precision</th>
                                <th className="px-5 py-3">Recall</th>
                                <th className="px-5 py-3">F1-Score</th>
                                <th className="px-5 py-3">MAPE</th>
                                <th className="px-5 py-3">Samples</th>
                                <th className="px-5 py-3">Last Trained</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {allModels.length > 0 ? allModels.map((m, i) => {
                                const f1Pct = (m.f1_score * 100);
                                const f1Color = f1Pct >= 90 ? '#10b981' : f1Pct >= 80 ? '#f59e0b' : '#ef4444';
                                return (
                                    <tr key={`${m.coin_symbol}-${m.model_name}-${i}`} className="hover:bg-accent/20 transition-colors">
                                        <td className="px-5 py-3 font-semibold capitalize flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COIN_COLORS[m.coin_symbol] ?? '#888' }} />
                                            {COIN_LABELS[m.coin_symbol] ?? m.coin_symbol}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                                                style={{ background: MODEL_COLORS[m.model_name] + '22', color: MODEL_COLORS[m.model_name] }}>
                                                {m.model_name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono">{(m.precision * 100).toFixed(1)}%</td>
                                        <td className="px-5 py-3 font-mono">{(m.recall * 100).toFixed(1)}%</td>
                                        <td className="px-5 py-3 font-bold" style={{ color: f1Color }}>{f1Pct.toFixed(1)}%</td>
                                        <td className="px-5 py-3 font-mono text-muted-foreground">{m.mape.toFixed(2)}%</td>
                                        <td className="px-5 py-3 text-muted-foreground">{m.samples_count ?? '—'}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs">
                                            {m.last_trained ? format(new Date(m.last_trained), 'MMM dd, HH:mm') : '—'}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">No data. Train models first.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Prediction Trend Line Chart */}
            {trendData.length > 1 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Prediction Trend (₹) — Last 30 Entries
                        </h2>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={filterCoin}
                                onChange={e => setFilterCoin(e.target.value)}
                                className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground"
                            >
                                <option value="all">All Coins</option>
                                {COINS.map(c => <option key={c} value={c}>{COIN_LABELS[c] ?? c}</option>)}
                            </select>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} minTickGap={40} />
                            <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                            <Tooltip
                                contentStyle={{ background: '#0a0a0c', border: '1px solid #1f2937', borderRadius: 8 }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(v: any) => [`₹${v?.toLocaleString('en-IN')}`, 'Predicted Price']}
                            />
                            <Line type="monotone" dataKey="price" stroke="#7C3AED" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Prediction History Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-bold">Prediction Log</h2>
                        <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{filteredHistory.length} entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={filterCoin}
                            onChange={e => setFilterCoin(e.target.value)}
                            className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground"
                        >
                            <option value="all">All Coins</option>
                            {COINS.map(c => <option key={c} value={c}>{COIN_LABELS[c] ?? c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/40 sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3">Time</th>
                                <th className="px-5 py-3">Asset</th>
                                <th className="px-5 py-3">Predicted Price (₹)</th>
                                <th className="px-5 py-3">USD Equivalent</th>
                                <th className="px-5 py-3">Sentiment</th>
                                <th className="px-5 py-3">MAPE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-accent/20 transition-colors">
                                    <td className="px-5 py-3 text-muted-foreground text-xs">{format(new Date(item.timestamp), 'MMM dd, HH:mm')}</td>
                                    <td className="px-5 py-3 font-semibold capitalize flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COIN_COLORS[item.coin_symbol] ?? '#888' }} />
                                        {COIN_LABELS[item.coin_symbol] ?? item.coin_symbol}
                                    </td>
                                    <td className="px-5 py-3 font-bold text-primary">{formatINR(item.predicted_price)}</td>
                                    <td className="px-5 py-3 font-mono text-muted-foreground text-xs">
                                        ${item.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-5 py-3">
                                        {item.sentiment_score != null ? (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit
                                                ${item.sentiment_score > 0 ? 'bg-green-500/20 text-green-400' : item.sentiment_score < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {item.sentiment_score > 0 ? <ArrowUpRight className="h-3 w-3" /> : item.sentiment_score < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                                                {item.sentiment_score > 0 ? 'Bullish' : item.sentiment_score < 0 ? 'Bearish' : 'Neutral'}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-5 py-3 font-mono text-muted-foreground">{item.mape != null ? `${item.mape.toFixed(2)}%` : '—'}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No prediction history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Users Section ───────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-lg font-bold">Registered Users</h2>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{usersList.length} users</span>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold">
                        <span className="px-3 py-1 rounded-full bg-gray-500/15 text-gray-300">{planCounts.free} Free</span>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400">{planCounts.pro} Pro</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-400">{planCounts.elite} Elite</span>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400">{planCounts.enterprise} Enterprise</span>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/40 sticky top-0 z-10">
                            <tr>
                                <th className="px-5 py-3">#</th>
                                <th className="px-5 py-3">Full Name</th>
                                <th className="px-5 py-3">Username</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Subscription Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {usersList.length > 0 ? usersList.map((u: any, idx: number) => {
                                const plan = u.subscription_plan || 'free';
                                const planStyle = PLAN_STYLES[plan] ?? PLAN_STYLES['free'];
                                const PlanIcon = planStyle.icon;
                                return (
                                    <tr key={u.id} className="hover:bg-accent/20 transition-colors">
                                        <td className="px-5 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                                        <td className="px-5 py-3 font-semibold">{u.full_name || '—'}</td>
                                        <td className="px-5 py-3 text-muted-foreground">@{u.username || '—'}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs">{u.email}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs">
                                            {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${planStyle.bg} ${planStyle.text}`}>
                                                    {PlanIcon && <PlanIcon className="h-3 w-3" />}
                                                    {planStyle.label}
                                                </span>
                                                <select
                                                    value={plan}
                                                    onChange={e => handlePlanChange(u.id, e.target.value)}
                                                    className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground cursor-pointer"
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="pro">Pro</option>
                                                    <option value="elite">Elite</option>
                                                    <option value="enterprise">Enterprise</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No users registered yet.
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

export default ManagementDashboard;
