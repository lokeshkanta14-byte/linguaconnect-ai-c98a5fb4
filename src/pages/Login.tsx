import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight, Eye, EyeOff, Mail, Phone, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
];

type AuthMode = "email" | "phone";
type PhoneStep = "input" | "otp";

const Login = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("email");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: name.trim(), preferred_language: language },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) toast({ title: error.message, variant: "destructive" });
      else toast({ title: "Check your email to confirm your account!" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) toast({ title: error.message, variant: "destructive" });
      else navigate("/");
    }
    setLoading(false);
  };

  const handleSendOTP = async () => {
    const phone = phoneNumber.replace(/\D/g, "");
    if (phone.length < 7 || phone.length > 15) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    const fullPhone = `${countryCode.code}${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setPhoneStep("otp");
      setResendTimer(30);
      setOtpAttempts(0);
      toast({ title: "OTP sent to your phone!" });
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({ title: "Please enter the 6-digit OTP", variant: "destructive" });
      return;
    }
    if (otpAttempts >= 3) {
      toast({ title: "Too many attempts. Please resend OTP.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const fullPhone = `${countryCode.code}${phoneNumber.replace(/\D/g, "")}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: code,
      type: "sms",
    });
    if (error) {
      setOtpAttempts((p) => p + 1);
      toast({ title: `Invalid OTP. ${2 - otpAttempts} attempts remaining.`, variant: "destructive" });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const fullPhone = `${countryCode.code}${phoneNumber.replace(/\D/g, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) toast({ title: error.message, variant: "destructive" });
    else {
      setResendTimer(30);
      setOtpAttempts(0);
      setOtp(["", "", "", "", "", ""]);
      toast({ title: "OTP resent!" });
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast({ title: error.message, variant: "destructive" });
    else {
      toast({ title: "Password reset link sent to your email!" });
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }, []);

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Forgot password modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email to receive a reset link
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
              placeholder="you@email.com"
            />
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Spinner /> : "Send Reset Link"}
            </button>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification screen
  if (authMode === "phone" && phoneStep === "otp") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display text-foreground">Verify OTP</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to {countryCode.code} {phoneNumber}
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-11 h-13 text-center text-lg font-bold rounded-xl bg-secondary text-secondary-foreground outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            ))}
          </div>

          {otpAttempts > 0 && (
            <p className="text-xs text-destructive text-center mb-3">
              {3 - otpAttempts} attempt{3 - otpAttempts !== 1 ? "s" : ""} remaining
            </p>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otpAttempts >= 3}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mb-4"
          >
            {loading ? <Spinner /> : <>Verify <ArrowRight className="w-4 h-4" /></>}
          </button>

          <div className="text-center">
            <button
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
              className="text-sm text-primary font-semibold hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>

          <button
            onClick={() => { setPhoneStep("input"); setOtp(["", "", "", "", "", ""]); setOtpAttempts(0); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 text-center"
          >
            Change phone number
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gradient">LinguaConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">Chat across languages, effortlessly</p>
        </div>

        {/* Auth mode tabs */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => setAuthMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              authMode === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            onClick={() => setAuthMode("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              authMode === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Phone className="w-4 h-4" /> Phone
          </button>
        </div>

        {/* Email form */}
        {authMode === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
            {isSignup && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-11 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none text-secondary-foreground"
                >
                  <option>English</option>
                  <option>Telugu (తెలుగు)</option>
                  <option>Hindi (हिन्दी)</option>
                </select>
              </div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setResetEmail(email); }}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
            >
              {loading ? <Spinner /> : <>{isSignup ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-semibold hover:underline">
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        )}

        {/* Phone form */}
        {authMode === "phone" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="h-12 px-3 rounded-xl bg-secondary text-sm flex items-center gap-1 text-secondary-foreground min-w-[90px]"
                  >
                    <span>{countryCode.flag}</span>
                    <span>{countryCode.code}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {showCountryPicker && (
                    <div className="absolute top-14 left-0 bg-popover border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto w-48">
                      {COUNTRY_CODES.map((cc) => (
                        <button
                          key={cc.code}
                          onClick={() => { setCountryCode(cc); setShowCountryPicker(false); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 text-popover-foreground"
                        >
                          <span>{cc.flag}</span>
                          <span>{cc.country}</span>
                          <span className="text-muted-foreground ml-auto">{cc.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-12 px-4 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-secondary-foreground placeholder:text-muted-foreground"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Spinner /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Spinner = () => (
  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
);

export default Login;
