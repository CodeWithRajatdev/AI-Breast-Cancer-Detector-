import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Ribbon, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useApp } from '../App.jsx'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { login } = useApp()
  const nav = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) { setError('Please fill all fields.'); return }
    if (mode === 'signup' && !form.name) { setError('Please enter your name.'); return }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return }

    const users = JSON.parse(localStorage.getItem('cs_users') || '[]')

    if (mode === 'signup') {
      if (users.find(u => u.email === form.email)) { setError('Email already registered.'); return }
      const newUser = { id: Date.now(), name: form.name, email: form.email, password: form.password }
      users.push(newUser)
      localStorage.setItem('cs_users', JSON.stringify(users))
      login({ id: newUser.id, name: newUser.name, email: newUser.email })
    } else {
      const u = users.find(u => u.email === form.email && u.password === form.password)
      if (!u) { setError('Invalid email or password.'); return }
      login({ id: u.id, name: u.name, email: u.email })
    }
    nav('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity:0, y:30, scale:0.96 }}
        animate={{ opacity:1, y:0, scale:1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => nav('/')} className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-800 transition-colors mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-300/40">
              <Ribbon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">CancerShield AI</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your personal screening assistant</p>
        </div>

        <div className="glass rounded-3xl p-8 card-shadow">
          {/* Tab toggle */}
          <div className="flex bg-rose-100 dark:bg-gray-800 rounded-2xl p-1 mb-8">
            {['login','signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text" placeholder="Jane Doe"
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="text-rose-600 text-sm bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-300/40 hover:shadow-rose-400/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mt-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo account */}
          <button
            onClick={() => {
              const demoUsers = JSON.parse(localStorage.getItem('cs_users') || '[]')
              if (!demoUsers.find(u => u.email === 'demo@cancershield.ai')) {
                demoUsers.push({ id:1, name:'Demo User', email:'demo@cancershield.ai', password:'demo123' })
                localStorage.setItem('cs_users', JSON.stringify(demoUsers))
              }
              login({ id:1, name:'Demo User', email:'demo@cancershield.ai' })
              nav('/dashboard')
            }}
            className="w-full mt-3 py-3 border border-rose-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors"
          >
            🚀 Try Demo Account
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          By continuing, you agree that this tool is for informational purposes only and not a medical diagnosis.
        </p>
      </motion.div>
    </div>
  )
}
