import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, LogIn, AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { PasswordInput } from '../../components/common/PasswordInput';
import { ClayButton } from '../../components/common/ClayButton';
import { SetupNotice } from '../../components/common/SetupNotice';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }

      // Query user's role from cloud profiles table to route correctly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const role = profile?.role;

        // Check if there is an intended redirect destination
        const fromPath = (location.state as { from?: string })?.from;
        if (fromPath && fromPath !== '/login') {
          navigate(fromPath, { replace: true });
          return;
        }

        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'student') {
          navigate('/student/dashboard', { replace: true });
        } else if (role === 'tutor') {
          // Check application status
          const { data: app } = await supabase
            .from('tutor_applications')
            .select('status')
            .eq('tutor_id', user.id)
            .maybeSingle();

          if (app?.status === 'approved') {
            navigate('/tutor/dashboard', { replace: true });
          } else {
            navigate('/tutor/status', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please check your credentials.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Sign In" subtitle="Access your Shikshan account" />
      <SetupNotice />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 flex flex-col justify-center">
        <ClayCard className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500">
              Sign in to continue your learning or tutoring journey
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <p className="font-semibold">Demo Notice:</p>
              <p className="mt-0.5">
                Supabase credentials have not been configured yet. To sign in with real cloud credentials, configure <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ClayInput
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <PasswordInput
                label="Password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                showRequirements={false}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <ClayButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </ClayButton>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">Don&apos;t have an account yet?</p>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-blue-700">
              <Link to="/student/register" className="hover:underline">
                Register as Student
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/tutor/register" className="hover:underline">
                Apply as Tutor
              </Link>
            </div>
          </div>
        </ClayCard>
      </main>
    </div>
  );
};
