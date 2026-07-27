import * as React from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, AlertCircle, Loader2, Stethoscope, Mail, CheckCircle2, Key } from 'lucide-react';

export default function AuthScreen() {
  const { useState } = React;
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized. Please add this domain to "Authorized domains" in Firebase Console.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled: popup was closed.');
      } else {
        setError(err.message || 'An error occurred during Google Sign In');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) {
          throw new Error('Please enter your email address');
        }
        await sendPasswordResetEmail(auth, email);
        setShowResetSuccess(true);
        return;
      }

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setShowVerification(true);
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        try {
          await sendEmailVerification(userCredential.user);
        } catch (verifyErr: any) {
          console.error('Failed to send verification email:', verifyErr);
          // Don't block registration if email fails, but notify them
          setError('Account created, but verification email failed to send. Please check your email settings or try logging in again.');
        }
        await signOut(auth);
        setShowVerification(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const authErr = err as AuthError;
      
      if (authErr.code === 'auth/operation-not-allowed') {
        setError("Email/Password Authentication is disabled in Firebase. Please use 'Clinician Google Account' below, or enable 'Email/Password' in your Firebase Console (Authentication > Sign-in method).");
      } else if (isLogin) {
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
          setError('Password or Email Incorrect');
        } else {
          setError(err.message || 'An error occurred during sign in');
        }
      } else {
        if (authErr.code === 'auth/email-already-in-use') {
          setError('user already exists. Sign in?');
        } else {
          setError(err.message || 'An error occurred during registration');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (showResetSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-nejm-blue text-white rounded-none mb-6 shadow-xl shadow-nejm-blue/20">
              <Key size={32} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2 tracking-tighter">Reset Link</h1>
            <p className="text-[10px] text-nejm-text/50 uppercase tracking-[0.3em] font-bold italic">Verification Sent</p>
          </div>

          <div className="nejm-card border-t-4 border-t-nejm-blue p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-serif font-bold mb-4 text-nejm-blue">Authentication Update</h2>
            <p className="text-xs text-nejm-text/70 mb-10 leading-relaxed font-sans">
              We have dispatched a secure password reset link to <br/>
              <span className="font-bold text-nejm-blue tracking-tight">{email}</span>.
            </p>

            <button 
              onClick={() => {
                setShowResetSuccess(false);
                setIsForgotPassword(false);
                setIsLogin(true);
              }}
              className="nejm-btn w-full px-4 text-center justify-center flex items-center"
            >
              Return to Access
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-nejm-blue text-white rounded-none mb-6 shadow-xl shadow-nejm-blue/20">
              <Mail size={32} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2 tracking-tighter">Verify Email</h1>
            <p className="text-[10px] text-nejm-text/50 uppercase tracking-[0.3em] font-bold italic">Identity Confirmation</p>
          </div>

          <div className="nejm-card border-t-4 border-t-nejm-blue p-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <CheckCircle2 size={24} className="text-nejm-blue" />
              </div>
            </div>
            <h2 className="text-xl font-serif font-bold mb-4 text-nejm-blue">Clinician Verification</h2>
            <p className="text-xs text-nejm-text/70 mb-10 leading-relaxed font-sans">
              A verification directive has been sent to <br/>
              <span className="font-bold text-nejm-blue tracking-tight">{email}</span>. 
              Please authenticate your email to establish your audit trail.
            </p>

            <button 
              onClick={() => {
                setShowVerification(false);
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
              }}
              className="nejm-btn w-full px-4 text-center justify-center flex items-center"
            >
              Back to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Sophisticated atmospheric background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nejm-blue/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nejm-red/5 blur-[120px] rounded-full"></div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-nejm-blue text-white rounded-none mb-6 shadow-xl shadow-nejm-blue/20">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-nejm-blue mb-2 tracking-tighter">MedWise</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-nejm-red"></div>
            <p className="text-[10px] text-nejm-text/50 uppercase tracking-[0.3em] font-bold">Clinical Portal</p>
            <div className="h-px w-8 bg-nejm-red"></div>
          </div>
        </div>

          <div className="nejm-card border-t-4 border-t-nejm-blue relative overflow-hidden p-10">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Stethoscope size={120} />
            </div>

            {!isForgotPassword && (
              <div className="flex border-b border-nejm-border -mx-10 -mt-10 mb-10">
                <button 
                  onClick={() => { setIsLogin(true); setError(null); setIsForgotPassword(false); }}
                  className={`flex-1 py-5 text-[10px] uppercase font-bold tracking-[0.2em] transition-all relative ${isLogin ? 'text-nejm-blue bg-white' : 'text-nejm-text/30 bg-nejm-gray hover:text-nejm-blue'}`}
                >
                  Sign In
                  {isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-nejm-blue" />}
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(null); setIsForgotPassword(false); }}
                  className={`flex-1 py-5 text-[10px] uppercase font-bold tracking-[0.2em] transition-all relative ${!isLogin ? 'text-nejm-blue bg-white' : 'text-nejm-text/30 bg-nejm-gray hover:text-nejm-blue'}`}
                >
                  Register
                  {!isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-nejm-blue" />}
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="border-b border-nejm-border -mx-10 -mt-10 mb-10 p-10 bg-nejm-gray/30 relative">
                <h2 className="text-lg font-serif font-bold text-nejm-blue">Reset Your Password</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-nejm-text/40 mt-1">Enter your clinical email address below.</p>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-nejm-blue/30" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key="name-field"
                  >
                    <label className="nejm-label block">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="nejm-input" 
                      placeholder="Dr. Jane Smith"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout>
                <label className="nejm-label block">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nejm-input" 
                  placeholder="name@institution.edu"
                />
              </motion.div>

              {!isForgotPassword && (
                <motion.div layout>
                  <div className="flex justify-between items-center mb-1">
                    <label className="nejm-label block mb-0">Password</label>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(null); }}
                        className="text-[9px] text-nejm-blue hover:underline font-bold uppercase tracking-wider"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="nejm-input" 
                    placeholder="••••••••"
                  />
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    key="confirm-password-field"
                  >
                    <label className="nejm-label block">Repeat Password</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="nejm-input" 
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-nejm-red/5 border border-nejm-red/20 text-nejm-red text-[11px] leading-relaxed flex items-start gap-3"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Authorization Error</span>
                  <p className="opacity-80">{error}</p>
                </div>
                {error.includes('Sign in?') && (
                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="shrink-0 px-2 py-1 bg-nejm-red text-white font-bold uppercase tracking-tighter text-[9px] hover:bg-nejm-red/90 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </motion.div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="nejm-btn w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isForgotPassword ? (
                <>
                  <Mail size={20} />
                  Get Reset Link
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={20} />
                  Access MedWise
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

            {isForgotPassword && (
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(null); }}
                className="w-full text-center text-[10px] uppercase font-bold text-nejm-text/40 hover:text-nejm-blue transition-colors mt-2"
              >
                Return to Sign In
              </button>
            )}
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-nejm-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-white px-4 text-nejm-text/30">Or Continue With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-4 px-6 border border-nejm-border bg-white text-[11px] uppercase tracking-[0.15em] font-bold text-nejm-text hover:bg-nejm-cream hover:border-nejm-blue/30 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <img 
                  src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                  alt="Google Logo" 
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="font-sans font-semibold">Clinician Google Account</span>
              </button>
            </>
          )}

          <p className="mt-8 text-[10px] text-center text-nejm-text/40 leading-relaxed uppercase tracking-widest">
            Restricted to medical professionals. <br />
            Subject to institutional audit.
          </p>
        </div>

        <div className="mt-12 text-center opacity-30 text-[10px] uppercase tracking-tighter">
          © 2026 Medical Decision Support Systems
        </div>
      </motion.div>
    </div>
  );
}
