import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { Check, X, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Register = () => {
    const [role] = useState<'user'>('user');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Password validation state
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (role === 'user' && !isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register({ email, username, password, role, full_name: fullName });
            navigate('/login');
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-foreground">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">Sign up to access crypto price predictions</p>
                </div>


                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-secondary rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Username (for login)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="full-name" className="sr-only">Full Name</label>
                            <input
                                id="full-name"
                                name="full-name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-secondary rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-secondary rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-secondary rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password Strength Meter */}
                    {(
                        <div className="space-y-2 p-4 bg-secondary/50 rounded-lg text-sm">
                            <p className="font-medium mb-2">Password Requirements:</p>
                            <PasswordRequirement label="At least 8 characters" valid={hasMinLength} />
                            <PasswordRequirement label="One uppercase letter" valid={hasUpper} />
                            <PasswordRequirement label="One lowercase letter" valid={hasLower} />
                            <PasswordRequirement label="One number" valid={hasNumber} />
                            <PasswordRequirement label="One special character" valid={hasSpecial} />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading || (role === 'user' && !isPasswordValid)}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center">
                                    Register <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <a href="/login" className="text-sm text-primary hover:text-primary/80 font-medium">
                        Already have an account? Sign in
                    </a>
                </div>
            </div>
        </div>
    );
};

const PasswordRequirement = ({ label, valid }: { label: string, valid: boolean }) => (
    <div className={cn("flex items-center space-x-2 transition-colors", valid ? "text-green-500" : "text-muted-foreground")}>
        {valid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        <span>{label}</span>
    </div>
)

export default Register;
