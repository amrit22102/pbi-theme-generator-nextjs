'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const handleSignIn = (provider: 'google' | 'microsoft' | 'demo') => {
    signIn(provider);
    router.push('/');
  };

  return (
    <div className={styles.signinPage}>
      <div className="mesh-gradient-bg" />
      <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className={`${styles.signinCard} glass-card`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <span className={styles.logoText}>
            <span className="gradient-text">Theme Studio</span>
          </span>
        </div>
        <p className={styles.subtitle}>
          Create professional Power BI themes with a visual editor.
          <br />
          Sign in to get started.
        </p>

        <button
          id="signin-google"
          className={`${styles.providerBtn} ${styles.googleIcon}`}
          onClick={() => handleSignIn('google')}
        >
          <span className={styles.providerIcon}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </span>
          Continue with Google
        </button>

        <button
          id="signin-microsoft"
          className={`${styles.providerBtn} ${styles.microsoftIcon}`}
          onClick={() => handleSignIn('microsoft')}
        >
          <span className={styles.providerIcon}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
          </span>
          Continue with Microsoft
        </button>

        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <div className={styles.dividerLine} />
        </div>

        <button
          id="signin-demo"
          className={`${styles.providerBtn} ${styles.demoBtn}`}
          onClick={() => handleSignIn('demo')}
        >
          🚀 Try Demo Mode
        </button>

        <p className={styles.footer}>
          No account required in demo mode. Your themes are generated locally.
        </p>
      </div>
    </div>
  );
}
