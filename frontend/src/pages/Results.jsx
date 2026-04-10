import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, MessageSquare, Send, AlertTriangle, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react'
import { useApp } from '../App.jsx'
import axios from 'axios'
import jsPDF from 'jspdf'

const API = import.meta.env.VITE_API_URL || ''

const riskConfig = {
  Low: { color: 'emerald', label: 'Low Risk', icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', bar: 'from-emerald-400 to-teal-500' },
  Medium: { color: 'amber', label: 'Medium Risk', icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', bar: 'from-amber-400 to-orange-500' },
  High: { color: 'rose', label: 'High Risk', icon: AlertTriangle, bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400', bar: 'from-rose-500 to-red-600' },
}

function AnimatedBar({ value, gradient }) {
  return (
    <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.5, delay: 0.3, repeat: 0 }}
        className="absolute inset-0 bg-white/40 rounded-full"
      />
    </div>
  )
}

export default function Results() {
  const { currentResult } = useApp()
  const nav = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your health assistant. I can help you understand your screening results or answer questions about breast health. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef()

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  if (!currentResult) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No results found.</p>
          <button onClick={() => nav('/dashboard')} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { risk, probability, confidence, explanation, recommendation, recommendation_level, imageUrl, disclaimer, model_used } = currentResult
  const cfg = riskConfig[risk] || riskConfig.Medium

  const sendChat = async () => {
    if (!input.trim() || chatLoading) return
    const msg = input.trim(); setInput('')
    const userMsg = { role: 'user', content: msg }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs); setChatLoading(true)
    try {
      const history = newMsgs.slice(-4).map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post(`${API}/chat`, {
        message: msg,
        history: history.slice(0,-1),
        context: { risk, probability, confidence }
      }, { timeout: 20000 })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here to help. For medical questions, please consult a healthcare professional who can give you personalized guidance." }])
    } finally { setChatLoading(false) }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFillColor(252, 231, 243)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(190, 18, 60)
    doc.text('CancerShield AI — Screening Report', 15, 18)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 28)

    doc.setTextColor(30)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Risk Assessment', 15, 55)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Risk Level: ${risk}`, 15, 67)
    doc.text(`Probability: ${probability}%`, 15, 77)
    doc.text(`Confidence: ${confidence}%`, 15, 87)
    doc.text(`Model: ${model_used || 'CNN Analysis'}`, 15, 97)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('AI Explanation', 15, 115)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(explanation || '', 180)
    doc.text(lines, 15, 127)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendation', 15, 175)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(recommendation || '', 180), 15, 187)

    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(disclaimer || 'This is not a medical diagnosis. Consult a qualified healthcare professional.', 15, 270)
    doc.save(`cancershield-report-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Screening Results</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">AI analysis complete · {model_used}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-rose-200 dark:border-gray-600 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={() => nav('/dashboard')}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors shadow-md">
              <RefreshCw className="w-4 h-4" /> New Scan
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Risk card */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
            className={`glass rounded-3xl card-shadow p-6 border-2 ${cfg.border}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 ${cfg.bg} rounded-2xl flex items-center justify-center border ${cfg.border}`}>
                <cfg.icon className={`w-8 h-8 ${cfg.text}`} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>
                <div className={`text-2xl font-bold font-display ${cfg.text}`}>{cfg.label}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Malignancy Probability</span>
                  <span className="font-bold text-gray-800 dark:text-white">{probability}%</span>
                </div>
                <AnimatedBar value={probability} gradient={cfg.bar} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Model Confidence</span>
                  <span className="font-bold text-gray-800 dark:text-white">{confidence}%</span>
                </div>
                <AnimatedBar value={confidence} gradient="from-blue-400 to-indigo-500" />
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
            className="glass rounded-3xl card-shadow p-6 flex flex-col items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Uploaded scan" className="max-h-52 rounded-xl shadow-md object-contain w-full" />
            ) : (
              <div className="text-gray-400 dark:text-gray-600 text-center">
                <div className="text-4xl mb-2">🩺</div>
                <p className="text-sm">Image not available</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Explanation */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          className="glass rounded-3xl card-shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs">AI</span>
            AI Explanation
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation}</p>
        </motion.div>

        {/* Recommendation */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
          className={`rounded-3xl p-6 mb-6 border-2 ${cfg.bg} ${cfg.border}`}>
          <h2 className={`font-semibold mb-2 ${cfg.text}`}>
            {recommendation_level === 'urgent' ? '🚨' : recommendation_level === 'moderate' ? '⚠️' : '✅'} Recommendation
          </h2>
          <p className={`${cfg.text} leading-relaxed`}>{recommendation}</p>
        </motion.div>

        {/* Nearby hospitals placeholder */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
          className="glass rounded-3xl card-shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">🏥 Nearby Hospitals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {['City Cancer Center', 'Regional Medical Hospital', 'Women\'s Health Clinic'].map((h, i) => (
              <div key={i} className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
                <div className="font-medium text-gray-800 dark:text-white text-sm">{h}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">🗺️ {[2.3, 1.1, 4.7][i]}km away</div>
                <div className="text-xs text-emerald-600 mt-1">⭐ {(4.1+i*0.2).toFixed(1)} rating</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">* Hospital data shown for demonstration purposes. Search for actual nearby facilities.</p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="text-center text-xs text-gray-400 dark:text-gray-600 bg-white/50 dark:bg-gray-900/50 rounded-2xl p-4">
          ⚕️ {disclaimer}
        </motion.div>
      </div>

      {/* Chat button */}
      <motion.button
        initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.5, type:'spring' }}
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full shadow-xl shadow-rose-300/40 flex items-center justify-center hover:shadow-rose-400/60 hover:shadow-2xl transition-all hover:scale-110"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">AI</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity:0, y:20, scale:0.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.95 }}
            className="fixed bottom-6 right-6 w-[360px] max-h-[520px] glass border border-rose-100 dark:border-gray-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-sm">🤖</div>
                <div>
                  <div className="font-semibold text-sm">Health Assistant</div>
                  <div className="text-xs text-rose-200">Powered by AI</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="w-8 h-8 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-sm bubble-user'
                      : 'bg-rose-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-sm bubble-ai'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-rose-50 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <span className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.span key={i} className="w-2 h-2 bg-rose-400 rounded-full"
                          animate={{ y:[0,-4,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-rose-100 dark:border-gray-700 flex gap-2">
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about your results..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <button onClick={sendChat} disabled={!input.trim() || chatLoading}
                className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center hover:bg-rose-700 transition-colors disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
