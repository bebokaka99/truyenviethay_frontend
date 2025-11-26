import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiRocketLine, RiUserHeartLine, RiBookOpenLine,
  RiGlobalLine, RiShieldCheckLine, RiFlashlightLine,
  RiSmartphoneLine, RiAppleFill, RiAndroidFill
} from 'react-icons/ri';
import { FaCoffee } from 'react-icons/fa';

// Contexts & Components
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import Toast from '../components/common/Toast';

// Data constants
const STATS = [
  { num: '10,000+', label: 'Đầu Truyện', icon: RiBookOpenLine },
  { num: '500K+', label: 'Thành Viên', icon: RiUserHeartLine },
  { num: '1M+', label: 'Lượt Đọc/Ngày', icon: RiGlobalLine },
  { num: '24/7', label: 'Cập Nhật', icon: RiFlashlightLine },
];

const CORE_VALUES = [
  { 
    title: 'Chất Lượng Hàng Đầu', 
    desc: 'Hình ảnh sắc nét, bản dịch mượt mà và tốc độ tải trang siêu tốc là ưu tiên số 1 của chúng tôi.',
    icon: RiShieldCheckLine,
    color: 'green'
  },
  { 
    title: 'Cộng Đồng Sôi Nổi', 
    desc: 'Hệ thống cấp độ, nhiệm vụ và bình luận giúp bạn không chỉ đọc truyện mà còn "sống" cùng đam mê.',
    icon: RiUserHeartLine,
    color: 'yellow'
  },
  { 
    title: 'Đa Dạng Thể Loại', 
    desc: 'Từ Hành động, Phiêu lưu đến Ngôn tình, Đam mỹ... tất cả đều có tại kho tàng của chúng tôi.',
    icon: RiGlobalLine,
    color: 'purple'
  },
];

const DONATION_INFO = [
  {
    title: 'Ví MoMo',
    account: '0941434669',
    name: 'Trần Ngọc Quỳnh',
    img: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
    color: 'pink'
  },
  {
    title: 'Ngân Hàng MB Bank',
    account: '03092004002211',
    name: 'Trần Ngọc Quỳnh',
    img: '/mbbank.png',
    color: 'blue'
  }
];

// --- MAIN COMPONENT ---
const AboutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleAuthAction = (path) => {
    if (user) {
      setToast({ message: 'Bạn đã đăng nhập rồi nhé!', type: 'info' });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a16] font-display text-gray-300 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <div className="relative py-20 px-6 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Khám Phá Thế Giới <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Truyện Tranh Vô Tận</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              TruyenVietHay là nền tảng đọc truyện tranh miễn phí hàng đầu, nơi kết nối đam mê của hàng triệu độc giả với những bộ truyện hấp dẫn nhất hành tinh.
            </p>
            <Link to="/danh-sach" className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105">
              <RiRocketLine size={20} /> Bắt Đầu Đọc Ngay
            </Link>
          </div>
        </div>

        {/* 2. STATS SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, idx) => (
              <div key={idx} className="bg-[#1a1a2e] border border-white/5 p-6 rounded-2xl text-center hover:border-white/10 transition-colors group">
                <div className="w-12 h-12 mx-auto bg-[#252538] rounded-full flex items-center justify-center text-primary mb-3 text-2xl group-hover:scale-110 transition-transform">
                  <stat.icon />
                </div>
                <h3 className="text-2xl font-black text-white">{stat.num}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MISSION & VISION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Block */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-30 transform rotate-3"></div>
              <div className="relative bg-[#151525] p-8 rounded-3xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Sứ Mệnh Của Chúng Tôi</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Chúng tôi tin rằng truyện tranh không chỉ là giải trí, mà là một cánh cửa dẫn đến những thế giới diệu kỳ. Sứ mệnh của TruyenVietHay là xóa bỏ rào cản ngôn ngữ và chi phí, mang những tác phẩm Manga, Manhwa, Manhua xuất sắc nhất đến với độc giả Việt Nam.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Chúng tôi cam kết xây dựng một cộng đồng văn minh, nơi mọi người có thể chia sẻ cảm xúc, đánh giá và kết bạn thông qua những trang truyện.
                </p>
              </div>
            </div>

            {/* Core Values List */}
            <div className="space-y-8">
              {CORE_VALUES.map((item, idx) => {
                const colorClass = item.color === 'green' ? 'text-green-500 bg-green-500/10' : item.color === 'yellow' ? 'text-yellow-500 bg-yellow-500/10' : 'text-purple-500 bg-purple-500/10';
                return (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. PWA INSTALL GUIDE */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-[#1a1a2e] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
                  <RiSmartphoneLine /> Ứng Dụng Di Động
                </div>
                <h2 className="text-3xl font-black text-white mb-6 leading-tight">Trải Nghiệm Tốt Nhất Trên Điện Thoại Của Bạn</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  TruyenVietHay hỗ trợ cài đặt trực tiếp lên màn hình chính điện thoại (PWA). Không cần tải từ App Store/CH Play, không tốn dung lượng, đọc truyện full màn hình cực đã.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white flex-shrink-0"><RiAppleFill size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold mb-1">iOS (iPhone/iPad)</h4>
                      <p className="text-xs text-gray-500">Mở Safari → Bấm nút Chia sẻ <span className="inline-block border border-gray-600 rounded px-1">↑</span> → Chọn "Thêm vào Màn hình chính".</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white flex-shrink-0"><RiAndroidFill size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Android</h4>
                      <p className="text-xs text-gray-500">Mở Chrome → Bấm menu <span className="inline-block border border-gray-600 rounded px-1">⋮</span> → Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] bg-[#101022] rounded-[2.5rem] border-8 border-[#252538] shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500">
                <img src="/logo.png" alt="App Mockup" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent"></div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#252538] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. DONATE SECTION */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-bold mb-6">
            <FaCoffee /> Ủng Hộ Dự Án
          </div>
          <h2 className="text-3xl font-black text-white mb-6">Tiếp Sức Cho Đam Mê</h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            TruyenVietHay là một dự án phi lợi nhuận được duy trì bởi niềm đam mê. Mọi sự ủng hộ của bạn sẽ được dùng để chi trả phí server, nâng cấp hệ thống và mua thêm cà phê cho đội ngũ phát triển. ☕
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {DONATION_INFO.map((info, idx) => (
              <div key={idx} className={`bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 transition-colors group relative overflow-hidden ${info.color === 'pink' ? 'hover:border-pink-500/50' : 'hover:border-blue-500/50'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${info.color === 'pink' ? 'from-pink-500/10' : 'from-blue-500/10'}`}></div>
                <img src={info.img} alt={info.title} className="h-10 mx-auto mb-4 filter grayscale group-hover:grayscale-0 transition-all" />
                <h4 className="text-white font-bold mb-2">{info.title}</h4>
                <p className={`text-xl font-black ${info.color === 'pink' ? 'text-pink-500' : 'text-blue-500'}`}>{info.account}</p>
                <p className="text-sm text-gray-500">{info.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. CALL TO ACTION */}
        <div className="max-w-5xl mx-auto px-4 mb-20">
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#252538] rounded-3xl p-10 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h2 className="text-3xl font-black text-white mb-4 relative z-10">Sẵn Sàng Bước Vào Thế Giới Mới?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
              Đăng ký tài khoản ngay hôm nay để lưu tủ truyện, nhận thông báo chương mới và tham gia cộng đồng.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button onClick={() => handleAuthAction('/register')} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                Đăng Ký Miễn Phí
              </button>
              <button onClick={() => handleAuthAction('/login')} className="px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                Đăng Nhập
              </button>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AboutPage;