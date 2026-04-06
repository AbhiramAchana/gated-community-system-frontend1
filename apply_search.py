import re

with open('src/components/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add computed filtered sets based on searchQuery
computed_filters = """
    // ✅ Global Search Computed Lists
    const filteredSearchInvoices = invoices.filter(i => 
        (i.residentName || i.status || i.block || i.unitNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSearchProperties = properties.filter(p => 
        (p.residentName || p.block || p.unitNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSearchComplaints = complaints.filter(c => 
        (c.residentName || c.subject || c.category || c.status || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // ✅ System Analytics Data
"""
text = text.replace('    // ✅ System Analytics Data', computed_filters)

# 2. Replace the `.map` iterations in the rendering
text = text.replace('{invoices.map((invoice) => (', '{filteredSearchInvoices.map((invoice) => (')
text = text.replace('{properties.map((property) => (', '{filteredSearchProperties.map((property) => (')
text = text.replace('{complaints.map(c => (', '{filteredSearchComplaints.map(c => (')

with open('src/components/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Search filtering implemented!')
