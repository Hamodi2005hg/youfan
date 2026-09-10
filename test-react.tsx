const React = require('react');
// If I use useEffect with [initialSection, profile.id], what happens if profile.id changes but initialSection is undefined?
// The dependency array includes BOTH.
// If activeSection becomes undefined, initialSection becomes undefined.
// If currentProfile changes from admin to tfytg, profile.id changes.
// Since initialSection changed, the effect runs.
// It hits `else { setActiveTab('feed'); }`.
