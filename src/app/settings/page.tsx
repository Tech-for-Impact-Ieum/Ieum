'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Settings, User, Bell, Lock, Palette } from 'lucide-react'
import { MenuHeader } from '@/components/Header'
import { Auth } from '@/lib/auth'
import { User as UserType } from '@/lib/interface'
import { CircleUserRound } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const currentUser = Auth.getUser()
    setUser(currentUser)
  }, [])

  const displayName = user?.setting?.nickname || user?.name || '사용자'
  const imageUrl = user?.setting?.imageUrl

  const settingsItems = [
    {
      id: 'profile',
      label: displayName,
      sublabel: user?.email || '정보 수정',
      icon: User,
    },
    {
      id: 'notifications',
      label: '알림 설정',
      sublabel: user?.setting?.enableNotifications ? '켜짐' : '꺼짐',
      icon: Bell,
    },
    {
      id: 'summary',
      label: '요약 기능',
      sublabel: user?.setting?.enableSummary ? '사용' : '사용 안 함',
      icon: Settings,
    },
    {
      id: 'special',
      label: '접근성 모드',
      sublabel: user?.setting?.isSpecial ? '활성화' : '비활성화',
      icon: Palette,
    },
    {
      id: 'privacy',
      label: '개인정보',
      sublabel: '',
      icon: Lock,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <MenuHeader title="설정" />

      {/* User Profile Card */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <CircleUserRound size={64} className="text-gray-400 shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-2xl">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.setting?.isTest && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                테스트 계정
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {settingsItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className="flex w-full items-center gap-6 border-b border-border px-6 py-6 text-left transition-colors hover:bg-muted/50"
            >
              <Icon size={32} className="shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium text-2xl">{item.label}</h3>
                {item.sublabel && (
                  <p className="text-lg text-muted-foreground">
                    {item.sublabel}
                  </p>
                )}
              </div>
              <ChevronRight
                size={32}
                className="shrink-0 text-muted-foreground"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
