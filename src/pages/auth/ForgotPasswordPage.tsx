import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMessage(error);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header title="Reset Password" subtitle="Shikshan Account Recovery" />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 flex flex-col justify-center pb-24">
        <ClayCard className="p-6 sm:p-8 space-y-6 shadow-clay border border-[#DFD8F3]">
          {isSuccess ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Check Your Email</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We have sent a secure password reset link to <strong className="text-slate-800">{email}</strong>.
                  Click the link in that email to choose a new password.
                </p>
              </div>

              <div className="pt-4">
                <Link to="/login">
                  <ClayButton variant="secondary" fullWidth icon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Sign In
                  </ClayButton>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
                <p className="text-xs text-slate-500">
                  Enter your registered email address and we will send you a password reset link.
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
                  label="Registered Email Address"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  hint="We will never share your email with anyone else."
                />

                <ClayButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </ClayButton>
              </form>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-bold text-blue-700 hover:underline">
                  &larr; Back to Sign In
                </Link>
              </div>
            </>
          )}
        </ClayCard>
      </main>
    </div>
  );
};
