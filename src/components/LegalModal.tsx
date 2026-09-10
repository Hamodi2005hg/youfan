import React, { useState } from 'react';
import { X, ShieldAlert, FileText, Lock, DollarSign, CheckCircle2, AlertTriangle, Ban, Search, ExternalLink } from 'lucide-react';

export type LegalTab = 'content-policy' | 'terms' | 'privacy' | 'monetization';

interface LegalModalProps {
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'content-policy', onClose }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#FFFB93] flex items-center justify-center font-black text-lg">
              Y*
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight">
                YoStar Legal & Community Standards
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Effective & Last Updated: 2026 • YoStar LTD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer border-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('content-policy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'content-policy'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#FF2D55]" />
            Content Policy
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'terms'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 text-[#30D158]" />
            Terms of Service
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'privacy'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Lock className="w-4 h-4 text-[#007AFF]" />
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'monetization'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#FFD60A]" />
            Partner Program & AdSense Rules
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-gray-700 text-sm leading-relaxed">
          {/* TAB 1: CONTENT POLICY */}
          {activeTab === 'content-policy' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                <h3 className="text-base font-black text-amber-950 flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-[#FF2D55]" />
                  YoStar Creator Content Policy Overview
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  In order to maintain a safe and trustworthy network for all creators, fans, and advertising partners, YoStar enforces a strict creator content policy. The policy is structured into two main tiers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-900 font-semibold flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Tier 1: Prohibited Content:</strong> Explicitly banned from YoStar. Violations result in immediate permanent account termination.</span>
                  </div>
                  <div className="p-3 bg-yellow-50/80 border border-yellow-200 rounded-xl text-xs text-yellow-950 font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <span><strong>Tier 2: Restricted Content:</strong> Allowed for publication, but strictly not eligible for the YoStar Partner Monetization Program.</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Strictly Prohibited Content */}
              <div>
                <h4 className="text-lg font-black text-black tracking-tight mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-black">1</span>
                  Content Explicitly Not Allowed on YoStar
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  The following categories of content are strictly forbidden on YoStar. Publishing any of the following triggers an instant lifetime ban, and relevant details may be reported to law enforcement authorities:
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h5 className="font-bold text-black text-sm mb-1">⚖️ Illegal Content & Criminal Acts</h5>
                    <p className="text-xs text-gray-600">
                      YoStar adopts the standard definition of illegal content as governed by applicable United Kingdom, United States, and international laws. Examples include:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-gray-600">
                      <li><strong>Child sexual abuse material (CSAM) or grooming activities:</strong> Zero-tolerance policy with immediate reporting to policing bodies and NCMEC.</li>
                      <li><strong>Hate speech:</strong> Content that attacks, demeans, or incites hatred against protected characteristics (race, ethnicity, religion, disability, sexual orientation).</li>
                      <li><strong>Commercial scams, phishing, and fraudulent schemes:</strong> Misleading users for financial gain, deceptive promises, or impersonation.</li>
                      <li><strong>Intellectual property breaches:</strong> Unauthorized re-uploading or distribution of copyrighted visual media, audio, or trademarks.</li>
                      <li><strong>Harassment and cyberbullying:</strong> Targeted abuse, doxxing, non-consensual sharing of personal private information, or blackmail.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h5 className="font-bold text-black text-sm mb-1">🚫 Additional Prohibited Content Categories</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 mt-2">
                      <li><strong>Pornography, explicit nudity, and non-consensual sexual media.</strong></li>
                      <li><strong>Endangered or threatened wildlife trade:</strong> Products or media promoting illegal animal trade or harm.</li>
                      <li><strong>Dangerous or derogatory content:</strong> Inciting violence, self-harm instructions, or biological threats.</li>
                      <li><strong>Malicious software or exploit links:</strong> Malware, spyware, phishing landing pages, or ransomware vectors.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2: Non-Monetizable Content */}
              <div>
                <h4 className="text-lg font-black text-black tracking-tight mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">2</span>
                  Content Allowed, But Not Eligible for Partner Program (AdSense)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  We believe in empowering free expression. However, to comply with Google AdSense Publisher Policies and advertising brand safety, profiles sharing the following categories cannot monetize with ads:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">🔞 Sexual Suggestiveness</strong>
                    <span className="text-gray-600">Sexually suggestive content, fetish advice, or adult merchandise discussions are allowed to be posted, but cannot serve Google AdSense ads.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">⚠️ Shocking & Graphic Imagery</strong>
                    <span className="text-gray-600">Gruesome accidents, graphic injuries, or heavy profanity cannot be monetized.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">💣 Explosives & Fireworks</strong>
                    <span className="text-gray-600">Promoting explosive materials, fireworks sales, or homemade pyrotechnic guides.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">🔫 Firearms & Combat Weapons</strong>
                    <span className="text-gray-600">Sales of recreational guns, airsoft, ammunition, assembly guides, or weapons meant for injury.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">🚬 Tobacco & Vaping</strong>
                    <span className="text-gray-600">Tobacco sales, cigars, e-cigarettes, and rolling paper promotions.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">💊 Recreational & Unapproved Drugs</strong>
                    <span className="text-gray-600">Substances that alter mental states or unapproved pharmaceutical supplements.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">🍷 Alcohol Online Sales</strong>
                    <span className="text-gray-600">Facilitating unauthorized direct online sale or excessive/irresponsible consumption.</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                    <strong className="text-black block mb-1">🎲 Real-Money Online Gambling</strong>
                    <span className="text-gray-600">Promoting real-money casinos, sportsbooks, or unverified lotteries.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-black tracking-tight mb-2">
                  YoStar Terms of Service
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  These Terms of Service govern your use of the website located at <span className="font-mono text-black font-semibold">https://yo.star</span> and any related creator services provided by YOSTAR LTD.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  By accessing or registering on YoStar, you agree to abide by these Terms of Service and to comply with all applicable local and international laws. If you do not agree, you are prohibited from using this platform.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">1. Limitations of Use</h4>
                  <p className="text-gray-600 mb-2">By using this platform, you warrant that you will not:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Modify, reverse engineer, or decompile any software or APIs on YoStar;</li>
                    <li>Remove copyright, watermark, or proprietary notations from platform materials;</li>
                    <li>Artificially inflate views, votes, or ad impressions via automated bots, click farms, or proxies;</li>
                    <li>Transmit or publish harassing, fraudulent, obscene, or unlawful material;</li>
                    <li>Harvest or gather personal data of creators or visitors without explicit consent;</li>
                    <li>Send unauthorized marketing spam or malicious URL redirects.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">2. Intellectual Property & User-Generated Content</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>You retain your intellectual property ownership rights</strong> over any content, photography, links, and media you submit for publication on YoStar. We will never claim ownership of your content.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By submitting content, you grant YoStar LTD a non-exclusive, royalty-free, transferable, worldwide license to host, display, index, format, and distribute your content across the YoStar network and social discovery feeds to fulfill the platform experience. You may terminate this license at any time by deleting your post or account.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">3. Platform Revenue Sharing (70% / 30%)</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Eligible creators who connect a valid Google AdSense Publisher ID (<code className="bg-gray-200 px-1 py-0.5 rounded font-mono">pub-xxxxxxxx</code>) and pass platform quality milestones participate in the 70/30 programmatic ad split. 70% of impression opportunities rotate the creator's publisher unit, while 30% support platform infrastructure. All ad earnings are paid directly into your Google AdSense account by Google.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">4. Liability & Disclaimers</h4>
                  <p className="text-gray-600 leading-relaxed">
                    The platform and materials are provided on an 'as is' basis. YOSTAR LTD makes no warranties, expressed or implied, regarding commercial profitability, continuous uptime, or third-party ad acceptance. In no event shall YOSTAR LTD be liable for indirect, consequential, or lost revenue damages arising from platform usage.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">5. Governing Law & Jurisdiction</h4>
                  <p className="text-gray-600 leading-relaxed">
                    These Terms of Service are governed by and construed in accordance with the laws of the United Kingdom and relevant international treaties. You submit to the exclusive jurisdiction of the competent courts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-black tracking-tight mb-2">
                  YoStar Privacy Policy
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Your privacy is critically important to us. YOSTAR LTD complies with global data protection frameworks, including the EU/UK General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Australian Privacy Act.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">1. Information We Collect</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Account Credentials:</strong> Username, email address, password hashes, and profile bio.</li>
                    <li><strong>Content & Links:</strong> Photos, titles, verified URL links, and interaction tallies (upvotes, views).</li>
                    <li><strong>Log & Technical Data:</strong> IP address, browser user-agent, operating system, timestamp, and device identifiers (used exclusively for anti-fraud rate limiting and milestone validation).</li>
                    <li><strong>Monetization Identifiers:</strong> Google AdSense publisher ID (<code className="bg-gray-200 px-1 py-0.5 rounded font-mono">pub-xxxx</code>) to execute the dynamic ads.txt integration.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">2. Third-Party Service Providers</h4>
                  <p className="text-gray-600 mb-2">We integrate with trusted enterprise providers:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <strong>Google AdSense:</strong> Programmatic display ad delivery and ad revenue processing.
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <strong>Google Web Risk / Vision API:</strong> Automated content safety, malware scanning, and NSFW detection.
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <strong>Supabase / Cloud DB:</strong> Secure, encrypted cloud record persistence.
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                      <strong>Google Analytics:</strong> Aggregated anonymous engagement insights.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">3. GDPR (EU / UK) Compliance & Your Rights</h4>
                  <p className="text-gray-600 mb-2">
                    Under the GDPR, YOSTAR LTD acts as the <strong>Data Controller</strong>. You hold the following enforceable rights:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Right of Access & Portability:</strong> Request a complete machine-readable copy of your personal data.</li>
                    <li><strong>Right to Rectification:</strong> Update and correct inaccurate account information in real-time.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request permanent deletion of your profile, posts, and account records.</li>
                    <li><strong>Right to Object & Restrict Processing:</strong> Withdraw consent for non-essential communications at any time.</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">4. California Privacy Rights (CCPA / CPRA)</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    We do NOT sell or monetize your personal information to data brokers. California residents have the right to request disclosure of categories of personal information collected, request deletion, and opt-out without discriminatory pricing.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">5. Cookies & Local Storage</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We use functional cookies and session tokens to keep you logged into your creator profile and prevent vote tampering. You can clear cookies in your browser settings at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MONETIZATION & PARTNER PROGRAM */}
          {activeTab === 'monetization' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-black text-black">
                    YoStar Partner Monetization Program Guidelines
                  </h3>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  YoStar enables verified creators to earn passive revenue from page views and post engagement using the official Google AdSense 70/30 revenue share model.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-2">🏆 Partner Eligibility Milestones</h4>
                  <p className="text-gray-600 mb-3">To activate AdSense ads on your profile, you must achieve:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <strong className="text-black block text-sm mb-1">1. Minimum 1 Quality Post</strong>
                      <span className="text-gray-500">Original story, photo, or verified URL submission.</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200">
                      <strong className="text-black block text-sm mb-1">2. 5,000 Verified Views</strong>
                      <span className="text-gray-500">Genuine organic views across your published posts.</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-2">🔄 Dynamic ads.txt Setup</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    Once you save your Google AdSense Publisher ID (<code className="bg-gray-200 px-1 py-0.5 rounded font-mono">pub-xxxxxxxxxxxxxxxx</code>) in your Profile Settings, YoStar automatically indexes your publisher record into our live global route:
                  </p>
                  <div className="p-2.5 bg-black text-[#FFFB93] font-mono text-xs rounded-xl flex items-center justify-between">
                    <span>https://yo.star/ads.txt</span>
                    <span className="text-[10px] text-gray-400">google.com, pub-xxxxxxxx, DIRECT, f08c47fec0942fa0</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black text-sm mb-1.5">⚖️ Anti-Fraud & Traffic Authenticity</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Automated scripts, bot hits, VPN click loops, or artificial view manipulation are blocked by our server-side rate limiters. Accounts engaging in invalid traffic generation will have their AdSense monetization revoked and profile permanently banned.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>YoStar Network Policy • Compliant with Google AdSense Standards</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition cursor-pointer border-none"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
