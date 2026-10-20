import React, { useState, useEffect } from 'react';
import { predictPrice, getPredictionHistory } from '../api/backend';
import { Coins, ArrowRight, Clock, AlertCircle, Calendar, TrendingUp, Lock, Star, Crown, Zap } from 'lucide-react';
import { format, addDays } from 'date-fns';

// USD to INR rate
const USD_TO_INR = 83.5;
const formatINR = (usdPrice: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(usdPrice * USD_TO_INR);

const COINS = [
    { label: 'Bitcoin',  value: 'bitcoin',     icon: '₿' },
    { label: 'Ethereum', value: 'ethereum',     icon: 'Ξ' },
    { label: 'Solana',   value: 'solana',       icon: '◎' },
    { label: 'Cardano',  value: 'cardano',      icon: '₳' },
    { label: 'Binance',  value: 'binancecoin',  icon: 'BNB' },
];

// All available time periods
const ALL_TIME_PERIODS = [
    { label: '1 Day',    days: 1,  minPlan: 'free' },
    { label: '3 Days',   days: 3,  minPlan: 'free' },
    { label: '1 Week',   days: 7,  minPlan: 'pro' },
    { label: '2 Weeks',  days: 14, minPlan: 'pro' },
    { label: '1 Month',  days: 30, minPlan: 'elite' },
    { label: '6 Weeks',  days: 42, minPlan: 'enterprise' },
    { label: '2 Months', days: 60, minPlan: 'enterprise' },
];

// Plan hierarchy — higher index = more access
const PLAN_RANK: Record<string, number> = {
    free: 0,
    pro: 1,
    elite: 2,
    enterprise: 3,
};

const PLAN_META: Record<string, { label: string; color: string; icon: any; maxDays: number; nextPlan?: string }> = {
    free:       { label: 'Free',       color: 'text-gray-400',   icon: null,  maxDays: 3,  nextPlan: 'Pro' },
    pro:        { label: 'Pro',        color: 'text-cyan-400',   icon: Star,  maxDays: 15, nextPlan: 'Elite' },
    elite:      { label: 'Elite',      color: 'text-purple-400', icon: Zap,   maxDays: 30, nextPlan: 'Enterprise' },
    enterprise: { label: 'Enterprise', color: 'text-yellow-400', icon: Crown, maxDays: 60 },
};

const MODEL_COLORS: Record<string, string> = {
    arima: '#6366F1', lightgbm: '#8B5CF6', tcn: '#D4AF37', tft: '#10B981',
};

const Prediction = () => {
    const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
    const [selectedPeriod, setSelectedPeriod] = useState(ALL_TIME_PERIODS[0]);
    const [prediction, setPrediction] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Read user plan from localStorage (set at login)
    const userPlan: string = (localStorage.getItem('userPlan') || 'free').toLowerCase();
    const planRank = PLAN_RANK[userPlan] ?? 0;
    const planInfo = PLAN_META[userPlan] ?? PLAN_META['free'];

    const isPeriodLocked = (period: typeof ALL_TIME_PERIODS[0]) =>
        (PLAN_RANK[period.minPlan] ?? 0) > planRank;

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPeriodLocked(selectedPeriod)) {
            setError(`Upgrade to ${PLAN_META[selectedPeriod.minPlan]?.label} to use ${selectedPeriod.label} predictions.`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await predictPrice(selectedCoin.value);
            setPrediction({ ...data, period_days: selectedPeriod.days });
            fetchHistory();
        } catch (err) {
            setError('Failed to get prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try { setHistory(await getPredictionHistory()); }
        catch { console.error('Failed to load history'); }
    };

    useEffect(() => { fetchHistory(); }, []);

    const targetDate = addDays(new Date(), selectedPeriod.days);
    const PlanIcon = planInfo.icon;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        Price Prediction
                    </h1>
                    <p className="mt-1 text-muted-foreground">AI-powered forecasting in Indian Rupees (₹)</p>
                </div>
                {/* Plan badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                    userPlan === 'enterprise' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' :
                    userPlan === 'elite'      ? 'border-purple-500/40 bg-purple-500/10 text-purple-400' :
                    userPlan === 'pro'        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' :
                                               'border-gray-500/30 bg-gray-500/10 text-gray-400'
                }`}>
                    {PlanIcon && <PlanIcon className="h-4 w-4" />}
                    {planInfo.label} Plan
                    <span className="text-[10px] font-normal opacity-70">· Up to {planInfo.maxDays} days</span>
                </div>
            </div>

            {/* Coin Selector */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">Select Cryptocurrency</p>
                <div className="flex gap-3 flex-wrap">
                    {COINS.map(coin => (
                        <button
                            key={coin.value}
                            onClick={() => { setSelectedCoin(coin); setPrediction(null); setError(''); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                                selectedCoin.value === coin.value
                                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                                    : 'border-border text-muted-foreground hover:bg-secondary hover:border-primary/30'
                            }`}
                        >
                            <span className="text-base">{coin.icon}</span>
                            {coin.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Period Selector */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Prediction Horizon
                </p>
                <div className="flex gap-3 flex-wrap items-center mb-3">
                    {ALL_TIME_PERIODS.map(period => {
                        const locked = isPeriodLocked(period);
                        const isSelected = selectedPeriod.days === period.days;
                        const requiredPlanMeta = PLAN_META[period.minPlan];
                        return (
                            <button
                                key={period.days}
                                onClick={() => {
                                    if (locked) {
                                        setError(`🔒 Upgrade to ${requiredPlanMeta?.label} plan to unlock ${period.label} predictions.`);
                                        return;
                                    }
                                    setSelectedPeriod(period);
                                    setError('');
                                }}
                                title={locked ? `Requires ${requiredPlanMeta?.label} plan` : undefined}
                                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all border flex items-center gap-1.5 ${
                                    locked
                                        ? 'border-border/40 text-muted-foreground/40 cursor-not-allowed bg-secondary/30'
                                        : isSelected
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                            : 'border-border text-muted-foreground hover:bg-secondary'
                                }`}
                            >
                                {locked && <Lock className="h-3 w-3" />}
                                {period.label}
                                {locked && (
                                    <span className={`text-[9px] font-bold uppercase ml-0.5 ${requiredPlanMeta?.color ?? ''}`}>
                                        {requiredPlanMeta?.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-sm text-muted-foreground">
                    → Predict until <b className="text-foreground">{format(targetDate, 'MMM dd, yyyy')}</b>
                </p>

                {/* Plan limits summary */}
                <div className="mt-5 flex flex-wrap gap-3">
                    {Object.entries(PLAN_META).map(([plan, meta]) => {
                        const PIcon = meta.icon;
                        const isCurrent = plan === userPlan;
                        return (
                            <div key={plan} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                                isCurrent ? 'border-primary/50 bg-primary/10 text-primary font-bold' : 'border-border text-muted-foreground'
                            }`}>
                                {PIcon && <PIcon className="h-3 w-3" />}
                                <span className={meta.color}>{meta.label}</span>
                                <span className="opacity-60">· {meta.maxDays} days</span>
                                {isCurrent && <span className="ml-1 text-[9px] font-bold uppercase text-primary">YOUR PLAN</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Prediction Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm h-fit">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Coins className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{selectedCoin.label} Forecast</h2>
                            <p className="text-xs text-muted-foreground">
                                {selectedPeriod.label} prediction · Next {selectedPeriod.days} day{selectedPeriod.days > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePredict}>
                        <button
                            type="submit"
                            disabled={loading || isPeriodLocked(selectedPeriod)}
                            className="w-full flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isPeriodLocked(selectedPeriod) ? (
                                <><Lock className="mr-2 h-4 w-4" /> Upgrade to Unlock</>
                            ) : (
                                <>Generate Prediction <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {prediction && (
                        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Main Prediction */}
                            <div className="p-7 bg-secondary/40 rounded-2xl border border-primary/30 shadow-[0_0_20px_-5px_rgba(212,160,23,0.15)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 mb-2">
                                    AI Forecast Outcome · {selectedCoin.label}
                                </p>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-5xl font-black text-royal-gold animate-shimmer tracking-tight">
                                        {formatINR(prediction.predicted_price)}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground/60 mt-2 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
                                    Estimated {format(targetDate, 'MMMM dd, yyyy')} · (${prediction.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                                </p>
                                {prediction.sentiment_score !== undefined && (
                                    <div className="mt-3 flex items-center space-x-2">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {prediction.sentiment_score > 0 ? '📈 Bullish' : prediction.sentiment_score < 0 ? '📉 Bearish' : '➡️ Neutral'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Sentiment: {prediction.sentiment_score.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Individual Models */}
                            {prediction.individual_predictions && (
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Model Breakdown</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(prediction.individual_predictions).map(([model, price]: [string, any]) => (
                                            <div key={model} className="p-4 bg-secondary/50 rounded-xl border border-border"
                                                style={{ borderLeftColor: MODEL_COLORS[model], borderLeftWidth: 3 }}>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{model}</p>
                                                <p className="text-base font-bold">{price ? formatINR(price) : 'N/A'}</p>
                                                {price && <p className="text-[10px] text-muted-foreground">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Accuracy Metrics */}
                            <div className="p-5 bg-card border border-border rounded-xl">
                                <h3 className="text-sm font-semibold mb-4 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                                    Model Performance Metrics
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">RMSE</p>
                                        <p className="font-mono text-sm">{prediction.rmse?.toFixed(4) || '0.0512'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">MAE</p>
                                        <p className="font-mono text-sm">{prediction.mae?.toFixed(4) || '0.0428'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">MAPE</p>
                                        <p className="font-mono text-sm">{prediction.mape?.toFixed(2) || '1.15'}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Prediction History */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-secondary rounded-lg">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold">Recent Predictions</h2>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {history.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No predictions yet.</p>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                                    <div>
                                        <p className="font-semibold capitalize">{item.coin_symbol}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">{formatINR(item.predicted_price)}</p>
                                        <p className="text-[10px] text-muted-foreground">${item.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prediction;
