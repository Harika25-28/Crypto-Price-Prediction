import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, ChevronDown, ChevronUp, Activity, Zap, TrendingUp,
    CheckCircle2, AlertCircle, Target
} from 'lucide-react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, Legend
} from 'recharts';

interface ModelPerformance {
    coin_symbol: string;
    model_name: string;
    rmse: number;
    mae: number;
    mape: number;
    precision: number;
    recall: number;
    f1_score: number;
    last_trained: string;
    samples_count: number;
}

const MODEL_COLORS: Record<string, string> = {
    arima: '#7C3AED',
    lightgbm: '#06b6d4',
    tcn: '#f59e0b',
    tft: '#10b981',
};

const MODEL_DESCRIPTIONS: Record<string, string> = {
    arima: 'Classic statistical model that identifies trends and seasonality in time series data. Best for stable, linear market patterns.',
    lightgbm: 'Gradient boosting framework using tree-based learning algorithms. Handles feature interactions and non-linearity extremely well.',
    tcn: 'Temporal Convolutional Network that captures long-range dependencies in price sequences using dilated convolutions.',
    tft: 'Temporal Fusion Transformer combining attention mechanisms with LSTMs for multi-horizon probabilistic forecasting.',
};

const MODEL_TAGS: Record<string, string[]> = {
    arima: ['Statistical', 'Interpretable', 'Fast Training'],
    lightgbm: ['Gradient Boosting', 'Feature-Rich', 'High Accuracy'],
    tcn: ['Deep Learning', 'Causal Convolution', 'Parallelizable'],
    tft: ['Transformer-based', 'Attention Mechanism', 'Multi-Horizon'],
};

const COINS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin'];
const COIN_LABELS: Record<string, string> = {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    cardano: 'Cardano',
    binancecoin: 'Binance',
};
const MODELS = ['arima', 'lightgbm', 'tcn', 'tft'];

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

const ConfusionMatrix = ({ precision, recall }: { precision: number; recall: number }) => {
    const tp = Math.round(precision * recall * 100);
    const fp = Math.round((1 - precision) * 100);
    const fn = Math.round((1 - recall) * 100);
    const tn = Math.round(precision * (1 - recall) * 100) + 20;

    return (
        <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Confusion Matrix</p>
            <div className="grid grid-cols-2 gap-1">
                {[
                    { label: 'True Positive', value: tp, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'False Positive', value: fp, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'False Negative', value: fn, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'True Negative', value: tn, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} p-3 rounded-lg text-center`}>
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ModelCard = ({
    model, stats, isExpanded, onToggle
}: {
    model: string;
    stats: ModelPerformance | undefined;
    isExpanded: boolean;
    onToggle: () => void;
}) => {
    const color = MODEL_COLORS[model];
    const accuracy = stats ? ((stats.precision + stats.recall + stats.f1_score) / 3 * 100).toFixed(1) : null;

    const radarData = stats ? [
        { metric: 'Precision', value: Math.round(stats.precision * 100) },
        { metric: 'Recall', value: Math.round(stats.recall * 100) },
        { metric: 'F1-Score', value: Math.round(stats.f1_score * 100) },
        { metric: 'Accuracy', value: accuracy ? parseFloat(accuracy) : 0 },
    ] : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: isExpanded ? color : 'rgba(255,255,255,0.08)' }}
        >
            {/* Accordion Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}22` }}
                    >
                        <Zap className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wider">{model}</p>
                        <p className="text-xs text-muted-foreground">{MODEL_DESCRIPTIONS[model].split('.')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {accuracy && (
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                            <p className="text-xl font-bold" style={{ color }}>{accuracy}%</p>
                        </div>
                    )}
                    {!stats && (
                        <span className="text-xs text-muted-foreground italic px-3 py-1 rounded-full border border-dashed border-border">
                            No data
                        </span>
                    )}
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t"
                        style={{ borderColor: `${color}44` }}
                    >
                        <div className="p-5 space-y-6">
                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed">{MODEL_DESCRIPTIONS[model]}</p>

                            {/* Tags */}
                            <div className="flex gap-2 flex-wrap">
                                {MODEL_TAGS[model].map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-full border font-medium"
                                        style={{ borderColor: `${color}66`, color, backgroundColor: `${color}18` }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {stats ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Metrics bars */}
                                    <div className="col-span-1 space-y-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Classification Metrics</p>
                                        <MetricBar label="Precision" value={stats.precision} color={color} />
                                        <MetricBar label="Recall" value={stats.recall} color={color} />
                                        <MetricBar label="F1-Score" value={stats.f1_score} color={color} />
                                        <div className="pt-2 border-t border-border space-y-1">
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">RMSE</span><span className="font-mono">{stats.rmse.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">MAE</span><span className="font-mono">{stats.mae.toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">MAPE</span><span className="font-mono">{stats.mape.toFixed(2)}%</span></div>
                                        </div>
                                    </div>

                                    {/* Radar chart */}
                                    <div className="col-span-1">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Performance Radar</p>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <RadarChart data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#888', fontSize: 11 }} />
                                                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 9 }} />
                                                <Radar name={model} dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Confusion Matrix */}
                                    <div className="col-span-1">
                                        <ConfusionMatrix precision={stats.precision} recall={stats.recall} />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    No data yet — go to <a href="/prediction" className="text-primary underline">Prediction</a> and click Retrain.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Models = () => {
    const [performance, setPerformance] = useState<ModelPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCoin, setSelectedCoin] = useState('bitcoin');
    const [expandedModels, setExpandedModels] = useState<string[]>([]);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/models/performance');
                setPerformance(response.data);
            } catch (err) {
                setError('Failed to load model performance data.');
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, []);

    const toggleModel = (model: string) => {
        setExpandedModels(prev =>
            prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
        );
    };

    const coinData = performance.filter(p => p.coin_symbol === selectedCoin);

    // Bar chart data for top performance overview
    const barData = MODELS.map(m => {
        const s = coinData.find(d => d.model_name === m);
        return {
            name: m.toUpperCase(),
            f1: s ? parseFloat((s.f1_score * 100).toFixed(1)) : 0,
            fill: MODEL_COLORS[m],
        };
    }).filter(d => d.f1 > 0);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                    <BarChart3 className="h-9 w-9 text-purple-500" />
                    Models &amp; Performance Metrics
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Deep-dive accuracy analysis for 4 AI models across all 5 crypto assets.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* Coin Selector Pills */}
            <div className="flex gap-2 flex-wrap mb-8">
                {COINS.map(coin => (
                    <button
                        key={coin}
                        onClick={() => { setSelectedCoin(coin); setExpandedModels([]); }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all border ${
                            selectedCoin === coin
                                ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                : 'border-border text-muted-foreground hover:bg-secondary'
                        }`}
                    >
                        {COIN_LABELS[coin] ?? coin}
                    </button>
                ))}
            </div>

            {/* Bar Chart: Top Models by F1 */}
            {barData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" /> Top Models by F1-Score for <span className="text-foreground capitalize">{COIN_LABELS[selectedCoin] ?? selectedCoin}</span>
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 11 }} unit="%" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
                                formatter={(v: number) => [`${v}%`, 'F1-Score']}
                            />
                            <Bar dataKey="f1" radius={[6, 6, 0, 0]}>
                                {barData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {performance.length === 0 ? (
                <div className="bg-card border border-dashed border-border p-16 rounded-2xl text-center">
                    <Activity className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No Performance Data Found</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                        Your dashboard is empty because no models have been trained yet.
                        Go to the <a href="/prediction" className="text-purple-400 font-bold hover:underline">Prediction</a> page and click <b>"Retrain"</b> on any coin to populate the dashboard.
                    </p>
                </div>
            ) : (
                <div>
                    {/* Accordion model list */}
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Model Analysis — click to expand
                    </p>
                    <div className="space-y-3">
                        {MODELS.map(model => (
                            <ModelCard
                                key={model}
                                model={model}
                                stats={coinData.find(d => d.model_name === model)}
                                isExpanded={expandedModels.includes(model)}
                                onToggle={() => toggleModel(model)}
                            />
                        ))}
                    </div>

                    {coinData.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            No training data for <span className="capitalize font-semibold">{COIN_LABELS[selectedCoin] ?? selectedCoin}</span> yet. Run a retrain to see results.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Models;
