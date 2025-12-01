'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Settings, User, Bell, Lock, Palette } from 'lucide-react'
import { MenuHeader } from '@/components/Header'
import { Auth } from '@/lib/auth'
import { User as UserType } from '@/lib/interface'
import { CircleUserRound } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  SettingsModal,
  ToggleOption,
  InfoSection,
} from '@/components/SettingsModal'
import { ApiClient } from '@/lib/api-client'

type ModalType = 'notifications' | 'summary' | 'special' | 'privacy' | null

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = Auth.getUser()
    setUser(currentUser)
  }, [])

  const handleSettingClick = (id: string) => {
    if (id === 'profile') {
      router.push(`/settings/${id}`)
    } else {
      setOpenModal(id as ModalType)
    }
  }

  const updateSetting = async (setting: Partial<UserType['setting']>) => {
    if (!user) return

    setIsUpdating(true)
    try {
      const response = await ApiClient.patch('/users/me/settings', setting)

      if (response.ok) {
        const updatedUser = {
          ...user,
          setting: {
            nickname: user.setting?.nickname,
            imageUrl: user.setting?.imageUrl,
            isSpecial: user.setting?.isSpecial ?? false,
            isTest: user.setting?.isTest ?? false,
            enableNotifications: user.setting?.enableNotifications ?? false,
            enableSummary: user.setting?.enableSummary ?? false,
            ...setting,
          },
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Failed to update setting:', error)
    } finally {
      setIsUpdating(false)
    }
  }

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
              onClick={() => handleSettingClick(item.id)}
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

      {/* Notifications Modal */}
      <SettingsModal
        isOpen={openModal === 'notifications'}
        onClose={() => setOpenModal(null)}
        title="알림 설정"
      >
        <ToggleOption
          label="알림 받기"
          description="새로운 메시지 알림을 받습니다"
          value={user?.setting?.enableNotifications ?? false}
          onChange={(value) => updateSetting({ enableNotifications: value })}
        />
      </SettingsModal>

      {/* Summary Modal */}
      <SettingsModal
        isOpen={openModal === 'summary'}
        onClose={() => setOpenModal(null)}
        title="요약 기능"
      >
        <ToggleOption
          label="요약 기능 사용"
          description="대화 내용을 자동으로 요약합니다"
          value={user?.setting?.enableSummary ?? false}
          onChange={(value) => updateSetting({ enableSummary: value })}
        />
      </SettingsModal>

      {/* Special Mode Modal */}
      <SettingsModal
        isOpen={openModal === 'special'}
        onClose={() => setOpenModal(null)}
        title="접근성 모드"
      >
        <ToggleOption
          label="접근성 모드 활성화"
          description="발달장애인을 위한 인터페이스를 활성화합니다"
          value={user?.setting?.isSpecial ?? false}
          onChange={(value) => updateSetting({ isSpecial: value })}
        />
      </SettingsModal>

      {/* Privacy Modal */}
      <SettingsModal
        isOpen={openModal === 'privacy'}
        onClose={() => setOpenModal(null)}
        title="개인정보"
      >
        <div className="space-y-4">
          <InfoSection title="개발팀" content="KAIST Team Ieum" />
          <InfoSection
            title="프로젝트 소개"
            content="이음은 발달장애인의 소통을 돕기 위해 개발된 채팅 애플리케이션입니다."
          />
          <InfoSection
            title="문의"
            content="기술 지원 및 문의사항은 KAIST Team Ieum으로 연락주시기 바랍니다."
          />
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              © 2025 KAIST Team Ieum. All rights reserved.
            </p>
          </div>
        </div>
      </SettingsModal>
    </div>
  )
}
