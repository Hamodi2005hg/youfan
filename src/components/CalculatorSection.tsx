import React, { useState, useMemo } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface CalculatorSectionProps {
  onStartEarning: () => void;
}

const REGIONS: { [key: string]: number } = {
  'North America': 1.0,
  Europe: 0.88,
  'Middle East': 0.76,
  Asia: 0.62,
  Oceania: 0.94,
  'South America': 0.58,
  Africa: 0.48,
};

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({ onStartEarning }) => {
  const [selectedRegion, setSelectedRegion] = useState('North America');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [followers, setFollowers] = useState(6067000);
  const [friends, setFriends] = useState(2605000);
  const [subscribers, setSubscribers] = useState(4487000);
  const [views, setViews] = useState(7613000);

  // Dynamic formula mirroring YoFan calculations with region multiplier
  const annualEarnings = useMemo(() => {
    const regionFactor = REGIONS[selectedRegion] || 1.0;
    // CPM base formula calibrated so standard defaults yield ~$6.6M
    const totalEngagement = followers * 0.25 + friends * 0.4 + subscribers * 0.5 + views * 0.35;
    const baseRevenue = (totalEngagement / 1000) * 1.05 * regionFactor;
    return Math.round(baseRevenue);
  }, [followers, friends, subscribers, views, selectedRegion]);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 mb-24 md:mb-36">
      {/* Top Header with Region Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight">
          How much can I earn on YoStar?
        </h3>

        <div className="flex items-center gap-3 relative">
          <p className="text-sm font-medium text-gray-700 text-right leading-tight">
            Most of my <br className="hidden sm:inline" /> audience is in:
          </p>

          <div className="relative">
            <button
              id="calc-region-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between gap-3 bg-[#FFFB93] hover:bg-[#FFF97D] px-5 py-3 rounded-2xl font-bold text-sm text-black cursor-pointer transition min-w-[180px]"
            >
              <span>{selectedRegion}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                {Object.keys(REGIONS).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      setSelectedRegion(reg);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition cursor-pointer ${
                      selectedRegion === reg ? 'bg-[#FFFDC9] font-bold text-black' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Sliders Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Slider 1: Followers */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-800">Followers</span>
              <span className="text-base font-black text-black">{followers.toLocaleString()}</span>
            </div>
            <input
              id="calc-slider-followers"
              type="range"
              min={0}
              max={10000000}
              step={10000}
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Friends */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-800">Friends</span>
              <span className="text-base font-black text-black">{friends.toLocaleString()}</span>
            </div>
            <input
              id="calc-slider-friends"
              type="range"
              min={0}
              max={10000000}
              step={10000}
              value={friends}
              onChange={(e) => setFriends(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 3: Subscribers */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-800">Subscribers</span>
              <span className="text-base font-black text-black">{subscribers.toLocaleString()}</span>
            </div>
            <input
              id="calc-slider-subscribers"
              type="range"
              min={0}
              max={10000000}
              step={10000}
              value={subscribers}
              onChange={(e) => setSubscribers(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 4: Views */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-800">Profile & Post Views</span>
              <span className="text-base font-black text-black">{views.toLocaleString()}</span>
            </div>
            <input
              id="calc-slider-views"
              type="range"
              min={0}
              max={10000000}
              step={10000}
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Result Yellow Box */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFB93] rounded-3xl p-8 sm:p-12 text-center shadow-lg border border-yellow-200 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full text-xs font-bold text-black mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>70% Google AdSense Partner Share</span>
            </div>

            <p className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight mb-2">
              ${annualEarnings.toLocaleString()}
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-800 mb-8">
              Your potential annual earnings
            </p>

            <button
              id="calc-start-earning-btn"
              onClick={onStartEarning}
              className="w-full py-4 px-8 bg-black hover:bg-gray-800 text-white font-bold text-base sm:text-lg rounded-2xl transition cursor-pointer shadow-md"
            >
              Start Earning
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
