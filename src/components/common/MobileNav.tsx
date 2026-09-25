import React from 'react'
import { Calendar, Camera, HeartPulse, Activity, BookOpen, MessageSquare, ClipboardList } from 'lucide-react'

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'camera', label: 'Vision AI', icon: Camera },
    { id: 'smr', label: 'Fascia/SMR', icon: HeartPulse },
    { id: 'analytics', label: 'ACWR Load', icon: Activity },
    { id: 'journal', label: 'Journal', icon: ClipboardList },
    { id: 'sources', label: '100 Papers', icon: BookOpen },
    { id: 'ai-coach', label: 'AI Coach', icon: MessageSquare },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1 safe-bottom overflow-x-auto">
      <div className="flex items-center justify-around min-w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
