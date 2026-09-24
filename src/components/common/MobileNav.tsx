import React from 'react'
import { Calendar, Camera, HeartPulse, Activity, MessageSquare } from 'lucide-react'

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'camera', label: 'AI Camera', icon: Camera },
    { id: 'smr', label: 'SMR Drills', icon: HeartPulse },
    { id: 'analytics', label: 'Load & Risk', icon: Activity },
    { id: 'ai-coach', label: 'AI Coach', icon: MessageSquare },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
