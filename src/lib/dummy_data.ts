import { ChatRoom, Friend, Message } from './interface'

export const friends: Friend[] = [
  { id: '1', name: '이름' },
  { id: '2', name: '이름' },
  { id: '3', name: '이름' },
  { id: '4', name: '이름' },
  { id: '5', name: '이름' },
]

export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '이름',
    lastMessage: '안녕하세요',
    unread: 2,
    time: '오후 3:24',
  },
  {
    id: '2',
    name: '이름',
    lastMessage: '내일 봐요',
    unread: 0,
    time: '오후 2:15',
  },
  {
    id: '3',
    name: '이름',
    lastMessage: '감사합니다',
    unread: 1,
    time: '오전 11:30',
  },
  {
    id: '4',
    name: '이름',
    lastMessage: '좋은 하루 되세요',
    unread: 0,
    time: '어제',
  },
  {
    id: '5',
    name: '이름',
    lastMessage: '네, 알겠습니다',
    unread: 0,
    time: '어제',
  },
  {
    id: '6',
    name: '이름',
    lastMessage: '회의는 몇 시에 하나요?',
    unread: 3,
    time: '월요일',
  },
  {
    id: '7',
    name: '이름',
    lastMessage: '프로젝트 진행 상황 알려주세요',
    unread: 0,
    time: '월요일',
  },
  {
    id: '8',
    name: '이름',
    lastMessage: '점심 뭐 먹을까요?',
    unread: 0,
    time: '일요일',
  },
  {
    id: '9',
    name: '이름',
    lastMessage: '주말 잘 보내세요',
    unread: 0,
    time: '토요일',
  },
  {
    id: '10',
    name: '이름',
    lastMessage: '주말 잘 보내세요',
    unread: 0,
    time: '토요일',
  },
]

export const sampleMessages: Message[] = [
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