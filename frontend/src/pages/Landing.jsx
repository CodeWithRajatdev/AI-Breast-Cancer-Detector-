import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, Heart, ChevronRight, Ribbon, Activity, Brain } from 'lucide-react'

const stats = [
  { label: 'Accuracy Rate', value: '94.2%' },
  { label: 'Lives Impacted', value: '10K+' },
  { label: 'AI Model', value: 'CNN' },
  { label: 'Results in', value: '<30s' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced CNN model analyzes medical images with high precision' },
  { icon: Zap, title: 'Instant Results', desc: 'Get detailed risk assessment in under 30 seconds' },
  { icon: Shield, title: 'Explainable AI', desc: 'Clear explanations for every prediction with confidence scores' },
  { icon: Heart, title: 'Compassionate Care', desc: 'Supportive guidance tailored to your specific situation' },
]

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-rose-200/30 dark:bg-rose-900/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-pink-200/30 dark:bg-pink-900/10 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Ribbon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-rose-700 dark:text-rose-300">CancerShield AI</span>
        </motion.div>
        <motion.button
          initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }}
          onClick={() => nav('/auth')}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium text-sm shadow-md transition-all hover:shadow-rose-300/50 hover:shadow-lg"
        >
          Get Started
        </motion.button>
      </nav>

      {/* Hero */}
      <div className="relative max-w-7xl mx-auto px-8 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-sm font-medium mb-6 border border-rose-200 dark:border-rose-800"
          >
            <Activity className="w-3.5 h-3.5" />
            AI-Powered Early Detection
          </motion.div>

          <motion.h1
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white"
          >
            Early Detection{' '}
            <span className="gradient-text">Saves Lives</span>
          </motion.h1>

          <motion.p
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg"
          >
            Our AI-powered breast cancer screening assistant analyzes medical images with precision,
            providing instant risk assessments and intelligent explanations to guide your healthcare journey.
          </motion.p>

          <motion.div
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => nav('/auth')}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg shadow-rose-300/40 hover:shadow-rose-400/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Screening
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              Learn More
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            className="mt-12 grid grid-cols-4 gap-4"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display font-bold text-2xl text-rose-600 dark:text-rose-400">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual card */}
        <motion.div
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:0.6 }}
          className="relative hidden lg:block"
        >
          <div className="relative glass rounded-3xl p-8 card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">Scan Analysis</div>
                <div className="text-xs text-gray-500">AI Processing Complete</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Risk Level', val: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: 'Probability', val: '12.4%', color: 'text-rose-600', bar: 12 },
                { label: 'Confidence', val: '94.2%', color: 'text-blue-600', bar: 94 },
              ].map((item, i) => (
                <div key={i} className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.val}</span>
                  </div>
                  {item.bar !== undefined && (
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width:0 }} animate={{ width:`${item.bar}%` }}
                        transition={{ delay: 0.8+i*0.2, duration:1, ease:'easeOut' }}
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                ✓ Low risk detected. Continue regular annual screenings as recommended.
                This is not a medical diagnosis.
              </p>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0,-8,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
              className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-lg border border-rose-100 dark:border-gray-700"
            >
              <span className="text-xs font-semibold text-rose-600">🎗️ AI Analyzed</span>
            </motion.div>
            <motion.div
              animate={{ y: [0,8,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:0.5 }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-lg border border-rose-100 dark:border-gray-700"
            >
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">💬 Chat Support</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <motion.div
          initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Powered by Advanced AI
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Combining computer vision with large language models</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.1 }}
              className="glass rounded-2xl p-6 card-shadow hover:-translate-y-1 transition-transform cursor-default"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center pb-8 text-xs text-gray-400 dark:text-gray-600 px-4">
        ⚕️ CancerShield AI is not a substitute for professional medical advice, diagnosis, or treatment.
        Always consult a qualified healthcare provider.
      </div>
    </div>
  )
}
