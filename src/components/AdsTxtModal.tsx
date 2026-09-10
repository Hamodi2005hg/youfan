import React, { useState, useEffect } from 'react';
import { FileText, Copy, ExternalLink, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AdsTxtModalProps {
  onClose: () => void;
}

export const AdsTxtModal: React.FC<AdsTxtModalProps> = ({ onClose }) => {
  const [content, setContent] = useState<string>('Loading dynamic ads.txt...');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchAdsTxt = async () => {
    setLoading(true);
    try {
      const res = await fetch('/ads.txt');
      const text = await res.text();
      setContent(text);
    } catch (err) {
      setContent('Error fetching /ads.txt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsTxt();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-black">Dynamic /ads.txt</h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Render Compatible
                </span>
              </div>
              <p className="text-xs text-gray-500">Live Backend Route generated from Supabase & verified creators</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="my-4 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">📡 How this works on Render / Production:</p>
          <p className="text-blue-800">
            Whenever Google AdSense crawlers inspect your domain at <code className="font-mono bg-blue-100/70 px-1 py-0.5 rounded">/ads.txt</code>,
            Express immediately queries Supabase to yield your master platform publisher ID alongside all verified creators meeting the 5,000 verified post views threshold in direct plain text format.
          </p>
        </div>

        {/* Code view */}
        <div className="relative flex-1 min-h-[260px] bg-gray-950 text-gray-200 rounded-2xl p-4 font-mono text-xs overflow-y-auto border border-gray-800">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdsTxt}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <a
            href="/ads.txt"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-full transition"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
