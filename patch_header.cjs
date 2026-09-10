const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

code = code.replace("onGoHome: () => void;", "onGoHome: () => void;\n  onGoFeed: () => void;");
code = code.replace("onGoHome,", "onGoHome,\n  onGoFeed,");

const navReplacement = `
      {/* Brand Logo & Nav */}
      <div className="flex items-center gap-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none bg-transparent border-none text-left p-0"
        >
          <div className="flex items-center">
            <span className="font-extrabold text-3xl tracking-tighter text-black">
              yo<span className="text-[#FF2D55]">.</span>star
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-black text-white px-2 py-0.5 rounded-full hidden sm:inline-block">
              Creator
            </span>
          </div>
        </button>

        <button 
          onClick={onGoFeed}
          className="text-gray-500 hover:text-black font-bold text-sm cursor-pointer border-none bg-transparent"
        >
          Feed
        </button>
      </div>
`;

code = code.replace(/\{(\/\* Brand Logo \*\/[\s\S]*?)<\/button>/, navReplacement);

fs.writeFileSync('src/components/Header.tsx', code);
