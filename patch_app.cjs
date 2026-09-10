const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Import GlobalFeedView
code = code.replace("import { TrendingProfiles } from './components/TrendingProfiles';", "import { TrendingProfiles } from './components/TrendingProfiles';\nimport { GlobalFeedView } from './components/GlobalFeedView';");

// update state definition for activeView
code = code.replace(/useState<'home' \| 'profile'>\('home'\);/, "useState<'home' | 'profile' | 'feed'>('home');");

const headerProps = `
      <Header
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onSelectProfile={handleSelectProfile}
        onGoHome={handleGoHome}
        onGoFeed={() => { setSelectedUsername(null); setActiveView('feed'); }}
        onLogout={handleLogout}
        activeView={activeView}
        activeSection={activeSection}
      />
`;

code = code.replace(/<Header[\s\S]*?\/>/, headerProps);

const contentRouterEnd = `
        ) : activeView === 'feed' ? (
          <GlobalFeedView 
            posts={allPosts} 
            currentUser={currentUser}
            onSelectPost={(post) => setSelectedPost(post)}
            onSelectProfile={handleSelectProfile}
            onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}
          />
        ) : currentProfile ? (
`;

code = code.replace(/        \) : currentProfile \? \(/, contentRouterEnd);

// Pass onRequireAuth to ProfileView
code = code.replace(/<ProfileView/, `<ProfileView\n            onRequireAuth={() => setAuthModal({ open: true, mode: 'login' })}`);

fs.writeFileSync('src/App.tsx', code);
