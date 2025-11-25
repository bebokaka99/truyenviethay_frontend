import React, { useState, useRef } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef(null);

  // --- LOGIC TÍNH TOÁN CỐT LÕI (DÙNG CHO CẢ MOUSE VÀ TOUCH) ---
  // Tính điểm dựa trên vị trí X tương đối trong TOÀN BỘ container
  const calculateRating = (clientX) => {
      if (!containerRef.current) return 0;
      const { left, width } = containerRef.current.getBoundingClientRect();
      
      // 1. Tính vị trí tương đối của điểm chạm so với mép trái container
      let relativeX = clientX - left;

      // 2. Giới hạn (Clamp) để đảm bảo không vượt quá mép trái/phải
      // Nếu kéo ra ngoài bên trái -> 0, kéo ra ngoài bên phải -> max width
      relativeX = Math.max(0, Math.min(relativeX, width));

      // 3. Tính tỷ lệ phần trăm vị trí trên tổng chiều rộng (0.0 -> 1.0)
      const percent = relativeX / width;
      
      // 4. Quy đổi ra thang điểm 5 (0.0 -> 5.0)
      let rawScore = percent * 5;

      // 5. Làm tròn thông minh về mức 0.5 gần nhất
      // Công thức: Nhân 2, làm tròn tới số nguyên gần nhất, rồi chia lại cho 2.
      // VD: 4.2 -> 8.4 -> round(8) -> 4.0
      // VD: 4.3 -> 8.6 -> round(9) -> 4.5
      // VD: 4.8 -> 9.6 -> round(10) -> 5.0
      let finalScore = Math.round(rawScore * 2) / 2;

      // Đảm bảo điểm tối thiểu là 0.5 khi đã chạm vào vùng đánh giá
      return finalScore < 0.5 ? 0.5 : finalScore;
  };

  // --- HANDLERS CHO PC (MOUSE) ---
  const handleMouseMove = (e) => {
    if (readonly) return;
    // MouseMove trên PC cũng dùng logic tính toán tổng thể này luôn cho đồng nhất
    const value = calculateRating(e.clientX);
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const handleClick = () => {
      // Khi click, dùng giá trị hover hiện tại (đã được tính toán chính xác)
      if (!readonly && onRate && hoverRating > 0) {
          onRate(hoverRating);
      }
  };

  // --- HANDLERS CHO MOBILE (TOUCH) ---
  const handleTouchStart = (e) => {
      if (readonly) return;
      const score = calculateRating(e.touches[0].clientX);
      setHoverRating(score);
  }

  const handleTouchMove = (e) => {
      if (readonly) return;
      // Ngăn scroll trang khi đang vuốt chọn sao
      if (e.cancelable) e.preventDefault(); 
      
      const score = calculateRating(e.touches[0].clientX);
      setHoverRating(score);
  };

  const handleTouchEnd = (e) => {
      if (!readonly && onRate) {
          if (e.cancelable) e.preventDefault();
          
          // Gửi điểm số đi
          if (hoverRating > 0) {
              onRate(hoverRating);
          }
          // Reset hover
          setHoverRating(0);
      }
  };

  const displayRating = hoverRating || rating;

  return (
    <div 
        ref={containerRef}
        // touch-action: none -> QUAN TRỌNG: Báo trình duyệt không can thiệp scroll/zoom ở khu vực này
        // select-none -> Không bôi đen khi kéo
        className="flex items-center gap-1 select-none touch-none py-2" // Thêm py-2 để tăng vùng chạm theo chiều dọc
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove} // Gán sự kiện chuột vào container tổng
        onClick={handleClick}         // Gán sự kiện click vào container tổng
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {[...Array(5)].map((_, i) => {
        const fullValue = i + 1;
        const halfValue = i + 0.5;

        return (
          // pointer-events-none trên các div con là QUAN TRỌNG.
          // Nó đảm bảo mọi sự kiện chuột/chạm đều đi thẳng qua chúng và được container cha xử lý.
          <div key={i} className="relative transition-transform hover:scale-110 pointer-events-none p-0.5">
              {/* Icon ngôi sao */}
              {displayRating >= fullValue ? (
                  <RiStarFill className={`${size} text-yellow-400 drop-shadow-md`} />
              ) : displayRating >= halfValue ? (
                  <RiStarHalfFill className={`${size} text-yellow-400 drop-shadow-md`} />
              ) : (
                  <RiStarLine className={`${size} text-gray-600`} />
              )}
          </div>
        );
      })}
      
      {/* Hiển thị điểm số bên cạnh */}
      {!readonly && (
          <span className={`ml-2 font-bold text-lg min-w-[35px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;