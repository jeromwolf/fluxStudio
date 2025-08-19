# 🎭 Avatar & World Building Architecture

## 📋 목차
1. [개요](#개요)
2. [아바타 시스템](#아바타-시스템)
3. [월드 빌딩 시스템](#월드-빌딩-시스템)
4. [오브젝트 라이브러리](#오브젝트-라이브러리)
5. [아이템 시스템](#아이템-시스템)
6. [상호작용 시스템](#상호작용-시스템)
7. [기술 아키텍처](#기술-아키텍처)
8. [개발 로드맵](#개발-로드맵)

---

## 🎯 개요

### 비전
"사용자가 자신만의 독특한 아바타와 월드를 쉽고 재미있게 만들 수 있는 창작 플랫폼"

### 핵심 원칙
1. **쉬운 사용성**: 드래그 앤 드롭만으로 완성
2. **무한한 창의성**: 다양한 커스터마이징 옵션
3. **즉각적인 피드백**: 실시간 프리뷰
4. **소셜 경험**: 공유와 협업이 쉬운 시스템

---

## 👤 아바타 시스템

### 1. 아바타 구조 (Modular System)
```
Avatar
├── Head
│   ├── Face (눈, 코, 입, 표정)
│   ├── Hair (헤어스타일, 색상)
│   ├── Accessories (안경, 귀걸이, 모자)
│   └── Makeup (화장, 문신, 특수효과)
├── Body
│   ├── UpperBody (상체 체형)
│   ├── LowerBody (하체 체형)
│   ├── Skin (피부색, 질감)
│   └── Proportions (신체 비율)
├── Outfit
│   ├── Top (상의)
│   ├── Bottom (하의)
│   ├── Shoes (신발)
│   ├── Outerwear (겉옷)
│   └── Accessories (가방, 벨트, 장신구)
└── Animation
    ├── Idle (대기 모션)
    ├── Walk/Run (이동 모션)
    ├── Emotes (감정 표현)
    └── Custom (사용자 정의 모션)
```

### 2. 커스터마이징 레벨

#### Level 1: Quick Start (초보자)
- 프리셋 아바타 20종
- 색상 변경만 가능
- 1-Click 랜덤 생성

#### Level 2: Basic Custom (일반)
- 파츠별 교체 (머리, 몸, 의상)
- 색상 팔레트 제공
- 기본 체형 조절 (3단계)

#### Level 3: Advanced Custom (고급)
- 세부 파츠 조절 (눈 크기, 코 높이 등)
- 커스텀 색상 (RGB/HSL)
- 체형 슬라이더 (연속적 조절)
- 텍스처 업로드

#### Level 4: Pro Creator (전문가)
- 3D 모델 임포트
- 리깅 & 애니메이션
- 셰이더 편집
- 파츠 제작 도구

### 3. 아바타 프리셋 카테고리
- **캐주얼**: 일상적인 스타일
- **비즈니스**: 전문적인 모습
- **판타지**: 환상적인 캐릭터
- **사이버펑크**: 미래적 스타일
- **애니메**: 일본 애니메이션 스타일
- **리얼리스틱**: 사실적인 인간
- **커스텀**: 사용자 제작

---

## 🏗️ 월드 빌딩 시스템

### 1. 월드 템플릿

#### 기본 템플릿
1. **Empty Space** - 빈 공간에서 시작
2. **City Street** - 도시 거리
3. **Nature Park** - 자연 공원
4. **Beach** - 해변
5. **Mountain** - 산악 지형
6. **Space Station** - 우주 정거장
7. **Fantasy Castle** - 판타지 성
8. **Cyberpunk City** - 사이버펑크 도시

#### 목적별 템플릿
1. **Gallery** - 전시 공간
2. **Concert Hall** - 공연장
3. **Classroom** - 교육 공간
4. **Meeting Room** - 회의실
5. **Game Arena** - 게임 경기장
6. **Shopping Mall** - 쇼핑몰
7. **Cafe** - 카페/라운지
8. **House** - 개인 주택

### 2. 빌딩 시스템 구조

```
World Builder
├── Terrain (지형)
│   ├── Base (평지, 언덕, 계곡)
│   ├── Texture (잔디, 모래, 돌, 물)
│   ├── Vegetation (나무, 풀, 꽃)
│   └── Weather (날씨 효과)
├── Architecture (건축)
│   ├── Foundations (바닥, 기초)
│   ├── Walls (벽, 창문, 문)
│   ├── Roofs (지붕, 천장)
│   └── Stairs (계단, 엘리베이터)
├── Props (소품)
│   ├── Furniture (가구)
│   ├── Decoration (장식품)
│   ├── Interactive (상호작용 오브젝트)
│   └── Lighting (조명)
└── Systems (시스템)
    ├── Physics (물리 엔진)
    ├── Lighting (조명 시스템)
    ├── Audio (사운드 존)
    └── Triggers (이벤트 트리거)
```

### 3. 빌딩 도구

#### 기본 도구
- **Select** - 선택/이동
- **Place** - 오브젝트 배치
- **Rotate** - 회전
- **Scale** - 크기 조절
- **Delete** - 삭제
- **Duplicate** - 복제
- **Group** - 그룹화

#### 고급 도구
- **Terrain Sculpt** - 지형 조각
- **Paint** - 텍스처 페인팅
- **Path** - 경로 생성
- **Array** - 배열 복제
- **Snap** - 스냅 정렬
- **Measure** - 측정
- **Blueprint** - 청사진 모드

---

## 📦 오브젝트 라이브러리

### 1. 카테고리별 오브젝트

#### 🪑 가구 (Furniture) - 200+ items
- **거실**: 소파(10종), 테이블(15종), TV장(5종), 선반(10종)
- **침실**: 침대(10종), 옷장(8종), 화장대(5종), 서랍장(8종)
- **주방**: 식탁(10종), 의자(20종), 주방가구(15종)
- **사무실**: 책상(10종), 사무의자(10종), 책장(10종), 캐비닛(8종)
- **욕실**: 욕조(5종), 세면대(5종), 거울(8종)

#### 🌳 자연 (Nature) - 150+ items
- **나무**: 침엽수(10종), 활엽수(15종), 열대수(10종), 꽃나무(10종)
- **식물**: 꽃(30종), 잔디(5종), 덤불(10종), 선인장(8종)
- **바위**: 큰바위(10종), 작은돌(10종), 절벽(5종)
- **물**: 연못(5종), 분수(8종), 폭포(5종), 시냇물(5종)

#### 🏢 건축 요소 (Architecture) - 300+ items
- **벽**: 일반벽(20종), 유리벽(10종), 벽돌벽(10종)
- **문**: 일반문(15종), 유리문(10종), 자동문(5종)
- **창문**: 일반창(20종), 대형창(10종), 스테인드글라스(5종)
- **기둥**: 원형(10종), 사각(10종), 장식기둥(15종)
- **계단**: 직선(10종), 나선(5종), 에스컬레이터(3종)

#### 🎮 인터랙티브 (Interactive) - 100+ items
- **게임**: 아케이드(10종), 보드게임(10종), 스포츠장비(20종)
- **미디어**: TV(10종), 모니터(10종), 프로젝터(5종), 스피커(10종)
- **기계**: 자판기(10종), ATM(3종), 키오스크(5종)
- **포털**: 텔레포트(5종), 엘리베이터(5종), 이동장치(5종)

#### 💡 조명 (Lighting) - 80+ items
- **실내**: 천장등(20종), 스탠드(15종), 벽등(10종)
- **실외**: 가로등(10종), 정원등(10종), 투광등(5종)
- **특수**: 네온사인(10종), LED스트립(5종), 무대조명(10종)

#### 🎨 장식 (Decoration) - 200+ items
- **벽장식**: 그림(30종), 포스터(20종), 시계(10종)
- **바닥장식**: 러그(20종), 카펫(15종), 매트(10종)
- **선반장식**: 책(20종), 화분(20종), 피규어(30종)
- **특수효과**: 파티클(20종), 홀로그램(10종), 연기효과(5종)

### 2. 오브젝트 속성

#### 기본 속성
- **Transform**: 위치, 회전, 크기
- **Material**: 색상, 질감, 투명도
- **Physics**: 충돌, 중력, 질량
- **Interaction**: 클릭, 호버, 터치

#### 고급 속성
- **Animation**: 루프 애니메이션, 트리거 애니메이션
- **Script**: 커스텀 동작, 이벤트
- **Audio**: 사운드 이펙트, 배경음
- **Particle**: 파티클 효과

---

## 🎁 아이템 시스템

### 1. 아이템 카테고리

#### 착용 아이템 (Wearables)
- **모자**: 캡(20종), 베레모(10종), 왕관(5종), 헬멧(10종)
- **안경**: 선글라스(15종), 안경(10종), 고글(5종)
- **액세서리**: 목걸이(20종), 귀걸이(20종), 반지(15종)
- **가방**: 백팩(10종), 핸드백(15종), 크로스백(10종)
- **신발**: 운동화(20종), 구두(15종), 부츠(10종)

#### 소지 아이템 (Handheld)
- **도구**: 망치, 드릴, 페인트붓, 카메라
- **음식**: 커피, 피자, 햄버거, 아이스크림
- **스포츠**: 공, 라켓, 골프클럽, 스케이트보드
- **악기**: 기타, 피아노, 드럼, 바이올린

#### 탈것 (Vehicles)
- **자동차**: 세단(5종), SUV(5종), 스포츠카(5종)
- **자전거**: 일반(5종), 산악(3종), 전기(3종)
- **스쿠터**: 킥보드(5종), 전동스쿠터(5종)
- **특수**: 호버보드, 제트팩, 텔레포터

#### 펫 (Pets)
- **동물**: 강아지(10종), 고양이(10종), 새(5종)
- **판타지**: 드래곤, 유니콘, 피닉스
- **로봇**: 로봇개, 드론, AI 컴패니언

### 2. 아이템 획득 방법
- **기본 제공**: 회원가입 시 기본 아이템
- **레벨업 보상**: 활동에 따른 보상
- **상점 구매**: 크레딧으로 구매
- **이벤트**: 기간 한정 이벤트
- **제작**: 재료 조합으로 제작
- **거래**: 유저 간 거래

---

## 🔗 상호작용 시스템

### 1. 아바타 ↔ 월드 상호작용

#### 기본 상호작용
- **앉기**: 의자, 소파, 벤치에 앉기
- **눕기**: 침대, 소파에 눕기
- **사용하기**: 문 열기, 스위치 켜기
- **줍기/놓기**: 아이템 들고 이동

#### 고급 상호작용
- **탑승**: 차량, 엘리베이터 탑승
- **조작**: 기계 작동, 게임 플레이
- **변형**: 오브젝트 색상/크기 변경
- **생성**: 그림 그리기, 메모 남기기

### 2. 아바타 ↔ 아바타 상호작용

#### 소셜 액션
- **인사**: 손흔들기, 악수, 하이파이브
- **감정표현**: 춤추기, 박수, 웃기
- **협동**: 함께 들기, 같이 춤추기
- **게임**: 가위바위보, 공놀이

### 3. 월드 시스템

#### 환경 시스템
- **날씨**: 맑음, 비, 눈, 안개
- **시간**: 낮/밤 사이클, 일출/일몰
- **계절**: 봄, 여름, 가을, 겨울
- **이벤트**: 불꽃놀이, 축제, 콘서트

#### 물리 시스템
- **중력**: 일반, 저중력, 무중력
- **충돌**: 리얼리스틱, 아케이드, 없음
- **파괴**: 부서지는 오브젝트
- **유체**: 물, 용암, 구름

---

## 🏗️ 기술 아키텍처

### 1. 아바타 시스템 기술 스택
```typescript
// Avatar Structure
interface Avatar {
  id: string
  userId: string
  metadata: {
    name: string
    created: Date
    lastModified: Date
  }
  components: {
    head: HeadComponent
    body: BodyComponent
    outfit: OutfitComponent
    animations: AnimationSet
  }
  inventory: Item[]
}

// Modular Component System
class AvatarBuilder {
  private parts: Map<string, AvatarPart>
  
  addPart(slot: string, part: AvatarPart): void
  removePart(slot: string): void
  updatePart(slot: string, properties: Partial<AvatarPart>): void
  generateMesh(): THREE.Group
  serialize(): AvatarData
  deserialize(data: AvatarData): void
}
```

### 2. 월드 빌더 기술 스택
```typescript
// World Structure
interface World {
  id: string
  ownerId: string
  metadata: {
    name: string
    description: string
    thumbnail: string
    tags: string[]
  }
  terrain: TerrainData
  objects: WorldObject[]
  lighting: LightingConfig
  environment: EnvironmentConfig
  permissions: PermissionSet
}

// Object Placement System
class WorldBuilder {
  private scene: THREE.Scene
  private objects: Map<string, WorldObject>
  private grid: GridSystem
  
  placeObject(object: WorldObject, position: Vector3): string
  moveObject(id: string, position: Vector3): void
  rotateObject(id: string, rotation: Euler): void
  scaleObject(id: string, scale: Vector3): void
  deleteObject(id: string): void
  
  // Batch operations
  groupObjects(ids: string[]): string
  duplicateObjects(ids: string[]): string[]
  alignObjects(ids: string[], alignment: AlignmentType): void
}
```

### 3. 최적화 전략

#### LOD (Level of Detail)
- **거리별 모델 전환**
  - 0-10m: High poly
  - 10-30m: Medium poly
  - 30-100m: Low poly
  - 100m+: Billboard/Impostor

#### 인스턴싱
- **동일 오브젝트 최적화**
  - GPU Instancing
  - Texture Atlas
  - Batch Rendering

#### 스트리밍
- **Dynamic Loading**
  - 청크 단위 로딩
  - 우선순위 큐
  - 프리로딩

### 4. 데이터 구조

#### 아바타 데이터
```json
{
  "version": "1.0",
  "avatar": {
    "head": {
      "model": "head_type_3",
      "skin": "#FFD4B2",
      "eyes": { "type": "eyes_2", "color": "#4A90E2" },
      "hair": { "type": "hair_long_1", "color": "#2C1810" }
    },
    "body": {
      "type": "body_athletic",
      "height": 1.75,
      "proportions": { "shoulders": 1.0, "waist": 0.8 }
    },
    "outfit": {
      "top": "shirt_casual_1",
      "bottom": "jeans_1",
      "shoes": "sneakers_3"
    }
  }
}
```

#### 월드 데이터
```json
{
  "version": "1.0",
  "world": {
    "terrain": {
      "type": "hills",
      "size": [100, 100],
      "heightmap": "terrain_1.png",
      "textures": ["grass", "dirt", "rock"]
    },
    "objects": [
      {
        "id": "obj_001",
        "type": "furniture_sofa_1",
        "position": [10, 0, 5],
        "rotation": [0, 45, 0],
        "scale": [1, 1, 1],
        "properties": {
          "color": "#FF6B6B",
          "material": "fabric"
        }
      }
    ]
  }
}
```

---

## 📅 개발 로드맵

### Phase 1: Core Systems (2개월)
1. **Week 1-2**: 아바타 기본 시스템
   - [ ] 모듈러 아바타 구조
   - [ ] 기본 파츠 10종
   - [ ] 색상 커스터마이징

2. **Week 3-4**: 월드 빌더 기초
   - [ ] 그리드 시스템
   - [ ] 오브젝트 배치/이동/회전
   - [ ] 기본 오브젝트 20종

3. **Week 5-6**: 저장/불러오기
   - [ ] 아바타 직렬화
   - [ ] 월드 직렬화
   - [ ] 클라우드 저장

4. **Week 7-8**: 기본 상호작용
   - [ ] 앉기/서기
   - [ ] 문 열기/닫기
   - [ ] 아이템 줍기/놓기

### Phase 2: Content Expansion (3개월)
1. **Month 3**: 아바타 확장
   - [ ] 고급 커스터마이징
   - [ ] 애니메이션 시스템
   - [ ] 표정 시스템

2. **Month 4**: 오브젝트 라이브러리
   - [ ] 200+ 기본 오브젝트
   - [ ] 카테고리별 정리
   - [ ] 검색/필터 시스템

3. **Month 5**: 아이템 시스템
   - [ ] 인벤토리 UI
   - [ ] 아이템 착용/해제
   - [ ] 아이템 거래 시스템

### Phase 3: Advanced Features (3개월)
1. **Month 6**: 고급 빌더 도구
   - [ ] 지형 편집
   - [ ] 라이팅 시스템
   - [ ] 파티클 효과

2. **Month 7**: 스크립팅
   - [ ] 비주얼 스크립팅
   - [ ] 이벤트 시스템
   - [ ] 커스텀 상호작용

3. **Month 8**: 최적화 & 폴리싱
   - [ ] LOD 시스템
   - [ ] 성능 최적화
   - [ ] UI/UX 개선

### 성공 지표
- **Phase 1**: 기본 기능으로 아바타 생성 및 간단한 방 만들기 가능
- **Phase 2**: 다양한 콘텐츠로 풍부한 월드 제작 가능
- **Phase 3**: 프로페셔널 수준의 월드 제작 및 인터랙션 구현

---

*이 아키텍처는 지속적으로 업데이트되며, 사용자 피드백과 기술 발전에 따라 조정됩니다.*