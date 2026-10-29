import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { useAuth } from '../../context/AuthContext';

export const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header title="Set New Password" subtitle="Security update" />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 flex flex-col justify-center pb-24">
        <ClayCard className="p-6 sm:p-8 space-y-6 shadow-clay border border-[#DFD8F3]">
          {isSuccess ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Password Updated Successfully</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Your account password has been changed. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-4">
                <ClayButton
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Continue to Sign In
                </ClayButton>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h2>
                <p className="text-xs text-slate-500">
                  Please enter your new secure password below.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <ClayInput
                  label="New Password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />

                <ClayInput
                  label="Confirm New Password"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />

                <ClayButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Update Password
                </ClayButton>
              </form>
            </>
          )}
        </ClayCard>
      </main>
    </div>
  );
};
