import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const data = response.data;
            login(data);
            if (data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/resident');
            }
        } catch (error) {
            const msg = error.response?.data?.message || '';
            if (msg.includes('disabled') || msg.includes('pending')) {
                setError('Your account is pending admin approval. Please wait.');
            } else {
                setError('Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="glass-panel login-box animate-fade-in">

                <div className="login-header stagger-1">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--accent-primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
                            <KeyRound size={32} color="white" />
                        </div>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Access your gated community portal</p>
                </div>

                <form onSubmit={handleLogin} className="stagger-2">

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} /> Remember me
                        </label>
                        <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', opacity: loading ? 0.7 : 1, marginBottom: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                    </button>

                    {/* ✅ Sign up link */}
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Don&apos;t have an account?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Sign up
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}