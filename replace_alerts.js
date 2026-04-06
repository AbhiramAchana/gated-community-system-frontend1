const fs = require('fs');
const file = 'src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import toast from 'react-hot-toast';")) {
  content = content.replace(/(import .* from 'lucide-react';)/, `$1\nimport toast from 'react-hot-toast';`);
}

content = content.replace(/alert\('✅ (.*?)'\)/g, `toast.success('$1')`);
content = content.replace(/alert\('(.*?failed.*?)'\)/gi, `toast.error('$1')`);
content = content.replace(/alert\('(.*?already exist.*?)'\)/gi, `toast.error('$1')`);
content = content.replace(/alert\('(.*?created.*?)'\)/gi, `toast.success('$1')`);
content = content.replace(/alert\('(.*?generated.*?)'\)/gi, `toast.success('$1')`);
content = content.replace(/alert\('(.*?approved.*?)'\)/gi, `toast.success('$1')`);
content = content.replace(/alert\('(.*?)'\)/g, `toast('$1')`);

fs.writeFileSync(file, content);
console.log('Replaced alerts with toast');
