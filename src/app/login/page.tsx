'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const result = await Auth.login(email, password)
        console.log('Login successful:', result)
        router.push('/')
      } else {
        // Register
        const result = await Auth.register({
          name,
          email,
          password,
          phone: phone || undefined,
        })
        console.log('Registration successful:', result)
        router.push('/')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || '로그인/회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            이음 채팅
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? '로그인하여 시작하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Email Field (both login & register) */}
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Password Field (both login & register) */}
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Additional fields for registration */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="sr-only">
                    이름
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="sr-only">
                    전화번호 (선택)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="전화번호 (선택)"
                    className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Test Account Info */}
          {isLogin && (
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                테스트 계정:
              </p>
              <p className="text-xs text-blue-700">
                sihyun@test.com / test1234
              </p>
              <p className="text-xs text-blue-700">daho@test.com / test1234</p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !password.trim() ||
                (!isLogin && !name.trim())
              }
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin
                ? '계정이 없으신가요? 회원가입'
                : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
