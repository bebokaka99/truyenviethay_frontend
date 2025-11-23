import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { 
  RiArrowRightSLine, RiLayoutGridFill, RiFilter3Line, 
  RiCloseLine, RiLoader4Line, RiErrorWarningLine, 
  RiCheckLine, RiDeleteBinLine, RiTimeLine, RiBookOpenLine
} from 'react-icons/ri';

const ListPage = () => {
  const { slug } = useParams(); // Slug thể loại
  const navigate = useNavigate();
  const location = useLocation();

  // --- CẤU HÌNH API ---
  const API_ENDPOINTS = {
      NEW: 'truyen-moi',         // Mặc định (Chương mới cập nhật)
      ONGOING: 'dang-phat-hanh',
      COMPLETED: 'hoan-thanh',
      UPCOMING: 'sap-ra-mat'
  };

  // --- STATE ---
  const [stories, setStories] = useState([]);
  const [fullCategories, setFullCategories] = useState([]); 
  const [pageTitle, setPageTitle] = useState('Kho Truyện');
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [domainAnh, setDomainAnh] = useState('');
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Toggle Filter Panel
  const [showFilter, setShowFilter] = useState(false);
  
  // --- FILTER STATE ---
  // 1. Bộ lọc thực tế đang áp dụng
  const [filter, setFilter] = useState({
      status: 'all',       // 'all' | 'ONGOING' | 'COMPLETED' | 'UPCOMING'
      category: slug || '', 
      sort: 'default'      // 'default' (Update mới nhất) | 'name_az' | 'chapter_desc' | 'chapter_asc'
  });

  // 2. Bộ lọc tạm thời (trên UI panel)
  const [tempFilter, setTempFilter] = useState({
      status: 'all',
      category: slug || '',
      sort: 'default'
  });

  // --- 1. INIT LOAD (Lấy danh sách thể loại) ---
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const res = await axios.get('https://otruyenapi.com/v1/api/the-loai');
            setFullCategories(res.data.data.items);
        } catch (e) { console.error(e); }
    };
    fetchCats();
  }, []);

  // --- 2. ĐỒNG BỘ URL VÀO FILTER ---
  // Khi URL thay đổi (VD: bấm từ menu), cập nhật lại filter
  useEffect(() => {
      const newCategory = slug || '';
      
      setFilter(prev => ({
          ...prev,
          category: newCategory,
          // Nếu vào trang thể loại cụ thể, reset status về all để hiện nhiều truyện nhất
          // Nếu vào trang danh sách gốc, giữ nguyên hoặc reset tùy ý
          status: 'all' 
      }));

      setTempFilter(prev => ({
          ...prev,
          category: newCategory,
          status: 'all'
      }));

      setStories([]);
      setPage(1);
  }, [slug, location.pathname]);

  // --- 3. FETCH DATA TỪ API ---
  useEffect(() => {
      const fetchData = async () => {
          if (page === 1) setLoading(true);
          else setLoadingMore(true);

          try {
              let apiUrl = '';
              
              // LOGIC QUYẾT ĐỊNH GỌI API NÀO
              
              // TH1: Có lọc theo Thể Loại -> Bắt buộc gọi API Thể Loại
              if (filter.category) {
                  apiUrl = `https://otruyenapi.com/v1/api/the-loai/${filter.category}?page=${page}`;
              } 
              // TH2: Không có Thể Loại -> Gọi API Danh Sách theo Trạng Thái
              else {
                  // Nếu status là 'all', mặc định gọi 'truyen-moi'
                  const endpointKey = filter.status === 'all' ? 'NEW' : filter.status;
                  const endpoint = API_ENDPOINTS[endpointKey] || 'truyen-moi';
                  apiUrl = `https://otruyenapi.com/v1/api/danh-sach/${endpoint}?page=${page}`;
              }

              const res = await axios.get(apiUrl);
              const data = res.data.data;

              setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
              setPageTitle(data.titlePage);
              setTotalItems(data.params.pagination.totalItems);

              const newItems = data.items;

              if (page === 1) {
                  setStories(newItems);
              } else {
                  // Load more: Nối thêm và lọc trùng ID
                  setStories(prev => {
                      const existing = new Set(prev.map(s => s._id));
                      return [...prev, ...newItems.filter(s => !existing.has(s._id))];
                  });
              }

              const totalPages = Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage);
              setHasMore(page < totalPages);

          } catch (error) {
              console.error("Lỗi fetch:", error);
              setStories([]); 
          } finally {
              setLoading(false);
              setLoadingMore(false);
          }
      };

      // Debounce call
      const timer = setTimeout(() => { fetchData(); }, 100);
      return () => clearTimeout(timer);

  }, [page, filter.category, filter.status]); 
  // Lưu ý: filter.sort không nằm trong dependency của useEffect fetch
  // Vì API Otruyen không hỗ trợ sort server-side, ta sort client-side bên dưới

  // --- 4. LOGIC LỌC & SẮP XẾP (CLIENT SIDE) ---
  const displayedStories = useMemo(() => {
      let result = [...stories];

      // A. LỌC TRẠNG THÁI (Chỉ khi đang ở API Thể loại)
      // Vì API Thể loại trả về hỗn hợp, ta cần lọc lại.
      // API Danh sách (TH2 ở trên) đã trả về đúng status rồi nên không cần lọc lại.
      if (filter.category && filter.status !== 'all') {
          const targetStatus = filter.status === 'COMPLETED' ? 'Completed' : 'Ongoing'; 
          // 'UPCOMING' thường ít khi có trong list thể loại, chủ yếu là Ongoing/Completed
          
          result = result.filter(s => {
              // So sánh không phân biệt hoa thường
              return s.status.toLowerCase() === targetStatus.toLowerCase();
          });
      }

      // B. SẮP XẾP
      // Hàm lấy số chương từ chuỗi (VD: "Chapter 100" -> 100)
      const getChapNum = (item) => {
          const chapStr = item.latest_chapter || (item.chaptersLatest && item.chaptersLatest[0]?.chapter_name) || '';
          const num = parseFloat(chapStr.match(/\d+(\.\d+)?/)?.[0]);
          return isNaN(num) ? 0 : num;
      };

      switch (filter.sort) {
          case 'name_az':
              result.sort((a, b) => a.name.localeCompare(b.name));
              break;
          case 'chapter_desc': // Nhiều chương nhất
              result.sort((a, b) => getChapNum(b) - getChapNum(a));
              break;
          case 'chapter_asc': // Ít chương nhất
              result.sort((a, b) => getChapNum(a) - getChapNum(b));
              break;
          case 'default': 
          default:
              // Mặc định API đã trả về theo Update mới nhất (updatedAt DESC)
              // Tuy nhiên nếu muốn chắc chắn, ta sort lại
              result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
              break;
      }

      return result;
  }, [stories, filter.sort, filter.status, filter.category]);


  // --- ACTIONS ---
  const handleLoadMore = () => setPage(prev => prev + 1);

  // Cập nhật state tạm thời khi chọn trên UI
  const handleTempFilterChange = (key, value) => {
      setTempFilter(prev => ({ ...prev, [key]: value }));
  };

  // Nút Áp Dụng
  const handleApplyFilter = () => {
      // Nếu đổi thể loại -> Chuyển trang (Logic điều hướng)
      if (tempFilter.category !== filter.category) {
           if (tempFilter.category) navigate(`/the-loai/${tempFilter.category}`);
           else navigate('/danh-sach');
           // Khi navigate, useEffect số 2 sẽ chạy và reset mọi thứ
      } else {
           // Nếu chỉ đổi status/sort -> Cập nhật filter để fetch/sort lại
           setStories([]);
           setPage(1);
           setFilter(tempFilter);
      }
      // setShowFilter(false); // Tùy chọn: Có muốn đóng bảng lọc sau khi apply không
  };

  // Nút Đặt Lại (Chỉ reset Status & Sort, giữ nguyên Category hiện tại)
  const handleResetFilter = () => {
      const defaultState = {
          category: filter.category, // Giữ nguyên thể loại đang xem
          status: 'all',
          sort: 'default'
      };
      setTempFilter(defaultState);
      setFilter(defaultState);
      setStories([]);
      setPage(1);
  };

  // Helpers Render
  const formatChapter = (truyen) => {
    const chap = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name);
    if (!chap) return '??';
    return String(chap).toLowerCase().includes('chap') ? chap : `Chap ${chap}`;
  };

  const timeAgo = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen w-full bg-[#101022] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase mb-2">
                <Link to="/" className="hover:text-primary">Trang chủ</Link>
                <RiArrowRightSLine />
                <span>{filter.category ? 'Thể loại' : 'Danh sách'}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 uppercase">
                        <span className="text-primary">#</span> {pageTitle}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {/* Hiển thị số lượng đang hiển thị / Tổng số */}
                        Đang hiển thị {displayedStories.length} truyện
                    </p>
                </div>

                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${showFilter ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-[#1a1a2e] border border-white/10 hover:bg-white/10'}`}
                >
                    {showFilter ? <RiCloseLine size={18} /> : <RiFilter3Line size={18} />}
                    {showFilter ? 'Ẩn Bộ Lọc' : 'Lọc & Sắp Xếp'}
                </button>
            </div>
        </div>

        {/* --- FILTER PANEL --- */}
        {showFilter && (
            <div className="mb-8 bg-[#151525] p-6 rounded-2xl border border-white/5 shadow-xl animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* 1. Trạng Thái */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-primary pl-2">Trạng Thái</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* Nút "Tất Cả" luôn hiện */}
                            <button onClick={() => handleTempFilterChange('status', 'all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'all' ? 'bg-primary text-white border-primary' : 'bg-[#1a1a2e] border-white/10'}`}>Tất Cả</button>
                            
                            {/* Nếu không chọn category, cho phép lọc theo list API */}
                            {!filter.category && (
                                <button onClick={() => handleTempFilterChange('status', 'NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'NEW' ? 'bg-green-600 text-white border-green-600' : 'bg-[#1a1a2e] border-white/10'}`}>Truyện Mới</button>
                            )}
                            
                            <button onClick={() => handleTempFilterChange('status', 'ONGOING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'ONGOING' ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#1a1a2e] border-white/10'}`}>Đang Tiến Hành</button>
                            <button onClick={() => handleTempFilterChange('status', 'COMPLETED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'COMPLETED' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#1a1a2e] border-white/10'}`}>Hoàn Thành</button>
                            
                            {!filter.category && (
                                <button onClick={() => handleTempFilterChange('status', 'UPCOMING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'UPCOMING' ? 'bg-purple-500 text-white border-purple-500' : 'bg-[#1a1a2e] border-white/10'}`}>Sắp Ra Mắt</button>
                            )}
                        </div>
                    </div>

                    {/* 2. Sắp Xếp */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-green-500 pl-2">Sắp Xếp</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'default', label: 'Mới Cập Nhật' },
                                { id: 'chapter_desc', label: 'Nhiều Chương' },
                                { id: 'chapter_asc', label: 'Ít Chương' },
                                { id: 'name_az', label: 'Tên A-Z' },
                            ].map(s => (
                                <button key={s.id} onClick={() => handleTempFilterChange('sort', s.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.sort === s.id ? 'bg-green-600 text-white border-green-600' : 'bg-[#1a1a2e] border-white/10 hover:border-white/30'}`}>{s.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Thể Loại */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-purple-500 pl-2">Chuyển Thể Loại</h4>
                        <select 
                            onChange={(e) => handleTempFilterChange('category', e.target.value)} 
                            value={tempFilter.category} 
                            className="w-full bg-[#1a1a2e] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="">-- Tất cả thể loại --</option>
                            {fullCategories.map(cat => (
                                <option key={cat._id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button 
                        onClick={handleResetFilter}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#252538] hover:bg-red-500/20 hover:text-red-500 text-gray-400 text-sm font-bold transition-colors"
                    >
                        <RiDeleteBinLine /> Đặt Lại
                    </button>
                    <button 
                        onClick={handleApplyFilter}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-900/30 transition-all"
                    >
                        <RiCheckLine /> Áp Dụng
                    </button>
                </div>
            </div>
        )}

        {/* LOADING */}
        {loading && (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm animate-pulse">Đang tải dữ liệu...</p>
            </div>
        )}

        {/* CONTENT */}
        {!loading && displayedStories.length > 0 ? (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-fade-in-up">
                    {displayedStories.map((truyen) => (
                        <Link key={truyen._id} to={`/truyen-tranh/${truyen.slug}`} className="flex flex-col gap-2 group cursor-pointer">
                            <div className="w-full aspect-[2/3] bg-[#1f1f3a] rounded-lg overflow-hidden relative border border-white/5 group-hover:border-green-500/50 transition-all shadow-sm">
                                <img 
                                    src={`${domainAnh}/uploads/comics/${truyen.thumb_url}`}
                                    alt={truyen.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute top-1.5 right-1.5 flex flex-row items-center gap-1">
                                    <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <RiTimeLine size={8} className="text-primary"/> {timeAgo(truyen.updatedAt)}
                                    </span>
                                    <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <RiBookOpenLine size={8} /> {formatChapter(truyen)}
                                    </span>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 text-[9px] text-center font-bold text-white py-0.5 ${truyen.status === 'ongoing' ? 'bg-green-600/80' : 'bg-blue-600/80'}`}>
                                    {truyen.status === 'ongoing' ? 'ĐANG TIẾN HÀNH' : 'HOÀN THÀNH'}
                                </div>
                            </div>
                            <h4 className="text-gray-200 text-xs md:text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5em]">
                                {truyen.name}
                            </h4>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={handleLoadMore} 
                            disabled={loadingMore} 
                            className="px-8 py-3 rounded-full bg-[#1a1a2e] border border-white/10 hover:bg-primary hover:text-white hover:border-primary text-gray-300 font-bold transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                            {loadingMore && <RiLoader4Line className="animate-spin" />}
                            {loadingMore ? 'Đang tải thêm...' : 'Xem Thêm Truyện'}
                        </button>
                    </div>
                )}
            </>
        ) : (
            !loading && (
                <div className="py-20 text-center text-gray-500 bg-[#151525] rounded-xl border border-white/5 border-dashed">
                    <RiErrorWarningLine className="text-5xl mx-auto mb-4 opacity-50" />
                    <p>Không tìm thấy truyện nào phù hợp.</p>
                    {/* Nút Reset thông minh hơn */}
                    <button onClick={handleResetFilter} className="mt-4 text-primary hover:underline text-sm font-bold">
                        Xóa bộ lọc (Giữ thể loại hiện tại)
                    </button>
                </div>
            )
        )}

      </main>
      <Footer />
    </div>
  );
};

export default ListPage;