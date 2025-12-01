'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Save } from 'lucide-react'
import { MenuHeader } from '@/components/Header'
import { Auth } from '@/lib/auth'
import { ApiClient } from '@/lib/api-client'
import { User } from '@/lib/interface'
import { CircleUserRound } from 'lucide-react'
import Image from 'next/image'
import { uploadToS3 } from '@/lib/media-utils'

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [nickname, setNickname] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = Auth.getUser()
    if (currentUser) {
      setUser(currentUser)
      setNickname(currentUser.setting?.nickname || currentUser.name || '')
      setImageUrl(currentUser.setting?.imageUrl || '')
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setMessage(null)

    try {
      let imageKey: string | undefined

      // Upload image if a new file is selected
      if (imageFile) {
        try {
          const mediaItem = await uploadToS3(imageFile)
          imageKey = mediaItem.key // Get the S3 key from the uploaded media item
        } catch (uploadError) {
          setMessage({
            type: 'error',
            text: uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.'
          })
          setIsLoading(false)
          return
        }
      }

      // Update user settings
      const updatePayload: { nickname: string; imageKey?: string } = {
        nickname,
      }

      // Only include imageKey if a new image was uploaded
      if (imageKey) {
        updatePayload.imageKey = imageKey
      }

      const response = await ApiClient.patch('/users/me/settings', updatePayload)

      if (response.ok && response.setting) {
        // Update local storage with the response data
        const updatedUser = {
          ...user,
          setting: {
            nickname: response.setting.nickname,
            imageUrl: response.setting.imageUrl, // Backend returns signed URL
            isSpecial: response.setting.isSpecial ?? false,
            isTest: response.setting.isTest ?? false,
            enableNotifications: response.setting.enableNotifications ?? false,
            enableSummary: response.setting.enableSummary ?? false,
          },
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setImageUrl(response.setting.imageUrl || '')
        setImageFile(null)
        setPreviewUrl(null)

        setMessage({ type: 'success', text: '프로필이 저장되었습니다.' })

        // Redirect back to settings after 1 second
        setTimeout(() => {
          router.push('/settings')
        }, 1000)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '프로필 저장에 실패했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayImageUrl = previewUrl || imageUrl

  return (
    <div className="flex h-full flex-col">
      <MenuHeader title="프로필 설정" />

      <div className="flex-1 overflow-y-auto bg-white p-6">
        {/* Profile Image Section */}
        <div className="mb-8">
          <label className="block text-xl font-medium mb-4">프로필 이미지</label>
          <div className="flex items-center gap-6">
            <div className="relative">
              {displayImageUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={displayImageUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <CircleUserRound size={96} className="text-gray-400" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Camera size={20} />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-base text-muted-foreground">
                클릭하여 프로필 이미지를 변경하세요
              </p>
              {imageFile && (
                <p className="text-sm text-blue-600 mt-1">
                  새 이미지 선택됨: {imageFile.name}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Nickname Section */}
        <div className="mb-8">
          <label htmlFor="nickname" className="block text-xl font-medium mb-4">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-muted-foreground mt-2">
            다른 사용자에게 표시될 이름입니다
          </p>
        </div>

        {/* User Info (Read-only) */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-3">계정 정보</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">이름: </span>
              <span className="text-base">{user?.name}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">이메일: </span>
              <span className="text-base">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xl font-medium"
        >
          <Save size={24} />
          {isLoading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
