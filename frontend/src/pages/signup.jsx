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
import { User, Mail, Lock, Shield, Check, AlertCircle } from "lucide-react";

// ── Password strength helper ───────────────────
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0–4
}
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#ef4444", "#f59e0b", "#3B82F6", "#22c55e"];

// lucide icons imported above

// ──────────────────────────────────────────────
export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [focused, setFocus] = useState(null);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoad] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const strength = getStrength(form.password);

  // ── Field updater ────────────────────────────
  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  // ── Validation ───────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "At least 8 characters required.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!agreed) e.agreed = "You must accept the terms to continue.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoad(true);
    try {
      const response = await authAPI.signup(
        form.name,
        form.email,
        form.password,
      );
      // Store user and token in auth context
      login(response.user, response.access_token);
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle specific error: User already exists
      if (err.message.includes("already exists")) {
        setErrors({ email: "This email is already registered." });
      } else {
        setErrors({ form: err.message || "Signup failed. Please try again." });
      }
    } finally {
      setLoad(false);
    }
  };

  // ── Password strength bar ────────────────────
  const StrengthBar = () =>
    form.password.length > 0 ? (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-all duration-300"
              style={{
                background:
                  i <= strength
                    ? STRENGTH_COLOR[strength]
                    : "rgba(139,92,246,0.1)",
              }}
            />
          ))}
        </div>
        <span
          className="text-[11px] font-semibold"
          style={{ color: STRENGTH_COLOR[strength] }}
        >
          {STRENGTH_LABEL[strength]} password
        </span>
      </div>
    ) : null;

  // ── Password match indicator ─────────────────
  const MatchCheck = () =>
    form.confirm.length > 0 &&
    !errors.confirm &&
    form.password === form.confirm ? (
      <div className="flex items-center gap-1.5 mt-1.5">
        <Check size={12} color="#22c55e" strokeWidth={3} />
        <span
          className="text-[11px] font-semibold"
          style={{ color: "#22c55e" }}
        >
          Passwords match
        </span>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center relative overflow-hidden p-6">
      <AuthBackground />

      <AuthCard>
        <AuthLogo />

        <AuthHeading
          title="Create your account"
          subtitle="Start practicing smarter. Land your dream role."
        />

        {/* Google first */}
        <div style={{ animation: "fadeUp 0.5s 0.15s both" }}>
          <GoogleButton label="Sign up with Google" />
        </div>

        <OrDivider text="or sign up with email" />

        {errors.form && <ErrorAlert message={errors.form} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full name */}
          <div style={{ animation: "fadeUp 0.5s 0.2s both" }}>
            <InputField
              label="Full Name"
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={set("name")}
              onFocus={() => setFocus("name")}
              onBlur={() => setFocus(null)}
              focused={focused === "name"}
              error={errors.name}
              icon={<User size={16} />}
            />
          </div>

          {/* Email */}
          <div style={{ animation: "fadeUp 0.5s 0.25s both" }}>
            <InputField
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              onFocus={() => setFocus("email")}
              onBlur={() => setFocus(null)}
              focused={focused === "email"}
              error={errors.email}
              icon={<Mail size={16} />}
            />
          </div>

          {/* Password */}
          <div style={{ animation: "fadeUp 0.5s 0.3s both" }}>
            <InputField
              label="Password"
              id="password"
              type={show.password ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              onFocus={() => setFocus("password")}
              onBlur={() => setFocus(null)}
              focused={focused === "password"}
              error={errors.password}
              icon={<Lock size={16} />}
              rightElement={
                <EyeToggle
                  show={show.password}
                  onClick={() =>
                    setShow((s) => ({ ...s, password: !s.password }))
                  }
                />
              }
              extra={<StrengthBar />}
            />
          </div>

          {/* Confirm password */}
          <div style={{ animation: "fadeUp 0.5s 0.35s both" }}>
            <InputField
              label="Confirm Password"
              id="confirm"
              type={show.confirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={set("confirm")}
              onFocus={() => setFocus("confirm")}
              onBlur={() => setFocus(null)}
              focused={focused === "confirm"}
              error={errors.confirm}
              icon={<Shield size={16} />}
              rightElement={
                <EyeToggle
                  show={show.confirm}
                  onClick={() =>
                    setShow((s) => ({ ...s, confirm: !s.confirm }))
                  }
                />
              }
              extra={<MatchCheck />}
            />
          </div>

          {/* Terms checkbox */}
          <div style={{ animation: "fadeUp 0.5s 0.4s both" }}>
            <label
              className="flex items-start gap-2.5 cursor-pointer select-none"
              onClick={() => {
                setAgreed((a) => !a);
                if (errors.agreed)
                  setErrors((e) => {
                    const n = { ...e };
                    delete n.agreed;
                    return n;
                  });
              }}
            >
              {/* Custom checkbox */}
              <div
                className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  border: `1.5px solid ${errors.agreed ? "rgba(239,68,68,0.5)" : agreed ? "#8B5CF6" : "rgba(139,92,246,0.25)"}`,
                  background: agreed
                    ? "linear-gradient(135deg,#3B82F6,#8B5CF6)"
                    : "transparent",
                }}
              >
                {agreed && <Check size={9} color="#fff" strokeWidth={3.5} />}
              </div>
              <span
                className="text-[12.5px] leading-relaxed"
                style={{ color: "rgba(196,181,253,0.5)" }}
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="font-medium transition-colors duration-200 hover:text-purple-300"
                  style={{ color: "#8B5CF6", textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="font-medium transition-colors duration-200 hover:text-purple-300"
                  style={{ color: "#8B5CF6", textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.agreed && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={11} color="#ef4444" strokeWidth={2.5} />
                <span className="text-[11px]" style={{ color: "#fca5a5" }}>
                  {errors.agreed}
                </span>
              </div>
            )}
          </div>

          <SubmitButton
            loading={loading}
            label="Create Account"
            loadingLabel="Creating account..."
          />
        </form>

        <AuthFooter
          text="Already have an account?"
          linkText="Sign in"
          to="/login"
        />
      </AuthCard>

      <AuthStyles />
    </div>
  );
}
