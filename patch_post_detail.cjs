const fs = require('fs');
let code = fs.readFileSync('src/components/PostDetailModal.tsx', 'utf-8');

code = code.replace("onVoteSuccess: () => void;", "onVoteSuccess: () => void;\n  onRequireAuth: () => void;");
code = code.replace("onVoteSuccess,", "onVoteSuccess,\n  onRequireAuth,");

const requireAuthLogic = `
  const requireAuth = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return true;
    }
    if (!currentUser) {
      alert("Please log in to interact.");
      return true;
    }
    return false;
  };
`;

code = code.replace(/const handleVote = async \([^)]*\) => \{/, requireAuthLogic + "\n  const handleVote = async (type: 'up' | 'down') => {\n    if (requireAuth()) return;");
code = code.replace(/const handleAddComment = async \([^)]*\) => \{/, "const handleAddComment = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (requireAuth()) return;");

fs.writeFileSync('src/components/PostDetailModal.tsx', code);
