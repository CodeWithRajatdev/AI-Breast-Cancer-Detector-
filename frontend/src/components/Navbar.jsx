import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ribbon, Moon, Sun, Globe, History, LayoutDashboard, LogOut } from 'lucide-react'
import { useApp } from '../App.jsx'

export default function Navbar() {
  const { user, logout, dark, setDark, lang, setLang } = useApp()
  const nav = useNavigate()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
  ]

  return (
    <motion.nav
      initial={{ y:-60, opacity:0 }} animate={{ y:0, opacity:1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-rose-100 dark:border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav('/dashboard')}>
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
            <Ribbon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-rose-700 dark:text-rose-300 hidden sm:block">CancerShield AI</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
              }`
            }>
              <Icon className="w-4 h-4" /><span className="hidden sm:block">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors border border-rose-100 dark:border-gray-700"
            title="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'हि' : 'EN'}
          </button>

          {/* Dark mode */}
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{user?.name}</div>
              <div className="text-xs text-gray-400 dark:text-gray-600 truncate max-w-[120px]">{user?.email}</div>
            </div>
            <button
              onClick={() => { logout(); nav('/') }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
