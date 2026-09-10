const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf-8');

const newToggleFollow = `
  const handleToggleFollow = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
`;

code = code.replace(/const handleToggleFollow = async \(\) => \{\n\s*if \(!currentUser\) \{\n\s*alert\([^)]+\);\n\s*return;\n\s*\}/, newToggleFollow);
fs.writeFileSync('src/components/ProfileView.tsx', code);
