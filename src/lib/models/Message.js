import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom', 
        required: [true, '채팅방 ID는 필수입니다.'],
        index: true, 
    },
    
    content: {
        type: String,
        required: [true, '메시지 내용은 필수입니다.'],
    },
    
    sender: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '메시지 발신자는 필수입니다.'],
    },
    
    sentAt: {
        type: Date,
        default: Date.now,
        index: true, 
    },
  
    type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text',
    }
    
}, { 
    timestamps: false 
});


export default mongoose.models.Message || mongoose.model('Message', MessageSchema);