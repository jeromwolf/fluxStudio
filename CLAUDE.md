# 🚀 Flux Studio - 메타버스 플랫폼 개발 원칙

## ⚠️ 핵심 개발 원칙

### 🎯 **절대 원칙: 확장 가능한 메타버스 플랫폼**
- **모든 기능은 확장 가능한 아키텍처로 구현**
- **플러그인 시스템과 모듈화 필수**
- **실시간 멀티플레이어와 소셜 기능 우선**
- **클라우드 기반 데이터 저장 (Neon PostgreSQL 사용)**
- **소스 코드는 짧고 컴포넌트화 (150줄 이하)**

---

## 🌍 테마별 오브젝트 라이브러리

### 🎨 **현재 테마**
1. **🪑 Furniture (가구)**: 의자 5종 구현 완료
2. **🎡 Amusement Park (놀이공원)**: 롤러코스터, 대관람차, 회전목마, 범퍼카
3. **🌳 Nature (자연)**: 나무(소나무/참나무), 바위, 꽃(해바라기/장미), 수풀
4. **📦 Basic (기본)**: 큐브, 구, 실린더 등 기본 도형

### 🚀 **계획된 테마**
1. **🏙️ City/Urban (도시)**: 건물, 도로, 가로등, 벤치, 표지판
2. **🧙 Fantasy (판타지)**: 성, 마법진, 크리스탈, 드래곤 알
3. **🚀 Sci-Fi (SF)**: 우주선, 로봇, 홀로그램, 포털
4. **🏠 Home Decor (홈데코)**: 조명, 커튼, 카펫, 액자
5. **🎮 Gaming (게이밍)**: 아케이드 기계, 콘솔, 게이밍 의자

---

## 🏗️ 메타버스 월드 빌더 아키텍처

### 📦 **오브젝트 시스템 구조**
```
src/lib/world-builder/
├── object-system/
│   ├── registry.ts              # 오브젝트 레지스트리
│   ├── plugin-system.ts         # 플러그인 관리
│   ├── property-system.ts       # 속성 시스템
│   └── types.ts                 # 타입 정의
├── objects/
│   ├── furniture/               # 가구 오브젝트
│   │   ├── chairs/             # 의자 컬렉션
│   │   │   ├── basic-chair.tsx
│   │   │   ├── office-chair.tsx
│   │   │   ├── dining-chair.tsx
│   │   │   ├── gaming-chair.tsx
│   │   │   └── stool.tsx
│   │   └── index.ts
│   ├── amusement-park/         # 놀이공원 테마
│   │   ├── roller-coaster.tsx  # 롤러코스터
│   │   ├── ferris-wheel.tsx    # 대관람차
│   │   ├── carousel.tsx        # 회전목마
│   │   ├── bumper-cars.tsx     # 범퍼카
│   │   └── index.ts
│   ├── nature/                 # 자연 테마
│   │   ├── tree.tsx            # 나무 (소나무/참나무)
│   │   ├── rock.tsx            # 바위
│   │   ├── flower.tsx          # 꽃 (해바라기/장미)
│   │   ├── bush.tsx            # 수풀
│   │   └── index.ts
│   └── basic/                   # 기본 도형
└── object-factory.tsx           # 오브젝트 생성 팩토리
```

### 🔌 **확장 가능한 오브젝트 팩토리**
```typescript
// 팩토리 인터페이스
export interface ObjectFactory {
  createGeometry(container: THREE.Group, definition: any): void
}

// 팩토리 등록
registerFactory('chair', new ChairFactory())
registerFactory('table', new TableFactory())
```

### 📝 **오브젝트 정의 구조**
```typescript
export const BasicChairDefinition = {
  metadata: {
    type: 'furniture_chair_basic',
    name: 'Basic Chair',
    category: ObjectCategory.FURNITURE,
    icon: '🪑',
    tags: ['furniture', 'chair', 'seating']
  },
  config: {
    interactions: {
      clickable: true,
      hoverable: true,
      draggable: true,
      selectable: true,
      sittable: true
    },
    materials: {
      default: { color: '#8B4513' }
    }
  },
  component: BasicChairObject,
  propertySchema: basicChairSchema
}
```

---

## 🎨 월드 빌더 기능

### ✅ **에디터 모드**
1. **Build Mode**: 오브젝트 선택 후 배치
2. **Select Mode**: 오브젝트 선택 및 속성 편집
3. **Move Mode**: 드래그로 오브젝트 이동

### 🛠️ **오브젝트 속성 시스템**
```typescript
// 속성 빌더 패턴
export const chairSchema = new PropertyBuilder()
  .addGroup({
    id: 'dimensions',
    label: 'Dimensions',
    properties: [
      {
        key: 'height',
        type: PropertyType.RANGE,
        min: 0.4,
        max: 0.8
      }
    ]
  })
  .inherit('transform')
  .inherit('appearance')
  .build()
```

### 📋 **오브젝트 팔레트**
- 카테고리별 필터링
- 검색 기능
- 실시간 오브젝트 카운트
- 시각적 아이콘 표시

---

## 🚀 현재 구현 상태

### ✅ **완료된 작업**
- [x] 의자 5종 프로토타입 (Basic, Office, Dining, Gaming, Stool)
- [x] 확장 가능한 오브젝트 레지스트리
- [x] 플러그인 시스템
- [x] 속성 편집 시스템
- [x] 월드 빌더 3가지 모드
- [x] 오브젝트 팩토리 패턴
- [x] 놀이공원 테마 4종 (롤러코스터, 대관람차, 회전목마, 범퍼카)
- [x] 자연 테마 4종 (나무, 바위, 꽃, 수풀)
- [x] 테마별 오브젝트 라이브러리 구축

### 🎯 **다음 작업**
- [ ] 테이블 5종 제작
- [ ] 소파 5종 제작
- [ ] 수납 5종 제작
- [ ] 침대 5종 제작
- [ ] 도시/건축 테마 오브젝트
- [ ] 판타지 테마 오브젝트
- [ ] SF 테마 오브젝트
- [ ] 오브젝트별 상세 속성 구현

---

## 💡 개발 가이드라인

### 1. **오브젝트 추가 방법**
```typescript
// 1. 새 오브젝트 컴포넌트 생성
export function MyObjectComponent({ object, isPreview, isSelected }: ObjectComponentProps) {
  // 컴포넌트 구현
}

// 2. 정의 생성
export const MyObjectDefinition = {
  metadata: { /* ... */ },
  config: { /* ... */ },
  component: MyObjectComponent
}

// 3. 레지스트리에 등록
registry.register(MyObjectDefinition)
```

### 2. **팩토리 추가 방법**
```typescript
class MyObjectFactory implements ObjectFactory {
  createGeometry(container: THREE.Group, definition: any) {
    // Three.js 지오메트리 생성
  }
}

registerFactory('myobject', new MyObjectFactory())
```

### 3. **코드 작성 원칙**
- **짧고 간결하게**: 한 파일당 150줄 이하
- **컴포넌트화**: 재사용 가능한 단위로 분리
- **타입 안전성**: TypeScript 활용
- **확장 가능성**: 플러그인/팩토리 패턴 사용

---

## 📊 성능 최적화

### 🎯 **목표 성능**
- 1000개 오브젝트 동시 렌더링
- 60 FPS 유지
- 메모리 사용량 < 500MB

### 🔧 **최적화 전략**
1. **LOD 시스템**: 거리별 디테일 조절
2. **인스턴싱**: 동일 오브젝트 GPU 최적화
3. **오클루전 컬링**: 보이지 않는 오브젝트 제외
4. **텍스처 아틀라스**: 드로우콜 최소화

---

## 🚨 주의사항

1. **React 컴포넌트와 Three.js 분리**: 직접 렌더링 대신 팩토리 패턴 사용
2. **메모리 관리**: 오브젝트 제거 시 geometry/material dispose 필수
3. **상태 동기화**: mesh position과 state position 일치 유지
4. **확장성 우선**: 하드코딩 금지, 레지스트리 패턴 사용

---

## 📁 템플릿 시스템 구조

### 🗂️ **확장 가능한 템플릿 아키텍처**

```
src/lib/three/
├── templates/                    # 새로운 확장 가능한 시스템
│   ├── index.ts                 # 중앙 레지스트리
│   ├── lofi-glass-panels.ts     # 개별 템플릿 파일
│   ├── cyberpunk-neon.ts        # 예시: 새 템플릿
│   └── vintage-film.ts          # 예시: 새 템플릿
├── template-scenes.ts           # 레거시 (마이그레이션 필요)
└── templates.ts                 # 메인 인터페이스
```

### ✅ **올바른 템플릿 추가 방법**
1. `templates/` 폴더에 새 파일 생성 (예: `my-template.ts`)
2. `templates/index.ts`에서 import 후 `TEMPLATE_REGISTRY`에 추가
3. 자동으로 UI에서 사용 가능

---

## 🛠️ 인터랙티브 에디터 시스템

### 🎨 **드래그 앤 드롭 구조**
```
InteractiveEditor (도구 선택) 
    ↓
Viewport3D (3D 뷰포트에서 드래그)
    ↓  
SceneManager (3D 씬에 요소 추가)
    ↓
속성 편집 패널 (실시간 업데이트)
```

### 🔧 **속성 편집 기능**
- ✅ **위치**: X, Y 슬라이더로 실시간 이동
- ✅ **크기**: 너비/높이 개별 설정
- ✅ **색상**: 텍스트/도형 색상 실시간 변경
- ✅ **투명도**: 0-100% 슬라이더
- ✅ **텍스트**: 내용, 폰트 크기 (12-72px)

---

## 🎨 **Lo-fi Glass Panels 템플릿**
스크린샷에서 영감을 받은 새로운 템플릿:
- 일몰 그라디언트 배경
- 투명 유리 패널 효과
- 로파이 미학
- 부드러운 애니메이션

---

## 🗄️ **데이터베이스 아키텍처 (Neon PostgreSQL)**

### 💎 **Neon 서버리스 PostgreSQL 선택 이유**
- ✅ Vercel과 완벽한 통합
- ✅ 자동 스케일링 지원
- ✅ 자동 백업 및 복구
- ✅ Branching 기능으로 개발/테스트 환경 분리
- ✅ Edge Functions와 낮은 레이턴시
- ✅ Connection Pooling 자동 관리

### 🔧 **연결 설정**
```typescript
// lib/db/client.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
```

### 📊 **데이터베이스 스키마**
```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 아바타 테이블
CREATE TABLE avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metadata JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 월드 테이블
CREATE TABLE worlds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'private', 'friends')),
  max_players INT DEFAULT 50,
  objects JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 월드 방문 기록
CREATE TABLE world_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP DEFAULT NOW(),
  duration INT DEFAULT 0
);

-- 친구 관계
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

---

## 🏗️ **프로젝트 구조 (리팩토링 진행 중)**

### 📁 **새로운 확장 가능한 구조**
```
src/
├── core/                    # 핵심 시스템
│   ├── auth/               # 인증 (NextAuth + Neon)
│   ├── database/           # DB 스키마 및 쿼리  
│   ├── storage/            # 파일 저장 (R2/S3)
│   └── realtime/           # WebRTC/Colyseus
├── features/               # 기능별 모듈
│   ├── avatar/            # 아바타 시스템
│   ├── world-builder/     # 월드 빌더
│   ├── multiplayer/       # 멀티플레이어
│   └── social/            # 소셜 기능
├── shared/                 # 공유 컴포넌트
│   ├── ui/                # UI 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   └── utils/             # 유틸리티
└── app/                    # Next.js App Router
```

---

## 🎯 **현재 진행 중인 Critical 태스크**

### ✅ **완료된 태스크**
- [x] 메타버스 플랫폼 아키텍처 설계
- [x] WebRTC 기반 실시간 멀티플레이어 시스템
- [x] 아바타 커스터마이징 시스템
- [x] 3D 월드 빌더 (5개 테마)
- [x] 로컬 저장 시스템

### ✅ **완료된 Critical 태스크**
- [x] TASK-001: 프로젝트 구조 리팩토링
  - [x] core/ 폴더 구조 생성
    - [x] auth/ - NextAuth 인증 설정
    - [x] database/ - Neon PostgreSQL 스키마 및 클라이언트
    - [x] storage/ - 파일 저장 추상화 레이어
    - [x] realtime/ - Colyseus 실시간 통신
  - [x] features/ 모듈 분리
    - [x] avatar/ - 아바타 시스템
    - [x] world-builder/ - 월드 빌더
    - [x] multiplayer/ - 멀티플레이어
    - [x] social/ - 소셜 기능
  - [x] shared/ 공유 컴포넌트
    - [x] ui/ - UI 컴포넌트 재사용
    - [x] hooks/ - 커스텀 훅 (useDebounce, useLocalStorage 등)
    - [x] utils/ - 유틸리티 함수
  - [x] TypeScript 경로 별칭 설정
    - @/core/*, @/features/*, @/shared/* 추가
  - [x] 파일 마이그레이션 스크립트 작성
    - scripts/migrate-structure.ts 생성

- [x] TASK-004: Neon DB 프로젝트 설정
  - [x] Vercel Store에서 fluxStudio-db 생성
  - [x] 데이터베이스 연결 테스트 성공
  - [x] 스키마 적용 완료 (5개 테이블)
    - users: 사용자 정보
    - avatars: 아바타 데이터
    - worlds: 월드 정보
    - world_visits: 방문 기록
    - friendships: 친구 관계

### 🚧 **다음 진행할 Critical 태스크**
- [ ] TASK-002: 상태 관리 통합 (Zustand)
- [ ] TASK-005: 사용자 인증 시스템
- [ ] TASK-008: 월드 저장 시스템 클라우드 마이그레이션
- [ ] TASK-009: 물리 엔진 통합 (Rapier)
- [ ] TASK-010: 아바타-월드 통합
- [ ] TASK-012: Colyseus 서버 설정
- [ ] TASK-013: 월드 룸 구현
- [ ] TASK-014: 클라이언트 네트워킹

---

## 📊 **현재 프로젝트 상태**

### 🎉 **완료된 핵심 작업**
1. **프로젝트 구조 리팩토링** ✅
   - 모듈화된 폴더 구조 (core/, features/, shared/)
   - TypeScript 경로 별칭 설정
   - 확장 가능한 아키텍처 구축

2. **Neon PostgreSQL 데이터베이스** ✅
   - Vercel Store 통합 (fluxStudio-db)
   - 데이터베이스 스키마 적용
   - Drizzle ORM 설정

### 🚀 **다음 단계**
1. **상태 관리 통합** (TASK-002)
   - 글로벌 Zustand 스토어 설계
   - localStorage → Neon DB 마이그레이션

2. **인증 시스템** (TASK-005)
   - NextAuth.js 구현
   - Google/Discord OAuth
   - 사용자 세션 관리

3. **월드 시스템 통합** (TASK-008~010)
   - 클라우드 저장
   - 물리 엔진 (Rapier)
   - 아바타-월드 연동

이제 Neon PostgreSQL 기반의 확장 가능한 메타버스 플랫폼으로 진화하고 있습니다! 🚀