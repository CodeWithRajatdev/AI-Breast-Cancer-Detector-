import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Eye, Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { useApp } from '../App.jsx'
import { useNavigate } from 'react-router-dom'

const riskIcon = { Low: CheckCircle, Medium: AlertCircle, High: AlertTriangle }
const riskColor = { Low: 'text-emerald-600 dark:text-emerald-400', Medium: 'text-amber-600 dark:text-amber-400', High: 'text-rose-600 dark:text-rose-400' }
const riskBg = { Low: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', Medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', High: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' }

export default function History() {
  const { setCurrentResult } = useApp()
  const nav = useNavigate()
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('cs_history') || '[]'))

  const remove = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('cs_history', JSON.stringify(updated))
  }

  const view = (item) => {
    setCurrentResult(item)
    nav('/results')
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem('cs_history')
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Screening History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{history.length} past result{history.length !== 1 ? 's' : ''}</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </motion.div>

        {history.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="glass rounded-3xl card-shadow p-16 text-center">
            <div className="text-6xl mb-4">🩺</div>
            <h2 className="font-display text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No history yet</h2>
            <p className="text-gray-400 dark:text-gray-600 mb-6">Your past screening results will appear here.</p>
            <button onClick={() => nav('/dashboard')}
              className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors">
              Start First Scan
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((item, i) => {
              const Icon = riskIcon[item.risk] || AlertCircle
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}
                  className={`glass rounded-2xl card-shadow p-5 border ${riskBg[item.risk] || ''} flex items-center gap-5 group`}
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="Scan" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${riskColor[item.risk]}`} />
                      <span className={`font-semibold ${riskColor[item.risk]}`}>{item.risk} Risk</span>
                      <span className="text-gray-400 dark:text-gray-600">·</span>
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{item.probability}%</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.explanation?.slice(0, 100)}...</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-600">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => view(item)}
                      className="p-2.5 bg-white dark:bg-gray-700 rounded-xl border border-rose-100 dark:border-gray-600 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(item.id)}
                      className="p-2.5 bg-white dark:bg-gray-700 rounded-xl border border-red-100 dark:border-gray-600 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
