import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
    RiNotification3Line, RiLoader4Line, RiAlertLine, RiTaskLine, RiChat1Line, RiTimeLine
} from 'react-icons/ri';

// ĐỔI URL NẾU CẦN
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- HELPER: XÁC ĐỊNH STYLE CHO THÔNG BÁO (Giống Header) ---
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'system': // Cảnh báo, xóa comment
                return { icon: RiAlertLine, colorClass: 'text-red-500', borderClass: 'border-l-red-500', bg: 'bg-red-500/5', bgHover: 'hover:bg-red-500/10' };
            case 'quest': // Hoàn thành nhiệm vụ
                return { icon: RiTaskLine, colorClass: 'text-green-500', borderClass: 'border-l-green-500', bg: 'bg-green-500/5', bgHover: 'hover:bg-green-500/10' };
            case 'comment': // Có người trả lời (Mặc định)
            default:
                return { icon: RiChat1Line, colorClass: 'text-blue-500', borderClass: 'border-l-blue-500', bg: 'bg-blue-500/5', bgHover: 'hover:bg-blue-500/10' };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('user_token');
                // 1. Lấy danh sách thông báo
                const res = await axios.get(`${BACKEND_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
                setNotifications(res.data.items);

                // 2. Đánh dấu tất cả là đã đọc khi vào trang này
                if (res.data.unread > 0) {
                    await axios.put(`${BACKEND_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
                }
            } catch (error) {
                console.error("Lỗi tải thông báo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Scroll lên đầu trang khi load
        window.scrollTo(0, 0);
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a16] pt-24 pb-12 px-4 flex items-center justify-center font-display">
                <div className="text-center text-gray-400">Vui lòng đăng nhập để xem thông báo.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a16] pt-20 pb-12 font-display">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                        <RiNotification3Line className="text-primary text-2xl" />
                        <h1 className="text-xl font-bold text-white">Tất Cả Thông Báo</h1>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-primary gap-3">
                                <RiLoader4Line className="animate-spin text-3xl" />
                                <p className="text-sm font-medium">Đang tải thông báo...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {notifications.map(notif => {
                                    // Lấy style dựa trên loại thông báo
                                    const style = getNotificationStyle(notif.type);
                                    const Icon = style.icon;

                                    return (
                                        <Link 
                                            to={notif.link || '#'} 
                                            key={notif.id} 
                                            className={`flex gap-4 p-4 rounded-xl transition-all border-l-4 ${notif.is_read ? `bg-white/5 hover:bg-white/10 border-transparent opacity-75` : `${style.bg} ${style.bgHover} ${style.borderClass} shadow-md`}`}
                                        >
                                            {/* Icon */}
                                            <div className={`mt-1 p-2 rounded-full ${notif.is_read ? 'bg-white/5 text-gray-400' : `bg-white/10 ${style.colorClass}`}`}>
                                                <Icon size={20} />
                                            </div>
                                            
                                            {/* Nội dung */}
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold mb-1 ${notif.is_read ? 'text-gray-300' : style.colorClass}`}>
                                                    {notif.title}
                                                </p>
                                                {/* Xử lý xuống dòng cho phần "Lý do:" */}
                                                <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                                                    {notif.type === 'system' ? notif.message.replace('. Lý do:', '.\nLý do:') : notif.message}
                                                </p>
                                                <span className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <RiTimeLine /> {new Date(notif.created_at).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                                <RiNotification3Line size={40} className="opacity-50"/>
                                <p>Bạn chưa có thông báo nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;