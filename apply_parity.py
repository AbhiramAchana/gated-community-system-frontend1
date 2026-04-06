import re
import os

def apply_fx(file_path):
    if not os.path.exists(file_path):
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Imports
    if "import { motion, AnimatePresence } from" not in text:
        text = re.sub(
            r"(import .* from 'lucide-react';)",
            r"\1\nimport toast from 'react-hot-toast';\nimport { motion, AnimatePresence } from 'framer-motion';",
            text
        )
    elif "import toast from" not in text:
        text = re.sub(
            r"(import { motion, AnimatePresence } from 'framer-motion';)",
            r"\1\nimport toast from 'react-hot-toast';",
            text
        )

    # 2. Add GlowCard component if missing
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

export default function """
    
    if 'function GlowCard' not in text:
        if file_path.endswith('ResidentDashboard.jsx'):
            text = text.replace('export default function ResidentDashboard() {', glow_card_code + 'ResidentDashboard() {')
        else:
            text = text.replace('export default function GateDashboard() {', glow_card_code + 'GateDashboard() {')

    if file_path.endswith('ResidentDashboard.jsx'):
        # 3. resident dashboard alerts
        text = re.sub(r"alert\('✅ (.*?)'\)", r"toast.success('\1')", text)
        text = re.sub(r"alert\('❌ (.*?)'\)", r"toast.error('\1')", text)
        text = re.sub(r"alert\('(.*?failed.*?)'\)", r"toast.error('\1')", text, flags=re.IGNORECASE)
        text = re.sub(r"alert\('(.*?exist.*?)'\)", r"toast.error('\1')", text, flags=re.IGNORECASE)
        text = re.sub(r"alert\('(.*?)'\)", r"toast('\1')", text)

        # 4. Skeletons
        skeleton = '<div className="skeleton-loader tall"></div>'
        text = re.sub(r"<p style={{.*?}}>Loading.*?\.\.\.</p>", skeleton, text)

        # 5. Glow cards on resident dashboard top row cards (the ones in Payment tab)
        text = text.replace("""<div className="glass-panel stagger-1" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}>""",
"""<GlowCard className="stagger-1" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}>""")
        text = text.replace("""</button>
                                </>
                            ) : (
                                <>""",
"""</button>
                                </>
                            ) : (
                                <>""")
        text = text.replace("""You have no pending dues.</p>
                                </>
                            )}
                        </div>""",
"""You have no pending dues.</p>
                                </>
                            )}
                        </GlowCard>""")
        
        # 6. Framer motion
        tab_strip_end = """                    </button>
                </div>
            </div>"""
        
        framer_wrapper = tab_strip_end + """
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15, position: 'absolute', width: '100%' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >"""
        
        if '<AnimatePresence' not in text:
            text = text.replace(tab_strip_end, framer_wrapper)
            # close framer motion div
            file_end = """                </div>
            )}
        </div>
    );
}"""
            file_end_wrapper = """                </div>
            )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}"""
            text = text.replace(file_end, file_end_wrapper)

    elif file_path.endswith('GateDashboard.jsx'):
        # Just replace error sets with toast
        text = text.replace("setError('Invalid token — visitor not found');", "toast.error('Invalid token — visitor not found');")
        text = text.replace("setError('Failed to process gate action');", "toast.error('Failed to process gate action');")
        text = text.replace("setError('');", "") # remove explicit clear
        # Add success toast
        text = text.replace("setVisitor(response.data);", "setVisitor(response.data);\n            if(action) toast.success(`Gate ${action.toLowerCase()} recorded`);")
        
        # framer motion animation for gate dashboard main panel
        if '<AnimatePresence' not in text:
            # Wrap the entire main container (under nav)
            gate_start = """            <div style={{ maxWidth: '600px', margin: '0 auto' }}>"""
            gate_framer = gate_start + """
                <AnimatePresence mode="wait">
                    <motion.div
                        key={visitor ? visitor.id : 'lookup'}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, position: 'absolute', width: '100%' }}
                        transition={{ duration: 0.3 }}
                    >"""
            
            text = text.replace(gate_start, gate_framer)
            
            gate_end = """                    </div>
                )}
            </div>
        </div>
    );
}"""
            gate_end_wrapper = """                    </div>
                )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}"""
            text = text.replace(gate_end, gate_end_wrapper)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)

apply_fx('src/components/ResidentDashboard.jsx')
apply_fx('src/components/GateDashboard.jsx')

print('Dashboards updated with parity!')
