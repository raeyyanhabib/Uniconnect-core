const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const dirs = ['components', 'pages', 'hooks', 'assets', 'services'];
dirs.forEach(d => {
  const dirPath = path.join(baseDir, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const components = [
  'Avatar', 'Badge', 'StatusBadge', 'StarRating', 'SectionHeader', 
  'Tabs', 'StatCard', 'Modal', 'FormField', 'EmptyState', 
  'StudentCard', 'ResourceCard'
];

const pages = [
  'LoginPage', 'AdminLoginPage', 'RegisterPage', 'VerifyStudentPage', 
  'ResetPasswordPage', 'DashboardPage', 'StudyPartnersPage', 
  'StudyGroupsPage', 'ResourcesPage'
];

const services = ['api', 'theme'];

const createBoilerplate = (name, type) => {
  if (type === 'react') {
    return `import React from 'react';\n\nexport default function ${name}() {\n  return (\n    <div>${name} Component</div>\n  );\n}\n`;
  }
  return `// ${name} service\n`;
};

components.forEach(c => {
  fs.writeFileSync(path.join(baseDir, 'components', `${c}.tsx`), createBoilerplate(c, 'react'));
});

pages.forEach(p => {
  fs.writeFileSync(path.join(baseDir, 'pages', `${p}.tsx`), createBoilerplate(p, 'react'));
});

services.forEach(s => {
  fs.writeFileSync(path.join(baseDir, 'services', `${s}.ts`), createBoilerplate(s, 'service'));
});

console.log('Scaffolding complete!');
