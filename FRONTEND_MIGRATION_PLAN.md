# 🔄 Frontend Migration Plan

백엔드 변경사항에 따른 프론트엔드 마이그레이션 계획

## 📋 목차

1. [변경사항 요약](#변경사항-요약)
2. [Breaking Changes](#breaking-changes)
3. [새로운 기능](#새로운-기능)
4. [작업 계획](#작업-계획)
5. [우선순위](#우선순위)

---

## 변경사항 요약

### 백엔드 주요 변경사항

| 분류       | 변경 내용                                     | 영향도    |
| ---------- | --------------------------------------------- | --------- |
| **스키마** | User/UserSetting 분리, 복합 미디어 지원       | 🔴 High   |
| **API**    | 새로운 엔드포인트 추가 (미디어, 요약)         | 🟡 Medium |
| **Socket** | roomId 타입 변경 (string → number), 새 이벤트 | 🔴 High   |
| **인증**   | email/password 로그인 (기존 name → email)     | 🔴 High   |
| **업로드** | S3 Presigned URL 방식                         | 🟢 New    |
| **요약**   | GPT-4o + TTS 기능                             | 🟢 New    |

---

## Breaking Changes

### 1. 🔴 로그인 API 변경

**Before**:

```typescript
POST /api/auth/login
{
  "name": "안시현"
}
```

**After**:

```typescript
POST /api/auth/login
{
  "email": "sihyun@test.com",
  "password": "test1234"
}
```

**영향 파일**:

- `src/app/login/page.tsx`
- `src/lib/auth.ts`

**작업**:

- [ ] 로그인 폼에 email/password 필드 추가
- [ ] 로그인 API 호출 수정
- [ ] 회원가입 폼 추가 (필요시)

---

### 2. 🔴 User 스키마 변경 (UserSetting 분리)

**Before**:

```typescript
interface User {
  id: number
  name: string
  profileImage?: string
  isOnline?: boolean
}
```

**After**:

```typescript
interface User {
  id: number
  name: string
  email: string
  setting?: {
    nickname?: string
    imageUrl?: string
    isSpecial: boolean
    isTest: boolean
    enableNotifications: boolean
    enableSummary: boolean
  }
}
```

**영향 파일**:

- `src/lib/interface.ts` (모든 User 타입 정의)
- `src/components/Profile.tsx`
- `src/components/Header.tsx`
- `src/app/settings/page.tsx`

**작업**:

- [ ] `interface.ts`에 User, UserSetting 타입 업데이트
- [ ] `user.profileImage` → `user.setting?.imageUrl` 변경
- [ ] `user.isOnline` → `user.setting?.isOnline` 변경
- [ ] Settings 페이지에 새 필드 추가 (isSpecial, enableSummary 등)

---

### 3. 🔴 Message 스키마 변경 (복합 미디어 지원)

**Before**:

```typescript
interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'audio' | 'file'
  imageUrl?: string
  audioUrl?: string
}
```

**After**:

```typescript
interface Message {
  id: string
  roomId: number // ⚠️ string → number
  senderId: number
  senderName: string
  senderImageUrl?: string
  text?: string
  media: Array<{
    type: 'audio' | 'image' | 'video' | 'file'
    url: string
    fileName?: string
    fileSize?: number
    duration?: number // 음성/비디오
    width?: number // 이미지/비디오
    height?: number
  }>
  readBy: Array<{
    userId: number
    readAt: string
  }>
  createdAt: string
}
```

**영향 파일**:

- `src/lib/interface.ts`
- `src/components/Chat.tsx`
- `src/components/ChatRoom.tsx`
- `src/app/chat/[id]/page.tsx`

**작업**:

- [ ] Message 타입 정의 업데이트
- [ ] 메시지 렌더링 로직 수정 (복합 미디어 지원)
- [ ] `roomId` string → number 변환
- [ ] 읽음 표시 UI (`readBy` 배열 활용)

---

### 4. 🔴 Socket 이벤트 변경

**Before**:

```typescript
// 메시지 전송
socket.emit('send-message', { roomId, content, type })

// roomId: string
```

**After**:

```typescript
// 메시지 전송
socket.emit('send-message', {
  roomId, // ⚠️ number
  text,
  media: [],
})

// 새로운 이벤트
socket.on('unread-count-update', (data) => {
  // { roomId, unreadCount }
})

socket.on('messages-read', (data) => {
  // { roomId, userId, messageId }
})
```

**영향 파일**:

- `src/lib/socket-client.ts`
- `src/app/chat/[id]/page.tsx`

**작업**:

- [ ] `sendMessage()` 함수 파라미터 변경
- [ ] `roomId` 타입 string → number 처리
- [ ] 새 이벤트 리스너 추가:
  - `unread-count-update` - 실시간 읽지 않은 개수
  - `messages-read` - 읽음 처리
  - `user-typing` - 타이핑 인디케이터

---

### 5. 🔴 Chat Room API 변경

**Before**:

```typescript
GET /api/chat/rooms
{
  rooms: [{
    id: string;
    name: string;
    participants: User[];
  }]
}
```

**After**:

```typescript
GET /api/chat/rooms
{
  rooms: [{
    id: number;
    name: string;
    participantCount: number;
    roomType: 'direct' | 'group';  // 동적 생성
    unreadCount: number;  // 🆕
    lastMessage: { ... };
    participants: User[];
    isPinned: boolean;
    isMuted: boolean;
  }]
}
```

**영향 파일**:

- `src/lib/interface.ts`
- `src/app/page.tsx` (채팅방 리스트)
- `src/components/ChatRoom.tsx`

**작업**:

- [ ] ChatRoom 타입 업데이트
- [ ] `unreadCount` 배지 표시
- [ ] `isPinned`, `isMuted` UI 추가
- [ ] 1:1 채팅은 상대방 이름/이미지 자동 표시

---

## 새로운 기능

### 1. 🟢 미디어 업로드 (S3 Presigned URL)

**플로우**:

```typescript
// 1. Presigned URL 요청
const { uploadUrl, publicUrl } = await ApiClient.post('/media/upload-url', {
  fileName: file.name,
  fileType: file.type,
  mediaType: 'image',
  fileSize: file.size,
})

// 2. S3로 직접 업로드
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
})

// 3. 메시지 전송
socket.emit('send-message', {
  roomId: 1,
  text: '이 사진 봐!',
  media: [
    {
      type: 'image',
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    },
  ],
})
```

**작업**:

- [ ] 파일 업로드 컴포넌트 생성
- [ ] Presigned URL API 호출 로직
- [ ] S3 직접 업로드 로직
- [ ] 업로드 진행 상태 표시
- [ ] 이미지/음성/비디오 프리뷰
- [ ] 복수 파일 업로드 지원

**새 컴포넌트**:

- `src/components/MediaUploader.tsx`
- `src/components/MediaPreview.tsx`
- `src/components/ImageGallery.tsx` (복수 이미지)

---

### 2. 🟢 채팅 요약 + TTS

**API**:

```typescript
// 요약 생성
POST /api/chat/rooms/:roomId/summary

// 최신 요약 조회
GET /api/chat/rooms/:roomId/summary
{
  summary: {
    text: "정다호님이 점심 약속을...",
    audioUrl: "https://s3.../summary.mp3",
    messageCount: 12,
    createdAt: "2025-11-05T..."
  }
}
```

**작업**:

- [ ] 요약 버튼/트리거 추가 (채팅방 입장 시 또는 수동)
- [ ] 요약 표시 UI
- [ ] TTS 오디오 플레이어
- [ ] 로딩 상태 표시
- [ ] 발달장애인 모드 설정 (`isSpecial`)

**새 컴포넌트**:

- `src/components/ChatSummary.tsx`
- `src/components/AudioPlayer.tsx`

---

### 3. 🟢 실시간 읽지 않은 개수

**Socket 이벤트**:

```typescript
// 자동 업데이트 수신
socket.on('unread-count-update', (data) => {
  // { roomId, unreadCount }
  updateChatRoomBadge(data.roomId, data.unreadCount)
})

// 수동 요청
socket.emit('get-unread-count', { roomId: 1 })
socket.on('unread-count', (data) => {
  // { roomId, unreadCount }
})
```

**작업**:

- [ ] Socket 이벤트 리스너 추가
- [ ] 채팅방 리스트 배지 실시간 업데이트
- [ ] 읽음 처리 (`mark-read`) API/Socket 연동
- [ ] 배지 애니메이션 (새 메시지 시)

---

### 4. 🟢 타이핑 인디케이터

**Socket 이벤트**:

```typescript
// 타이핑 중 전송
socket.emit('typing', { roomId: 1, isTyping: true })

// 타이핑 중 수신
socket.on('user-typing', (data) => {
  // { userId, userName, roomId, isTyping }
})
```

**작업**:

- [ ] Input onChange 시 typing 이벤트 전송 (debounce)
- [ ] 타이핑 중 표시 ("안시현님이 입력 중...")
- [ ] 타이핑 애니메이션 (...)

---

## 작업 계획

### Phase 1: 기본 호환성 (Breaking Changes 해결)

**목표**: 기존 기능이 새 백엔드에서 작동하도록 수정

**작업 리스트**:

#### 1.1 타입 정의 업데이트

- [ ] `src/lib/interface.ts` 전체 업데이트
  - User, UserSetting
  - Message, Media
  - ChatRoom
  - Friend

#### 1.2 인증 시스템 마이그레이션

- [ ] 로그인 페이지 수정 (email/password)
- [ ] 회원가입 페이지 추가
- [ ] localStorage 구조 변경 (`user.setting` 포함)

#### 1.3 Socket 클라이언트 업데이트

- [ ] `socket-client.ts` - roomId 타입 변경
- [ ] `sendMessage()` 함수 수정 (text, media 파라미터)
- [ ] 기존 이벤트 호환성 확인

#### 1.4 API 클라이언트 업데이트

- [ ] User 관련 API 응답 처리 (`user.setting`)
- [ ] Chat Room API 응답 처리 (`unreadCount`, `roomType`)
- [ ] Message API 응답 처리 (`media` 배열)

#### 1.5 UI 컴포넌트 수정

- [ ] Profile 컴포넌트 (`user.setting`)
- [ ] ChatRoom 리스트 (`unreadCount` 배지)
- [ ] Chat 메시지 렌더링 (복합 미디어)
- [ ] Settings 페이지 (새 필드들)

**예상 기간**: 2-3일

---

### Phase 2: 미디어 업로드 구현

**목표**: 이미지/음성/비디오 전송 기능

**작업 리스트**:

#### 2.1 미디어 업로더 컴포넌트

- [ ] `MediaUploader.tsx` 생성
  - 파일 선택 UI
  - 드래그 앤 드롭
  - 파일 타입 검증
  - 파일 크기 검증

#### 2.2 Presigned URL 업로드 로직

- [ ] API 호출: `POST /media/upload-url`
- [ ] S3 직접 업로드 (PUT)
- [ ] 업로드 진행 상태 (Progress Bar)
- [ ] 에러 핸들링

#### 2.3 미디어 프리뷰 컴포넌트

- [ ] 이미지 프리뷰 (`MediaPreview.tsx`)
- [ ] 음성 플레이어 (waveform)
- [ ] 비디오 플레이어
- [ ] 복수 이미지 갤러리

#### 2.4 메시지 전송 통합

- [ ] 텍스트 + 미디어 동시 전송
- [ ] 미디어 메타데이터 포함 (fileSize, duration 등)
- [ ] 업로드 실패 시 재시도

**예상 기간**: 3-4일

---

### Phase 3: 고급 기능 (요약, 실시간 업데이트)

**목표**: 채팅 요약, TTS, 실시간 읽지 않은 개수

**작업 리스트**:

#### 3.1 채팅 요약

- [ ] `ChatSummary.tsx` 컴포넌트
- [ ] 요약 생성 API 연동
- [ ] 요약 표시 UI (텍스트 + 오디오)
- [ ] 오디오 플레이어 (`AudioPlayer.tsx`)
- [ ] 로딩 스피너
- [ ] 발달장애인 모드 토글

#### 3.2 실시간 읽지 않은 개수

- [ ] Socket 이벤트 리스너 추가
  - `unread-count-update`
  - `messages-read`
- [ ] 채팅방 리스트 배지 실시간 업데이트
- [ ] 읽음 처리 로직 (`mark-read`)
- [ ] 배지 애니메이션

#### 3.3 타이핑 인디케이터

- [ ] Input onChange 이벤트 (debounce)
- [ ] `typing` 이벤트 전송
- [ ] `user-typing` 이벤트 수신
- [ ] "입력 중..." UI

#### 3.4 읽음 표시

- [ ] 메시지별 읽음 사용자 표시
- [ ] "읽음" / "N명 읽지 않음" UI
- [ ] 프로필 이미지 오버레이

**예상 기간**: 3-4일

---

### Phase 4: 최적화 & 테스트

**목표**: 성능 최적화, 버그 수정, UX 개선

**작업 리스트**:

#### 4.1 성능 최적화

- [ ] 메시지 무한 스크롤 (`before`, `limit`)
- [ ] 이미지 Lazy Loading
- [ ] Socket 연결 재시도 로직
- [ ] 오프라인 대응

#### 4.2 UX 개선

- [ ] 로딩 상태 일관성
- [ ] 에러 메시지 개선
- [ ] 성공 토스트 알림
- [ ] 키보드 단축키 (Enter, Shift+Enter)

#### 4.3 테스트

- [ ] E2E 테스트 (로그인, 메시지 전송, 미디어 업로드)
- [ ] Socket 연결 테스트
- [ ] 멀티 유저 테스트 (2명 이상)
- [ ] 오프라인 시나리오

#### 4.4 문서화

- [ ] README 업데이트
- [ ] 환경 변수 가이드
- [ ] 테스트 계정 정보

**예상 기간**: 2-3일

---

## 우선순위

### 🔴 필수 (P0) - Phase 1

1. 타입 정의 업데이트
2. 로그인/인증 마이그레이션
3. Socket roomId 타입 변경
4. 기본 메시지 송수신 호환성

### 🟡 중요 (P1) - Phase 2

5. 이미지 업로드
6. 복합 미디어 렌더링
7. 읽지 않은 개수 표시

### 🟢 Nice-to-have (P2) - Phase 3

8. 채팅 요약 + TTS
9. 타이핑 인디케이터
10. 읽음 표시

---

## 예상 일정

| Phase     | 작업 내용       | 예상 기간   | 담당 |
| --------- | --------------- | ----------- | ---- |
| Phase 1   | 기본 호환성     | 2-3일       | TBD  |
| Phase 2   | 미디어 업로드   | 3-4일       | TBD  |
| Phase 3   | 고급 기능       | 3-4일       | TBD  |
| Phase 4   | 최적화 & 테스트 | 2-3일       | TBD  |
| **Total** |                 | **10-14일** |      |

---

## 체크리스트

### Phase 1 (기본 호환성)

- [ ] interface.ts 업데이트
- [ ] 로그인 페이지 수정
- [ ] socket-client.ts 업데이트
- [ ] api-client.ts 업데이트
- [ ] 기본 컴포넌트 수정 (Profile, ChatRoom, Chat)

### Phase 2 (미디어)

- [ ] MediaUploader 컴포넌트
- [ ] Presigned URL 로직
- [ ] MediaPreview 컴포넌트
- [ ] 메시지 전송 통합

### Phase 3 (고급 기능)

- [ ] ChatSummary 컴포넌트
- [ ] 실시간 unread count
- [ ] 타이핑 인디케이터
- [ ] 읽음 표시

### Phase 4 (최적화)

- [ ] 성능 최적화
- [ ] UX 개선
- [ ] E2E 테스트
- [ ] 문서화

---

## 참고 자료

- [Backend API Reference](../Ieum-Backend/docs/API.md)
- [Backend Database Schema](../Ieum-Backend/docs/DATABASE.md)
- [Backend Architecture](../Ieum-Backend/docs/ARCHITECTURE.md)
- [Backend Testing Guide](../Ieum-Backend/docs/TESTING.md)

---

**작성일**: 2025-11-05
**작성자**: AI Assistant
