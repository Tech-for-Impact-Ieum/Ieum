import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, '채팅방 이름은 필수입니다.'],
        trim: true,
    },
    
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    }],
    
    unreadCount: {
        type: Number,
        default: 0,
    },
    
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message',
    },
    
    lastMessageAt: {
        type: Date,
        default: Date.now,
    }
}, { 
    timestamps: true 
});


export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', ChatRoomSchema);
