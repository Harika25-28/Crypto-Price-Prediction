import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12">
            <section className="text-center space-y-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold"
                >
                    About CryptoPulse
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground"
                >
                    Empowering investors with AI-driven insights and real-time data analysis.
                </motion.p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Cryptocurrency markets are volatile and unpredictable. Our mission is to provide traders and investors with advanced tools to navigate this landscape with confidence. By combining real-time market data with machine learning algorithms, we offer a unique perspective on price movements.
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-24 h-24 bg-primary/40 rounded-full flex items-center justify-center">
                            <div className="w-16 h-16 bg-primary rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Technology Stack</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python', 'Scikit-Learn', 'Recharts', 'Framer Motion'].map((tech) => (
                        <div key={tech} className="bg-secondary/50 p-4 rounded-lg text-center font-medium border border-border/50">
                            {tech}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;
