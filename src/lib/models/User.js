import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '사용자 이름은 필수입니다.'],
        trim: true,
        unique: true, 
    },
    // 실제 인증을 위해 필요한 필드 (추후 확장 가능)
    // email: { type: String, required: true, unique: true },
    // password: { type: String, required: true, select: false }, // 비밀번호는 조회 시 제외

    isOnline: {
        type: Boolean,
        default: false,
    },
}, { 
    timestamps: true 
});


export default mongoose.models.User || mongoose.model('User', UserSchema);
