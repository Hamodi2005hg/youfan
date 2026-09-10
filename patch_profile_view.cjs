const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf-8');

code = code.replace("onSelectProfile: (username: string) => void;", "onSelectProfile: (username: string) => void;\n  onRequireAuth: () => void;");
code = code.replace("onSelectProfile,", "onSelectProfile,\n  onRequireAuth,");

code = code.replace(/<FeedPostCard/g, "<FeedPostCard\n                    onRequireAuth={onRequireAuth}");

// also update followers requireAuth
code = code.replace(/const handleFollow = async \([^)]*\) => \{/, "const handleFollow = async () => {\n    if (!currentUser) {\n      onRequireAuth();\n      return;\n    }");

fs.writeFileSync('src/components/ProfileView.tsx', code);
