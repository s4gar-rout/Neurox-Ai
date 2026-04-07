import React,{useState} from 'react'
import { Link } from 'react-router'
import '../styles/register.css'
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";
import { setError } from "../auth.slice";
import AuthBackground from '../components/AuthBackground'
import { useEffect } from "react";
import SocialButtons from '../components/SocialButtons'
import Divider from '../components/Divider'


const Register = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const submitForm = async(e)=>{
    e.preventDefault()

    if (password !== confirmPassword) {
      dispatch(setError("Passwords do not match"));
      return;
    }

    const payload={
      username,
      email,
      password
    }

    const result = await handleRegister(payload);
    
    if (result && result.success) {
      setIsSuccess(true);
    }
  }

  return (
    <div className="min-h-screen w-full flex relative register-body">
      {/* Background wrapper to clip glows without breaking page scroll */}
      <AuthBackground />

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 w-full">
        {isSuccess ? (
          <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
             <div className="w-20 h-20 bg-lime-400 rounded-3xl flex items-center justify-center text-slate-900 shadow-xl mx-auto shadow-lime-400/20 mb-8">
              <iconify-icon icon="lucide:mail-check" className="text-4xl"></iconify-icon>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Check your email</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We've sent a verification link to <span className="text-slate-200 font-semibold">{email}</span>. Please check your inbox and spam folder, then click the link to verify your account.
            </p>
            <div className="pt-4">
              <Link to="/login" className="w-full bg-slate-800 text-slate-100 font-bold py-4 rounded-xl shadow-lg border border-white/5 hover:bg-slate-700 transition-all inline-flex items-center justify-center">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col items-center sm:items-start">
            <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl mb-6 shadow-lime-400/20">
              <iconify-icon icon="lucide:brain" className="text-3xl"></iconify-icon>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create account</h1>
            <p className="text-slate-400 text-sm">Begin your journey with Neurox today.</p>
          </div>
          
          <SocialButtons isSignUp={true} />
          
          <Divider />
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 mb-4">
              <iconify-icon icon="lucide:alert-circle"></iconify-icon>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={submitForm}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                  <iconify-icon icon="lucide:user"></iconify-icon>
                </span>
                <input onChange={(e)=>setUsername(e.target.value)}
                value={username}
                 type="text" placeholder="Felix Arvid" className="input-field w-full px-11 py-3.5 rounded-xl text-slate-100 placeholder-slate-600 text-sm" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                  <iconify-icon icon="lucide:mail"></iconify-icon>
                </span>
                <input onChange={(e)=>setEmail(e.target.value)}
                value={email}
                type="email" placeholder="felix@example.com" className="input-field w-full px-11 py-3.5 rounded-xl text-slate-100 placeholder-slate-600 text-sm" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                    <iconify-icon icon="lucide:lock"></iconify-icon>
                  </span>
                  <input onChange={(e)=>setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? "text" : "password"} placeholder="••••••••" className="input-field w-full px-11 py-3.5 rounded-xl text-slate-100 placeholder-slate-600 text-sm" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lime-400 transition-colors focus:outline-none"
                  >
                    <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"}></iconify-icon>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                    <iconify-icon icon="lucide:shield-check"></iconify-icon>
                  </span>
                  <input 
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="input-field w-full px-11 py-3.5 rounded-xl text-slate-100 placeholder-slate-600 text-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lime-400 transition-colors focus:outline-none"
                  >
                    <iconify-icon icon={showConfirmPassword ? "lucide:eye-off" : "lucide:eye"}></iconify-icon>
                  </button>
                </div>
              </div>
            </div>
         
            
            <button type="submit" id="signup-submit-btn" className="w-full bg-lime-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-lime-400/10 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all glow-accent mt-2 inline-flex items-center justify-center">
              Sign Up
            </button>
          </form>
          
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" id="login-redirect-link" className="text-lime-400/80 hover:text-lime-400 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
        )}
      </div>
      
    
    </div>
  )
}

export default Register