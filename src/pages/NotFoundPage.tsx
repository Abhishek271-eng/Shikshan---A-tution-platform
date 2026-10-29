import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Header } from '../components/common/Header';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Page Not Found" subtitle="404 Error" />

      <main className="flex-1 max-w-md mx-auto w-full px-4 sm:px-6 py-12 flex flex-col justify-center">
        <ClayCard className="p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Page Not Found</h2>
            <p className="text-xs text-slate-500">
              The screen you are looking for does not exist or may have moved.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <ClayButton
              variant="secondary"
              fullWidth
              onClick={() => navigate(-1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </ClayButton>
            <ClayButton
              variant="primary"
              fullWidth
              onClick={() => navigate('/')}
              icon={<Home className="w-4 h-4" />}
            >
              Shikshan Home
            </ClayButton>
          </div>
        </ClayCard>
      </main>
    </div>
  );
};
