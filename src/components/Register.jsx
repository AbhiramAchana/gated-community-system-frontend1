import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, ArrowRight } from 'lucide-react';
import { authAPI } from '../api/api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationType, setRegistrationType] = useState('resident'); // 'resident' | 'tenant'
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);

        try {
            if (registrationType === 'tenant') {
                if (!inviteCode) {
                    setError('Invite code is required for tenants');
                    setLoading(false);
                    return;
                }
                const response = await authAPI.registerTenant(inviteCode, { name, email, password, phone });
                // Auto-login them
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    navigate('/resident');
                    return;
                }
            } else {
                await authAPI.register({ name, email, password, role: 'RESIDENT', phone });
                setSuccess(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-wrapper">
                <div className="glass-panel login-box animate-fade-in" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ marginBottom: '1rem' }}>Registration Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Your account is pending admin approval. You will be able to login once an admin approves your request.
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-wrapper">
            <div className="glass-panel login-box animate-fade-in">
                <div className="login-header stagger-1">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--accent-primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
                            <UserPlus size={32} color="white" />
                        </div>
                    </div>
                    <h2>Create Account</h2>
                    <p>Join your gated community portal</p>
                </div>

                <form onSubmit={handleRegister} className="stagger-2">

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

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button 
                            type="button" 
                            className={`btn ${registrationType === 'resident' ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ flex: 1 }}
                            onClick={() => setRegistrationType('resident')}
                        >
                            Owner / Resident
                        </button>
                        <button 
                            type="button" 
                            className={`btn ${registrationType === 'tenant' ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ flex: 1 }}
                            onClick={() => setRegistrationType('tenant')}
                        >
                            Tenant
                        </button>
                    </div>

                    {registrationType === 'tenant' && (
                        <div className="input-group">
                            <label className="input-label">Invite Code</label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                placeholder="e.g. A1B2C3D4"
                                className="input-field"
                                required={registrationType === 'tenant'}
                                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Ask your landlord/owner for your invite code.
                            </p>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="9876543210"
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
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-field"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}
                        >
                            Sign in
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}