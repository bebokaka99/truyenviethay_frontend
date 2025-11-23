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
  const { slug } = useParams(); // Lấy slug nếu đang ở route /the-loai/:slug
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONFIG API ---
  const API_ENDPOINTS = {
      NEW: 'truyen-moi',
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

  // Bộ lọc
  const [showFilter, setShowFilter] = useState(false);
  
  // State Filter
  const [filter, setFilter] = useState({
      status: 'NEW', 
      category: slug || '', 
      sort: 'default' 
  });
  
  // State Temp Filter (Để UI hiển thị trước khi bấm Áp dụng)
  const [tempFilter, setTempFilter] = useState({
      status: 'NEW', 
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

  // --- 2. RESET KHI URL THAY ĐỔI ---
  // Khi chuyển từ /danh-sach sang /the-loai/action (hoặc ngược lại)
  useEffect(() => {
      setStories([]);
      setPage(1);
      setHasMore(true);
      
      // Cấu hình lại bộ lọc dựa trên URL mới
      const newFilter = {
          category: slug || '', // Nếu có slug thì là trang thể loại
          status: slug ? 'all' : 'NEW', // Trang thể loại thì lấy all, trang thường thì lấy truyện mới
          sort: 'default'
      };
      
      setFilter(newFilter);
      setTempFilter(newFilter); // Đồng bộ luôn bộ lọc tạm

  }, [slug, location.pathname]);

  // --- 3. FETCH DATA CHÍNH ---
  useEffect(() => {
      const fetchData = async () => {
          if (page === 1) setLoading(true);
          else setLoadingMore(true);

          try {
              let apiUrl = '';
              
              // LOGIC CHỌN API:
              // Ưu tiên 1: Nếu có Category (Trang thể loại) -> Gọi API Thể loại
              if (filter.category) {
                  apiUrl = `https://otruyenapi.com/v1/api/the-loai/${filter.category}?page=${page}`;
              } 
              // Ưu tiên 2: Nếu không có Category -> Gọi API theo Status
              else {
                  const endpoint = API_ENDPOINTS[filter.status] || API_ENDPOINTS.NEW;
                  apiUrl = `https://otruyenapi.com/v1/api/danh-sach/${endpoint}?page=${page}`;
              }

              const res = await axios.get(apiUrl);
              const data = res.data.data;

              setDomainAnh(data.APP_DOMAIN_CDN_IMAGE);
              setPageTitle(data.titlePage); // Tên tiêu đề từ API (VD: Thể loại Action)
              setTotalItems(data.params.pagination.totalItems);

              const newItems = data.items;

              if (page === 1) {
                  setStories(newItems);
              } else {
                  setStories(prev => {
                      const existing = new Set(prev.map(s => s._id));
                      return [...prev, ...newItems.filter(s => !existing.has(s._id))];
                  });
              }

              const totalPages = Math.ceil(data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage);
              setHasMore(page < totalPages);

          } catch (error) {
              console.error("Lỗi fetch:", error);
              setStories([]); // Reset list nếu lỗi (ví dụ trang 404)
          } finally {
              setLoading(false);
              setLoadingMore(false);
          }
      };

      const timer = setTimeout(() => {
          fetchData();
      }, 100);
      return () => clearTimeout(timer);

  }, [page, filter.category, filter.status]); 

  // --- HANDLERS ---
  const handleLoadMore = () => setPage(prev => prev + 1);

  // Xử lý thay đổi trên UI bộ lọc (Chưa gọi API ngay)
  const handleTempFilterChange = (key, value) => {
      setTempFilter(prev => ({ ...prev, [key]: value }));
  };

  // Bấm nút "Áp Dụng" -> Mới gọi API
  const handleApplyFilter = () => {
      setStories([]); // Xóa list cũ
      setPage(1);
      
      // Nếu người dùng đổi thể loại trong dropdown -> Chuyển trang
      if (tempFilter.category !== filter.category) {
           if (tempFilter.category) navigate(`/the-loai/${tempFilter.category}`);
           else navigate('/danh-sach');
           // Việc navigate sẽ kích hoạt useEffect số 2, tự động load lại data
      } else {
           // Nếu chỉ đổi status/sort -> Update state filter để kích hoạt useEffect số 3
           setFilter(tempFilter);
      }
      setShowFilter(false); // Đóng panel
  };

  // Bấm nút "Xóa Lọc" -> Reset về mặc định của trang hiện tại
  const handleClearFilter = () => {
      // Logic thông minh:
      // - Nếu đang ở trang Thể loại (có slug): Giữ nguyên thể loại đó, chỉ reset status về 'all'
      // - Nếu ở trang Danh sách chung: Reset về 'truyen-moi'
      const defaultState = { 
          status: slug ? 'all' : 'NEW', 
          category: slug || '', 
          sort: 'default' 
      };
      
      setTempFilter(defaultState);
      setFilter(defaultState);
      setStories([]);
      setPage(1);
  };

  // --- CLIENT SIDE SORTING & FILTERING ---
  // API Otruyen trả về list hỗn hợp khi gọi theo thể loại, nên ta cần lọc lại ở Client
  const displayedStories = useMemo(() => {
      let result = [...stories];
      
      // 1. Lọc Status (Chỉ áp dụng khi đang ở trang Thể loại)
      // Vì trang Danh sách chung (API_ENDPOINTS) đã lọc sẵn từ Server rồi
      if (filter.category && filter.status !== 'all') {
          const statusKey = filter.status === 'COMPLETED' ? 'Completed' : 'Ongoing';
          // API Otruyen đôi khi trả về 'Completed' hoặc 'completed', nên check cả 2
          result = result.filter(s => 
              s.status.toLowerCase() === statusKey.toLowerCase() || 
              s.status === filter.status // fallback
          );
      }

      // 2. Sắp xếp
      if (filter.sort === 'name_az') {
          result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filter.sort === 'chapter_desc') {
          // Nhiều chương nhất
          result.sort((a, b) => {
             const getNum = (item) => parseFloat(item.latest_chapter?.match(/\d+/)?.[0] || 0);
             return getNum(b) - getNum(a);
          });
      }
      // 'default' & 'new_update': Mặc định API đã trả về theo update mới nhất

      return result;
  }, [stories, filter.sort, filter.status, filter.category]);


  // --- HELPERS ---
  const formatChapter = (truyen) => {
    const chap = truyen.latest_chapter || (truyen.chaptersLatest && truyen.chaptersLatest[0]?.chapter_name);
    if (!chap) return '??';
    return String(chap).includes('hapter') ? chap : `Chap ${chap}`;
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
                        {totalItems > 0 ? `Tìm thấy ${totalItems} truyện` : 'Kho truyện khổng lồ'}
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
                            {/* Nút Tất Cả chỉ hiện khi ở trang thể loại */}
                            {filter.category && (
                                <button onClick={() => handleTempFilterChange('status', 'all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'all' ? 'bg-primary text-white border-primary' : 'bg-[#1a1a2e] border-white/10'}`}>Tất Cả</button>
                            )}
                            
                            <button onClick={() => handleTempFilterChange('status', 'NEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'NEW' ? 'bg-primary text-white border-primary' : 'bg-[#1a1a2e] border-white/10'}`}>Truyện Mới</button>
                            <button onClick={() => handleTempFilterChange('status', 'ONGOING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'ONGOING' ? 'bg-green-600 text-white border-green-600' : 'bg-[#1a1a2e] border-white/10'}`}>Đang Tiến Hành</button>
                            <button onClick={() => handleTempFilterChange('status', 'COMPLETED')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'COMPLETED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#1a1a2e] border-white/10'}`}>Hoàn Thành</button>
                            <button onClick={() => handleTempFilterChange('status', 'UPCOMING')} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${tempFilter.status === 'UPCOMING' ? 'bg-purple-600 text-white border-purple-600' : 'bg-[#1a1a2e] border-white/10'}`}>Sắp Ra Mắt</button>
                        </div>
                        {!filter.category && <p className="text-[10px] text-gray-500 mt-2 italic">*Chọn trạng thái sẽ tải lại danh sách từ server.</p>}
                    </div>

                    {/* 2. Sắp Xếp */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase mb-3 border-l-2 border-green-500 pl-2">Sắp Xếp</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'default', label: 'Mặc Định' },
                                { id: 'name_az', label: 'Tên A-Z' },
                                { id: 'chapter_desc', label: 'Nhiều Chương' },
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

                {/* Nút Hành Động */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <button 
                        onClick={handleClearFilter}
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
                    <p>Không tìm thấy truyện nào phù hợp với bộ lọc.</p>
                    <button onClick={handleClearFilter} className="mt-4 text-primary hover:underline text-sm font-bold">
                        Xóa bộ lọc phụ (Giữ thể loại)
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