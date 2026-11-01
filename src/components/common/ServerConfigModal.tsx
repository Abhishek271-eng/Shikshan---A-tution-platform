import React, { useState } from 'react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, X, Globe } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, api } from '../../lib/api';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ isOpen, onClose }) => {
  const currentUrl = getApiBaseUrl();
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setStatusMessage('Testing connection to server...');

    try {
      const data = await api.checkHealth(urlInput.trim());
      setTestStatus('success');
      setStatusMessage(`Connected successfully! Server: ${data.status}, DB: ${data.database}`);
    } catch (err: unknown) {
      setTestStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to reach server. Please check URL or network.');
    }
  };

  const handleSave = () => {
    setCustomApiUrl(urlInput.trim());
    onClose();
    // Soft reload to apply across running instances
    window.location.reload();
  };

  const handleReset = () => {
    setCustomApiUrl(null);
    setUrlInput('http://192.168.1.253:5000/api');
    setTestStatus('idle');
    setStatusMessage('Reset to default Home Wi-Fi URL.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Server Connection Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#DFD8F3] space-y-4 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-[#686487] hover:text-[#1C1938] rounded-full hover:bg-[#F3EEFB] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#1C1938]">Server Settings</h3>
            <p className="text-[11px] text-[#686487]">Backend API Endpoint for Testing</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="server-url-input" className="block text-xs font-bold text-[#1C1938]">
            API Base URL
          </label>
          <div className="flex items-center bg-[#F8F7FD] border border-[#DFD8F3] rounded-2xl px-3 py-2 focus-within:border-[#6D28D9]">
            <Globe className="w-4 h-4 text-[#8B5CF6] mr-2 flex-shrink-0" />
            <input
              id="server-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="http://192.168.1.253:5000/api"
              className="w-full bg-transparent text-xs font-semibold text-[#1C1938] focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-[#8C88A8]">
            For testing outside home Wi-Fi, enter your free Cloudflare Tunnel URL.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#686487] uppercase tracking-wider">Quick Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setUrlInput('http://192.168.1.253:5000/api');
                setTestStatus('idle');
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#F3EEFB] text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#EDE9FE]"
            >
              Home Wi-Fi (192.168.1.253)
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlInput('http://localhost:5000/api');
                setTestStatus('idle');
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#F3EEFB] text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#EDE9FE]"
            >
              Localhost (127.0.0.1)
            </button>
          </div>
        </div>

        {/* Status display */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
              testStatus === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : testStatus === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
            {testStatus === 'testing' && <RefreshCw className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5 animate-spin" />}
            <p className="leading-snug text-[11px] font-medium">{statusMessage}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#F3EEFB] text-[#6D28D9] text-xs font-bold hover:bg-[#EDE9FE] transition-colors border border-[#DDD6FE] flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            Test Server
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#6D28D9] text-white text-xs font-bold hover:bg-[#5B21B6] transition-colors shadow-sm"
          >
            Save & Apply
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-[#686487] hover:text-[#1C1938] underline"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};
