'use client'

import { Radio, ChevronRight } from 'lucide-react'
import { MenuHeader } from '@/components/Header'

export default function SettingsPage() {
  const settingsItems = [
    { id: 'profile', label: '안시현', sublabel: '정보 수정' },
    { id: 'notifications', label: '알림 설정', sublabel: '' },
    { id: 'privacy', label: '개인정보', sublabel: '' },
    { id: 'theme', label: '테마', sublabel: '' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MenuHeader title="설정" />

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            className="flex w-full items-center gap-3 border-b border-border px-4 py-6 text-left transition-colors hover:bg-muted/50"
          >
            <Radio className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="font-medium text-2xl">{item.label}</h3>
              {item.sublabel && (
                <p className="text-lg text-muted-foreground">{item.sublabel}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
