const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf-8');

// Replace handleSelectGoogleAccount
const handleSelectGoogleAccount = `
  const handleSelectGoogleAccount = async (email: string, fullName: string) => {
    setLoading(true);
    setError('');
    setGooglePickerOpen(false);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username: mode === 'signup' ? username : undefined,
          isSignup: mode === 'signup'
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Google Sign-In failed');
      }

      const profile = await res.json();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In error');
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(/const handleSelectGoogleAccount = async \(email: string, fullName: string\) => \{[\s\S]*?^\s*};\n/m, handleSelectGoogleAccount + "\n");
fs.writeFileSync('src/components/AuthModal.tsx', code);
