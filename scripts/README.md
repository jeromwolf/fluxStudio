# 🛠️ Flux Studio Scripts

메타버스 플랫폼 개발을 위한 유틸리티 스크립트들입니다.

## 📜 스크립트 목록

### 1. `start-metaverse.sh`
메타버스 플랫폼의 모든 서비스를 시작합니다.

```bash
# 기본 실행
./scripts/start-metaverse.sh

# 포트가 사용 중일 때 자동으로 종료하고 시작
./scripts/start-metaverse.sh --kill-ports

# 커스텀 포트 지정
./scripts/start-metaverse.sh --next-port 3000 --multiplayer-port 3001

# 도움말
./scripts/start-metaverse.sh --help
```

**기능:**
- ✅ 포트 가용성 확인
- ✅ 자동 포트 정리 옵션
- ✅ Next.js 개발 서버 시작 (포트 3002)
- ✅ 멀티플레이어 서버 시작 (포트 3003)
- ✅ Colyseus 서버 준비 (포트 2567)
- ✅ Ctrl+C로 모든 서비스 종료

### 2. `kill-ports.sh`
메타버스 플랫폼이 사용하는 포트를 정리합니다.

```bash
# 기본 포트 정리 (3002, 3003, 2567)
./scripts/kill-ports.sh

# 특정 포트만 정리
./scripts/kill-ports.sh 3002

# 여러 포트 정리
./scripts/kill-ports.sh 3000 3001 3002
```

**기능:**
- ✅ 포트 사용 중인 프로세스 확인
- ✅ 프로세스 이름 표시
- ✅ 안전한 프로세스 종료
- ✅ 결과 요약 표시

### 3. `migrate-structure.ts`
프로젝트 구조를 리팩토링합니다.

```bash
# TypeScript로 실행
npx tsx scripts/migrate-structure.ts
```

**기능:**
- ✅ 레거시 코드를 새로운 폴더 구조로 이동
- ✅ import 경로 자동 업데이트
- ✅ 백업 생성

## 🚨 문제 해결

### 포트가 계속 사용 중일 때
```bash
# 강제로 포트 정리
sudo ./scripts/kill-ports.sh

# 또는 수동으로
sudo kill -9 $(lsof -ti:3002)
```

### 권한 오류
```bash
# 스크립트 실행 권한 부여
chmod +x scripts/*.sh
```

### 프로세스를 찾을 수 없을 때
```bash
# 모든 Node.js 프로세스 확인
ps aux | grep node

# 특정 포트 사용 프로세스 확인
lsof -i :3002
```

## 📝 추가 팁

1. **개발 시작 전 루틴**
   ```bash
   ./scripts/kill-ports.sh && ./scripts/start-metaverse.sh
   ```

2. **안전한 종료**
   - `Ctrl+C`를 한 번만 누르면 모든 서비스가 정상 종료됩니다
   - 강제 종료가 필요한 경우 `Ctrl+C`를 두 번 누르세요

3. **로그 확인**
   - Next.js 로그: 터미널에 직접 출력
   - 멀티플레이어 서버 로그: 별도 터미널 탭에서 확인 가능