import React from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';

const Support = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
                    <p className="text-muted-foreground">
                        Have a question or need assistance? Our team is here to help you with any inquiries about our platform.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Email Us</p>
                            <p className="text-muted-foreground">support@cryptopulse.com</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Call Us</p>
                            <p className="text-muted-foreground">+1 (555) 123-4567</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Live Chat</p>
                            <p className="text-muted-foreground">Available 24/7</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                            <input type="text" id="firstName" className="w-full px-3 py-2 bg-secondary border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                            <input type="text" id="lastName" className="w-full px-3 py-2 bg-secondary border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <input type="email" id="email" className="w-full px-3 py-2 bg-secondary border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <textarea id="message" rows={4} className="w-full px-3 py-2 bg-secondary border border-border rounded-md outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Support;
