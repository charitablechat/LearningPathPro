import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { navigateTo } from '../lib/router';
import { acceptLegalTerms } from '../lib/legal';

export function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigateTo('/dashboard');
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_CONFIRMED') {
        setError('Please check your email and confirm your account before signing in. Check your spam folder if you don\'t see the email.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
      setLoading(false);
    }
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setSuccessMessage('Account created! Please check your email to confirm your account before signing in.');
  };

  if (showSignUp) {
    return <SignUpPage onBackToLogin={() => setShowSignUp(false)} onSuccess={handleSignUpSuccess} />;
  }

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-24" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Clear Course Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to continue your learning journey</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-200 text-sm">
                {successMessage}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-24" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Your Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-200 text-sm">
                Password reset email sent! Please check your inbox and follow the instructions to reset your password.
              </div>
              <Button type="button" fullWidth onClick={onBackToLogin}>
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Remember your password?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignUpPage({ onBackToLogin, onSuccess }: { onBackToLogin: () => void; onSuccess: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted || !privacyAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);

      await acceptLegalTerms({
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent,
      });

      onSuccess();
    } catch (err: any) {
      if (err.message === 'CONFIRMATION_REQUIRED') {
        onSuccess();
      } else if (err.message.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to sign up');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo_variation_3_gradient.png" alt="Clear Course Studio" className="h-24" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join Clear Course Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Create your account and start learning</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-200 text-sm">
              You will receive a confirmation email after signing up. Please check your email and confirm your account before signing in.
            </div>

            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              helperText="Minimum 6 characters"
            />

            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Terms of Service
                  </a>
                  <span className="text-red-600 dark:text-red-400 ml-1">*</span>
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-red-600 dark:text-red-400 ml-1">*</span>
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I would like to receive marketing emails about new features and updates (optional)
                </span>
              </label>
            </div>

            <Button type="submit" fullWidth disabled={loading || !termsAccepted || !privacyAccepted}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
