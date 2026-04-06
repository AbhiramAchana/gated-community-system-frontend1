import { useState, useEffect, useCallback } from 'react';
import { Home, CreditCard, Clock, LogOut, CheckCircle, AlertCircle, Shield, Plus, MessageSquare, Megaphone, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoiceAPI, paymentAPI, visitorAPI, complaintAPI, announcementAPI, facilityAPI, propertyAPI } from '../api/api';


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

export default function ResidentDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payingId, setPayingId] = useState(null);
    const [activeTab, setActiveTab] = useState('payment');

    // ── Visitor state ──
    const [visitors, setVisitors] = useState([]);
    const [visitorsLoading, setVisitorsLoading] = useState(false);
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [visitorName, setVisitorName] = useState('');
    const [visitorPhone, setVisitorPhone] = useState('');
    const [visitorVehicle, setVisitorVehicle] = useState('');
    const [visitorPurpose, setVisitorPurpose] = useState('GUEST');
    const [addingVisitor, setAddingVisitor] = useState(false);

    // ── Facility / Booking state ──
    const [activeFacilities, setActiveFacilities] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookFacilityId, setBookFacilityId] = useState('');
    const [bookDate, setBookDate] = useState('');
    const [bookStart, setBookStart] = useState('09:00');
    const [bookEnd, setBookEnd] = useState('11:00');
    const [bookNotes, setBookNotes] = useState('');
    const [submittingBooking, setSubmittingBooking] = useState(false);

    // ── Complaint state ──
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [complaintCategory, setComplaintCategory] = useState('MAINTENANCE');
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintPriority, setComplaintPriority] = useState('MEDIUM');
    const [submittingComplaint, setSubmittingComplaint] = useState(false);

    // ── Announcements state ──
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);

    // ── Properties state ──
    const [myProperties, setMyProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitePropertyId, setInvitePropertyId] = useState(null);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteExpiry, setInviteExpiry] = useState('');
    const [invitingTenant, setInvitingTenant] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            const response = await invoiceAPI.getMyInvoices(user?.id);
            setInvoices(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchVisitors = useCallback(async () => {
        setVisitorsLoading(true);
        try {
            const response = await visitorAPI.getMyVisitors(user?.id);
            setVisitors(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load visitors');
        } finally {
            setVisitorsLoading(false);
        }
    }, [user?.id]);

    const fetchComplaints = useCallback(async () => {
        setComplaintsLoading(true);
        try {
            const response = await complaintAPI.getMyComplaints(user?.id);
            setComplaints(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load complaints');
        } finally {
            setComplaintsLoading(false);
        }
    }, [user?.id]);

    const fetchAnnouncements = useCallback(async () => {
        setAnnouncementsLoading(true);
        try {
            const response = await announcementAPI.getActive();
            setAnnouncements(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load announcements');
        } finally {
            setAnnouncementsLoading(false);
        }
    }, []);

    const fetchMyProperties = useCallback(async () => {
        setPropertiesLoading(true);
        try {
            const res = await propertyAPI.getMyProperties(user?.id);
            setMyProperties(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load my properties');
        } finally {
            setPropertiesLoading(false);
        }
    }, [user?.id]);

    const fetchFacilities = useCallback(async () => {
        setFacilitiesLoading(true);
        try {
            const [facRes, bookRes] = await Promise.all([
                facilityAPI.getActiveFacilities(),
                facilityAPI.getMyBookings(user?.id),
            ]);
            setActiveFacilities(facRes.data);
            setMyBookings(bookRes.data);
        // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load facilities'); }
        finally { setFacilitiesLoading(false); }
    }, [user?.id]);

    const handleBookFacility = async (e) => {
        e.preventDefault();
        setSubmittingBooking(true);
        try {
            await facilityAPI.createBooking(user?.id, {
                facilityId: Number(bookFacilityId),
                bookingDate: bookDate,
                startTime: bookStart,
                endTime: bookEnd,
                notes: bookNotes,
            });
            setBookFacilityId(''); setBookDate(''); setBookStart('09:00'); setBookEnd('11:00'); setBookNotes('');
            setShowBookingForm(false);
            fetchFacilities();
            toast.success('Booking submitted! Awaiting admin approval.');
        } catch (e) { 
            toast.error(e.response?.data?.message || 'Failed to submit booking. Try again.'); 
        }
        finally { setSubmittingBooking(false); }
    };

    useEffect(() => {
        fetchInvoices();
        fetchVisitors();
        fetchComplaints();
        fetchAnnouncements();
        fetchMyProperties();
    }, [fetchInvoices, fetchVisitors, fetchComplaints, fetchAnnouncements, fetchMyProperties]);

    const handleInviteTenant = async (e) => {
        e.preventDefault();
        setInvitingTenant(true);
        try {
            const res = await propertyAPI.inviteTenant(user?.id, invitePropertyId, {
                invitedName: inviteName,
                invitedEmail: inviteEmail,
                leaseExpiryDate: inviteExpiry
            });
            setGeneratedCode(res.data.inviteCode);
            toast.success(res.data.message || "Invitation sent successfully!");
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to generate invite");
        } finally {
            setInvitingTenant(false);
        }
    };

    const handlePay = async (invoice) => {
        setPayingId(invoice.invoiceId);
        try {
            const orderRes = await paymentAPI.createOrder({
                invoiceId: invoice.invoiceId,
                amount: invoice.totalAmount,
            });
            const { orderId, amount, currency, keyId, customerName, customerEmail, customerPhone } = orderRes.data;
            const options = {
                key: keyId, amount: amount * 100, currency,
                name: 'Gated Community',
                description: `Maintenance - ${invoice.monthYear}`,
                order_id: orderId,
                prefill: { name: customerName, email: customerEmail, contact: customerPhone || '' },
                theme: { color: '#6366f1' },
                handler: async function (response) {
                    try {
                        const verifyRes = await paymentAPI.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            invoiceId: invoice.invoiceId,
                        });
                        if (verifyRes.data.success) {
                            toast.success('Payment successful! Receipt sent to your email.');
                            fetchInvoices();
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        toast.error('Error verifying payment.');
                    }
                },
                modal: { ondismiss: function () { setPayingId(null); } }
            };
            const razor = new window.Razorpay(options);
            razor.open();
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to initiate payment. Try again.');
            setPayingId(null);
        }
    };

    const handleAddVisitor = async (e) => {
        e.preventDefault();
        setAddingVisitor(true);
        try {
            await visitorAPI.preApproveVisitor(user?.id, {
                visitorName, visitorPhone, visitorVehicle, purpose: visitorPurpose,
            });
            setVisitorName(''); setVisitorPhone(''); setVisitorVehicle('');
            setShowVisitorForm(false);
            fetchVisitors();
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to add visitor');
        } finally {
            setAddingVisitor(false);
        }
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setSubmittingComplaint(true);
        try {
            await complaintAPI.raiseComplaint(user?.id, {
                category: complaintCategory,
                subject: complaintSubject,
                description: complaintDescription,
                priority: complaintPriority,
            });
            setComplaintCategory('MAINTENANCE');
            setComplaintSubject('');
            setComplaintDescription('');
            setComplaintPriority('MEDIUM');
            setShowComplaintForm(false);
            fetchComplaints();
            toast.success('Complaint submitted successfully!');
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to submit complaint. Try again.');
        } finally {
            setSubmittingComplaint(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const pendingInvoices = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
    const paidInvoices = invoices.filter(i => i.status === 'PAID');

    const getComplaintStatusColor = (status) => {
        const map = {
            'OPEN': { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
            'IN_PROGRESS': { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
            'RESOLVED': { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
            'CLOSED': { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' },
        };
        return map[status] || { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' };
    };

    const getPriorityColor = (priority) => {
        const map = { 'LOW': '#10b981', 'MEDIUM': '#f59e0b', 'HIGH': '#ef4444', 'URGENT': '#7c3aed' };
        return map[priority] || '#94a3b8';
    };

    const getAnnouncementTypeColor = (type) => {
        const map = { 'GENERAL': '#6366f1', 'MAINTENANCE': '#f59e0b', 'EMERGENCY': '#ef4444', 'EVENT': '#10b981' };
        return map[type] || '#6366f1';
    };

    // ✅ emergency announcements shown in nav
    const emergencyAnnouncements = announcements.filter(a => a.type === 'EMERGENCY');

    const tabStyle = (tab) => ({
        padding: '1rem 2rem', background: 'none', border: 'none', cursor: 'pointer',
        color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem'
    });

    return (
        <div className="app-container">
            <nav className="glass-panel dashboard-nav animate-fade-in">
                <div className="nav-brand">
                    <Home color="var(--accent-primary)" size={24} />
                    <span>My Portal</span>
                </div>
                <div className="nav-actions">
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                        Welcome, {user?.name}
                    </span>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            {/* ✅ Emergency announcements banner */}
            {emergencyAnnouncements.map(a => (
                <div key={a.id} style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: '8px', padding: '0.75rem 1.25rem',
                    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <AlertCircle size={16} color="#ef4444" />
                    <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>🚨 {a.title}:</strong>
                    <span style={{ fontSize: '0.9rem' }}>{a.content}</span>
                </div>
            ))}

            {/* Tabs */}
            <div className="glass-panel" style={{ padding: '0', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('payment')} style={tabStyle('payment')}>
                        <CreditCard size={16} /> Payments
                    </button>
                    <button onClick={() => { setActiveTab('visitors'); fetchVisitors(); }} style={tabStyle('visitors')}>
                        <Shield size={16} /> Visitors ({visitors.length})
                    </button>
                    <button onClick={() => { setActiveTab('complaints'); fetchComplaints(); }} style={tabStyle('complaints')}>
                        <MessageSquare size={16} /> Complaints ({complaints.length})
                    </button>
                    <button onClick={() => { setActiveTab('announcements'); fetchAnnouncements(); }} style={tabStyle('announcements')}>
                        <Megaphone size={16} /> Notices
                        {announcements.length > 0 && (
                            <span style={{ background: '#6366f1', color: 'white', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', marginLeft: '4px' }}>
                                {announcements.length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { setActiveTab('facilities'); fetchFacilities(); }} style={tabStyle('facilities')}>
                        <Dumbbell size={16} /> Book Amenity
                    </button>
                    <button onClick={() => { setActiveTab('properties'); fetchMyProperties(); }} style={tabStyle('properties')}>
                        <Home size={16} /> My Properties
                    </button>
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15, position: 'absolute', width: '100%' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >

            {loading && <div className="skeleton-loader tall"></div>}
            {error && <p style={{ color: 'var(--accent-danger)', textAlign: 'center' }}>{error}</p>}

            {/* ── My Properties Tab ── */}
            {activeTab === 'properties' && !propertiesLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {myProperties.map(prop => (
                        <GlowCard key={prop.id} style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Block {prop.block} - Unit {prop.unitNumber}</h3>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Role: {prop.ownerId === user?.id ? 'Owner' : 'Tenant'}
                                        {prop.ownerId === user?.id && !prop.tenantId && (
                                            <span style={{ marginLeft: '8px', color: 'var(--accent-primary)' }}>• Self-occupied</span>
                                        )}
                                    </p>
                                </div>
                                {prop.ownerId === user?.id && !prop.tenantId && (
                                    <button className="btn btn-primary" onClick={() => { setInvitePropertyId(prop.id); setGeneratedCode(null); setShowInviteModal(true); }}>
                                        <Plus size={16} /> Invite Tenant
                                    </button>
                                )}
                            </div>
                            {prop.ownerId === user?.id && prop.tenantId && (
                                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Current Tenant:</strong> {prop.tenantName} ({prop.tenantEmail})</p>
                                </div>
                            )}
                            {prop.tenantId === user?.id && prop.ownerId && (
                                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Landlord:</strong> {prop.ownerName} ({prop.ownerEmail})</p>
                                </div>
                            )}
                        </GlowCard>
                    ))}
                    {myProperties.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You are not assigned to any property yet.</p>
                    )}
                </div>
            )}

            {/* ── Payment Tab ── */}
            {activeTab === 'payment' && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Pending Invoices Section */}
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={24} /> Pending Payments
                            {pendingInvoices.length > 0 && (
                                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 12px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {pendingInvoices.length}
                                </span>
                            )}
                        </h2>
                        
                        {pendingInvoices.length === 0 ? (
                            <GlowCard className="stagger-1" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <CheckCircle size={48} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
                                <h2 style={{ marginBottom: '0.5rem' }}>All Paid!</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>You have no pending dues.</p>
                            </GlowCard>
                        ) : (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {pendingInvoices.map((invoice) => (
                                    <GlowCard key={invoice.invoiceId} className="stagger-1" style={{ 
                                        padding: '2rem', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        background: invoice.status === 'OVERDUE' 
                                            ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(30,41,59,0.8) 100%)'
                                            : 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                                        border: invoice.status === 'OVERDUE' ? '1px solid rgba(239, 68, 68, 0.3)' : undefined
                                    }}>
                                        {/* Property Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Home size={16} color="var(--accent-primary)" />
                                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                                    {invoice.block}-{invoice.unitNumber}
                                                </span>
                                            </div>
                                            {myProperties.find(p => p.id === invoice.propertyId) && (
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    background: 'rgba(99, 102, 241, 0.3)', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {myProperties.find(p => p.id === invoice.propertyId)?.ownerId === user?.id ? 'Owner' : 'Tenant'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Amount */}
                                        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: '600' }}>
                                                Amount Due
                                            </p>
                                            <h1 style={{ 
                                                fontSize: '2.5rem', 
                                                marginBottom: '0.5rem', 
                                                background: '-webkit-linear-gradient(0deg, #f8fafc, #94a3b8)', 
                                                WebkitBackgroundClip: 'text', 
                                                WebkitTextFillColor: 'transparent' 
                                            }}>
                                                ₹{invoice.totalAmount?.toFixed(2)}
                                            </h1>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {invoice.monthYear} Maintenance
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Due by {invoice.dueDate}
                                            </p>
                                        </div>

                                        {/* Overdue Warning */}
                                        {invoice.status === 'OVERDUE' && (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '8px', 
                                                color: '#ef4444', 
                                                marginBottom: '1rem',
                                                padding: '0.5rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                <AlertCircle size={16} /> OVERDUE
                                            </div>
                                        )}

                                        {/* Pay Button */}
                                        <button 
                                            className="btn btn-primary"
                                            style={{ 
                                                padding: '0.875rem 1.5rem', 
                                                fontSize: '0.95rem', 
                                                borderRadius: 'var(--radius-full)', 
                                                opacity: payingId ? 0.7 : 1,
                                                width: '100%'
                                            }}
                                            onClick={() => handlePay(invoice)} 
                                            disabled={!!payingId}
                                        >
                                            <CreditCard size={18} />
                                            {payingId === invoice.invoiceId ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </GlowCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment History Section */}
                    <div className="glass-panel stagger-2" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} color="var(--accent-success)" /> Payment History
                        </h2>
                        {paidInvoices.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No payment history yet.</p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {paidInvoices.map((invoice) => (
                                <div key={invoice.invoiceId} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '50%' }}>
                                            <CheckCircle color="var(--accent-success)" size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1rem' }}>{invoice.monthYear} Maintenance</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                Property: {invoice.block}-{invoice.unitNumber}
                                                {myProperties.find(p => p.id === invoice.propertyId) && (
                                                    <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                        {myProperties.find(p => p.id === invoice.propertyId)?.ownerId === user?.id ? 'Owner' : 'Tenant'}
                                                    </span>
                                                )}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <CheckCircle size={12} /> Paid
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹{invoice.totalAmount?.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Visitors Tab ── */}
            {activeTab === 'visitors' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>My Visitors</h2>
                        <button className="btn btn-primary" onClick={() => setShowVisitorForm(!showVisitorForm)}>
                            <Plus size={16} /> Pre-approve Visitor
                        </button>
                    </div>
                    {showVisitorForm && (
                        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>New Visitor</h3>
                            <form onSubmit={handleAddVisitor} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div>
                                    <label className="input-label">Visitor Name</label>
                                    <input className="input-field" placeholder="John Doe" value={visitorName}
                                        onChange={e => setVisitorName(e.target.value)} required style={{ width: '150px' }} />
                                </div>
                                <div>
                                    <label className="input-label">Phone</label>
                                    <input className="input-field" placeholder="9876543210" value={visitorPhone}
                                        onChange={e => setVisitorPhone(e.target.value)} required style={{ width: '130px' }} />
                                </div>
                                <div>
                                    <label className="input-label">Vehicle (optional)</label>
                                    <input className="input-field" placeholder="TS09AB1234" value={visitorVehicle}
                                        onChange={e => setVisitorVehicle(e.target.value)} style={{ width: '130px' }} />
                                </div>
                                <div>
                                    <label className="input-label">Purpose</label>
                                    <select className="input-field" value={visitorPurpose}
                                        onChange={e => setVisitorPurpose(e.target.value)} style={{ width: '130px' }}>
                                        <option value="GUEST">Guest</option>
                                        <option value="DELIVERY">Delivery</option>
                                        <option value="SERVICE">Service</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={addingVisitor}>
                                    {addingVisitor ? 'Adding...' : 'Pre-approve'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowVisitorForm(false)}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                    {visitorsLoading && <div className="skeleton-loader tall"></div>}
                    {!visitorsLoading && visitors.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No visitors yet. Pre-approve one above.</p>
                    )}
                    {!visitorsLoading && visitors.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {visitors.map(v => (
                                <div key={v.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ marginBottom: '4px' }}>{v.visitorName}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {v.purpose} • {v.visitorPhone} {v.visitorVehicle ? `• ${v.visitorVehicle}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            background: v.status === 'ENTERED' ? 'rgba(16,185,129,0.2)' : v.status === 'APPROVED' ? 'rgba(99,102,241,0.2)' : 'rgba(148,163,184,0.2)',
                                            color: v.status === 'ENTERED' ? '#10b981' : v.status === 'APPROVED' ? '#6366f1' : '#94a3b8',
                                            padding: '4px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px'
                                        }}>
                                            {v.status}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Token: <code>{v.entryToken}</code>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Complaints Tab ── */}
            {activeTab === 'complaints' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>My Complaints</h2>
                        <button className="btn btn-primary" onClick={() => setShowComplaintForm(!showComplaintForm)}>
                            <Plus size={16} /> Raise Complaint
                        </button>
                    </div>
                    {showComplaintForm && (
                        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>New Complaint</h3>
                            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <label className="input-label">Category</label>
                                        <select className="input-field" value={complaintCategory}
                                            onChange={e => setComplaintCategory(e.target.value)} style={{ width: '160px' }}>
                                            <option value="MAINTENANCE">Maintenance</option>
                                            <option value="NOISE">Noise</option>
                                            <option value="SECURITY">Security</option>
                                            <option value="BILLING">Billing</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">Priority</label>
                                        <select className="input-field" value={complaintPriority}
                                            onChange={e => setComplaintPriority(e.target.value)} style={{ width: '130px' }}>
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label className="input-label">Subject</label>
                                        <input className="input-field" placeholder="Brief description of issue"
                                            value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)}
                                            required style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Description</label>
                                    <textarea className="input-field" placeholder="Describe the issue in detail..."
                                        value={complaintDescription} onChange={e => setComplaintDescription(e.target.value)}
                                        required rows={4} style={{ width: '100%', resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submittingComplaint}>
                                        {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowComplaintForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {complaintsLoading && <div className="skeleton-loader tall"></div>}
                    {!complaintsLoading && complaints.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No complaints yet.</p>
                    )}
                    {!complaintsLoading && complaints.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {complaints.map(c => (
                                <div key={c.id} className="glass-card" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '4px' }}>{c.subject}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                color: getPriorityColor(c.priority),
                                                padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                                                background: `${getPriorityColor(c.priority)}20`
                                            }}>
                                                {c.priority}
                                            </span>
                                            <span style={{
                                                background: getComplaintStatusColor(c.status).bg,
                                                color: getComplaintStatusColor(c.status).color,
                                                padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                                            }}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: c.adminResponse ? '0.75rem' : '0' }}>
                                        {c.description}
                                    </p>
                                    {c.adminResponse && (
                                        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '4px' }}>Admin Response:</p>
                                            <p style={{ fontSize: '0.875rem' }}>{c.adminResponse}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Announcements Tab ── */}
            {activeTab === 'announcements' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '2rem' }}>Community Notices</h2>
                    {announcementsLoading && <div className="skeleton-loader tall"></div>}
                    {!announcementsLoading && announcements.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No active announcements.</p>
                    )}
                    {!announcementsLoading && announcements.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {announcements.map(a => (
                                <div key={a.id} className="glass-card" style={{
                                    padding: '1.25rem',
                                    borderLeft: `4px solid ${getAnnouncementTypeColor(a.type)}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{
                                            background: `${getAnnouncementTypeColor(a.type)}20`,
                                            color: getAnnouncementTypeColor(a.type),
                                            padding: '2px 8px', borderRadius: '999px',
                                            fontSize: '0.75rem', fontWeight: '600'
                                        }}>
                                            {a.type}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(a.createdAt).toLocaleDateString()} • By {a.createdByName}
                                        </span>
                                    </div>
                                    <h4 style={{ marginBottom: '8px' }}>{a.title}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{a.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Facilities Tab ── */}
            {activeTab === 'facilities' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>Book an Amenity</h2>
                        <button className="btn btn-primary" onClick={() => setShowBookingForm(!showBookingForm)}>
                            <Plus size={16} /> New Booking
                        </button>
                    </div>

                    {showBookingForm && (
                        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Book a Facility</h3>
                            <form onSubmit={handleBookFacility} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <label className="input-label">Facility</label>
                                        <select className="input-field" value={bookFacilityId} onChange={e => setBookFacilityId(e.target.value)} required style={{ width: '200px' }}>
                                            <option value="">Select facility...</option>
                                            {activeFacilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="input-label">Date</label>
                                        <input type="date" className="input-field" value={bookDate} onChange={e => setBookDate(e.target.value)} required style={{ width: '160px' }} /></div>
                                    <div><label className="input-label">Start Time</label>
                                        <input type="time" className="input-field" value={bookStart} onChange={e => setBookStart(e.target.value)} required style={{ width: '120px' }} /></div>
                                    <div><label className="input-label">End Time</label>
                                        <input type="time" className="input-field" value={bookEnd} onChange={e => setBookEnd(e.target.value)} required style={{ width: '120px' }} /></div>
                                </div>
                                <div><label className="input-label">Notes (optional)</label>
                                    <input className="input-field" placeholder="Any special requests..." value={bookNotes} onChange={e => setBookNotes(e.target.value)} style={{ width: '100%' }} /></div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submittingBooking}>{submittingBooking ? 'Submitting...' : 'Submit Booking'}</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        Available Facilities
                    </h3>
                    {facilitiesLoading && <div className="skeleton-loader tall"></div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {activeFacilities.map(f => (
                            <div key={f.id} className="glass-card" style={{ padding: '1.25rem' }}>
                                <h4 style={{ marginBottom: '0.4rem' }}>{f.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{f.description}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                                    <span>👥 Capacity: {f.capacity ?? '—'}</span>
                                    <span>🕐 {f.openTime} – {f.closeTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        My Bookings
                    </h3>
                    {myBookings.length === 0 && !facilitiesLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No bookings yet. Make one above!</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myBookings.map(b => (
                            <div key={b.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>{b.facilityName}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {b.bookingDate} &nbsp;•&nbsp; {b.startTime} – {b.endTime}
                                    </p>
                                    {b.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{b.notes}</p>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                                        background: b.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : b.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : b.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)',
                                        color: b.status === 'APPROVED' ? '#10b981' : b.status === 'PENDING' ? '#f59e0b' : b.status === 'REJECTED' ? '#ef4444' : '#94a3b8' }}>
                                        {b.status}
                                    </span>
                                    {b.status === 'PENDING' && (
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', color: '#ef4444' }}
                                            onClick={async () => { await facilityAPI.cancelBooking(b.id); fetchFacilities(); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                </motion.div>
            </AnimatePresence>

            {/* ── Tenant Invite Modal ── */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content animate-scale-in" style={{ maxWidth: '450px', width: '100%' }}>
                        <h2 style={{ marginTop: 0 }}>Invite Tenant</h2>
                        {!generatedCode ? (
                            <form onSubmit={handleInviteTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Tenant Name</label>
                                    <input type="text" className="input-field" value={inviteName} onChange={e => setInviteName(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="input-label">Tenant Email</label>
                                    <input type="email" className="input-field" placeholder="tenant@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                        An invitation email will be sent to this address
                                    </small>
                                </div>
                                <div>
                                    <label className="input-label">Lease Expiry Date</label>
                                    <input type="date" className="input-field" value={inviteExpiry} onChange={e => setInviteExpiry(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={invitingTenant}>
                                        {invitingTenant ? 'Sending...' : 'Send Invitation'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Invitation email sent! Your tenant can also use this code to register:
                                </p>
                                <div className="input-field" style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', padding: '1rem', textAlign: 'center', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                                    {generatedCode}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Registration link: <code style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                        http://localhost:5173/register-tenant?token={generatedCode}
                                    </code>
                                </p>
                                <button className="btn btn-primary" onClick={() => { setShowInviteModal(false); setInviteName(''); setInviteEmail(''); setInviteExpiry(''); setGeneratedCode(null); }} style={{ width: '100%' }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}