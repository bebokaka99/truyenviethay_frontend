import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    RiDashboardLine, RiArrowLeftLine, RiDeleteBinLine,
    RiErrorWarningLine, RiProhibitedLine, RiCheckLine,
    RiShieldUserLine, RiSearchLine, RiFilter3Line, RiCloseLine,
    RiFlag2Line, RiChat1Line, RiUser3Line,
    RiTaskLine, RiAddLine, RiEditLine,
    RiBookmarkLine, RiGlobalLine, RiDownloadCloud2Line,
    RiBarChartFill, RiSave3Line, RiSpamLine, RiAdminLine, RiUserStarLine, RiStarFill, RiTimeLine, RiLoader4Line, RiSendPlaneFill
} from 'react-icons/ri';

const BACKEND_URL = 'https://truyenviethay-backend.onrender.com';

// Config Menu Items
const MENU_ITEMS = [
    { id: 'dashboard', icon: RiBarChartFill, label: 'Tổng Quan', color: 'gray' },
    { id: 'users', icon: RiUser3Line, label: 'Quản Lý Users', color: 'red' },
    { id: 'reports', icon: RiFlag2Line, label: 'Báo Lỗi Truyện', color: 'yellow' },
    { id: 'comment_reports', icon: RiSpamLine, label: 'Báo Cáo Bình Luận', color: 'orange' },
    { id: 'comments', icon: RiChat1Line, label: 'Tất Cả Bình Luận', color: 'blue' },
    { id: 'quests', icon: RiTaskLine, label: 'Hệ Thống Nhiệm Vụ', color: 'green' },
    { id: 'comics', icon: RiBookmarkLine, label: 'Cấu Hình Truyện', color: 'purple' },
];

// Main component
const DashboardPage = () => {
    // State management
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Pagination (Users)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modals & Forms
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [showBanModal, setShowBanModal] = useState(false);
    const [banDays, setBanDays] = useState(1);

    const [showWarnModal, setShowWarnModal] = useState(false);
    const [warnReason, setWarnReason] = useState('');

    const [showQuestModal, setShowQuestModal] = useState(false);
    const [isEditingQuest, setIsEditingQuest] = useState(false);
    const [questForm, setQuestForm] = useState({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' });

    // Comics Management
    const [managedComics, setManagedComics] = useState([]);
    const [comicForm, setComicForm] = useState({ slug: '', name: '', is_hidden: false, is_recommended: false });
    const [externalSearch, setExternalSearch] = useState('');
    const [externalResults, setExternalResults] = useState([]);
    const [searchingExternal, setSearchingExternal] = useState(false);

    // --- API HELPERS ---
    const callApi = async (method, endpoint, body = null) => {
        const token = localStorage.getItem('user_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const url = `${BACKEND_URL}${endpoint}`;
        try {
            if (method === 'post') return await axios.post(url, body, config);
            if (method === 'put') return await axios.put(url, body, config);
            if (method === 'delete') return await axios.delete(url, config);
        } catch (error) {
            throw error;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            const api = axios.create({ baseURL: BACKEND_URL, headers: { Authorization: `Bearer ${token}` } });
            let res;

            if (activeTab === 'users') {
                res = await api.get(`/api/user/admin/users?page=${currentPage}&limit=${itemsPerPage}`);
                setData(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
            else if (activeTab === 'reports') res = await api.get('/api/reports/admin/all');
            else if (activeTab === 'comment_reports') res = await api.get('/api/reports/comments/admin/all');
            else if (activeTab === 'comments') res = await api.get('/api/comments/admin/all');
            else if (activeTab === 'quests') res = await api.get('/api/quests/admin/all');
            else if (activeTab === 'comics') res = await api.get('/api/user/admin/comics');

            if (activeTab === 'comics') setManagedComics(res.data);
            else if (activeTab !== 'dashboard' && activeTab !== 'users') setData(res.data);

        } catch (error) {
            console.error("Lỗi load data:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Phiên đăng nhập hết hạn hoặc bạn không có quyền admin.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'dashboard') fetchData();
        setSearchTerm('');
        setExternalResults([]);
        setExternalSearch('');
        if (activeTab !== 'users') setCurrentPage(1);
    }, [activeTab, currentPage]);

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        if (!data || activeTab === 'dashboard') return [];
        if (activeTab === 'users') return data;

        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item => {
             if (activeTab === 'reports') return item.comic_slug?.toLowerCase().includes(lowerSearch) || item.reason?.toLowerCase().includes(lowerSearch);
            else if (activeTab === 'comment_reports') return item.comment_content?.toLowerCase().includes(lowerSearch) || item.reporter_name?.toLowerCase().includes(lowerSearch);
            else if (activeTab === 'comments') return item.content?.toLowerCase().includes(lowerSearch) || item.username?.toLowerCase().includes(lowerSearch);
            else if (activeTab === 'quests') return item.name?.toLowerCase().includes(lowerSearch) || item.quest_key?.toLowerCase().includes(lowerSearch);
            return false;
        });
    }, [data, searchTerm, activeTab]);

    const currentAdminId = useMemo(() => {
        try {
            const token = localStorage.getItem('user_token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                return JSON.parse(window.atob(base64)).id;
            }
            return null;
        } catch (e) { return null; }
    }, []);

    // Actions
    
    // User Actions
    const handleDeleteUser = async (id) => { if (!window.confirm('Xóa user này?')) return; try { await callApi('delete', `/api/user/admin/users/${id}`); setData(prev => prev.filter(u => u.id !== id)); alert('Đã xóa user.'); } catch (e) { alert(e.response?.data?.message || 'Lỗi xóa user.'); } };
    const handleUnban = async (id) => { if (!window.confirm('Mở khóa tài khoản này?')) return; try { await callApi('post', `/api/user/admin/users/${id}/unban`); alert('Đã mở khóa!'); fetchData(); } catch (e) { alert('Lỗi mở khóa.'); } }
    const handleChangeRole = async (userId, newRole, currentRole) => {
        if (newRole === currentRole) return;
        if (!window.confirm(`Đổi quyền thành ${newRole.toUpperCase()}?`)) { fetchData(); return; }
        try { await callApi('put', `/api/user/admin/users/${userId}/role`, { newRole }); alert(`Đã thay đổi quyền thành ${newRole.toUpperCase()}.`); fetchData(); } catch (error) { alert(error.response?.data?.message); fetchData(); }
    };

    // Modal Openers
    const openWarnModal = (user) => { setSelectedUser(user); setWarnReason(''); setShowWarnModal(true); };
    const openBanModal = (user) => { setSelectedUser(user); setShowBanModal(true); };
    const confirmWarn = async () => { if (!selectedUser || !warnReason) return; try { await callApi('post', `/api/user/admin/users/${selectedUser.id}/warn`, { reason: warnReason }); alert(`Đã cảnh báo ${selectedUser.username}.`); setShowWarnModal(false); fetchData(); } catch (e) { alert('Lỗi gửi cảnh báo.'); } };
    const confirmBan = async () => { if (!selectedUser) return; try { await callApi('post', `/api/user/admin/users/${selectedUser.id}/ban`, { days: parseInt(banDays) }); alert(`Đã chặn ${selectedUser.username}.`); setShowBanModal(false); fetchData(); } catch (e) { alert('Lỗi khi chặn.'); } };

    // Other Data Actions
    const handleResolveReport = async (id) => { if (!window.confirm('Đã xử lý xong?')) return; try { await callApi('delete', `/api/reports/admin/${id}`); setData(prev => prev.filter(r => r.id !== id)); } catch (e) { alert('Lỗi server.'); } };
    const handleDeleteComment = async (id) => { if (!window.confirm('Xóa bình luận?')) return; try { await callApi('delete', `/api/comments/admin/${id}`); setData(prev => prev.filter(c => c.id !== id)); } catch (e) { alert('Lỗi xóa bình luận.'); } };
    const handleDeleteQuest = async (id) => { if (!window.confirm('Xóa nhiệm vụ?')) return; try { await callApi('delete', `/api/quests/admin/${id}`); setData(prev => prev.filter(q => q.id !== id)); } catch (e) { alert('Lỗi xóa nhiệm vụ.'); } };
    const handleResolveCommentReport = async (reportId, action) => { if (!window.confirm(action === 'delete_comment' ? 'Xóa bình luận & gửi thông báo?' : 'Bỏ qua báo cáo?')) return; try { await callApi('post', `/api/reports/comments/admin/${reportId}/resolve`, { action }); setData(prev => prev.filter(r => r.id !== reportId)); alert('Đã xử lý.'); } catch (e) { alert(e.response?.data?.message); } };

    // Quest Actions
    const openQuestModal = (quest = null) => { if (quest) { setQuestForm(quest); setIsEditingQuest(true); } else { setQuestForm({ id: null, quest_key: '', name: '', description: '', target_count: 1, reward_exp: 10, type: 'daily', action_type: 'read' }); setIsEditingQuest(false); } setShowQuestModal(true); };
    const handleSubmitQuest = async (e) => { e.preventDefault(); try { if (isEditingQuest) await callApi('put', `/api/quests/admin/${questForm.id}`, questForm); else await callApi('post', '/api/quests/admin', questForm); setShowQuestModal(false); fetchData(); alert('Lưu nhiệm vụ thành công!'); } catch (error) { alert(error.response?.data?.message); } };

    // Comic Actions
    const handleSearchOtruyen = async (e) => { e.preventDefault(); if (!externalSearch.trim()) return; setSearchingExternal(true); try { const res = await axios.get(`https://otruyenapi.com/v1/api/tim-kiem?keyword=${externalSearch}`); setExternalResults(res.data.data.items); } catch (error) { alert("Lỗi API Otruyen."); } finally { setSearchingExternal(false); } };
    const selectExternalComic = (comic) => { setComicForm({ slug: comic.slug, name: comic.name, is_hidden: false, is_recommended: false }); setExternalResults([]); setExternalSearch(''); };
    const handleUpdateComic = async (e) => { e.preventDefault(); if (!comicForm.slug) return alert("Chưa nhập Slug!"); try { await callApi('post', '/api/user/admin/comics', comicForm); alert("Cập nhật thành công!"); fetchData(); setComicForm({ slug: '', name: '', is_hidden: false, is_recommended: false }); } catch (error) { alert("Lỗi cập nhật."); } };
    const editComic = (comic) => { setComicForm({ slug: comic.slug, name: comic.name, is_hidden: comic.is_hidden === 1, is_recommended: comic.is_recommended === 1 }); };

    // Render content switcher
    const renderContent = () => {
        if (activeTab === 'dashboard') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-up">
                    {[
                        { id: 'users', icon: RiUser3Line, title: 'Người dùng', subtitle: 'Quản lý User & Role', color: 'red' },
                        { id: 'reports', icon: RiFlag2Line, title: 'Báo lỗi truyện', subtitle: 'Xử lý báo cáo lỗi', color: 'yellow' },
                        { id: 'comment_reports', icon: RiSpamLine, title: 'Spam / Độc hại', subtitle: 'Báo cáo bình luận', color: 'orange' },
                        { id: 'comics', icon: RiBookmarkLine, title: 'Nội dung', subtitle: 'Cấu hình Truyện', color: 'purple' },
                    ].map(card => (
                        <div key={card.id} className={`bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1`} onClick={() => setActiveTab(card.id)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110 bg-white/5 text-${card.color}-500`}><card.icon /></div>
                                <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{card.title}</p><h3 className="text-xl font-black text-white mt-1">{card.subtitle}</h3></div>
                            </div>
                            <div className={`text-xs font-bold mt-6 flex items-center gap-1 group-hover:gap-2 transition-all text-${card.color}-500`}>Truy cập ngay <RiArrowLeftLine className="rotate-180" /></div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'comics') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="flex flex-col gap-8">
                        <div className="bg-[#151525] p-6 rounded-2xl border border-white/10 h-fit shadow-xl">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><RiSave3Line className="text-primary"/> Cấu Hình Truyện</h3>
                            <form onSubmit={handleUpdateComic} className="flex flex-col gap-5">
                                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Slug Truyện (ID)</label><input type="text" placeholder="VD: one-piece" value={comicForm.slug} onChange={e => setComicForm({ ...comicForm, slug: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-primary outline-none transition-colors" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tên Hiển Thị Tùy Chỉnh</label><input type="text" placeholder="VD: Đảo Hải Tặc (để trống sẽ lấy tên gốc)" value={comicForm.name} onChange={e => setComicForm({ ...comicForm, name: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-primary outline-none transition-colors" /></div>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-red-500/30 hover:bg-red-500/5 transition-all"><input type="checkbox" checked={comicForm.is_hidden} onChange={e => setComicForm({ ...comicForm, is_hidden: e.target.checked })} className="accent-red-500 w-5 h-5" /><span className="text-sm font-bold text-red-400 group-hover:text-red-500 transition-colors">Ẩn Truyện Này</span></label>
                                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"><input type="checkbox" checked={comicForm.is_recommended} onChange={e => setComicForm({ ...comicForm, is_recommended: e.target.checked })} className="accent-yellow-500 w-5 h-5" /><span className="text-sm font-bold text-yellow-400 group-hover:text-yellow-500 transition-colors">Đề Cử (Hot)</span></label>
                                </div>
                                <button type="submit" className="mt-4 w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1"><RiSave3Line size={18} /> Lưu Cấu Hình</button>
                            </form>
                        </div>
                        <div className="bg-[#151525] p-6 rounded-2xl border border-white/10 shadow-xl">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><RiGlobalLine className="text-green-500" /> Tìm Từ Kho Truyện Online</h3>
                            <form onSubmit={handleSearchOtruyen} className="flex gap-3 mb-6"><input type="text" placeholder="Nhập tên truyện..." value={externalSearch} onChange={(e) => setExternalSearch(e.target.value)} className="flex-1 bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white text-sm font-medium outline-none focus:border-green-500 transition-colors" /><button type="submit" disabled={searchingExternal} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40">{searchingExternal ? <RiLoader4Line className="animate-spin" size={20}/> : <RiSearchLine size={20}/>}</button></form>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">{externalResults.length > 0 ? externalResults.map(item => (<div key={item._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/20 group" onClick={() => selectExternalComic(item)}><div className="flex items-center gap-3 overflow-hidden"><div className="w-10 h-14 bg-black/50 rounded-lg flex-shrink-0 overflow-hidden shadow-md"><img src={`https://img.otruyenapi.com/uploads/comics/${item.thumb_url}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" /></div><div className="min-w-0"><p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.name}</p><p className="text-xs text-gray-500 truncate font-mono mt-1">{item.slug}</p></div></div><RiDownloadCloud2Line className="text-gray-500 group-hover:text-primary flex-shrink-0 ml-3 transition-all" size={18} /></div>)) : !searchingExternal && <div className="text-center text-gray-500 text-sm italic py-10 flex flex-col items-center gap-2"><RiSearchLine size={24} className="text-gray-700"/>Nhập tên để tìm kiếm...</div>}</div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-[#151525] rounded-2xl border border-white/5 overflow-hidden h-fit shadow-xl">
                        <div className="p-5 border-b border-white/10"><h3 className="text-xl font-black text-white flex items-center gap-2"><RiBookmarkLine className="text-purple-500"/> Danh Sách Truyện Đã Cấu Hình <span className="text-sm text-gray-500 font-normal">({managedComics.length})</span></h3></div>
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-[#1f1f3a]/80 text-gray-400 text-xs uppercase font-bold tracking-wider backdrop-blur-sm"><th className="p-5 border-b border-white/10">Thông Tin Truyện</th><th className="p-5 border-b border-white/10 text-center">Trạng Thái</th><th className="p-5 border-b border-white/10 text-right">Hành Động</th></tr></thead>
                            <tbody className="divide-y divide-white/5">{managedComics.length > 0 ? managedComics.map(c => (<tr key={c.id} className="hover:bg-white/[0.02] transition-colors text-sm group"><td className="p-5"><div className="font-bold text-white text-base">{c.name || c.slug}</div><div className="text-xs text-gray-500 font-mono mt-1 bg-white/5 px-2 py-0.5 rounded inline-block">{c.slug}</div></td><td className="p-5 text-center"><div className="flex items-center justify-center gap-2">{c.is_hidden === 1 && <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg ring-1 ring-red-500/30"><RiProhibitedLine/> BỊ ẨN</span>}{c.is_recommended === 1 && <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase px-2 py-1 rounded-lg ring-1 ring-yellow-500/30"><RiStarFill/> ĐỀ CỬ</span>}{c.is_hidden === 0 && c.is_recommended === 0 && <span className="text-gray-500 text-xs font-bold italic">Mặc định</span>}</div></td><td className="p-5 text-right"><button onClick={() => editComic(c)} className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold text-xs transition-all flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100"><RiEditLine size={16}/> Sửa Cấu Hình</button></td></tr>)) : <tr><td colSpan="3" className="p-10 text-center text-gray-500 italic">Chưa có truyện nào được cấu hình.</td></tr>}</tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // Default Table for Users, Reports, Comments, Quests
        return (
            <div className="bg-[#151525] rounded-2xl border border-white/5 overflow-hidden shadow-xl animate-scale-up">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1f1f3a]/80 text-gray-400 text-xs uppercase font-bold tracking-wider backdrop-blur-sm">
                                <th className="p-5 border-b border-white/10 w-20">ID</th>
                                {activeTab === 'users' && <><th className="p-5 border-b border-white/10">Thông Tin User</th><th className="p-5 border-b border-white/10 text-center">Vai Trò</th><th className="p-5 border-b border-white/10 text-center">Đổi Role</th><th className="p-5 border-b border-white/10 text-center">Trạng Thái</th><th className="p-5 border-b border-white/10 text-center">Warnings</th></>}
                                {activeTab === 'reports' && <><th className="p-5 border-b border-white/10">Chi Tiết Báo Lỗi</th><th className="p-5 border-b border-white/10">Người Báo Cáo</th></>}
                                {activeTab === 'comment_reports' && <><th className="p-5 border-b border-white/10 w-[35%]">Bình Luận</th><th className="p-5 border-b border-white/10 w-[20%]">Lý Do</th><th className="p-5 border-b border-white/10">Người Báo</th></>}
                                {activeTab === 'comments' && <><th className="p-5 border-b border-white/10 w-[40%]">Nội Dung</th><th className="p-5 border-b border-white/10">Người Đăng</th><th className="p-5 border-b border-white/10">Tại Truyện</th></>}
                                {activeTab === 'quests' && <><th className="p-5 border-b border-white/10">Nhiệm Vụ</th><th className="p-5 border-b border-white/10 text-center">Loại</th><th className="p-5 border-b border-white/10 text-center">Chu Kỳ</th><th className="p-5 border-b border-white/10 text-center">Mục Tiêu</th><th className="p-5 border-b border-white/10 text-center">Thưởng</th></>}
                                <th className="p-5 border-b border-white/10 text-right">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? <tr><td colSpan="10" className="p-10 text-center"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></td></tr> : filteredData.length > 0 ? filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors text-sm group">
                                    <td className="p-5 text-gray-500 font-mono">#{item.id}</td>
                                    
                                    {/* USERS ROWS */}
                                    {activeTab === 'users' && <>
                                        <td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden"><img src={item.avatar && item.avatar.startsWith('http') ? item.avatar : `https://ui-avatars.com/api/?name=${item.full_name}&background=random`} alt="" className="w-full h-full object-cover" /></div><div><div className="font-bold text-white text-base">{item.full_name}</div><div className="text-xs text-gray-500 font-medium">@{item.username}</div></div></div></td>
                                        <td className="p-5 text-center"><span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${item.role === 'admin' ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500/30' : 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/30'}`}>{item.role === 'admin' ? 'ADMIN' : 'USER'}</span></td>
                                        <td className="p-5 text-center"><select value={item.role} onChange={(e) => handleChangeRole(item.id, e.target.value, item.role)} className={`bg-[#252538] border border-white/10 text-white text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all hover:border-white/30 ${item.id === currentAdminId ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={item.id === currentAdminId}><option value="user">USER</option><option value="admin">ADMIN</option></select></td>
                                        <td className="p-5 text-center">{item.status === 'banned' ? <span className="text-red-500 font-bold text-xs"><RiProhibitedLine className="inline"/> BỊ CHẶN</span> : <span className="text-green-500 font-bold text-xs"><RiCheckLine className="inline"/> HOẠT ĐỘNG</span>}</td>
                                        <td className="p-5 text-center"><span className={`font-bold ${item.warnings > 0 ? 'text-yellow-500' : 'text-gray-600'}`}>{item.warnings}</span></td>
                                        <td className="p-5 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">{item.role !== 'admin' && <><button onClick={() => openWarnModal(item)} className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"><RiErrorWarningLine size={18} /></button>{item.status === 'banned' ? <button onClick={() => handleUnban(item.id)} className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><RiCheckLine size={18} /></button> : <button onClick={() => openBanModal(item)} className="p-2.5 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-white hover:text-black transition-all"><RiProhibitedLine size={18} /></button>}<button onClick={() => handleDeleteUser(item.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><RiDeleteBinLine size={18} /></button></>}</div></td>
                                    </>}

                                    {/* REPORTS ROWS */}
                                    {activeTab === 'reports' && <><td className="p-5"><div><div className="font-bold text-white">{item.comic_name || item.comic_slug}</div><div className="text-xs text-primary font-bold">{item.comic_slug} {item.chapter_name && `| ${item.chapter_name}`}</div><div className="mt-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-sm italic">"{item.reason}"</div></div></td><td className="p-5"><div className="font-bold text-white">{item.full_name}</div><div className="text-xs text-gray-500">@{item.username}</div></td><td className="p-5 text-right"><button onClick={() => handleResolveReport(item.id)} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 ml-auto"><RiCheckLine size={16}/> Xử lý</button></td></>}

                                    {/* COMMENT REPORTS ROWS */}
                                    {activeTab === 'comment_reports' && <><td className="p-5"><div className="bg-[#1f1f3a] p-4 rounded-xl border border-white/5"><p className="text-gray-300 text-sm italic line-clamp-3">"{item.comment_content}"</p><div className="mt-2 text-xs text-gray-500">Tác giả: <span className="text-blue-400 font-bold">{item.reported_user_name}</span></div></div></td><td className="p-5"><span className="bg-red-500/20 text-red-500 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 w-fit"><RiFlag2Line /> {item.reason}</span></td><td className="p-5"><div className="font-bold text-white">{item.reporter_name}</div><div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('vi-VN')}</div></td><td className="p-5 text-right"><div className="flex justify-end gap-3"><button onClick={() => handleResolveCommentReport(item.id, 'delete_comment')} className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500">Xóa & Thông báo</button><button onClick={() => handleResolveCommentReport(item.id, 'dismiss')} className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-600">Bỏ qua</button></div></td></>}

                                    {/* COMMENTS ROWS */}
                                    {activeTab === 'comments' && <><td className="p-5"><div className="bg-[#1f1f3a] p-3 rounded-xl"><p className="text-gray-300 text-sm line-clamp-2">"{item.content}"</p></div></td><td className="p-5"><div className="font-bold text-white">{item.username}</div></td><td className="p-5"><span className="text-sm font-bold text-primary">{item.comic_slug}</span></td><td className="p-5 text-right"><button onClick={() => handleDeleteComment(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><RiDeleteBinLine size={18} /></button></td></>}

                                    {/* QUESTS ROWS */}
                                    {activeTab === 'quests' && <><td className="p-5"><div className="font-bold text-white">{item.name}</div><div className="text-xs text-gray-500 font-mono mt-1">{item.quest_key}</div></td><td className="p-5 text-center"><span className="bg-gray-700/50 px-2 py-1 rounded text-xs font-bold uppercase">{item.action_type}</span></td><td className="p-5 text-center"><span className="text-xs font-bold uppercase">{item.type}</span></td><td className="p-5 text-center font-black">{item.target_count}</td><td className="p-5 text-center text-primary font-black">+{item.reward_exp} XP</td><td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => openQuestModal(item)} className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"><RiEditLine size={18} /></button><button onClick={() => handleDeleteQuest(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><RiDeleteBinLine size={18} /></button></div></td></>}
                                </tr>
                            )) : <tr><td colSpan="10" className="p-10 text-center text-gray-500 italic">Không có dữ liệu.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {/* Pagination for Users */}
                {activeTab === 'users' && totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 bg-[#151525] border-t border-white/5">
                        <div className="text-sm text-gray-500 font-medium">Trang <span className="font-bold text-white">{currentPage}</span> / {totalPages}</div>
                        <div className="flex gap-3"><button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50">Trước</button><button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50">Sau</button></div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a16] text-gray-300 font-display flex">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#151525] border-r border-white/5 p-6 flex flex-col gap-6 fixed h-full z-20 overflow-y-auto no-scrollbar shadow-xl">
                <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight"><RiShieldUserLine className="text-red-500" /> ADMIN PANEL</h1>
                <nav className="flex flex-col gap-2 flex-1">
                    {MENU_ITEMS.map(item => {
                        const isActive = activeTab === item.id;
                        const colorClass = isActive ? `bg-${item.color}-500/20 text-${item.color}-500` : 'hover:bg-white/5 text-gray-400 hover:text-white';
                        return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`px-4 py-3 rounded-xl font-bold cursor-pointer flex items-center gap-3 transition-all ${isActive ? 'bg-gray-700 text-white shadow-lg' : 'hover:bg-white/5'}`}><item.icon size={20} /> {item.label}</button>;
                    })}
                </nav>
                <Link to="/" className="mt-auto flex items-center gap-2 text-sm text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors font-bold"><RiArrowLeftLine /> Quay về Trang Chủ</Link>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 ml-64">
                <div className="flex justify-between items-end mb-8 animate-fade-in-down">
                    <div><h2 className="text-3xl font-black text-white capitalize tracking-tight mb-1">{MENU_ITEMS.find(i => i.id === activeTab)?.label}</h2><p className="text-gray-500 text-sm">Chào mừng trở lại, Admin!</p></div>
                    {activeTab === 'quests' && <button onClick={() => openQuestModal()} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-1"><RiAddLine size={18} /> Thêm Nhiệm Vụ</button>}
                </div>

                {/* SEARCH BAR */}
                {activeTab !== 'comics' && activeTab !== 'dashboard' && (
                    <div className="bg-[#151525] p-4 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-lg animate-fade-in">
                        <div className="flex-1 w-full relative">
                            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input type="text" placeholder="Tìm kiếm..." className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl pl-12 pr-10 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"><RiCloseLine size={18} /></button>}
                        </div>
                        {activeTab === 'users' && (
                            <div className="flex gap-3 w-full md:w-auto animate-fade-in">
                                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-[#1f1f3a] border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none cursor-pointer"><option value="all">Role</option><option value="admin">Admin</option><option value="user">User</option></select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#1f1f3a] border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none cursor-pointer"><option value="all">Status</option><option value="active">Active</option><option value="banned">Banned</option></select>
                                <button onClick={() => fetchData()} className="px-5 py-3 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"><RiSearchLine /> Tìm</button>
                            </div>
                        )}
                    </div>
                )}

                {renderContent()}
            </div>

            {/* MODALS COMPONENT INSTANCES */}
            <BanModal isOpen={showBanModal} onClose={() => setShowBanModal(false)} onConfirm={confirmBan} username={selectedUser?.username} days={banDays} setDays={setBanDays} />
            <WarnModal isOpen={showWarnModal} onClose={() => setShowWarnModal(false)} onConfirm={confirmWarn} username={selectedUser?.username} reason={warnReason} setReason={setWarnReason} />
            <QuestModal isOpen={showQuestModal} onClose={() => setShowQuestModal(false)} onSubmit={handleSubmitQuest} isEditing={isEditingQuest} form={questForm} setForm={setQuestForm} />
        </div>
    );
};

// Sub-components (Modals)

const BanModal = ({ isOpen, onClose, onConfirm, username, days, setDays }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button>
                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><RiProhibitedLine className="text-red-500" size={28} /> Chặn Người Dùng</h3>
                <p className="text-gray-400 text-sm mb-6">Bạn đang chặn <span className="font-bold text-white">{username}</span>.</p>
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Thời gian chặn</label>
                    <select value={days} onChange={(e) => setDays(e.target.value)} className="w-full bg-[#252538] border border-white/10 text-white text-sm font-bold rounded-xl p-3 focus:outline-none focus:border-red-500 cursor-pointer">
                        <option value="1">1 Ngày</option><option value="3">3 Ngày</option><option value="7">1 Tuần</option><option value="-1">Vĩnh Viễn</option>
                    </select>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600">Hủy</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg">Xác Nhận</button>
                </div>
            </div>
        </div>
    );
};

const WarnModal = ({ isOpen, onClose, onConfirm, username, reason, setReason }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button>
                <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><RiErrorWarningLine className="text-yellow-500" size={28} /> Gửi Cảnh Báo</h3>
                <p className="text-gray-400 text-sm mb-6">Cảnh báo user <span className="font-bold text-white">{username}</span>.</p>
                <div className="space-y-3 mb-6">
                    {['Ngôn từ không phù hợp', 'Spam bình luận', 'Quảng cáo trái phép', 'Xúc phạm thành viên', 'Vi phạm quy định'].map((r) => (
                        <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${reason === r ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-[#252538] border-transparent hover:bg-white/5 text-gray-300'}`}>
                            <input type="radio" name="warnReason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="accent-yellow-500 w-4 h-4" />
                            <span className="text-sm font-medium">{r}</span>
                        </label>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600">Hủy</button>
                    <button onClick={onConfirm} disabled={!reason} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${reason ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}><RiSendPlaneFill/> Gửi</button>
                </div>
            </div>
        </div>
    );
};

const QuestModal = ({ isOpen, onClose, onSubmit, isEditing, form, setForm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a2e] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-scale-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1"><RiCloseLine size={24}/></button>
                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><RiTaskLine className="text-green-500" size={28} /> {isEditing ? 'Sửa Nhiệm Vụ' : 'Thêm Nhiệm Vụ'}</h3>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Loại Hành Động</label><select value={form.action_type} onChange={e => { const act = e.target.value; setForm({ ...form, action_type: act, quest_key: isEditing ? form.quest_key : `${act}_${Date.now()}` }) }} disabled={isEditing} className="w-full bg-[#252538] border border-white/10 rounded-xl p-3 text-white text-sm font-bold cursor-pointer focus:border-green-500 outline-none disabled:opacity-50"><option value="read">Đọc Truyện</option><option value="comment">Bình Luận</option><option value="login">Đăng Nhập</option><option value="streak">Chuỗi (Streak)</option></select></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Mã Key</label><input type="text" disabled value={form.quest_key} className="w-full bg-[#1a1a2e] border border-white/5 rounded-xl p-3 text-gray-600 text-sm font-mono italic cursor-not-allowed" /></div>
                    </div>
                    <input type="text" required placeholder="Tên Nhiệm Vụ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-green-500 outline-none" />
                    <input type="text" placeholder="Mô tả ngắn" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-medium focus:border-green-500 outline-none" />
                    <div className="grid grid-cols-3 gap-5">
                        <div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Mục Tiêu</label><input type="number" min="1" required value={form.target_count} onChange={e => setForm({ ...form, target_count: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-white font-black text-center focus:border-green-500 outline-none" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Thưởng XP</label><input type="number" min="0" required value={form.reward_exp} onChange={e => setForm({ ...form, reward_exp: e.target.value })} className="w-full bg-[#1f1f3a] border border-white/10 rounded-xl p-3 text-primary font-black text-center focus:border-green-500 outline-none" /></div>
                        <div><label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Chu Kỳ</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-[#252538] border border-white/10 rounded-xl p-3 text-white text-sm font-bold cursor-pointer focus:border-green-500 outline-none"><option value="daily">Hàng Ngày</option><option value="weekly">Hàng Tuần</option><option value="achievement">Thành Tựu</option></select></div>
                    </div>
                    <div className="flex gap-4 mt-2"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600">Hủy</button><button type="submit" className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 flex items-center justify-center gap-2"><RiSave3Line size={18} /> {isEditing ? 'Cập Nhật' : 'Tạo Mới'}</button></div>
                </form>
            </div>
        </div>
    );
};

export default DashboardPage;