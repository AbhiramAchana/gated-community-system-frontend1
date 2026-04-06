import { useState, useEffect } from 'react';
import { Users, FileText, Activity, LogOut, Bell, Sparkles, Plus, Home, Shield, MessageSquare, Megaphone, Calendar, BarChart2, Briefcase, Dumbbell, Search, Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invoiceAPI, propertyAPI, visitorAPI, userAPI, authAPI, complaintAPI, announcementAPI, facilityAPI, staffAPI, reportAPI } from '../api/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


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

export default function AdminDashboard() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    // Global Dashboard State
    const [searchQuery, setSearchQuery] = useState('');

    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);
    const [invoicesError, setInvoicesError] = useState('');
    const [properties, setProperties] = useState([]);
    const [residents, setResidents] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(true);
    const [selectedPropertyBlock, setSelectedPropertyBlock] = useState('All');
    const [propertyCurrentPage, setPropertyCurrentPage] = useState(1);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [newBlock, setNewBlock] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [newOwnerId, setNewOwnerId] = useState('');
    const [addingProperty, setAddingProperty] = useState(false);
    const [showCreateInvoice, setShowCreateInvoice] = useState(false);
    const [invoicePropertyId, setInvoicePropertyId] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceDueDate, setInvoiceDueDate] = useState('');
    const [invoiceMonthYear, setInvoiceMonthYear] = useState('');
    const [creatingInvoice, setCreatingInvoice] = useState(false);
    
    // ── Batch Invoice state ──
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchAmount, setBatchAmount] = useState('');
    const [batchDueDate, setBatchDueDate] = useState('');
    const [batchMonthYear, setBatchMonthYear] = useState('');
    const [batchGenerating, setBatchGenerating] = useState(false);

    // ── AI Insights state ──
    const [showAiModal, setShowAiModal] = useState(false);
    const [visitors, setVisitors] = useState([]);
    const [visitorsLoading, setVisitorsLoading] = useState(true);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invoices');
    const [showAddResident, setShowAddResident] = useState(false);
    const [residentName, setResidentName] = useState('');
    const [residentEmail, setResidentEmail] = useState('');
    const [residentPassword, setResidentPassword] = useState('');
    const [residentPhone, setResidentPhone] = useState('');
    const [addingResident, setAddingResident] = useState(false);

    // ── Complaints state ──
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [complaintStatus, setComplaintStatus] = useState('');
    const [updatingComplaint, setUpdatingComplaint] = useState(false);

    // ── Announcements state ──
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    const [annType, setAnnType] = useState('GENERAL');
    const [annPriority, setAnnPriority] = useState('MEDIUM');
    const [postingAnnouncement, setPostingAnnouncement] = useState(false);

    // ── Facilities state ──
    const [facilities, setFacilities] = useState([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [showFacilityForm, setShowFacilityForm] = useState(false);
    const [facName, setFacName] = useState('');
    const [facDesc, setFacDesc] = useState('');
    const [facCapacity, setFacCapacity] = useState('');
    const [facOpen, setFacOpen] = useState('06:00');
    const [facClose, setFacClose] = useState('22:00');
    const [addingFacility, setAddingFacility] = useState(false);

    // ── Staff state ──
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [staffName, setStaffName] = useState('');
    const [staffPhone, setStaffPhone] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffRole, setStaffRole] = useState('SECURITY');
    const [staffVendor, setStaffVendor] = useState('');
    const [staffJoining, setStaffJoining] = useState('');
    const [addingStaff, setAddingStaff] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // ── Reports state ──
    const [financialReport, setFinancialReport] = useState(null);
    const [reportsLoading, setReportsLoading] = useState(false);

    // ── Monthly filter ──
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // Generate all 12 months for the current year only
    const generateAvailableMonths = () => {
        const months = [];
        const year = new Date().getFullYear();
        for (let month = 0; month < 12; month++) {
            const d = new Date(year, month, 1);
            months.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
        }
        return months;
    };

    useEffect(() => {
        fetchInvoices();
        fetchProperties();
        fetchResidents();
        fetchVisitors();
        fetchPendingUsers();
        fetchComplaints();
        fetchAnnouncements();
    }, []);

    useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws`);
    const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                stompClient.subscribe('/topic/admin/complaints', () => {
                    toast('🔔 New Complaint Activity', { icon: '🛠️' });
                    fetchComplaints();
                });
                stompClient.subscribe('/topic/admin/payments', (msg) => {
                    toast.success('💰 ' + msg.body);
                    fetchInvoices();
                    fetchFinancialReport();
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            }
        });
        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const fetchFacilities = async () => {
        setFacilitiesLoading(true);
        try {
            const res = await facilityAPI.getAllFacilities();
            setFacilities(res.data);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load facilities'); }
        finally { setFacilitiesLoading(false); }
    };

    const fetchAllBookings = async () => {
        setBookingsLoading(true);
        try {
            const res = await facilityAPI.getAllBookings();
            setAllBookings(res.data);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load bookings'); }
        finally { setBookingsLoading(false); }
    };

    const fetchStaff = async () => {
        setStaffLoading(true);
        try {
            const res = await staffAPI.getAllStaff();
            setStaffList(res.data);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load staff'); }
        finally { setStaffLoading(false); }
    };

    const fetchAttendanceByDate = async (date) => {
        setAttendanceLoading(true);
        try {
            const res = await staffAPI.getAttendanceByDate(date);
            setAttendanceRecords(res.data);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load attendance'); }
        finally { setAttendanceLoading(false); }
    };

    const fetchFinancialReport = async () => {
        setReportsLoading(true);
        try {
            const res = await reportAPI.getFinancialReport(new Date().getFullYear());
            setFinancialReport(res.data);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { console.error('Failed to load report'); }
        finally { setReportsLoading(false); }
    };

    const handleAddFacility = async (e) => {
        e.preventDefault();
        setAddingFacility(true);
        try {
            await facilityAPI.createFacility({ name: facName, description: facDesc, capacity: Number(facCapacity), openTime: facOpen, closeTime: facClose });
            setFacName(''); setFacDesc(''); setFacCapacity(''); setFacOpen('06:00'); setFacClose('22:00');
            setShowFacilityForm(false);
            fetchFacilities();
            // eslint-disable-next-line no-unused-vars
        } catch (e) { toast.error('Failed to add facility'); }
        finally { setAddingFacility(false); }
    };

    const handleToggleFacility = async (id) => {
        try { await facilityAPI.toggleFacility(id); fetchFacilities(); }
        // eslint-disable-next-line no-unused-vars
        catch (e) { toast.error('Failed to toggle facility'); }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try { await facilityAPI.updateBookingStatus(bookingId, status); fetchAllBookings(); }
        // eslint-disable-next-line no-unused-vars
        catch (e) { toast.error('Failed to update booking'); }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try { 
            await facilityAPI.deleteBooking(bookingId); 
            toast.success('Booking deleted');
            fetchAllBookings(); 
        }
        // eslint-disable-next-line no-unused-vars
        catch (e) { toast.error('Failed to delete booking'); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setAddingStaff(true);
        try {
            await staffAPI.addStaff({ name: staffName, phone: staffPhone, email: staffEmail, role: staffRole, vendorCompany: staffVendor, joiningDate: staffJoining || null });
            setStaffName(''); setStaffPhone(''); setStaffEmail(''); setStaffRole('SECURITY'); setStaffVendor(''); setStaffJoining('');
            setShowStaffForm(false);
            fetchStaff();
            // eslint-disable-next-line no-unused-vars
        } catch (e) { toast.error('Failed to add staff'); }
        finally { setAddingStaff(false); }
    };

    const handleMarkAttendance = async (staffId, status) => {
        try {
            await staffAPI.markAttendance({ staffId, date: attendanceDate, status });
            fetchAttendanceByDate(attendanceDate);
            // eslint-disable-next-line no-unused-vars
        } catch (e) { toast.error('Failed to mark attendance'); }
    };

    const fetchInvoices = async () => {
    try {
        const response = await invoiceAPI.getAllInvoices();
        // Sort by status (PENDING first), then by due date (newest first)
        const sorted = response.data.sort((a, b) => {
            // First, sort by status (PENDING before PAID)
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            // Then sort by due date (newest first)
            return new Date(b.dueDate) - new Date(a.dueDate);
        });
        setInvoices(sorted);
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        setInvoicesError('Failed to load invoices');
    } finally {
        setInvoicesLoading(false);
    }
};


    const fetchProperties = async () => {
        try {
            const response = await propertyAPI.getAllProperties();
            setProperties(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load properties');
        } finally {
            setPropertiesLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            const response = await propertyAPI.getAllResidents();
            setResidents(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load residents');
        }
    };

    const fetchVisitors = async () => {
        try {
            const response = await visitorAPI.getAllVisitors();
            setVisitors(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load visitors');
        } finally {
            setVisitorsLoading(false);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const response = await userAPI.getPendingUsers();
            setPendingUsers(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load pending users');
        } finally {
            setPendingLoading(false);
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await complaintAPI.getAllComplaints();
            setComplaints(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load complaints');
        } finally {
            setComplaintsLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementAPI.getAll();
            setAnnouncements(response.data);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            console.error('Failed to load announcements');
        } finally {
            setAnnouncementsLoading(false);
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        setPostingAnnouncement(true);
        try {
            await announcementAPI.create(user?.id, {
                title: annTitle,
                content: annContent,
                type: annType,
                priority: annPriority,
            });
            setAnnTitle(''); setAnnContent('');
            setAnnType('GENERAL'); setAnnPriority('MEDIUM');
            setShowAnnouncementForm(false);
            fetchAnnouncements();
            toast.success('Announcement posted!');
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to post announcement');
        } finally {
            setPostingAnnouncement(false);
        }
    };

    const handleDeactivateAnnouncement = async (id) => {
        try {
            await announcementAPI.deactivate(id);
            fetchAnnouncements();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to deactivate announcement');
        }
    };

    const handleUpdateComplaint = async (complaintId) => {
        setUpdatingComplaint(true);
        try {
            await complaintAPI.updateComplaint(complaintId, {
                status: complaintStatus,
                adminResponse: adminResponse,
            });
            setSelectedComplaint(null);
            setAdminResponse('');
            setComplaintStatus('');
            fetchComplaints();
            toast.success('Complaint updated successfully!');
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to update complaint');
        } finally {
            setUpdatingComplaint(false);
        }
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        setAddingProperty(true);
        try {
            await propertyAPI.createProperty({
                block: newBlock, unitNumber: newUnit,
                ownerId: newOwnerId ? Number(newOwnerId) : null,
            });
            setNewBlock(''); setNewUnit(''); setNewOwnerId('');
            setShowAddProperty(false);
            fetchProperties();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to create property');
        } finally {
            setAddingProperty(false);
        }
    };

    const handleAssignOwner = async (propertyId, ownerId) => {
        try {
            if (!ownerId) {
                await propertyAPI.unassignOwner(propertyId);
                toast.success('Owner unassigned successfully');
            } else {
                await propertyAPI.assignOwner(propertyId, ownerId);
                toast.success('Owner assigned successfully');
            }
            fetchProperties();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to update owner assignment');
        }
    };

    const handleAssignTenant = async (propertyId, tenantId) => {
        try {
            if (tenantId === 'OWNER_OCCUPIED') {
                // Owner occupied - just unassign tenant if any
                if (properties.find(p => p.id === propertyId)?.tenantId) {
                    await propertyAPI.unassignTenant(propertyId);
                    toast.success('Property marked as owner occupied');
                } else {
                    toast.info('Property is already owner occupied');
                }
            } else if (!tenantId) {
                await propertyAPI.unassignTenant(propertyId);
                toast.success('Tenant unassigned successfully');
            } else {
                await propertyAPI.assignTenant(propertyId, tenantId);
                toast.success('Tenant assigned successfully');
            }
            fetchProperties();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to update tenant assignment');
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
        try {
            await invoiceAPI.deleteInvoice(invoiceId);
            toast.success('Invoice deleted successfully');
            fetchInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete invoice. Paid invoices cannot be deleted.');
        }
    };

    const handleRemoveTenant = async (propertyId) => {
        if (!window.confirm('Are you sure you want to remove the tenant?')) return;
        try {
            await propertyAPI.unassignTenant(propertyId);
            toast.success('Tenant removed successfully');
            fetchProperties();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { toast.error('Failed to remove tenant'); }
    };

    const handleDeleteProperty = async (id) => {
        if (!window.confirm('Are you sure you want to completely delete this property?')) return;
        try {
            await propertyAPI.deleteProperty(id);
            toast.success('Property deleted successfully!');
            fetchProperties();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cannot delete property. It likely has tied invoices.');
        }
    };

    const handleDeleteResident = async (residentId) => {
        if (!window.confirm('Are you sure you want to permanently delete this resident? This will remove them from all properties.')) return;
        try {
            await propertyAPI.deactivateResident(residentId);
            toast.success('Resident deleted successfully');
            fetchResidents();
            fetchProperties();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete resident');
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        setCreatingInvoice(true);
        try {
            await invoiceAPI.createInvoice({
                propertyId: Number(invoicePropertyId), amount: Number(invoiceAmount),
                dueDate: invoiceDueDate, monthYear: invoiceMonthYear,
            });
            setShowCreateInvoice(false);
            setInvoicePropertyId(''); setInvoiceAmount('');
            setInvoiceDueDate(''); setInvoiceMonthYear('');
            fetchInvoices();
            toast.success('Invoice created successfully!');
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to create invoice');
        } finally {
            setCreatingInvoice(false);
        }
    };

    const handleGenerateBatch = async (e) => {
        e.preventDefault();
        setBatchGenerating(true);
        try {
            await invoiceAPI.triggerBilling({
                amount: Number(batchAmount),
                dueDate: batchDueDate,
                monthYear: batchMonthYear
            });
            setShowBatchModal(false);
            setBatchAmount(''); setBatchDueDate(''); setBatchMonthYear('');
            toast.success('Monthly invoices generated successfully!');
            fetchInvoices();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to generate invoices');
        } finally {
            setBatchGenerating(false);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await userAPI.approveUser(userId);
            fetchPendingUsers(); fetchResidents();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to approve user');
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await userAPI.rejectUser(userId);
            fetchPendingUsers();
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to reject user');
        }
    };

    const handleAddResident = async (e) => {
        e.preventDefault();
        setAddingResident(true);
        try {
            await authAPI.register({
                name: residentName, email: residentEmail,
                password: residentPassword, role: 'RESIDENT', phone: residentPhone,
            });
            const allUsers = await userAPI.getAllUsers();
            const newUser = allUsers.data.find(u => u.email === residentEmail);
            if (newUser) await userAPI.approveUser(newUser.id);
            setResidentName(''); setResidentEmail('');
            setResidentPassword(''); setResidentPhone('');
            setShowAddResident(false);
            fetchResidents(); fetchPendingUsers();
            alert(`Resident ${residentName} added and approved successfully!`);
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to add resident. Email may already exist.');
        } finally {
            setAddingResident(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getStatusBadge = (status) => {
        const map = { 'PAID': 'badge-paid', 'PENDING': 'badge-pending', 'OVERDUE': 'badge-overdue' };
        return map[status] || 'badge-pending';
    };

    const getComplaintStatusColor = (status) => {
        const map = {
            'OPEN': { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
            'IN_PROGRESS': { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
            'RESOLVED': { bg: 'rgba(16,185,129,0.2)', color: '#10b981' },
            'CLOSED': { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' },
        };
        return map[status] || { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' };
    };

    const getAnnouncementTypeColor = (type) => {
        const map = {
            'GENERAL': '#6366f1',
            'MAINTENANCE': '#f59e0b',
            'EMERGENCY': '#ef4444',
            'EVENT': '#10b981',
        };
        return map[type] || '#6366f1';
    };

    const openComplaints = complaints.filter(c => c.status === 'OPEN').length;


    // ✅ Global Search Computed Lists
    const filteredSearchInvoices = invoices.filter(i => 
        [i.residentName, i.status, i.block, i.unitNumber, `INV-${i.invoiceId}`].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSearchProperties = properties.filter(p => 
        [p.ownerName, p.tenantName, p.block, p.unitNumber].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const uniqueBlocks = ['All', ...new Set(properties.map(p => p.block))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
    });
    const blockFilteredProperties = selectedPropertyBlock === 'All' 
        ? filteredSearchProperties 
        : filteredSearchProperties.filter(p => p.block === selectedPropertyBlock);
    
    // Sort properties alphabetically by block, then by unit number
    const sortedProperties = [...blockFilteredProperties].sort((a, b) => {
        const blockCompare = a.block.localeCompare(b.block);
        if (blockCompare !== 0) return blockCompare;
        // Sort unit numbers numerically if possible, otherwise alphabetically
        const aUnit = parseInt(a.unitNumber) || 0;
        const bUnit = parseInt(b.unitNumber) || 0;
        if (aUnit && bUnit) return aUnit - bUnit;
        return a.unitNumber.localeCompare(b.unitNumber);
    });
    
    // Pagination logic
    const propertiesPerPage = 10;
    const totalPropertyPages = Math.ceil(sortedProperties.length / propertiesPerPage);
    const paginatedProperties = sortedProperties.slice(
        (propertyCurrentPage - 1) * propertiesPerPage,
        propertyCurrentPage * propertiesPerPage
    );

    const filteredSearchComplaints = complaints.filter(c => 
        [c.residentName, c.subject, c.category, c.status].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // ✅ System Analytics Data

    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const occupiedPropertiesCount = properties.filter(p => p.ownerId || p.tenantId).length;
    const occupancyRate = properties.length > 0 ? ((occupiedPropertiesCount / properties.length) * 100).toFixed(1) : 0;
    const totalOverdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.totalAmount, 0);
    const unassignedPropertiesCount = properties.length - occupiedPropertiesCount;

    // ✅ Monthly filter for stats
    const filteredInvoices = invoices.filter(i => i.monthYear === selectedMonth);
    const totalCollected = filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPending = filteredInvoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
    const overdueCount = filteredInvoices.filter(i => i.status === 'OVERDUE').length;

    // ✅ All months for dropdown (current year + previous year)
    const availableMonths = generateAvailableMonths();

    const tabStyle = (tab) => ({
        padding: '0.75rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer',
        color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
        borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
        whiteSpace: 'nowrap', flexShrink: 0, transition: 'color 0.2s'
    });

    return (
        <div className="app-container">
            <nav className="glass-panel dashboard-nav animate-fade-in">
                <div className="nav-brand">
                    <Activity color="var(--accent-primary)" size={24} />
                    <span>Admin Portal</span>
                </div>
                
                <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
                    <Search color="var(--text-secondary)" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search invoices, properties, or helpdesk..." 
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '999px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'white', outline: 'none' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="nav-actions">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <Bell size={18} />
                    </button>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            {/* ✅ Monthly filter selector */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing stats for:</span>
                <select className="input-field" value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    style={{ width: '180px', padding: '0.4rem 0.75rem' }}>
                    {availableMonths.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid-cards stagger-1">
                <GlowCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Collections</h3>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '8px' }}>
                            <Activity color="var(--accent-success)" size={20} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>₹{totalCollected.toFixed(2)}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{selectedMonth}</p>
                </GlowCard>
                <GlowCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Pending Dues</h3>
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>
                            <FileText color="var(--accent-danger)" size={20} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>₹{totalPending.toFixed(2)}</h2>
                    <p style={{ fontSize: '0.85rem' }}>{overdueCount} overdue • {selectedMonth}</p>
                </GlowCard>
                <GlowCard style={{ border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} /> Quick Analytics
                        </h3>
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Community occupancy is at <strong>{occupancyRate}%</strong> with {openComplaints > 0 ? ` ${openComplaints} open helpdesk tickets requiring attention.` : ' no pending helpdesk tickets!'}
                    </p>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={() => setShowAiModal(true)}>
                        View Detailed Report
                    </button>
                </GlowCard>
            </div>

            {/* Tabs */}
            <div className="glass-panel stagger-2" style={{ padding: '0' }}>
                <div className="tab-strip" style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--glass-border)',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flexWrap: 'nowrap',
                    scrollbarWidth: 'none',   /* Firefox */
                    msOverflowStyle: 'none',  /* IE/Edge */
                }}>
                    <button onClick={() => setActiveTab('invoices')} style={tabStyle('invoices')}>
                        <FileText size={16} /> Invoices
                    </button>
                    <button onClick={() => setActiveTab('properties')} style={tabStyle('properties')}>
                        <Home size={16} /> Properties ({properties.length})
                    </button>
                    <button onClick={() => { setActiveTab('visitors'); fetchVisitors(); }} style={tabStyle('visitors')}>
                        <Shield size={16} /> Visitors ({visitors.length})
                    </button>
                    <button onClick={() => { setActiveTab('helpdesk'); fetchComplaints(); }} style={tabStyle('helpdesk')}>
                        <MessageSquare size={16} /> Helpdesk
                        {openComplaints > 0 && (
                            <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', marginLeft: '4px' }}>
                                {openComplaints}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { setActiveTab('announcements'); fetchAnnouncements(); }} style={tabStyle('announcements')}>
                        <Megaphone size={16} /> Announcements
                    </button>
                    <button onClick={() => { setActiveTab('users'); fetchPendingUsers(); }} style={tabStyle('users')}>
                        <Users size={16} /> Residents
                        {pendingUsers.length > 0 && (
                            <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', marginLeft: '4px' }}>
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { setActiveTab('facilities'); fetchFacilities(); fetchAllBookings(); }} style={tabStyle('facilities')}>
                        <Dumbbell size={16} /> Facilities
                    </button>
                    <button onClick={() => { setActiveTab('staff'); fetchStaff(); fetchAttendanceByDate(attendanceDate); }} style={tabStyle('staff')}>
                        <Briefcase size={16} /> Staff
                    </button>
                    <button onClick={() => { setActiveTab('reports'); fetchFinancialReport(); }} style={tabStyle('reports')}>
                        <BarChart2 size={16} /> Reports
                    </button>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >

                {/* ── Invoices Tab ── */}
                {activeTab === 'invoices' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Recent Invoices</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={() => setShowCreateInvoice(!showCreateInvoice)}>
                                    <Plus size={16} /> Create Invoice
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowBatchModal(!showBatchModal)}>
                                    <Users size={16} /> Generate Monthly Batch
                                </button>
                            </div>
                        </div>

                        {showCreateInvoice && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Create Invoice</h3>
                                <form onSubmit={handleCreateInvoice} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div>
                                        <label className="input-label">Property</label>
                                        <select className="input-field" value={invoicePropertyId}
                                            onChange={e => setInvoicePropertyId(e.target.value)} required style={{ width: '200px' }}>
                                            <option value="">Select Property</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.block}-{p.unitNumber} ({p.residentName})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">Amount (₹)</label>
                                        <input className="input-field" type="number" placeholder="2500"
                                            value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)}
                                            required style={{ width: '120px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Due Date</label>
                                        <input className="input-field" type="date" value={invoiceDueDate}
                                            onChange={e => setInvoiceDueDate(e.target.value)} required style={{ width: '150px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Month/Year</label>
                                        <input className="input-field" placeholder="April 2026" value={invoiceMonthYear}
                                            onChange={e => setInvoiceMonthYear(e.target.value)} required style={{ width: '130px' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={creatingInvoice}>
                                        {creatingInvoice ? 'Creating...' : 'Create Invoice'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateInvoice(false)}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}

                        {showBatchModal && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={16} color="var(--accent-primary)" /> Generate Monthly Batch
                                </h3>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                    This will generate invoices for all properties currently assigned to residents.
                                </p>
                                <form onSubmit={handleGenerateBatch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div>
                                        <label className="input-label">Amount (₹)</label>
                                        <input className="input-field" type="number" placeholder="2500"
                                            value={batchAmount} onChange={e => setBatchAmount(e.target.value)}
                                            required style={{ width: '120px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Due Date</label>
                                        <input className="input-field" type="date" value={batchDueDate}
                                            onChange={e => setBatchDueDate(e.target.value)} required style={{ width: '150px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Month/Year</label>
                                        <input className="input-field" placeholder="April 2026" value={batchMonthYear}
                                            onChange={e => setBatchMonthYear(e.target.value)} required style={{ width: '130px' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={batchGenerating}>
                                        {batchGenerating ? 'Generating...' : 'Generate Batch'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}

                        {invoicesLoading && <div className="skeleton-loader tall"></div>}
                        {invoicesError && <p style={{ color: 'var(--accent-danger)', textAlign: 'center' }}>{invoicesError}</p>}
                        {!invoicesLoading && !invoicesError && invoices.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No invoices found.</p>
                        )}
                        {!invoicesLoading && invoices.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Invoice ID</th><th>Unit</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Month</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredSearchInvoices.map((invoice) => (
                                            <tr key={invoice.invoiceId}>
                                                <td>INV-{invoice.invoiceId}</td>
                                                <td>{invoice.block}-{invoice.unitNumber}</td>
                                                <td>₹{invoice.totalAmount?.toFixed(2)}</td>
                                                <td>{invoice.dueDate}</td>
                                                <td><span className={`badge ${getStatusBadge(invoice.status)}`}>{invoice.status}</span></td>
                                                <td>{invoice.monthYear}</td>
                                                <td>
                                                    {invoice.status !== 'PAID' && (
                                                        <button 
                                                            className="btn btn-secondary" 
                                                            style={{ padding: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} 
                                                            onClick={() => handleDeleteInvoice(invoice.invoiceId)} 
                                                            title="Delete Invoice">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Properties Tab ── */}
                {activeTab === 'properties' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2>Properties</h2>
                                <select className="input-field" style={{ padding: '0.4rem 0.75rem', width: 'auto' }}
                                    value={selectedPropertyBlock} onChange={e => { setSelectedPropertyBlock(e.target.value); setPropertyCurrentPage(1); }}>
                                    {uniqueBlocks.map(b => <option key={b} value={b}>{b === 'All' ? 'All Blocks' : `Block ${b}`}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowAddProperty(!showAddProperty)}>
                                <Plus size={16} /> Add Property
                            </button>
                        </div>
                        {showAddProperty && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>New Property</h3>
                                <form onSubmit={handleAddProperty} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div>
                                        <label className="input-label">Block</label>
                                        <input className="input-field" placeholder="e.g. A" value={newBlock}
                                            onChange={e => setNewBlock(e.target.value)} required style={{ width: '100px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Unit Number</label>
                                        <input className="input-field" placeholder="e.g. 101" value={newUnit}
                                            onChange={e => setNewUnit(e.target.value)} required style={{ width: '120px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Assign Owner (optional)</label>
                                        <select className="input-field" value={newOwnerId}
                                            onChange={e => setNewOwnerId(e.target.value)} style={{ width: '200px' }}>
                                            <option value="">Unassigned</option>
                                            {residents.map(r => (
                                                <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={addingProperty}>
                                        {addingProperty ? 'Adding...' : 'Add Property'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddProperty(false)}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}
                        {propertiesLoading && <div className="skeleton-loader tall"></div>}
                        {!propertiesLoading && properties.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No properties yet.</p>
                        )}
                        {!propertiesLoading && properties.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Unit</th><th>Block</th><th>Owner</th><th>Tenant</th><th>Assign Owner</th><th>Assign Tenant</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProperties.map((property) => (
                                            <tr key={property.id}>
                                                <td>{property.unitNumber}</td>
                                                <td>{property.block}</td>
                                                <td>{property.ownerName || '—'} <br/><small>{property.ownerEmail || ''}</small></td>
                                                <td>{property.tenantName || '—'} <br/><small>{property.tenantEmail || ''}</small></td>
                                                <td>
                                                    <select className="input-field" style={{ padding: '0.3rem', fontSize: '0.8rem' }}
                                                        value={property.ownerId || ''}
                                                        onChange={e => handleAssignOwner(property.id, e.target.value)}>
                                                        <option value="">Unassigned</option>
                                                        {residents.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select className="input-field" style={{ padding: '0.3rem', fontSize: '0.8rem' }}
                                                        value={property.tenantId || (property.ownerId && !property.tenantId ? 'OWNER_OCCUPIED' : '')}
                                                        onChange={e => handleAssignTenant(property.id, e.target.value)}>
                                                        <option value="">Unassigned</option>
                                                        {property.ownerId && <option value="OWNER_OCCUPIED">Owner Occupied</option>}
                                                        {residents.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {property.tenantId && (
                                                            <button className="btn btn-secondary" style={{ padding: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => handleRemoveTenant(property.id)} title="Remove Tenant">
                                                                <UserX size={14} />
                                                            </button>
                                                        )}
                                                        {property.ownerId && (
                                                            <button className="btn btn-secondary" style={{ padding: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => handleDeleteResident(property.ownerId)} title="Delete Owner">
                                                                <UserX size={14} />
                                                            </button>
                                                        )}
                                                        <button className="btn btn-secondary" style={{ padding: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => handleDeleteProperty(property.id)} title="Delete Property">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!propertiesLoading && totalPropertyPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn btn-secondary" disabled={propertyCurrentPage === 1} onClick={() => setPropertyCurrentPage(prev => prev - 1)}>
                                    Previous
                                </button>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Page {propertyCurrentPage} of {totalPropertyPages}
                                </span>
                                <button className="btn btn-secondary" disabled={propertyCurrentPage === totalPropertyPages} onClick={() => setPropertyCurrentPage(prev => prev + 1)}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Visitors Tab ── */}
                {activeTab === 'visitors' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Visitor Log</h2>
                            <a href="/gate" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                                <Shield size={16} /> Open Gate Dashboard
                            </a>
                        </div>
                        {visitorsLoading && <div className="skeleton-loader tall"></div>}
                        {!visitorsLoading && visitors.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No visitors yet.</p>
                        )}
                        {!visitorsLoading && visitors.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Token</th><th>Visitor</th><th>Phone</th><th>Purpose</th><th>Resident</th><th>Status</th><th>Entry</th><th>Exit</th></tr>
                                    </thead>
                                    <tbody>
                                        {visitors.map(v => (
                                            <tr key={v.id}>
                                                <td><code>{v.entryToken}</code></td>
                                                <td>{v.visitorName}</td>
                                                <td>{v.visitorPhone}</td>
                                                <td>{v.purpose}</td>
                                                <td>{v.residentName}</td>
                                                <td>
                                                    <span className={`badge ${v.status === 'ENTERED' ? 'badge-paid' : v.status === 'APPROVED' ? 'badge-pending' : 'badge-overdue'}`}>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td>{v.entryTime ? new Date(v.entryTime).toLocaleTimeString() : '—'}</td>
                                                <td>{v.exitTime ? new Date(v.exitTime).toLocaleTimeString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Helpdesk Tab ── */}
                {activeTab === 'helpdesk' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Helpdesk — Complaints</h2>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {openComplaints} open • {complaints.length} total
                            </div>
                        </div>
                        {complaintsLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>}
                        {!complaintsLoading && complaints.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No complaints yet.</p>
                        )}
                        {!complaintsLoading && complaints.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredSearchComplaints.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '4px' }}>{c.subject}</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {c.residentName} • {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{
                                                    background: getComplaintStatusColor(c.status).bg,
                                                    color: getComplaintStatusColor(c.status).color,
                                                    padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                                                }}>
                                                    {c.status}
                                                </span>
                                                <button className="btn btn-secondary"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                                    onClick={() => {
                                                        setSelectedComplaint(c);
                                                        setComplaintStatus(c.status);
                                                        setAdminResponse(c.adminResponse || '');
                                                    }}>
                                                    Respond
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.description}</p>
                                        {c.adminResponse && (
                                            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '4px' }}>Your Response:</p>
                                                <p style={{ fontSize: '0.875rem' }}>{c.adminResponse}</p>
                                            </div>
                                        )}
                                        {selectedComplaint?.id === c.id && (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <label className="input-label">Update Status</label>
                                                        <select className="input-field" value={complaintStatus}
                                                            onChange={e => setComplaintStatus(e.target.value)} style={{ width: '160px' }}>
                                                            <option value="OPEN">Open</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                            <option value="CLOSED">Closed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <label className="input-label">Response to Resident</label>
                                                    <textarea className="input-field" placeholder="Write your response..."
                                                        value={adminResponse} onChange={e => setAdminResponse(e.target.value)}
                                                        rows={3} style={{ width: '100%', resize: 'vertical' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-primary" style={{ fontSize: '0.85rem' }}
                                                        onClick={() => handleUpdateComplaint(c.id)} disabled={updatingComplaint}>
                                                        {updatingComplaint ? 'Updating...' : '✅ Update Complaint'}
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }}
                                                        onClick={() => setSelectedComplaint(null)}>
                                                        Cancel
                                                    </button>
                                                </div>
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
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Announcements & Notices</h2>
                            <button className="btn btn-primary" onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>
                                <Plus size={16} /> New Announcement
                            </button>
                        </div>

                        {/* Post Announcement Form */}
                        {showAnnouncementForm && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>New Announcement</h3>
                                <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <label className="input-label">Type</label>
                                            <select className="input-field" value={annType}
                                                onChange={e => setAnnType(e.target.value)} style={{ width: '150px' }}>
                                                <option value="GENERAL">General</option>
                                                <option value="MAINTENANCE">Maintenance</option>
                                                <option value="EMERGENCY">Emergency</option>
                                                <option value="EVENT">Event</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="input-label">Priority</label>
                                            <select className="input-field" value={annPriority}
                                                onChange={e => setAnnPriority(e.target.value)} style={{ width: '130px' }}>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <label className="input-label">Title</label>
                                            <input className="input-field" placeholder="Announcement title"
                                                value={annTitle} onChange={e => setAnnTitle(e.target.value)}
                                                required style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Content</label>
                                        <textarea className="input-field" placeholder="Write announcement details..."
                                            value={annContent} onChange={e => setAnnContent(e.target.value)}
                                            required rows={4} style={{ width: '100%', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="submit" className="btn btn-primary" disabled={postingAnnouncement}>
                                            {postingAnnouncement ? 'Posting...' : '📢 Post Announcement'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAnnouncementForm(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {announcementsLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>}
                        {!announcementsLoading && announcements.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No announcements yet.</p>
                        )}
                        {!announcementsLoading && announcements.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {announcements.map(a => (
                                    <div key={a.id} className="glass-card" style={{
                                        padding: '1.25rem',
                                        borderLeft: `4px solid ${getAnnouncementTypeColor(a.type)}`,
                                        opacity: a.active ? 1 : 0.5
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{
                                                        background: `${getAnnouncementTypeColor(a.type)}20`,
                                                        color: getAnnouncementTypeColor(a.type),
                                                        padding: '2px 8px', borderRadius: '999px',
                                                        fontSize: '0.75rem', fontWeight: '600'
                                                    }}>
                                                        {a.type}
                                                    </span>
                                                    <span style={{
                                                        background: a.active ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)',
                                                        color: a.active ? '#10b981' : '#94a3b8',
                                                        padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem'
                                                    }}>
                                                        {a.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <h4 style={{ marginBottom: '4px' }}>{a.title}</h4>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{a.content}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    By {a.createdByName} • {new Date(a.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {a.active && (
                                                <button className="btn btn-secondary"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', marginLeft: '1rem', color: '#ef4444' }}
                                                    onClick={() => handleDeactivateAnnouncement(a.id)}>
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Residents & Approvals Tab ── */}
                {activeTab === 'users' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Residents & Approvals</h2>
                            <button className="btn btn-primary" onClick={() => setShowAddResident(!showAddResident)}>
                                <Plus size={16} /> Add Resident Manually
                            </button>
                        </div>
                        {showAddResident && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>New Resident</h3>
                                <form onSubmit={handleAddResident} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div>
                                        <label className="input-label">Full Name</label>
                                        <input className="input-field" placeholder="John Doe"
                                            value={residentName} onChange={e => setResidentName(e.target.value)}
                                            required style={{ width: '160px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Email</label>
                                        <input className="input-field" type="email" placeholder="john@example.com"
                                            value={residentEmail} onChange={e => setResidentEmail(e.target.value)}
                                            required style={{ width: '200px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Phone</label>
                                        <input className="input-field" type="tel" placeholder="9876543210"
                                            value={residentPhone} onChange={e => setResidentPhone(e.target.value)}
                                            style={{ width: '140px' }} />
                                    </div>
                                    <div>
                                        <label className="input-label">Password</label>
                                        <input className="input-field" type="password" placeholder="••••••••"
                                            value={residentPassword} onChange={e => setResidentPassword(e.target.value)}
                                            required minLength={6} style={{ width: '140px' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={addingResident}>
                                        {addingResident ? 'Adding...' : 'Add & Approve'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddResident(false)}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            Pending Approvals ({pendingUsers.length})
                        </h3>
                        {pendingLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>}
                        {!pendingLoading && pendingUsers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>✅ No pending approvals</p>
                            </div>
                        )}
                        {!pendingLoading && pendingUsers.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '4px', fontSize: '1rem' }}>{u.name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                Role: {u.role} • Status:
                                                <span style={{ color: '#f59e0b', marginLeft: '4px' }}>{u.status}</span>
                                                {u.phone && <span style={{ marginLeft: '8px' }}>📞 {u.phone}</span>}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-primary"
                                                style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}
                                                onClick={() => handleApproveUser(u.id)}>✅ Approve</button>
                                            <button className="btn btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', color: '#ef4444', borderColor: '#ef4444' }}
                                                onClick={() => handleRejectUser(u.id)}>❌ Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            Approved Residents ({residents.length})
                        </h3>
                        {residents.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No approved residents yet.</p>
                        )}
                        {residents.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {residents.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.name}</td>
                                                <td>{r.email}</td>
                                                <td>{r.phone || '—'}</td>
                                                <td>
                                                    <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '999px', fontSize: '0.8rem' }}>
                                                        APPROVED
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} 
                                                        onClick={() => handleDeleteResident(r.id)} 
                                                        title="Delete Resident">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Facilities Tab ── */}
                {activeTab === 'facilities' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Amenity & Facility Management</h2>
                            <button className="btn btn-primary" onClick={() => setShowFacilityForm(!showFacilityForm)}>
                                <Plus size={16} /> Add Facility
                            </button>
                        </div>

                        {showFacilityForm && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>New Facility</h3>
                                <form onSubmit={handleAddFacility} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div><label className="input-label">Name</label>
                                        <input className="input-field" placeholder="e.g. Swimming Pool" value={facName} onChange={e => setFacName(e.target.value)} required style={{ width: '160px' }} /></div>
                                    <div><label className="input-label">Description</label>
                                        <input className="input-field" placeholder="Short description" value={facDesc} onChange={e => setFacDesc(e.target.value)} style={{ width: '200px' }} /></div>
                                    <div><label className="input-label">Capacity</label>
                                        <input className="input-field" type="number" placeholder="10" value={facCapacity} onChange={e => setFacCapacity(e.target.value)} style={{ width: '90px' }} /></div>
                                    <div><label className="input-label">Open</label>
                                        <input className="input-field" type="time" value={facOpen} onChange={e => setFacOpen(e.target.value)} style={{ width: '110px' }} /></div>
                                    <div><label className="input-label">Close</label>
                                        <input className="input-field" type="time" value={facClose} onChange={e => setFacClose(e.target.value)} style={{ width: '110px' }} /></div>
                                    <button type="submit" className="btn btn-primary" disabled={addingFacility}>{addingFacility ? 'Adding...' : 'Add Facility'}</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowFacilityForm(false)}>Cancel</button>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {facilitiesLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}
                            {facilities.map(f => (
                                <div key={f.id} className="glass-card" style={{ padding: '1.25rem', opacity: f.isActive ? 1 : 0.5 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h4>{f.name}</h4>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: f.isActive ? '#ef4444' : '#10b981' }}
                                            onClick={() => handleToggleFacility(f.id)}>
                                            {f.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{f.description}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <span>👥 Capacity: {f.capacity ?? '—'}</span>
                                        <span>🕐 {f.openTime} – {f.closeTime}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', marginTop: '0.5rem', display: 'inline-block',
                                        background: f.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)',
                                        color: f.isActive ? '#10b981' : '#94a3b8'
                                    }}>
                                        {f.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            All Booking Requests ({allBookings.length})
                        </h3>
                        {bookingsLoading && <div className="skeleton-loader tall"></div>}
                        {!bookingsLoading && allBookings.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No bookings yet.</p>}
                        {!bookingsLoading && allBookings.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead><tr><th>Resident</th><th>Facility</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {allBookings.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.residentName}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.residentPhone}</span></td>
                                                <td>{b.facilityName}</td>
                                                <td>{b.bookingDate}</td>
                                                <td>{b.startTime} – {b.endTime}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                                                        background: b.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : b.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                                        color: b.status === 'APPROVED' ? '#10b981' : b.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                                                    }}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '0.4rem' }}>
                                                    {b.status === 'PENDING' && (<>
                                                        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => handleBookingStatus(b.id, 'APPROVED')}>✅ Approve</button>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#ef4444' }} onClick={() => handleBookingStatus(b.id, 'REJECTED')}>❌ Reject</button>
                                                    </>)}
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#ef4444' }} onClick={() => handleDeleteBooking(b.id)}>🗑️ Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Staff Tab ── */}
                {activeTab === 'staff' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Staff & Vendor Management</h2>
                            <button className="btn btn-primary" onClick={() => setShowStaffForm(!showStaffForm)}>
                                <Plus size={16} /> Add Staff
                            </button>
                        </div>

                        {showStaffForm && (
                            <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>New Staff / Vendor</h3>
                                <form onSubmit={handleAddStaff} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div><label className="input-label">Name</label><input className="input-field" placeholder="Full name" value={staffName} onChange={e => setStaffName(e.target.value)} required style={{ width: '150px' }} /></div>
                                    <div><label className="input-label">Phone</label><input className="input-field" placeholder="Phone" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} style={{ width: '130px' }} /></div>
                                    <div><label className="input-label">Email</label><input className="input-field" type="email" placeholder="Email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} style={{ width: '170px' }} /></div>
                                    <div><label className="input-label">Role</label>
                                        <select className="input-field" value={staffRole} onChange={e => setStaffRole(e.target.value)} style={{ width: '140px' }}>
                                            {['SECURITY', 'CLEANER', 'ELECTRICIAN', 'PLUMBER', 'GARDENER', 'OTHER'].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select></div>
                                    <div><label className="input-label">Vendor Company</label><input className="input-field" placeholder="Optional" value={staffVendor} onChange={e => setStaffVendor(e.target.value)} style={{ width: '150px' }} /></div>
                                    <div><label className="input-label">Joining Date</label><input className="input-field" type="date" value={staffJoining} onChange={e => setStaffJoining(e.target.value)} style={{ width: '140px' }} /></div>
                                    <button type="submit" className="btn btn-primary" disabled={addingStaff}>{addingStaff ? 'Adding...' : 'Add Staff'}</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowStaffForm(false)}>Cancel</button>
                                </form>
                            </div>
                        )}

                        {staffLoading && <div className="skeleton-loader tall"></div>}
                        {!staffLoading && staffList.length > 0 && (
                            <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
                                <table className="data-table">
                                    <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Vendor</th><th>Joining</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {staffList.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td><span style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem' }}>{s.role}</span></td>
                                                <td>{s.phone || '—'}</td>
                                                <td>{s.vendorCompany || '—'}</td>
                                                <td>{s.joiningDate || '—'}</td>
                                                <td><span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', background: s.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.2)', color: s.status === 'ACTIVE' ? '#10b981' : '#94a3b8' }}>{s.status}</span></td>
                                                <td>
                                                    {s.status === 'ACTIVE'
                                                        ? <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#ef4444' }} onClick={() => staffAPI.deactivateStaff(s.id).then(fetchStaff)}>Deactivate</button>
                                                        : <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#10b981' }} onClick={() => staffAPI.activateStaff(s.id).then(fetchStaff)}>Activate</button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Attendance ── */}
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Attendance — <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Mark & View</span></h3>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input type="date" className="input-field" value={attendanceDate}
                                        onChange={e => { setAttendanceDate(e.target.value); fetchAttendanceByDate(e.target.value); }}
                                        style={{ width: '160px' }} />
                                </div>
                            </div>
                            {attendanceLoading && <div className="skeleton-loader tall"></div>}
                            {!attendanceLoading && staffList.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {staffList.filter(s => s.status === 'ACTIVE').map(s => {
                                        const record = attendanceRecords.find(a => a.staffId === s.id);
                                        const current = record?.status || null;
                                        const colors = { PRESENT: '#10b981', ABSENT: '#ef4444', HALF_DAY: '#f59e0b', LEAVE: '#6366f1' };
                                        return (
                                            <div key={s.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.role}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'].map(st => (
                                                        <button key={st} onClick={() => handleMarkAttendance(s.id, st)}
                                                            style={{
                                                                fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                                                                background: current === st ? colors[st] : 'rgba(148,163,184,0.15)',
                                                                color: current === st ? 'white' : 'var(--text-secondary)',
                                                                fontWeight: current === st ? 700 : 400
                                                            }}>
                                                            {st.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Reports Tab ── */}
                {activeTab === 'reports' && (
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Financial Reports — {new Date().getFullYear()}</h2>
                            <button className="btn btn-secondary" onClick={fetchFinancialReport}>🔄 Refresh</button>
                        </div>
                        {reportsLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Generating report...</p>}
                        {!reportsLoading && financialReport && (
                            <>
                                <div className="grid-cards" style={{ marginBottom: '2rem' }}>
                                    <div className="glass-card">
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Year Total Collected</h3>
                                        <h2 style={{ fontSize: '1.75rem', color: '#10b981' }}>₹{Number(financialReport.yearTotalCollected).toFixed(2)}</h2>
                                    </div>
                                    <div className="glass-card">
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Year Total Pending</h3>
                                        <h2 style={{ fontSize: '1.75rem', color: '#ef4444' }}>₹{Number(financialReport.yearTotalPending).toFixed(2)}</h2>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ marginBottom: '2rem', height: '300px' }}>
                                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Revenue Trends</h3>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <AreaChart data={financialReport.months} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="monthYear" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                                            <Area type="monotone" dataKey="totalCollected" name="Collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" />
                                            <Area type="monotone" dataKey="totalPending" name="Pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Collected</th>
                                                <th>Pending</th>
                                                <th>Overdue</th>
                                                <th>Paid</th>
                                                <th>📊 Collection Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financialReport.months.map(m => (
                                                <tr key={m.monthYear}>
                                                    <td style={{ fontWeight: 500 }}>{m.monthYear}</td>
                                                    <td style={{ color: '#10b981' }}>₹{Number(m.totalCollected).toFixed(2)}</td>
                                                    <td style={{ color: '#f59e0b' }}>₹{Number(m.totalPending).toFixed(2)}</td>
                                                    <td style={{ color: '#ef4444' }}>₹{Number(m.totalOverdue).toFixed(2)}</td>
                                                    <td>{m.paidCount}/{m.paidCount + m.pendingCount + m.overdueCount}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ flex: 1, height: '6px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${m.collectionRate}%`, height: '100%', background: m.collectionRate >= 80 ? '#10b981' : m.collectionRate >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '999px' }} />
                                                            </div>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.collectionRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        {!reportsLoading && !financialReport && (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Click Refresh to load the report.</p>
                        )}
                    </div>
                )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── System Analytics Modal ── */}
            {showAiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', width: '90%', padding: '2rem', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowAiModal(false)}>
                            ✕
                        </button>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                            <BarChart2 size={24} /> System Analytics Report
                        </h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                <h3>🏢 Occupancy & Properties</h3>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Out of <strong>{properties.length}</strong> total properties, <strong>{occupiedPropertiesCount}</strong> are currently assigned to residents, resulting in an occupancy rate of <strong>{occupancyRate}%</strong>. There remain <strong>{unassignedPropertiesCount}</strong> properties awaiting residents.
                                </p>
                            </div>
                            <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <h3>💳 Outstanding Invoices</h3>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Currently, there are <strong>{overdueCount}</strong> overdue invoices across all past cycles totaling <strong style={{ color: '#ef4444' }}>₹{totalOverdueAmount.toFixed(2)}</strong>. You may want to review and follow up with these specific units.
                                </p>
                            </div>
                            <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                                <h3>🛠 Helpdesk Efficiency</h3>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                    The administration team has resolved <strong>{resolvedComplaints}</strong> complaints in total. <strong>{openComplaints}</strong> complaints are currently OPEN and <strong style={{color: complaints.filter(c => c.status === 'IN_PROGRESS').length > 0 ? '#f59e0b' : 'var(--text-secondary)'}}>{complaints.filter(c => c.status === 'IN_PROGRESS').length}</strong> are IN PROGRESS.
                                </p>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>Close Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}