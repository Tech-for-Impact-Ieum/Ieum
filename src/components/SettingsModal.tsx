'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SettingsModal({ isOpen, onClose, title, children }: SettingsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ToggleOptionProps {
  label: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleOption({ label, description, value, onChange }: ToggleOptionProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-lg font-medium">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          value ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

interface InfoSectionProps {
  title: string
  content: string
}

export function InfoSection({ title, content }: InfoSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-base text-muted-foreground">{content}</p>
    </div>
  )
}
