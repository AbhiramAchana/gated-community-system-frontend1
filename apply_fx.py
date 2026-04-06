import re

with open('src/components/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
if "import { motion, AnimatePresence } from" not in text:
    text = re.sub(
        r"(import toast from 'react-hot-toast';)",
        r"\1\nimport { motion, AnimatePresence } from 'framer-motion';",
        text
    )

# 2. Add GlowCard component
glow_card_code = """
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
"""

if 'function GlowCard' not in text:
    text = text.replace('export default function AdminDashboard() {', glow_card_code)

# 3. Replace <div className="glass-card"> with <GlowCard> for the top row cards
grid_cards_original = """            {/* Stats Grid */}
            <div className="grid-cards stagger-1">
                <div className="glass-card">"""
grid_cards_new = """            {/* Stats Grid */}
            <div className="grid-cards stagger-1">
                <GlowCard>"""

text = text.replace(grid_cards_original, grid_cards_new)

text = text.replace("""                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Pending Dues</h3>""", 
"""                <GlowCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Pending Dues</h3>""")

text = text.replace("""                <div className="glass-card" style={{ border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} /> Quick Analytics""",
"""                <GlowCard style={{ border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} /> Quick Analytics""")

# Replace closing </div> for the cards
text = text.replace("""                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{selectedMonth}</p>
                </div>""", """                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{selectedMonth}</p>
                </GlowCard>""")
text = text.replace("""                    <p style={{ fontSize: '0.85rem' }}>{overdueCount} overdue • {selectedMonth}</p>
                </div>""", """                    <p style={{ fontSize: '0.85rem' }}>{overdueCount} overdue • {selectedMonth}</p>
                </GlowCard>""")
text = text.replace("""                        View Detailed Report
                    </button>
                </div>""", """                        View Detailed Report
                    </button>
                </GlowCard>""")

# 4. Replace Loading text with skeletons
skeleton = '<div className="skeleton-loader tall"></div>'
text = re.sub(r"<p style={{.*?}}>Loading invoices...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading properties...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading visitors...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading complaints...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading announcements...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading residents...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading users...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading facilities...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading bookings...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading staff...</p>", skeleton, text)
text = re.sub(r"<p style={{.*?}}>Loading attendance...</p>", skeleton, text)

# 5. Framer motion wrapper
tab_strip_end = """                    <button onClick={() => { setActiveTab('reports'); fetchFinancialReport(); }} style={tabStyle('reports')}>
                        <BarChart2 size={16} /> Reports
                    </button>
                </div>"""
framer_wrapper = tab_strip_end + """
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >"""
if '<AnimatePresence' not in text:
    text = text.replace(tab_strip_end, framer_wrapper)

    # close framer wrapper right before the end of the glass-panel
    file_end = """                )}
            </div>

            {/* ── System Analytics Modal ── */}"""
    file_end_wrapper = """                )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── System Analytics Modal ── */}"""
    text = text.replace(file_end, file_end_wrapper)

with open('src/components/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
