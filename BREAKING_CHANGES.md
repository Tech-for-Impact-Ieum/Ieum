# 🚨 Breaking Changes - 상세 비교

백엔드 API 변경사항 Before/After 상세 비교

## 📋 목차

1. [인증 API](#인증-api)
2. [사용자 데이터 구조](#사용자-데이터-구조)
3. [메시지 데이터 구조](#메시지-데이터-구조)
4. [채팅방 API](#채팅방-api)
5. [Socket 이벤트](#socket-이벤트)

---

## 인증 API

### 로그인

**Before**:

```typescript
// Request
POST /api/auth/login
{
  "name": "안시현"  // ❌ name만 사용
}

// Response
{
  "ok": true,
  "user": {
    "id": 2,
    "name": "안시현",
    "profileImage": "https://...",
    "isOnline": true
  },
  "token": "eyJhbGc..."
}
```

**After**:

```typescript
// Request
POST /api/auth/login
{
  "email": "sihyun@test.com",  // ✅ email/password
  "password": "test1234"
}

// Response
{
  "ok": true,
  "user": {
    "id": 2,
    "name": "안시현",
    "email": "sihyun@test.com",  // ✅ email 추가
    "setting": {  // ✅ UserSetting 분리
      "nickname": "시현",
      "imageUrl": "https://...",
      "isSpecial": false,
      "isTest": false,
      "enableNotifications": true,
      "enableSummary": true
    }
  },
  "token": "eyJhbGc..."
}
```

**변경 포인트**:

- ✅ email/password 필수
- ✅ `profileImage` → `setting.imageUrl`
- ✅ `isOnline` → `setting` (별도 API로 관리)
- ✅ `setting` 객체 추가

---

## 사용자 데이터 구조

### User 타입

**Before**:

```typescript
interface User {
  id: number
  name: string
  profileImage?: string
  isOnline?: boolean
  lastSeenAt?: string
}
```

**After**:

```typescript
interface User {
  id: number
  name: string
  email: string // ✅ 추가
  phone?: string // ✅ 추가
  setting?: UserSetting // ✅ 분리
  createdAt: string
}

interface UserSetting {
  nickname?: string
  imageUrl?: string
  isSpecial: boolean // 발달장애인 인터페이스
  isTest: boolean // 테스트 계정
  enableNotifications: boolean
  enableSummary: boolean
}
```

**마이그레이션 가이드**:

```typescript
// Before
const image = user.profileImage
const online = user.isOnline

// After
const image = user.setting?.imageUrl
const online = user.setting?.isOnline // 별도 API 필요
```

---

## 메시지 데이터 구조

### Message 타입

**Before**:

```typescript
interface Message {
  id: string
  roomId: string // ❌ string
  userId: string
  userName: string
  content: string
  type: 'text' | 'image' | 'audio' | 'file'
  imageUrl?: string
  audioUrl?: string
  createdAt: string
  isRead?: boolean
}
```

**After**:

```typescript
interface Message {
  id: string // MongoDB ObjectId
  roomId: number // ✅ number (MySQL Room.id)
  senderId: number
  senderName: string
  senderImageUrl?: string // ✅ 비정규화

  // ✅ 복합 콘텐츠 (text + media 동시 가능)
  text?: string
  media: MediaItem[] // ✅ 배열로 변경

  // ✅ 읽음 처리 (배열)
  readBy: Array<{
    userId: number
    readAt: string
  }>

  createdAt: string
  updatedAt: string

  // ✅ Soft delete
  isDeleted: boolean
  deletedAt?: string
}

interface MediaItem {
  type: 'audio' | 'image' | 'video' | 'file'
  url: string // S3 URL
  fileName?: string
  fileSize?: number
  duration?: number // 음성/비디오
  width?: number // 이미지/비디오
  height?: number
}
```

**마이그레이션 가이드**:

```typescript
// Before: 단일 미디어
const message = {
  content: '이 사진 봐!',
  type: 'image',
  imageUrl: 'https://...',
}

// After: 복합 미디어
const message = {
  text: '이 사진 봐!',
  media: [
    {
      type: 'image',
      url: 'https://...',
      fileName: 'photo.jpg',
      fileSize: 1024000,
    },
  ],
}

// Before: 읽음 여부
message.isRead = true

// After: 읽은 사용자 목록
message.readBy = [{ userId: 2, readAt: '2025-11-05T12:00:00Z' }]
```

**복합 미디어 예시**:

```typescript
// 텍스트만
{
  text: "안녕하세요!",
  media: []
}

// 텍스트 + 이미지
{
  text: "이 사진 봐!",
  media: [{
    type: "image",
    url: "https://s3.../photo.jpg",
    fileName: "photo.jpg"
  }]
}

// 음성 + STT 텍스트
{
  text: "안녕하세요 만나서 반갑습니다",
  media: [{
    type: "audio",
    url: "https://s3.../voice.m4a",
    duration: 5
  }]
}

// 이미지 여러 개
{
  text: "여행 사진들",
  media: [
    { type: "image", url: "...", fileName: "photo1.jpg" },
    { type: "image", url: "...", fileName: "photo2.jpg" },
    { type: "image", url: "...", fileName: "photo3.jpg" }
  ]
}
```

---

## 채팅방 API

### GET /api/chat/rooms

**Before**:

```typescript
{
  "ok": true,
  "rooms": [{
    "id": "room123",  // ❌ string
    "name": "춤 동아리",
    "participants": [
      {
        "id": 1,
        "name": "정다호",
        "profileImage": "..."
      }
    ],
    "lastMessage": {
      "content": "내일 봐요!",
      "createdAt": "..."
    }
  }]
}
```

**After**:

```typescript
{
  "ok": true,
  "rooms": [{
    "id": 1,  // ✅ number
    "name": "춤 동아리",
    "imageUrl": "https://...",

    // ✅ 새로운 필드
    "participantCount": 4,
    "roomType": "group",  // "direct" | "group" (동적 생성)
    "unreadCount": 5,  // ✅ 실시간 계산

    "lastMessage": {
      "id": "507f1f77bcf86cd799439011",
      "text": "내일 봐요!",
      "senderId": 2,
      "senderName": "안시현",
      "createdAt": "2025-11-05T12:00:00Z"
    },

    "participants": [
      {
        "id": 1,
        "name": "정다호",
        "nickname": "다호",
        "imageUrl": "...",  // ✅ setting.imageUrl
        "isOnline": true
      }
    ],

    // ✅ 사용자별 설정
    "isPinned": false,
    "isMuted": false
  }]
}
```

**변경 포인트**:

- ✅ `id` string → number
- ✅ `unreadCount` 추가 (실시간 계산)
- ✅ `participantCount`, `roomType` 추가
- ✅ `isPinned`, `isMuted` 추가
- ✅ 1:1 채팅은 상대방 이름/이미지 자동 사용

---

### POST /api/chat/rooms (채팅방 생성)

**Before**:

```typescript
POST /api/chat/rooms
{
  "name": "여행 모임",
  "participantIds": [1, 2, 5]
}
```

**After**:

```typescript
POST /api/chat/rooms
{
  "name": "여행 모임",  // 그룹만 (1:1은 null)
  "participantIds": [1, 2, 5],
  "imageUrl": "https://..."  // 그룹만 (1:1은 null)
}

// ✅ 1:1 채팅방 자동 중복 체크
// 같은 참여자로 이미 존재하면 409 Conflict
```

---

## Socket 이벤트

### 메시지 전송

**Before**:

```typescript
// Client → Server
socket.emit('send-message', {
  roomId: 'room123', // ❌ string
  content: '안녕하세요!',
  type: 'text',
})

// Server → Client
socket.on('new-message', (message) => {
  // {
  //   id, roomId, userId, userName, content, type, createdAt
  // }
})
```

**After**:

```typescript
// Client → Server
socket.emit('send-message', {
  roomId: 1, // ✅ number
  text: '안녕하세요!', // ✅ content → text
  media: [], // ✅ 복합 미디어
})

// Server → Client
socket.on('new-message', (message) => {
  // {
  //   id, roomId, senderId, senderName, senderImageUrl,
  //   text, media, readBy, createdAt
  // }
})
```

---

### 새로운 이벤트

**Before**: ❌ 없음

**After**: ✅ 추가

#### 1. 읽지 않은 개수 실시간 업데이트

```typescript
// Server → Client (자동)
socket.on('unread-count-update', (data) => {
  // {
  //   roomId: number,
  //   unreadCount: number
  // }
})

// Client → Server (수동 요청)
socket.emit('get-unread-count', { roomId: 1 })
socket.on('unread-count', (data) => {
  // { roomId, unreadCount }
})
```

#### 2. 메시지 읽음 처리

```typescript
// Client → Server
socket.emit('mark-read', {
  roomId: 1,
  messageId: '507f1f77bcf86cd799439011',
})

// Server → Client
socket.on('messages-read', (data) => {
  // {
  //   roomId: number,
  //   userId: number,
  //   messageId: string
  // }
})
```

#### 3. 타이핑 인디케이터

```typescript
// Client → Server
socket.emit('typing', {
  roomId: 1,
  isTyping: true,
})

// Server → Client
socket.on('user-typing', (data) => {
  // {
  //   userId: number,
  //   userName: string,
  //   roomId: number,
  //   isTyping: boolean
  // }
})
```

---

## 새로운 API 엔드포인트

### 1. 미디어 업로드 (S3)

```typescript
// Presigned URL 발급
POST /api/media/upload-url
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "mediaType": "image",
  "fileSize": 1024000
}

// Response
{
  "ok": true,
  "uploadUrl": "https://s3.amazonaws.com/...",  // PUT으로 업로드
  "fileKey": "images/1730800000000-photo.jpg",
  "publicUrl": "https://ieum-media.s3.../images/1730800000000-photo.jpg",
  "expiresIn": 3600
}

// 파일 삭제
DELETE /api/media/:fileKey
```

### 2. 채팅 요약

```typescript
// 요약 생성
POST /api/chat/rooms/:roomId/summary

// Response
{
  "ok": true,
  "summary": {
    "text": "정다호님이 점심 약속을 제안했습니다...",
    "audioUrl": "https://s3.../summaries/123-1730800000000.mp3",
    "messageCount": 12,
    "createdAt": "2025-11-05T12:00:00Z"
  }
}

// 최신 요약 조회
GET /api/chat/rooms/:roomId/summary

// 요약 목록 조회
GET /api/chat/rooms/:roomId/summaries?limit=10&offset=0
```

---

## 마이그레이션 체크리스트

### 타입 정의

- [ ] User 인터페이스 업데이트 (`setting` 추가)
- [ ] Message 인터페이스 업데이트 (`media`, `readBy`)
- [ ] ChatRoom 인터페이스 업데이트 (`unreadCount`, `roomType`)
- [ ] MediaItem 인터페이스 추가

### API 호출

- [ ] 로그인 API (email/password)
- [ ] 사용자 조회 (`user.setting`)
- [ ] 채팅방 목록 (`unreadCount`)
- [ ] 메시지 조회 (`media`)

### Socket 이벤트

- [ ] `send-message` 파라미터 변경 (text, media)
- [ ] `new-message` 응답 처리
- [ ] `unread-count-update` 리스너 추가
- [ ] `messages-read` 리스너 추가
- [ ] `user-typing` 리스너 추가

### UI 컴포넌트

- [ ] 프로필 이미지 경로 변경
- [ ] 메시지 렌더링 (복합 미디어)
- [ ] 읽지 않은 개수 배지
- [ ] 타이핑 인디케이터

---

**작성일**: 2025-11-05
