console.log("Simulating React state changes...");
let initialSection = 'global_feed';
let activeTab = 'feed';
// initial mount
if (initialSection === 'global_feed') activeTab = 'global_feed';
console.log("1. Mount:", activeTab);

// click user
initialSection = undefined;
if (initialSection) {
  if (initialSection === 'global_feed') activeTab = 'global_feed';
} else {
  activeTab = 'feed';
}
console.log("2. Click user:", activeTab);
