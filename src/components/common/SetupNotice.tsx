import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SetupNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isSupabaseConfigured) {
    return null;
  }

  const sampleEnv = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key`;

  const copyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label="Configuration notice"
      className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-sm"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-amber-950">
              Supabase Configuration Required for Full Cloud Persistence
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            {isOpen ? 'Hide Instructions' : 'View Setup Steps'}
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-2 pt-2 border-t border-amber-200 text-xs space-y-2.5 text-amber-900">
            <p>
              The interface is fully functional in preview mode. To enable real email authentication, database writes, and private marksheet storage, add your Supabase project keys to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code>:
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs">
              <pre>{sampleEnv}</pre>
              <button
                onClick={copyEnv}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy configuration"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Execute the SQL migration in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code></li>
              <li>Run the storage setup in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase/storage.sql</code></li>
              <li>Restart the development server with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">npm run dev</code></li>
            </ol>
          </div>
        )}
      </div>
    </aside>
  );
};
