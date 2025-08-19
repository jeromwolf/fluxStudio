# 🔧 기술 구현 계획

## 📋 현재 상태 분석

### ✅ **이미 구현된 것**
1. **아바타 시스템**
   - 커스터마이징 (색상, 모양, 액세서리)
   - 저장/불러오기 (localStorage)
   
2. **월드 빌더**
   - 드래그&드롭 오브젝트 배치
   - 5개 테마 (가구, 놀이공원, 자연, SF, 판타지)
   - 속성 편집
   - 저장/불러오기 (localStorage)

3. **기본 멀티플레이어**
   - WebRTC 연결
   - 실시간 위치 동기화
   - 기본 이동 (WASD)

### ❌ **구현 필요한 핵심 기능**
1. **통합 시스템**
   - 아바타 ↔ 월드 연결
   - 월드 내 아바타 이동
   - 오브젝트 충돌 감지

2. **서버 인프라**
   - 사용자 인증
   - 월드 클라우드 저장
   - 실시간 동기화

3. **소셜 기능**
   - 월드 공유
   - 친구 시스템
   - 채팅

---

## 🏗️ 단계별 구현 계획

### **Phase 0: 아키텍처 리팩토링 (2주)**

#### 1. 프로젝트 구조 재구성
```
src/
├── core/                    # 핵심 시스템
│   ├── auth/               # 인증
│   ├── database/           # DB 연결
│   ├── storage/            # 파일 저장
│   └── realtime/           # 실시간 통신
├── features/               # 기능 모듈
│   ├── avatar/
│   ├── world-builder/
│   ├── multiplayer/
│   └── social/
├── shared/                 # 공유 컴포넌트
└── pages/                  # 페이지
```

#### 2. 상태 관리 통합
```typescript
// 글로벌 스토어 구조
interface GlobalStore {
  // 사용자
  user: {
    id: string
    profile: UserProfile
    currentAvatar: Avatar
  }
  
  // 월드
  world: {
    current: World | null
    objects: WorldObject[]
    players: Player[]
  }
  
  // 세션
  session: {
    isConnected: boolean
    latency: number
    serverTime: number
  }
}
```

---

### **Phase 1: 인증 & 데이터베이스 (2주)**

#### 1. Supabase 통합
```typescript
// 데이터베이스 스키마
-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP
);

-- avatars 테이블
CREATE TABLE avatars (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  metadata JSONB,
  is_default BOOLEAN
);

-- worlds 테이블
CREATE TABLE worlds (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  thumbnail_url TEXT,
  visibility TEXT,
  objects JSONB,
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- world_visits 테이블
CREATE TABLE world_visits (
  id UUID PRIMARY KEY,
  world_id UUID REFERENCES worlds(id),
  user_id UUID REFERENCES users(id),
  visited_at TIMESTAMP,
  duration INTEGER
);
```

#### 2. 인증 플로우
```typescript
// NextAuth 설정
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    CredentialsProvider({
      // 이메일/비밀번호 로그인
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // 사용자 정보 추가
      session.user.id = token.sub
      return session
    }
  }
})
```

---

### **Phase 2: 월드 시스템 통합 (3주)**

#### 1. 월드 로딩 시스템
```typescript
class WorldManager {
  async loadWorld(worldId: string): Promise<World> {
    // 1. 월드 메타데이터 로드
    const worldData = await api.getWorld(worldId)
    
    // 2. 3D 자산 로드
    const assets = await this.loadAssets(worldData.objects)
    
    // 3. 씬 구성
    const scene = this.buildScene(worldData, assets)
    
    // 4. 물리 엔진 초기화
    const physics = this.initPhysics(scene)
    
    // 5. 네트워킹 연결
    await this.connectToWorldServer(worldId)
    
    return { worldData, scene, physics }
  }
}
```

#### 2. 아바타-월드 통합
```typescript
class AvatarController {
  private avatar: Avatar
  private physics: PhysicsBody
  private input: InputManager
  
  update(deltaTime: number) {
    // 입력 처리
    const movement = this.input.getMovement()
    
    // 물리 업데이트
    this.physics.applyForce(movement)
    
    // 충돌 감지
    const collisions = this.physics.getCollisions()
    this.handleCollisions(collisions)
    
    // 애니메이션
    this.avatar.updateAnimation(movement)
    
    // 네트워크 동기화
    this.sendPositionUpdate()
  }
}
```

#### 3. 물리 엔진 (Rapier)
```typescript
import { World as RapierWorld } from '@dimforge/rapier3d'

class PhysicsManager {
  private world: RapierWorld
  
  addStaticBody(mesh: THREE.Mesh) {
    // 메시를 물리 바디로 변환
    const collider = this.createColliderFromMesh(mesh)
    this.world.createCollider(collider)
  }
  
  addDynamicBody(avatar: Avatar) {
    // 아바타 충돌체 생성
    const rigidBody = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
    )
    const collider = RAPIER.ColliderDesc.capsule(0.5, 0.3)
    this.world.createCollider(collider, rigidBody)
    
    return rigidBody
  }
}
```

---

### **Phase 3: 실시간 멀티플레이어 (3주)**

#### 1. Colyseus 서버
```typescript
// 게임 서버 (rooms/WorldRoom.ts)
export class WorldRoom extends Room<WorldState> {
  onCreate(options: any) {
    this.setState(new WorldState())
    
    // 월드 데이터 로드
    this.loadWorld(options.worldId)
    
    // 메시지 핸들러
    this.onMessage("move", this.handleMove.bind(this))
    this.onMessage("interact", this.handleInteract.bind(this))
    this.onMessage("chat", this.handleChat.bind(this))
  }
  
  onJoin(client: Client, options: any) {
    // 플레이어 생성
    const player = new Player(
      client.sessionId,
      options.avatar,
      this.state.spawnPoint
    )
    this.state.players.set(client.sessionId, player)
  }
  
  handleMove(client: Client, data: any) {
    const player = this.state.players.get(client.sessionId)
    player.position = data.position
    player.rotation = data.rotation
  }
}
```

#### 2. 클라이언트 동기화
```typescript
class NetworkManager {
  private room: Room<WorldState>
  
  async joinWorld(worldId: string) {
    this.room = await client.joinOrCreate("world", {
      worldId,
      avatar: currentAvatar
    })
    
    // 상태 변경 리스너
    this.room.state.players.onAdd = (player, key) => {
      this.addRemotePlayer(player)
    }
    
    this.room.state.players.onRemove = (player, key) => {
      this.removeRemotePlayer(key)
    }
    
    // 위치 업데이트
    this.room.state.players.onChange = (player, key) => {
      this.updateRemotePlayer(key, player)
    }
  }
}
```

---

### **Phase 4: 소셜 기능 (2주)**

#### 1. 채팅 시스템
```typescript
interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'emote' | 'system'
  channel: 'local' | 'world' | 'private'
}

class ChatManager {
  sendMessage(content: string, channel: ChatChannel) {
    // 필터링
    const filtered = this.filterProfanity(content)
    
    // 거리 기반 채팅
    if (channel === 'local') {
      this.room.send('chat', {
        content: filtered,
        position: myPosition,
        range: 10 // 10미터 반경
      })
    }
  }
}
```

#### 2. 친구 시스템
```typescript
// API 엔드포인트
POST   /api/friends/request     // 친구 요청
POST   /api/friends/accept      // 수락
DELETE /api/friends/:id         // 삭제
GET    /api/friends             // 목록
GET    /api/friends/online      // 온라인 친구

// 실시간 상태
socket.on('friend:online', (friendId) => {
  updateFriendStatus(friendId, 'online')
})

socket.on('friend:joined-world', (data) => {
  showNotification(`${data.name} joined ${data.worldName}`)
})
```

---

### **Phase 5: 월드 공유 & 탐색 (2주)**

#### 1. 월드 공유
```typescript
class WorldSharingService {
  async shareWorld(worldId: string, settings: ShareSettings) {
    // 공유 링크 생성
    const shareCode = this.generateShareCode()
    
    // 공유 설정 저장
    await db.worldShares.create({
      worldId,
      shareCode,
      visibility: settings.visibility,
      expiresAt: settings.expiresAt,
      maxUses: settings.maxUses
    })
    
    return {
      url: `${BASE_URL}/w/${shareCode}`,
      qrCode: await this.generateQRCode(shareCode)
    }
  }
}
```

#### 2. 월드 탐색
```typescript
// 월드 검색 API
GET /api/worlds/explore
  ?category=fantasy
  &sort=popular
  &page=1
  &limit=20

// 응답
{
  worlds: [{
    id: string
    name: string
    creator: {
      id: string
      username: string
      avatar: string
    }
    thumbnail: string
    stats: {
      visits: number
      likes: number
      activeUsers: number
    }
    tags: string[]
  }],
  pagination: {
    total: number
    page: number
    hasMore: boolean
  }
}
```

---

## 🛠️ 기술 스택 결정

### **필수 패키지**
```json
{
  "dependencies": {
    // 인증
    "next-auth": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    
    // 3D & 물리
    "@react-three/fiber": "^8.0.0",
    "@react-three/drei": "^9.0.0",
    "@react-three/rapier": "^1.0.0",
    
    // 실시간
    "colyseus": "^0.15.0",
    "colyseus.js": "^0.15.0",
    
    // UI
    "@radix-ui/react-*": "latest",
    "framer-motion": "^11.0.0",
    
    // 유틸
    "zod": "^3.0.0",
    "zustand": "^4.0.0"
  }
}
```

---

## 📊 성능 목표

### **클라이언트**
- FPS: 60 (최소 30)
- 로딩 시간: < 5초
- 메모리 사용: < 500MB

### **서버**
- 동시 접속: 100명/월드
- 레이턴시: < 50ms (같은 지역)
- 업타임: 99.9%

### **확장성**
- 수평 확장 가능
- 자동 스케일링
- 로드 밸런싱

---

## ⏱️ 타임라인

### **전체 일정: 12주**
- Week 1-2: 아키텍처 리팩토링
- Week 3-4: 인증 & DB
- Week 5-7: 월드 시스템 통합
- Week 8-10: 실시간 멀티플레이어
- Week 11-12: 소셜 기능
- Week 13-14: 월드 공유 & 탐색

### **MVP 목표**
- 로그인해서 월드 만들기
- 다른 사람 월드 방문하기
- 실시간으로 만나서 채팅
- 기본적인 상호작용

이렇게 단계적으로 구현하면 확장 가능한 메타버스 플랫폼을 만들 수 있습니다! 🚀