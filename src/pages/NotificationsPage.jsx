import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
    RiNotification3Line, RiLoader4Line, RiAlertLine, RiTaskLine, RiChat1Line, RiTimeLine, RiLayoutGridFill, RiBookOpenLine, RiArrowRightSLine
} from 'react-icons/ri';

// ĐỔI URL NẾU CẦN
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';
const COMIC_IMAGE_DOMAIN = 'https://img.otruyenapi.com/uploads/comics/';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- STATE MỚI: QUẢN LÝ TAB ---
    const [activeTab, setActiveTab] = useState('all');
    // --- STATE MỚI: GỢI Ý TRUYỆN ---
    const [recommendedComics, setRecommendedComics] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

    // --- ĐỊNH NGHĨA CÁC TABS ---
    const tabs = [
        { id: 'all', label: 'Tất Cả', icon: RiLayoutGridFill },
        { id: 'system', label: 'Hệ Thống & Cảnh Báo', icon: RiAlertLine },
        { id: 'quest', label: 'Nhiệm Vụ', icon: RiTaskLine },
        { id: 'comment', label: 'Bình Luận & Phản Hồi', icon: RiChat1Line },
    ];

    // --- HELPER: STYLE CHO THÔNG BÁO ---
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'system': return { icon: RiAlertLine, colorClass: 'text-red-500', borderClass: 'border-l-red-500', bg: 'bg-red-500/5', bgHover: 'hover:bg-red-500/10' };
            case 'quest': return { icon: RiTaskLine, colorClass: 'text-green-500', borderClass: 'border-l-green-500', bg: 'bg-green-500/5', bgHover: 'hover:bg-green-500/10' };
            case 'comment': default: return { icon: RiChat1Line, colorClass: 'text-blue-500', borderClass: 'border-l-blue-500', bg: 'bg-blue-500/5', bgHover: 'hover:bg-blue-500/10' };
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('user_token');
                // 1. Lấy thông báo
                const res = await axios.get(`${BACKEND_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
                setNotifications(res.data.items);
                // 2. Đánh dấu đã đọc
                if (res.data.unread > 0) await axios.put(`${BACKEND_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
            } catch (error) { console.error("Lỗi tải thông báo:", error); } finally { setLoading(false); }
        };

        // --- FETCH GỢI Ý TRUYỆN (Dùng API otruyen public làm ví dụ) ---
        const fetchRecommendations = async () => {
            setLoadingRecs(true);
            try {
                // Lấy danh sách truyện hoàn thành làm gợi ý (có thể đổi API khác)
                const res = await axios.get('https://otruyenapi.com/v1/api/danh-sach/hoan-thanh?page=1&limit=5');
                setRecommendedComics(res.data.data.items);
            } catch (e) { console.error("Lỗi tải gợi ý:", e); } finally { setLoadingRecs(false); }
        }

        fetchData();
        fetchRecommendations();
        window.scrollTo(0, 0);
    }, [user]);

    // --- LỌC THÔNG BÁO THEO TAB ---
    const filteredNotifications = notifications.filter(notif => activeTab === 'all' ? true : notif.type === activeTab);

    if (!user) return (<div className="min-h-screen bg-[#0a0a16] pt-24 pb-12 px-4 flex items-center justify-center font-display text-gray-400">Vui lòng đăng nhập để xem thông báo.</div>);

    return (
        <div className="min-h-screen bg-[#0a0a16] pt-20 pb-12 font-display">
            {/* --- CONTAINER CHÍNH: CHUYỂN SANG GRID LAYOUT --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* === CỘT CHÍNH (THÔNG BÁO) - CHIẾM 2 CỘT TRÊN DESKTOP === */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Header & Tabs Container */}
                    <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                            <RiNotification3Line className="text-primary text-2xl" />
                            <h1 className="text-xl font-bold text-white">Hộp Thư Thông Báo</h1>
                        </div>
                        
                        {/* --- THANH ĐIỀU HƯỚNG TABS --- */}
                        <div className="flex overflow-x-auto custom-scrollbar bg-[#151525] p-2 border-b border-white/5">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all mr-2 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <Icon size={16} /> {tab.label}
                                        {/* Hiển thị số lượng (tùy chọn) */}
                                        {tab.id !== 'all' && notifications.length > 0 && (
                                            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'}`}>
                                                {notifications.filter(n => n.type === tab.id).length}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Content List */}
                        <div className="p-4 sm:p-6 min-h-[300px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-primary gap-3"><RiLoader4Line className="animate-spin text-3xl" /><p className="text-sm font-medium">Đang tải thông báo...</p></div>
                            ) : filteredNotifications.length > 0 ? (
                                <div className="flex flex-col gap-3 animate-fade-in">
                                    {filteredNotifications.map(notif => {
                                        const style = getNotificationStyle(notif.type);
                                        const Icon = style.icon;
                                        return (
                                            <Link to={notif.link || '#'} key={notif.id} className={`flex gap-4 p-4 rounded-xl transition-all border-l-4 ${notif.is_read ? `bg-white/5 hover:bg-white/10 border-transparent opacity-75` : `${style.bg} ${style.bgHover} ${style.borderClass} shadow-md hover:-translate-y-0.5`}`}>
                                                <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notif.is_read ? 'bg-white/5 text-gray-400' : `bg-white/10 ${style.colorClass}`}`}><Icon size={20} /></div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold mb-1 ${notif.is_read ? 'text-gray-300' : style.colorClass}`}>{notif.title}</p>
                                                    <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{notif.type === 'system' ? notif.message.replace('. Lý do:', '.\nLý do:') : notif.message}</p>
                                                    <span className="text-xs text-gray-500 mt-2 flex items-center gap-1"><RiTimeLine /> {new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                                    <RiNotification3Line size={40} className="opacity-50"/>
                                    <p>{activeTab === 'all' ? 'Bạn chưa có thông báo nào.' : `Không có thông báo loại "${tabs.find(t=>t.id===activeTab)?.label}".`}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === CỘT SIDEBAR (GỢI Ý TRUYỆN) - CHIẾM 1 CỘT === */}
                <div className="flex flex-col gap-6">
                    <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 shadow-xl overflow-hidden sticky top-24">
                         <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><RiBookOpenLine className="text-green-500"/> Có Thể Bạn Thích</h2>
                            <Link to="/danh-sach" className="text-xs text-gray-500 hover:text-primary flex items-center transition-colors">Xem thêm <RiArrowRightSLine/></Link>
                        </div>
                        <div className="p-4">
                            {loadingRecs ? (
                                 <div className="flex justify-center py-10"><RiLoader4Line className="animate-spin text-primary text-2xl" /></div>
                            ) : recommendedComics.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {recommendedComics.map(comic => (
                                        <Link key={comic._id} to={`/truyen-tranh/${comic.slug}`} className="flex gap-3 group rounded-xl hover:bg-white/5 p-2 transition-all">
                                            <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                                                <img src={`${COMIC_IMAGE_DOMAIN}${comic.thumb_url}`} alt={comic.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{comic.name}</h3>
                                                <p className="text-xs text-green-500 font-medium mt-1 truncate">{comic.chaptersLatest?.[0]?.chapter_name || 'Đang cập nhật'}</p>
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {comic.category.slice(0, 2).map(cat => (
                                                        <span key={cat.id} className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded truncate">{cat.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 text-xs py-6">Không có gợi ý nào.</p>
                            )}
                        </div>
                    </div>
                     {/* Có thể thêm các block khác ở sidebar tại đây (ví dụ: Top user) */}
                </div>

            </div>
        </div>
    );
};

export default NotificationsPage;