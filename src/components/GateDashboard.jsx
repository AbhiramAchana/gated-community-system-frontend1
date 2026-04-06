import { useState } from 'react';
import { Shield, Search, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorAPI } from '../api/api';


function GlowCard({ children, style, className = '' }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    return (
        <div 
            className={`glass-card ${className}`} 
            style={{ ...style, position: 'relative', overflow: 'hidden' }}
            onMouseMove={handleMouseMove}
        >
            <div 
                style={{
                    position: 'absolute', top: mousePosition.y, left: mousePosition.x,
                    transform: 'translate(-50%, -50%)', width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none', zIndex: 0, transition: 'opacity 0.3s'
                }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}

export default function GateDashboard() {
    const [token, setToken] = useState('');
    const [visitor, setVisitor] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [securityNotes, setSecurityNotes] = useState('');

    const handleLookup = async (e) => {
        e.preventDefault();
        
        setVisitor(null);
        setError('');
        setLoading(true);
        try {
            const response = await visitorAPI.lookupByToken(token);
            setVisitor(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError('Invalid token — visitor not found');
        } finally {
            setLoading(false);
        }
    };

    const handleGateAction = async (action) => {
        setActionLoading(true);
        try {
            const response = await visitorAPI.gateAction({
                entryToken: token,
                action,
                securityNotes,
            });
            setVisitor(response.data);
            if(action) toast.success(`Gate ${action.toLowerCase()} recorded`);
            setSecurityNotes('');
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to process gate action');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const map = {
            'APPROVED': '#6366f1',
            'ENTERED': '#10b981',
            'EXITED': '#94a3b8',
            'DENIED': '#ef4444',
            'PENDING': '#f59e0b',
        };
        return map[status] || '#94a3b8';
    };

    return (
        <div className="app-container">
            <nav className="glass-panel dashboard-nav animate-fade-in">
                <div className="nav-brand">
                    <Shield color="var(--accent-primary)" size={24} />
                    <span>Gate Security</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Gate Management System
                </span>
            </nav>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={visitor ? visitor.id : 'lookup'}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, position: 'absolute', width: '100%' }}
                        transition={{ duration: 0.3 }}
                    >

                {/* Token Lookup */}
                <div className="glass-panel stagger-1" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={20} /> Visitor Lookup
                    </h2>
                    <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            className="input-field"
                            placeholder="Enter 6-digit token"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            maxLength={6}
                            style={{ flex: 1, fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Lookup'}
                        </button>
                    </form>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginTop: '1rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Visitor Details */}
                {visitor && (
                    <div className="glass-panel stagger-2" style={{ padding: '2rem', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Visitor Details</h2>
                            <span style={{
                                background: getStatusColor(visitor.status),
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                {visitor.status}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Visitor Name</p>
                                <p style={{ fontWeight: '600' }}>{visitor.visitorName}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Phone</p>
                                <p style={{ fontWeight: '600' }}>{visitor.visitorPhone}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Purpose</p>
                                <p style={{ fontWeight: '600' }}>{visitor.purpose}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Vehicle</p>
                                <p style={{ fontWeight: '600' }}>{visitor.visitorVehicle || '—'}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Approved By</p>
                                <p style={{ fontWeight: '600' }}>{visitor.residentName}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Expected Arrival</p>
                                <p style={{ fontWeight: '600' }}>{visitor.expectedArrival ? new Date(visitor.expectedArrival).toLocaleString() : '—'}</p>
                            </div>
                        </div>

                        {/* Entry/Exit times if recorded */}
                        {visitor.entryTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} /> Entered at {new Date(visitor.entryTime).toLocaleString()}
                            </div>
                        )}
                        {visitor.exitTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <CheckCircle size={16} /> Exited at {new Date(visitor.exitTime).toLocaleString()}
                            </div>
                        )}

                        {/* Security Notes */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">Security Notes (optional)</label>
                            <input
                                className="input-field"
                                placeholder="e.g. Verified ID, suspicious activity..."
                                value={securityNotes}
                                onChange={e => setSecurityNotes(e.target.value)}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {visitor.status === 'APPROVED' && (
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={() => handleGateAction('ENTRY')}
                                    disabled={actionLoading}
                                >
                                    <LogIn size={16} />
                                    {actionLoading ? 'Processing...' : 'Log Entry'}
                                </button>
                            )}
                            {visitor.status === 'ENTERED' && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => handleGateAction('EXIT')}
                                    disabled={actionLoading}
                                >
                                    <LogOut size={16} />
                                    {actionLoading ? 'Processing...' : 'Log Exit'}
                                </button>
                            )}
                            {(visitor.status === 'EXITED' || visitor.status === 'DENIED') && (
                                <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                                    This visitor has already {visitor.status.toLowerCase()}.
                                </div>
                            )}
                        </div>
                    </div>
                )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}