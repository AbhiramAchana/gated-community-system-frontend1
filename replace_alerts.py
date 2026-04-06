import re
with open('src/components/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'import toast' not in text:
    text = re.sub(r"(import .* from 'lucide-react';)", r"\1\nimport toast from 'react-hot-toast';", text)

text = re.sub(r"alert\('✅ (.*?)'\)", r"toast.success('\1')", text)
text = re.sub(r"alert\('(.*?failed.*?)'\)", r"toast.error('\1')", text, flags=re.IGNORECASE)
text = re.sub(r"alert\('(.*?exist.*?)'\)", r"toast.error('\1')", text, flags=re.IGNORECASE)
text = re.sub(r"alert\('(.*?created.*?)'\)", r"toast.success('\1')", text, flags=re.IGNORECASE)
text = re.sub(r"alert\('(.*?generated.*?)'\)", r"toast.success('\1')", text, flags=re.IGNORECASE)
text = re.sub(r"alert\('(.*?approved.*?)'\)", r"toast.success('\1')", text, flags=re.IGNORECASE)
text = re.sub(r"alert\('(.*?)'\)", r"toast('\1')", text)

with open('src/components/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done')
