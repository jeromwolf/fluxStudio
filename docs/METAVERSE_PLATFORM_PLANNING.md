# 🌍 Flux Studio 메타버스 플랫폼 기획서

## 📌 프로젝트 개요

### 비전
사용자가 자신만의 아바타를 만들고, 3D 월드를 구축하며, 친구들과 함께 즐길 수 있는 웹 기반 메타버스 플랫폼

### 핵심 가치
- **창작**: 누구나 쉽게 3D 월드를 만들 수 있는 도구
- **소통**: 실시간으로 친구들과 만나고 대화할 수 있는 공간
- **공유**: 자신이 만든 월드를 다른 사람들과 공유

---

## 🎯 주요 기능

### 1. 사용자 시스템
- **회원가입/로그인**
  - Google, Discord OAuth 로그인
  - 게스트 모드 (제한된 기능)
- **프로필 관리**
  - 닉네임, 프로필 이미지
  - 자기소개, 상태 메시지
  - 친구 목록

### 2. 아바타 시스템
- **아바타 생성/커스터마이징**
  - 기본 외형 선택 (성별, 체형, 피부색)
  - 헤어스타일, 얼굴 특징
  - 의상 및 액세서리
- **아바타 컬렉션**
  - 여러 아바타 저장 가능
  - 상황별 아바타 전환

### 3. 월드 빌더
- **3D 월드 제작**
  - 드래그 앤 드롭 방식
  - 다양한 오브젝트 라이브러리
  - 물리 엔진 적용
- **월드 관리**
  - 월드 저장/불러오기
  - 공개/비공개 설정
  - 방문자 권한 관리

### 4. 소셜 기능
- **친구 시스템**
  - 친구 추가/삭제
  - 온라인 상태 확인
  - 친구 월드 방문
- **실시간 멀티플레이어**
  - 음성/텍스트 채팅
  - 함께 월드 탐험
  - 상호작용

---

## 🔄 사용자 플로우

### 신규 사용자
```
1. 랜딩 페이지 → 회원가입/로그인
2. 아바타 생성 (튜토리얼)
3. 메인 허브 진입
4. 월드 빌더 튜토리얼
5. 첫 월드 생성
6. 친구 초대
```

### 기존 사용자
```
1. 로그인
2. 메인 허브 (대시보드)
   - 내 아바타 목록
   - 내 월드 목록
   - 친구 목록
   - 추천 월드
3. 활동 선택
   - 아바타 편집
   - 월드 제작/편집
   - 친구 월드 방문
   - 새로운 월드 탐험
```

---

## 📱 화면 구성

### 1. 인증 화면
- `/` - 랜딩 페이지
- `/auth/signin` - 로그인
- `/auth/signup` - 회원가입

### 2. 메인 대시보드
- `/dashboard` - 메인 허브
  - 내 아바타 섹션
  - 내 월드 섹션
  - 친구 활동 피드
  - 추천 컨텐츠

### 3. 아바타 관련
- `/avatar` - 아바타 목록
- `/avatar/create` - 새 아바타 생성
- `/avatar/[id]/edit` - 아바타 편집
- `/avatar/shop` - 아이템 상점

### 4. 월드 관련
- `/worlds` - 내 월드 목록
- `/worlds/create` - 새 월드 생성
- `/worlds/[id]/edit` - 월드 편집 (빌더)
- `/worlds/[id]/play` - 월드 플레이
- `/worlds/explore` - 월드 탐험 (공개 월드)

### 5. 소셜
- `/friends` - 친구 목록
- `/friends/[id]/profile` - 친구 프로필
- `/friends/[id]/worlds` - 친구 월드 목록

---

## 💾 데이터 구조

### User (사용자)
```typescript
{
  id: string
  email: string
  username: string
  profileImage?: string
  bio?: string
  status?: string
  createdAt: Date
  lastLoginAt: Date
}
```

### Avatar (아바타)
```typescript
{
  id: string
  userId: string
  name: string
  isDefault: boolean
  customization: {
    body: { type, skinColor, height }
    face: { shape, eyes, nose, mouth }
    hair: { style, color }
    outfit: { top, bottom, shoes }
    accessories: string[]
  }
  createdAt: Date
  updatedAt: Date
}
```

### World (월드)
```typescript
{
  id: string
  creatorId: string
  name: string
  description: string
  thumbnail: string
  visibility: 'public' | 'private' | 'friends'
  maxPlayers: number
  tags: string[]
  objects: WorldObject[]
  settings: {
    skybox: string
    lighting: object
    physics: object
  }
  stats: {
    visits: number
    likes: number
    activeUsers: number
  }
  createdAt: Date
  updatedAt: Date
}
```

### Friendship (친구관계)
```typescript
{
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: Date
}
```

---

## 🚀 구현 우선순위

### Phase 1: 기본 기능 (MVP)
1. ✅ 사용자 인증 시스템
2. ✅ 아바타 생성 및 커스터마이징
3. ✅ 월드 빌더 기본 기능
4. ⏳ 데이터 저장 (클라우드)
5. ⏳ 메인 대시보드

### Phase 2: 소셜 기능
1. 친구 시스템
2. 실시간 멀티플레이어
3. 채팅 시스템
4. 월드 공유

### Phase 3: 고급 기능
1. 아이템 상점
2. 월드 마켓플레이스
3. 이벤트 시스템
4. 업적/보상

---

## 🎨 UI/UX 원칙

### 디자인 원칙
- **직관적**: 처음 사용자도 쉽게 이해
- **반응형**: 모든 디바이스에서 작동
- **일관성**: 통일된 디자인 시스템
- **재미**: 밝고 활기찬 분위기

### 주요 인터랙션
- 드래그 앤 드롭
- 실시간 프리뷰
- 부드러운 애니메이션
- 명확한 피드백

---

## 📊 기술 스택

### Frontend
- Next.js 15 (App Router)
- React Three Fiber (3D)
- Tailwind CSS
- Zustand (상태관리)

### Backend
- Next.js API Routes
- Neon PostgreSQL
- NextAuth.js
- Socket.io (실시간)

### 3D/Physics
- Three.js
- Rapier (물리엔진)
- React Three Drei

---

## 🔐 보안 및 권한

### 권한 레벨
1. **Guest**: 제한된 월드 탐험
2. **User**: 아바타/월드 생성
3. **Premium**: 고급 기능
4. **Admin**: 전체 관리

### 데이터 보호
- OAuth 2.0 인증
- API 요청 인증
- 데이터 암호화
- Rate Limiting

---

## 📈 성공 지표

### 사용자 관련
- MAU (월간 활성 사용자)
- 평균 세션 시간
- 재방문율

### 컨텐츠 관련
- 생성된 월드 수
- 월드 방문 수
- 공유된 월드 수

### 소셜 관련
- 친구 연결 수
- 멀티플레이어 세션
- 채팅 활성도