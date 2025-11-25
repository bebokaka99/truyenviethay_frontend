import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom'; // Import thêm useLocation
import { useAuth } from '../../contexts/AuthContext';
import LevelBadge from '../common/LevelBadge';
import Toast from '../common/Toast';
import { 
    RiSendPlaneFill, RiChat1Line, RiTimeLine, 
    RiThumbUpLine, RiThumbUpFill, 
    RiLoader4Line 
} from 'react-icons/ri';

// Thay thế bằng URL backend thực tế
const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

const CommentSection = ({ comicSlug, chapterName = null }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState(''); 
    const [activeReplyId, setActiveReplyId] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    // Hook để lấy thông tin URL hiện tại (bao gồm phần hash #)
    const location = useLocation();

    const getAvatar = (path) => {
        if (!path) return `https://ui-avatars.com/api/?background=random`;
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}/${path}`;
    };

    const timeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // 1. Fetch Comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const userIdParam = user ? `&userId=${user.id}` : '';
                const chapterParam = `?chapter_name=${chapterName || 'null'}`; 
                
                const res = await axios.get(`${BACKEND_URL}/api/comments/${comicSlug}${chapterParam}${userIdParam}`);
                setComments(res.data);
            } catch (error) { console.error("Lỗi tải bình luận:", error); }
            finally { setLoading(false); }
        };
        if (comicSlug) fetchComments();
    }, [comicSlug, chapterName, user]);

    // --- 2. EFFECT XỬ LÝ CUỘN ĐẾN BÌNH LUẬN (DEEP LINKING) ---
    useEffect(() => {
        // Chỉ chạy khi đã tải xong comments và trên URL có hash (ví dụ #comment-123)
        if (!loading && comments.length > 0 && location.hash) {
            // Lấy ID từ hash (bỏ dấu # ở đầu)
            const targetId = location.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Delay nhẹ 500ms để đảm bảo DOM đã ổn định sau khi render
                setTimeout(() => {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', // Cuộn mượt
                        block: 'center'     // Đưa phần tử vào giữa màn hình
                    });
                    
                    // Thêm hiệu ứng highlight nhẹ để người dùng dễ nhận biết
                    targetElement.classList.add('bg-white/10');
                    // Sau 2 giây thì tắt highlight
                    setTimeout(() => {
                        targetElement.classList.remove('bg-white/10');
                    }, 2000);

                }, 500);
            }
        }
    // Chạy lại effect này khi danh sách comment, trạng thái loading hoặc hash trên URL thay đổi
    }, [comments, loading, location.hash]);
    // -----------------------------------------------------


    const handleSubmit = async (e, parentId = null) => {
        e.preventDefault();
        const textToSend = parentId ? replyContent : content;
        if (!textToSend.trim()) return;
        
        setSubmitting(true);
        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.post(`${BACKEND_URL}/api/comments`, {
                comic_slug: comicSlug,
                content: textToSend,
                parent_id: parentId,
                chapter_name: chapterName 
            }, { headers: { Authorization: `Bearer ${token}` } });

            setComments([res.data, ...comments]);
            
            if (parentId) {
                setReplyContent('');
                setActiveReplyId(null);
            } else {
                setContent('');
            }
        } catch (error) { 
            setToast({ message: "Lỗi gửi bình luận. Vui lòng thử lại!", type: "error" });
        }
        finally { setSubmitting(false); }
    };

    const handleLike = async (commentId) => {
        if (!user) {
            setToast({ message: "Vui lòng đăng nhập để thích bình luận!", type: "info" });
            return;
        }
        
        // Optimistic Update
        setComments(prevComments => {
            return prevComments.map(cmt => {
                 if (cmt.id === commentId) {
                    const newIsLiked = !cmt.is_liked;
                    return {
                        ...cmt,
                        is_liked: newIsLiked,
                        like_count: newIsLiked ? cmt.like_count + 1 : cmt.like_count - 1
                    };
                }
                return cmt;
            });
        });

        // Call API
        try {
            const token = localStorage.getItem('user_token');
            await axios.post(`${BACKEND_URL}/api/comments/like`, { comment_id: commentId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) { 
            console.error("Lỗi like:", error);
            setToast({ message: "Lỗi kết nối. Thao tác chưa được lưu.", type: "error" });
             // Revert UI if needed (optional)
        }
    };

    const rootComments = comments.filter(c => !c.parent_id);

    const CommentItem = ({ cmt, isReply = false }) => {
        const replies = comments.filter(c => c.parent_id === cmt.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return (
            // --- THÊM ID CHO THẺ DIV BAO NGOÀI ---
            // Thêm các class transition-all rounded-xl p-2 để hiệu ứng highlight đẹp hơn
            <div 
                id={`comment-${cmt.id}`} 
                className={`flex gap-3 group transition-all rounded-xl p-2 duration-500 ${isReply ? 'mt-3 ml-10 md:ml-14' : 'mt-6'}`}
            >
            {/* ------------------------------------ */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1">
                    <img src={getAvatar(cmt.avatar)} alt={cmt.full_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="bg-[#1f1f3a] p-3 rounded-2xl border border-white/5 inline-block min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-xs md:text-sm">{cmt.full_name}</span>
                            <div className="scale-75 origin-left">
                                <LevelBadge exp={cmt.exp} rankStyle={cmt.rank_style} role={cmt.role} />
                            </div>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-4 text-[10px] md:text-xs text-gray-500 font-bold ml-2">
                        <span className="flex items-center gap-1 font-normal"><RiTimeLine /> {timeAgo(cmt.created_at)}</span>
                        <button 
                            onClick={() => handleLike(cmt.id)}
                            className={`flex items-center gap-1 hover:text-white transition-colors ${cmt.is_liked ? 'text-red-500' : ''}`}
                        >
                            {cmt.is_liked ? <RiThumbUpFill /> : <RiThumbUpLine />} 
                            {cmt.like_count > 0 && cmt.like_count} Thích
                        </button>
                        <button onClick={() => setActiveReplyId(activeReplyId === cmt.id ? null : cmt.id)} className="hover:text-white transition-colors">
                            Trả lời
                        </button>
                    </div>

                    {activeReplyId === cmt.id && user && (
                        <form onSubmit={(e) => handleSubmit(e, cmt.id)} className="mt-3 flex gap-3 animate-fade-in-down">
                             <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mt-1">
                                <img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 relative">
                                <input 
                                    autoFocus
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={`Trả lời ${cmt.full_name}...`}
                                    className="w-full bg-[#252538] text-gray-200 text-xs p-2 pr-8 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
                                />
                                <button type="submit" disabled={submitting || !replyContent.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white">
                                    <RiSendPlaneFill />
                                </button>
                            </div>
                        </form>
                    )}

                    {replies.map(reply => (
                        <CommentItem key={reply.id} cmt={reply} isReply={true} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#1a1a2e] rounded-xl p-4 md:p-6 border border-white/5 shadow-sm mt-8 relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-wider border-l-4 border-primary pl-3">
                <RiChat1Line /> 
                {chapterName ? `Bình Luận Chương ${chapterName}` : 'Bình Luận Bộ Truyện'} 
                <span className="text-gray-500 text-sm ml-1">({comments.length})</span>
            </h3>

            {user ? (
                <form onSubmit={(e) => handleSubmit(e, null)} className="flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                        <img src={getAvatar(user.avatar)} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={chapterName ? `Bình luận về chương ${chapterName}...` : "Đánh giá bộ truyện này..."}
                            className="w-full bg-[#1f1f3a] text-gray-200 text-sm p-3 pr-12 rounded-xl border border-white/10 focus:border-primary focus:outline-none resize-none h-20"
                        />
                        <button type="submit" disabled={submitting || !content.trim()} className="absolute bottom-3 right-3 text-primary hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <RiSendPlaneFill size={20} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-[#252538] p-4 rounded-xl text-center text-sm text-gray-400 mb-8 border border-white/5">
                    Vui lòng <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link> để tham gia bình luận.
                </div>
            )}

            <div className="space-y-2 max-h-[800px] overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="text-center py-10"><RiLoader4Line className="animate-spin text-3xl text-primary mx-auto"/></div>
                ) : rootComments.length > 0 ? (
                    rootComments.map((cmt) => (
                        <CommentItem key={cmt.id} cmt={cmt} />
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500 text-sm italic bg-[#1f1f3a]/50 rounded-lg border border-white/5 border-dashed">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                )}
            </div>
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default CommentSection;