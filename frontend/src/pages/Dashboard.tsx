import React, { useEffect, useState } from 'react';
import { getMarketData, getCoinHistory } from '../api/crypto';
import PriceChart from '../components/PriceChart';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CoinData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
}

const Dashboard = () => {
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
    const [chartData, setChartData] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getMarketData();
            setCoins(data);
            if (data.length > 0) {
                setSelectedCoin(data[0]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (selectedCoin) {
                const history = await getCoinHistory(selectedCoin.id);
                setChartData(history);
            }
        };
        fetchHistory();
    }, [selectedCoin]);

    const handleCoinSelect = (coin: CoinData) => {
        setSelectedCoin(coin);
    };

    if (loading && coins.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Chart Section */}
                <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            {selectedCoin && (
                                <>
                                    <img src={selectedCoin.image} alt={selectedCoin.name} className="h-10 w-10" />
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
                                        <p className="text-muted-foreground uppercase">{selectedCoin.symbol}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {selectedCoin && (
                            <div className="text-right">
                                <p className="text-2xl font-bold">₹{selectedCoin.current_price.toLocaleString('en-IN')}</p>
                                <div className={cn("flex items-center justify-end text-sm font-medium", selectedCoin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500")}>
                                    {selectedCoin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                    {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-[400px]">
                        {chartData.length > 0 ? (
                            <PriceChart data={chartData} color={selectedCoin?.price_change_percentage_24h && selectedCoin.price_change_percentage_24h >= 0 ? '#22c55e' : '#ef4444'} />
                        ) : (
                            <div className="flex justify-center items-center h-full text-muted-foreground">Loading chart...</div>
                        )}
                    </div>
                </div>

                {/* Sidebar List */}
                <div className="w-full md:w-80 bg-card border border-border rounded-xl p-4 shadow-sm h-[500px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-bold mb-4 px-2">Top Assets</h3>
                    <div className="space-y-2">
                        {coins.map((coin) => (
                            <div
                                key={coin.id}
                                onClick={() => handleCoinSelect(coin)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                                    selectedCoin?.id === coin.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                                    <div>
                                        <p className="font-medium">{coin.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">₹{coin.current_price.toLocaleString('en-IN')}</p>
                                    <p className={cn("text-xs flex items-center justify-end", coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500")}>
                                        {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
