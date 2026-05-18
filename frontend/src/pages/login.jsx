import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import {
  AuthBackground,
  AuthCard,
  AuthLogo,
  AuthHeading,
  ErrorAlert,
  InputField,
  EyeToggle,
  SubmitButton,
  OrDivider,
  GoogleButton,
  AuthFooter,
  AuthStyles,
} from "../components/AuthComponents";
import { Mail, Lock } from "lucide-react";

// lucide icons imported above

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      // Store user and token in auth context
      login(response.user, response.access_token);
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center relative overflow-hidden p-6">
      <AuthBackground />

      <AuthCard>
        <AuthLogo />

        <AuthHeading
          title="Welcome back"
          subtitle="Sign in to continue your interview prep journey."
        />

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div style={{ animation: "fadeUp 0.5s 0.2s both" }}>
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              focused={focused === "email"}
              icon={<Mail size={16} />}
            />
          </div>

          {/* Password row — custom label with forgot link */}
          <div style={{ animation: "fadeUp 0.5s 0.25s both" }}>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(196,181,253,0.42)" }}
              >
                Password
              </span>
              <a
                href="/forgot-password"
                className="text-xs font-medium transition-opacity duration-200 hover:opacity-100"
                style={{
                  color: "#8B5CF6",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                Forgot password?
              </a>
            </div>
            <InputField
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              focused={focused === "password"}
              icon={<Lock size={16} />}
              rightElement={
                <EyeToggle
                  show={showPassword}
                  onClick={() => setShowPass((s) => !s)}
                />
              }
            />
          </div>

          <SubmitButton
            loading={loading}
            label="Sign In"
            loadingLabel="Signing in..."
          />
        </form>

        <OrDivider />
        <GoogleButton label="Continue with Google" />
        <AuthFooter
          text="Don't have an account?"
          linkText="Sign up free"
          to="/signup"
        />
      </AuthCard>

      <AuthStyles />
    </div>
  );
}
