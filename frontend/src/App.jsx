import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Results from './pages/Results.jsx'
import History from './pages/History.jsx'
import Navbar from './components/Navbar.jsx'

export const AppContext = createContext(null)

export function useApp() { return useContext(AppContext) }

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_user')) } catch { return null }
  })
  const [dark, setDark] = useState(() => localStorage.getItem('cs_dark') === 'true')
  const [lang, setLang] = useState(() => localStorage.getItem('cs_lang') || 'en')
  const [currentResult, setCurrentResult] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('cs_dark', dark)
  }, [dark])

  useEffect(() => {
    localStorage.setItem('cs_lang', lang)
  }, [lang])

  const login = (u) => { setUser(u); localStorage.setItem('cs_user', JSON.stringify(u)) }
  const logout = () => { setUser(null); localStorage.removeItem('cs_user') }

  const ctx = { user, login, logout, dark, setDark, lang, setLang, currentResult, setCurrentResult }

  return (
    <AppContext.Provider value={ctx}>
      <BrowserRouter>
        <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-gray-950' : 'bg-rose-50'}`}>
          {user && <Navbar />}
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/results" element={user ? <Results /> : <Navigate to="/auth" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
