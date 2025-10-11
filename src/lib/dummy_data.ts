import { ChatRoom, Friend, Message } from './interface'

export const friends: Friend[] = [
  { id: '1', name: '이름', status: '온라인' },
  { id: '2', name: '이름', status: '자리 비움' },
  { id: '3', name: '이름', status: '온라인' },
  { id: '4', name: '이름', status: '오프라인' },
  { id: '5', name: '이름', status: '온라인' },
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
    text: '다음 주 소모임에 같이 가볼 생각이 있어요?',
    sender: 'other',
    time: '오후 2:30',
    username: '김정우',
  },
  { id: '2', text: '네, 좋아요!', sender: 'me', time: '오후 2:31' },
  {
    id: '3',
    text: '그럼 토요일 2시에 만나요',
    sender: 'other',
    time: '오후 2:32',
    username: '손주호',
  },
]
