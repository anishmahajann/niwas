import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  firebaseAuth,
  isFirebaseClientConfigured,
  missingFirebaseClientSettings,
} from '../config/firebase';

export default function AuthDialog() {
  const { authDialogOpen, closeAuthDialog, addToast } = useApp();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authDialogOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) throw new Error('Enter your name (at least 2 characters).');
        if (password !== confirmPassword) throw new Error('The passwords do not match.');
        const { user } = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        try {
          await updateProfile(user, { displayName: name.trim() });
          await user.getIdToken(true);
          await sendEmailVerification(user);
        } finally {
          await firebaseSignOut(firebaseAuth);
        }
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        addToast('Account created. Verify your email before signing in.');
      } else {
        const { user } = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          await firebaseSignOut(firebaseAuth);
          throw new Error('Please verify your email first. We sent you a new verification link.');
        }
        closeAuthDialog();
        addToast('You are signed in to Niwas.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!firebaseAuth) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      closeAuthDialog();
      addToast('You are signed in to Niwas.');
    } catch (error) {
      setErrorMessage(error.message || 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!firebaseAuth || !email.trim()) {
      setErrorMessage('Enter your email address first.');
      return;
    }
    setErrorMessage('');
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      addToast('Password reset instructions have been sent to your email.');
    } catch (error) {
      setErrorMessage(error.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" onClick={closeAuthDialog}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <button type="button" onClick={closeAuthDialog} aria-label="Close sign in" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 id="sign-in-title" className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
          {mode === 'signup' ? 'Create your Niwas account' : 'Sign in to Niwas'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your Firebase account securely signs you in; Niwas stores your profile and permissions in MongoDB.
        </p>

        {!isFirebaseClientConfigured && (
          <p role="alert" className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Add these Firebase web app settings to .env: {missingFirebaseClientSettings.join(', ')}.
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input id="auth-name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="auth-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <input id="auth-confirm-password" type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </div>
          )}
          <button type="submit" disabled={!isFirebaseClientConfigured || isSubmitting} className="w-full rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {mode === 'login' && (
          <button type="button" onClick={handlePasswordReset} disabled={!isFirebaseClientConfigured || isSubmitting} className="mt-3 w-full text-sm font-medium text-teal-800 hover:text-teal-950 disabled:opacity-50">
            Forgot password?
          </button>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
        </div>
        <button type="button" onClick={handleGoogleSignIn} disabled={!isFirebaseClientConfigured || isSubmitting} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
          Continue with Google
        </button>
        <p className="mt-5 text-center text-sm text-slate-600">
          {mode === 'signup' ? 'Already have an account?' : 'New to Niwas?'}{' '}
          <button type="button" onClick={() => { setErrorMessage(''); setPassword(''); setConfirmPassword(''); setMode(mode === 'signup' ? 'login' : 'signup'); }} className="font-semibold text-teal-800 hover:text-teal-950">
            {mode === 'signup' ? 'Sign in' : 'Create account'}
          </button>
        </p>
        <p className="mt-4 text-center text-xs leading-5 text-slate-400">Email accounts must verify their address before signing in. Your password is handled by Firebase and is never stored in MongoDB.</p>
      </section>
    </div>
  );
}
