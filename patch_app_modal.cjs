const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<PostDetailModal([\s\S]*?)currentUser={currentUser}/, "<PostDetailModal$1currentUser={currentUser}\n          onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}");

fs.writeFileSync('src/App.tsx', code);
