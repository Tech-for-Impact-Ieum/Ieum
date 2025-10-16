import { ChatRoom, Friend, Message } from './interface'

export const friends: Friend[] = [
  { id: '1', name: '정다호' },
  { id: '2', name: '안시현' },
  { id: '3', name: '이리아' },
  { id: '4', name: '김정우' },
  { id: '5', name: '손주호' },
]

export const danceMessages: Message[] = [
  {
    id: '1',
    roomId: '1',
    text: '내일 오후 1시에 **사부작 춤 동아리** 하는 거 기억하고 계시죠? (AI quick message)',
    sender: 'other',
    time: '오후 1:00',
    username: '김정우',
  },
  {
    id: '2',
    roomId: '1',
    text: '네, 기억해요!',
    sender: 'me',
    time: '오후 1:01',
  },
  {
    id: '3',
    roomId: '1',
    text: '저는 춤 영상 한 번 더 보고 갈게요~',
    sender: 'other',
    time: '오후 1:02',
    username: '손주호',
  },

  {
    id: '4',
    roomId: '1',
    text: '혹시 내일 사부작 앞에서 같이 출발하실래요?',
    sender: 'other',
    time: '오후 1:03',
    username: '김정우',
  },
  {
    id: '5',
    roomId: '1',
    text: '좋아요! 어디에서 만날까요?',
    sender: 'other',
    time: '오후 1:04',
    username: '정다호',
  },

  {
    id: '6',
    roomId: '1',
    text: '저희 점심으로 **수제왕돈까스** (사부작의 옹호가게 중 하나) 같이 먹고 갈까요?',
    sender: 'me',
    time: '오후 1:05',
  },
  {
    id: '7',
    roomId: '1',
    text: '수제왕돈까스 좋아요! 만나서 먹고 출발해요~~',
    sender: 'other',
    time: '오후 1:05',
    username: '안시현',
  },
]

export const drawingMessages: Message[] = [
  {
    id: '1',
    roomId: '2',
    text: '다들 어디세요?',
    sender: 'other',
    time: '오후 1:00',
    username: '김정우',
  },
]

export const yogaMessages: Message[] = [
  {
    id: '1',
    roomId: '3',
    text: '내일 오후 3시에 만나는 것 맞나요?',
    sender: 'other',
    time: '오후 1:00',
    username: '김정우',
  },
]

export const cookMessages: Message[] = [
  {
    id: '1',
    roomId: '4',
    text: '먹고 싶은 메뉴 있나요?',
    sender: 'other',
    time: '오후 1:00',
    username: '김정우',
  },
  {
    id: '2',
    roomId: '4',
    text: '저는 볶음밥이 먹고 싶어요!',
    sender: 'me',
    time: '오후 1:05',
    username: '안시현',
  },
]

export const sampleMessages1: Message[] = [
  {
    id: '1',
    roomId: '5',
    text: '몇 시에 만날까요?',
    sender: 'other',
    time: '오후 1:00',
    username: '이리아',
  },
  {
    id: '2',
    roomId: '5',
    text: '3시 어때요?',
    sender: 'me',
    time: '오후 1:05',
    username: '안시현',
  },
]

export const sampleMessages2: Message[] = [
  {
    id: '1',
    roomId: '6',
    text: '안녕히 가세요!',
    sender: 'other',
    time: '오후 1:00',
    username: '안시현',
  },
  {
    id: '2',
    roomId: '6',
    text: '좋은 주말 보내세요!',
    sender: 'me',
    time: '오후 1:05',
    username: '김정우',
  },
]

export const sampleMessages3: Message[] = [
  {
    id: '1',
    roomId: '7',
    text: '올 때 색연필 챙겨주세요!',
    sender: 'other',
    time: '오후 1:00',
    username: '손주호',
  },
  {
    id: '2',
    roomId: '7',
    text: '네, 알겠습니다',
    sender: 'me',
    time: '오후 1:05',
    username: '안시현',
  },
]

export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '춤 동아리',
    messages: danceMessages,
    unread: 2,
    time: '오후 3:24',
  },
  {
    id: '2',
    name: '그림 동아리',
    messages: drawingMessages,
    unread: 0,
    time: '오후 2:15',
  },
  {
    id: '3',
    name: '요가 동아리',
    messages: yogaMessages,
    unread: 1,
    time: '오전 11:30',
  },
  {
    id: '4',
    name: '요리 동아리',
    messages: cookMessages,
    unread: 0,
    time: '어제',
  },
  {
    id: '5',
    name: '이리아',
    messages: sampleMessages1,
    unread: 0,
    time: '어제',
  },
  {
    id: '6',
    name: '김정우',
    messages: sampleMessages2,
    unread: 3,
    time: '월요일',
  },
  {
    id: '7',
    name: '손주호',
    messages: sampleMessages3,
    unread: 0,
    time: '월요일',
  },
]
