import React, { useState } from "react";
import "../styles/login.css";
import AuthBackground from "../components/AuthBackground";
import SocialButtons from "../components/SocialButtons";
import Divider from "../components/Divider";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router";
import { setError } from "../auth.slice";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const  user  = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const submitForm = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    await handleLogin(payload);
    navigate("/");
  };

  if(!loading && user){
    return <Navigate to="/" replace/>
  }

  return (
    <div
      className="min-h-screen w-full flex relative"
      style={{
        backgroundColor: "#030712",
        color: "#f8fafc",
        fontFamily: "'Satoshi', sans-serif",
      }}
    >
      {/* Background wrapper to clip glows without breaking page scroll */}
      <AuthBackground />

      {/* ── LEFT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 w-full">
        <div className="w-full max-w-md space-y-8">
          {/* Logo + heading */}
          <div className="flex flex-col items-center sm:items-start">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "#bef264",
                boxShadow: "0 8px 24px rgba(190,242,100,0.2)",
              }}
            >
              <iconify-icon icon="lucide:brain" className="text-2xl text-slate-900"></iconify-icon>
            </div>
            <h1
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Sign in to continue your journey with Neurox.
            </p>
          </div>

          {/* Social buttons */}
          <SocialButtons />

          {/* Divider */}
          <Divider />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 mb-4">
              <iconify-icon icon="lucide:alert-circle"></iconify-icon>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={submitForm}>
            {/* Email */}
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-wider ml-1"
                style={{ color: "#94a3b8" }}
              >
                Email Address
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="felix@example.com"
                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                style={{ color: "#f1f5f9" }}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#94a3b8" }}
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-[11px] transition-colors"
                  style={{ color: "rgba(190,242,100,0.8)" }}
                  onMouseEnter={(e) => (e.target.style.color = "#bef264")}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "rgba(190,242,100,0.8)")
                  }
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field w-full pl-4 pr-11 py-3.5 rounded-xl text-sm"
                  style={{ color: "#f1f5f9" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lime-400 transition-colors focus:outline-none"
                >
                  <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"}></iconify-icon>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full font-bold py-4 rounded-xl transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "#bef264",
                color: "#0f172a",
                boxShadow: "0 0 25px rgba(190,242,100,0.25)",
              }}
            >
              Sign In
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "#64748b" }}>
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold transition-colors"
              style={{ color: "rgba(190,242,100,0.8)" }}
              onMouseEnter={(e) => (e.target.style.color = "#bef264")}
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(190,242,100,0.8)")
              }
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
