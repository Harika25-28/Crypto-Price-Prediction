import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-12">
            <section className="text-center space-y-6 max-w-4xl pt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-royal-gold animate-shimmer pb-2"
                >
                    Predict the Future of Crypto
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
                >
                    Advanced AI-powered analytics to help you make smarter investment decisions.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center gap-4 pt-4"
                >
                    <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-3 w-40 h-12 text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link to="/about" className="inline-flex items-center justify-center px-8 py-3 w-40 h-12 text-base font-medium rounded-md text-foreground bg-secondary hover:bg-secondary/80 transition-colors">
                        Learn More
                    </Link>
                </motion.div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 pt-16">
                <FeatureCard
                    icon={<Activity className="h-10 w-10 text-blue-500" />}
                    title="Real-Time Data"
                    description="Live market data updates for top cryptocurrencies using CoinGecko API."
                    delay={0.4}
                />
                <FeatureCard
                    icon={<Zap className="h-10 w-10 text-yellow-500" />}
                    title="AI Predictions"
                    description="Machine learning models to forecast short-term price movements."
                    delay={0.5}
                />
                <FeatureCard
                    icon={<ShieldCheck className="h-10 w-10 text-green-500" />}
                    title="Secure & Reliable"
                    description="Built with modern tech stack ensuring performance and stability."
                    delay={0.6}
                />
            </section>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card/50 backdrop-blur border border-border p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </motion.div>
);

export default Home;
