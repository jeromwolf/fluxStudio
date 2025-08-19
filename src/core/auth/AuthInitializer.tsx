'use client'

import { useAuth } from './hooks'
import { useDataMigration } from '@/shared/hooks/use-data-migration'
import { useEffect, useState } from 'react'

// 앱 시작 시 인증 상태를 초기화하는 컴포넌트
export function AuthInitializer() {
  const auth = useAuth()
  const migration = useDataMigration()
  const [migrationChecked, setMigrationChecked] = useState(false)

  useEffect(() => {
    // 인증 상태 초기화 완료 시 로그
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        console.log('🔐 App initialized with authenticated user:', auth.user?.email)
      } else {
        console.log('🔓 App initialized in guest mode')
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user])

  // 로그인 후 마이그레이션 체크 및 실행
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.id && !migrationChecked && !migration.isChecking) {
      setMigrationChecked(true)
      
      // 마이그레이션이 필요한 경우 자동 실행
      setTimeout(async () => {
        if (migration.needsMigration && !migration.isLoading) {
          console.log('🚚 Starting automatic migration...')
          try {
            const result = await migration.runMigration()
            console.log('✅ Automatic migration completed:', result)
          } catch (error) {
            console.error('❌ Automatic migration failed:', error)
          }
        }
      }, 1000) // 1초 후 실행
    }
  }, [auth.isAuthenticated, auth.user?.id, migration.needsMigration, migration.isChecking, migration.isLoading, migrationChecked, migration.runMigration])

  // 이 컴포넌트는 렌더링되지 않음 (사이드 이펙트만 실행)
  return null
}