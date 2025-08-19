'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정에 문제가 있습니다.',
    AccessDenied: '접근이 거부되었습니다.',
    Verification: '이메일 인증이 필요합니다.',
    CredentialsSignin: '로그인 정보가 올바르지 않습니다.',
    default: '로그인 중 오류가 발생했습니다.'
  }

  const message = errorMessages[error || 'default'] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur border-white/20">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-500/20 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            로그인 오류
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {error === 'CredentialsSignin' && (
            <p className="text-sm text-gray-400 mb-6">
              게스트 로그인을 원하시면 사용자명에 "guest"를 입력해주세요.
            </p>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              다시 로그인하기
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full text-white border-white/30 hover:bg-white/10"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}