import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Logo } from '../../components/ui/Logo';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { FormMessage } from '../../components/forms/FormMessage';
import { useSeo } from '../../hooks/useSeo';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  useSeo({
    title: 'Admin Terminal Login',
    description: 'Waliliens Studio Operations & Management Terminal.',
    robots: 'noindex, nofollow',
  });

  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMessage(res.error || 'Invalid admin credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-obsidian-950 px-4 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyber-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyber-violet/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-obsidian-900/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_30px_rgba(0,240,255,0.25)] mb-4">
            <Logo />
          </div>
          <div className="font-mono text-xs text-cyber-cyan font-bold tracking-widest uppercase mb-1">
            WALILIENS STUDIO // OPERATIONS
          </div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Admin Terminal</h2>
          <p className="font-mono text-xs text-neutral-400 mt-2">
            Authenticate to access booking records and client briefs.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6">
            <FormMessage type="error" title="Authentication Failed" message={errorMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Admin Email" required>
            <div className="relative">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@waliliens.com"
              />
              <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>
          </FormField>

          <FormField label="Password" required>
            <div className="relative">
              <TextInput
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
              />
              <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>
          </FormField>

          <div className="pt-2">
            <SubmitButton isLoading={isSubmitting} loadingText="AUTHENTICATING...">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>ACCESS OPERATIONS TERMINAL</span>
              </div>
            </SubmitButton>
          </div>
        </form>

        <div className="mt-8 border-t border-white/10 pt-4 text-center font-mono text-[11px] text-neutral-400">
          Protected with HTTP-only tokens & server-side authorization.
        </div>
      </div>
    </main>
  );
};
