import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/favicon.webp";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Sign Up
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);

  const [isVerificationMode, setIsVerificationMode] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setError("");
    setMessage("");
    setIsLoading(false);
    setIsVerificationMode(false);
    setIsForgotPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError("");
    setMessage("");
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Unable to authenticate with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyClick = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      // If it succeeds, they are verified
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/unverified-email") {
        setError("Email not verified yet. Please check your inbox and click the link.");
      } else {
        setError("Unable to verify. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        if (!name.trim()) {
          setError("Name is required for registration.");
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password, phone);
        setIsVerificationMode(true);
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/unverified-email") {
        setError(err.message);
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(`Unable to ${isLogin ? "sign in" : "create your account"}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await resetPassword(email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        setError("Invalid email address or user not found.");
      } else {
        setError("Unable to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E9E4DA] p-6 sm:p-8 max-h-[90vh] overflow-y-auto font-sans">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isVerificationMode ? (
          <div className="text-center">
            <img alt="The Agamas Logo" className="h-10 w-auto mx-auto mb-4 rounded-xl shadow-sm object-cover" src={logo} />
            <h2 className="text-2xl text-[#001e2d] mb-2 leading-tight font-serif-display">
              Verify <span className="italic text-[#cd5c3d]">Email</span>
            </h2>
            <p className="text-sm text-[#001e2d]/70 font-sans mb-6">
              We've sent a verification email to <strong>{email}</strong>. Please check your inbox and confirm your email.
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 text-center">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleVerifyClick}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify
              </button>
              <button
                onClick={() => {
                  setIsVerificationMode(false);
                  setIsLogin(true);
                  setError("");
                }}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-white border border-[#E5DEC9] px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <img alt="The Agamas Logo" className="h-10 w-auto mx-auto mb-4 rounded-xl shadow-sm object-cover" src={logo} />
              <h2 className="text-2xl text-[#001e2d] mb-2 leading-tight font-serif-display">
                {isLogin ? (
                  <>Welcome <span className="italic text-[#cd5c3d]">Back</span></>
                ) : (
                  <>Create <span className="italic text-[#cd5c3d]">Account</span></>
                )}
              </h2>
              <p className="text-sm text-[#001e2d]/70 font-sans">
                {isLogin ? "Sign in to continue your journey" : "Begin your journey with The Agamas"}
              </p>
            </div>

            {/* Error / Success Message */}
            {error && (
              <div className="mb-4 p-3 rounded-full bg-red-50 border border-red-100 text-sm text-red-600 text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 rounded-full bg-green-50 border border-green-100 text-sm text-green-600 text-center">
                {message}
              </div>
            )}

            {isForgotPassword ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-800 mb-1.5 px-2">
                    Email ID
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full rounded-full border border-[#E5DEC9] bg-[#FFFDF8] px-5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send Reset Link
                </button>
                <div className="mt-4 text-center text-sm text-slate-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError("");
                      setMessage("");
                    }}
                    disabled={isLoading}
                    className="font-medium text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Google Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-white border border-[#E5DEC9] px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && isLogin ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5DEC9]"></div>
              </div>
              <div className="relative bg-white px-4 text-xs uppercase tracking-widest text-slate-400 font-medium">OR</div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-800 mb-1.5 px-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={!isLogin}
                    className="w-full rounded-full border border-[#E5DEC9] bg-[#FFFDF8] px-5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1.5 px-2">
                  Email ID
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-full border border-[#E5DEC9] bg-[#FFFDF8] px-5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1.5 px-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    required
                    className="w-full rounded-full border border-[#E5DEC9] bg-[#FFFDF8] px-5 py-2.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end mt-1.5 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError("");
                        setMessage("");
                      }}
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-800 mb-1.5 px-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full rounded-full border border-[#E5DEC9] bg-[#FFFDF8] px-5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && !isLogin ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={handleToggleMode}
                disabled={isLoading}
                className="font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
            </>
          )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
