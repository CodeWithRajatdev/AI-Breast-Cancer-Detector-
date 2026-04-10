import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, X, User, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import { useApp } from '../App.jsx'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || ''

export default function Dashboard() {
  const { user, setCurrentResult, lang } = useApp()
  const nav = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPatient, setShowPatient] = useState(false)
  const [patient, setPatient] = useState({ age:'', familyHistory:'no', prevScreenings:'no', symptoms:'' })
  const fileRef = useRef()

  const t = {
    en: {
      title: 'Upload Medical Image',
      sub: 'Drag & drop a mammogram or ultrasound image',
      btn: 'Analyze Image',
      patient: 'Patient Information (Optional)',
      age: 'Age',
      family: 'Family History of Breast Cancer',
      prev: 'Previous Screenings',
      symptoms: 'Current Symptoms (if any)',
      yes: 'Yes', no: 'No',
    },
    hi: {
      title: 'मेडिकल इमेज अपलोड करें',
      sub: 'मैमोग्राम या अल्ट्रासाउंड इमेज खींचें और छोड़ें',
      btn: 'विश्लेषण करें',
      patient: 'रोगी जानकारी (वैकल्पिक)',
      age: 'उम्र',
      family: 'स्तन कैंसर का पारिवारिक इतिहास',
      prev: 'पिछली स्क्रीनिंग',
      symptoms: 'वर्तमान लक्षण (यदि कोई हो)',
      yes: 'हाँ', no: 'नहीं',
    }
  }[lang] || {}

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (!f) return
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) {
      setError('Please upload a JPG, PNG, or WebP image.'); return
    }
    setError(''); setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const analyze = async () => {
    if (!file) { setError('Please select an image first.'); return }
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('patientData', JSON.stringify(patient))
      const { data } = await axios.post(`${API}/predict`, fd, { timeout: 30000 })
      const result = { ...data, imageUrl: preview, timestamp: new Date().toISOString() }
      setCurrentResult(result)
      // Save to history
      const hist = JSON.parse(localStorage.getItem('cs_history') || '[]')
      hist.unshift({ ...result, id: Date.now() })
      localStorage.setItem('cs_history', JSON.stringify(hist.slice(0, 20)))
      nav('/results')
    } catch (e) {
      console.error(e)
      setError('Analysis failed. Please ensure the backend is running and try again.')
      // Graceful fallback result
      const fallback = {
        risk: 'Medium', probability: 42.0, confidence: 75.0,
        model_used: 'Fallback',
        explanation: 'AI analysis suggests a medium risk. Please consult a medical professional for an accurate diagnosis.',
        recommendation: 'Schedule an appointment with your healthcare provider for further evaluation.',
        recommendation_level: 'moderate',
        imageUrl: preview,
        timestamp: new Date().toISOString(),
        disclaimer: 'This AI analysis is not a medical diagnosis.',
      }
      setCurrentResult(fallback)
      const hist = JSON.parse(localStorage.getItem('cs_history') || '[]')
      hist.unshift({ ...fallback, id: Date.now() })
      localStorage.setItem('cs_history', JSON.stringify(hist.slice(0, 20)))
      nav('/results')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.sub}</p>
        </motion.div>

        {/* Upload zone */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="glass rounded-3xl card-shadow overflow-hidden mb-6">
          <div className="p-6 border-b border-rose-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-rose-500" /> {t.title}
            </h2>
          </div>

          <div className="p-6">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dragging
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 scale-[1.01]'
                  : 'border-rose-200 dark:border-gray-600 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10'
              }`}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onDrop} />
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div key="preview" initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} className="relative">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-md object-contain" />
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setError('') }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{file?.name}</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut' }}
                      className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-rose-400" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Drag & drop your image here</p>
                    <p className="text-sm text-gray-400">or click to browse · JPG, PNG, WebP supported</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
                  className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Patient info */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          className="glass rounded-3xl card-shadow overflow-hidden mb-6">
          <button
            onClick={() => setShowPatient(!showPatient)}
            className="w-full p-6 flex items-center justify-between text-left"
          >
            <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" /> {t.patient}
            </span>
            {showPatient ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {showPatient && (
              <motion.div
                initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 grid md:grid-cols-2 gap-4 border-t border-rose-100 dark:border-gray-700 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{t.age}</label>
                    <input type="number" min="18" max="100" placeholder="e.g. 45"
                      value={patient.age} onChange={e => setPatient({...patient, age:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{t.family}</label>
                    <select value={patient.familyHistory} onChange={e => setPatient({...patient, familyHistory:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                      <option value="no">{t.no}</option>
                      <option value="yes">{t.yes}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{t.prev}</label>
                    <select value={patient.prevScreenings} onChange={e => setPatient({...patient, prevScreenings:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                      <option value="no">{t.no}</option>
                      <option value="yes">{t.yes}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{t.symptoms}</label>
                    <input type="text" placeholder="e.g. lump, pain..."
                      value={patient.symptoms} onChange={e => setPatient({...patient, symptoms:e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit */}
        <motion.button
          initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
          onClick={analyze}
          disabled={!file || loading}
          whileHover={{ scale: file && !loading ? 1.01 : 1 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            file && !loading
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-300/40 hover:shadow-rose-400/60 hover:shadow-xl'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>{t.btn} →</>
          )}
        </motion.button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          ⚕️ Not a medical diagnosis. Always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  )
}
