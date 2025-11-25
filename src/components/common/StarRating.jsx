import React, { useState, useRef } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef(null);

  // --- HÀM TÍNH TOÁN ĐIỂM CHO MOUSE (PC) ---
  const calculateMouseRating = (clientX, starElement) => {
    const { left, width } = starElement.getBoundingClientRect();
    const percent = (clientX - left) / width;
    const index = Array.from(containerRef.current.children).indexOf(starElement);
    // Nếu vị trí ở nửa trái (< 50%) -> X.5, ngược lại -> X.0
    return percent < 0.5 ? index + 0.5 : index + 1;
  };

  // --- HÀM TÍNH TOÁN ĐIỂM CHO TOUCH (MOBILE) ---
  // Tính toán dựa trên vị trí tương đối trong TOÀN BỘ container
  const calculateTouchRating = (touchX) => {
      if (!containerRef.current) return 0;
      const { left, width } = containerRef.current.getBoundingClientRect();
      
      // Tính vị trí tương đối của điểm chạm so với mép trái container
      let relativeX = touchX - left;

      // Giới hạn không cho vượt quá mép trái hoặc phải
      relativeX = Math.max(0, Math.min(relativeX, width));

      // Tính tỷ lệ phần trăm
      const percent = relativeX / width;
      
      // Quy đổi ra thang 5
      let rawScore = percent * 5;

      // Làm tròn lên mức 0.5 gần nhất (VD: 4.1 -> 4.5, 4.6 -> 5.0)
      // Cách làm tròn này tạo cảm giác nhạy hơn trên màn hình cảm ứng
      let finalScore = Math.ceil(rawScore * 2) / 2;

      // Đảm bảo tối thiểu là 0.5 và tối đa là 5
      return Math.max(0.5, Math.min(5, finalScore));
  };
  // -------------------------------------------


  // --- HANDLERS CHO PC (MOUSE) ---
  const handleMouseMove = (e) => {
    if (readonly) return;
    const value = calculateMouseRating(e.clientX, e.currentTarget);
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const handleClick = () => {
      if (!readonly && onRate && hoverRating > 0) {
          onRate(hoverRating);
      }
  };

  // --- HANDLERS CHO MOBILE (TOUCH) ---
  const handleTouchStart = (e) => {
      if (readonly) return;
      // Tính toán ngay khi vừa chạm vào
      const score = calculateTouchRating(e.touches[0].clientX);
      setHoverRating(score);
  }

  const handleTouchMove = (e) => {
      if (readonly) return;
      // Ngăn chặn hành vi cuộn trang khi đang kéo trên sao
      if (e.cancelable) e.preventDefault(); 
      
      const score = calculateTouchRating(e.touches[0].clientX);
      setHoverRating(score);
  };

  const handleTouchEnd = (e) => {
      if (!readonly && onRate) {
          // Ngăn chặn sự kiện click chuột ảo bắn ra sau khi touch end
          if (e.cancelable) e.preventDefault();
          
          // Gửi điểm số đi nếu hợp lệ
          if (hoverRating >= 0.5) {
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
        className="flex items-center gap-1 select-none" // select-none để tránh bôi đen khi kéo nhanh
        onMouseLeave={handleMouseLeave}
        // Gán sự kiện Touch vào container cha
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {[...Array(5)].map((_, i) => {
        const fullValue = i + 1;
        const halfValue = i + 0.5;

        return (
          <div
            key={i}
            // Thêm padding để tăng diện tích trỏ chuột/chạm
            className={`relative cursor-${readonly ? 'default' : 'pointer'} transition-transform hover:scale-110 p-1`} 
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          >
              {/* Icon ngôi sao */}
              {displayRating >= fullValue ? (
                  <RiStarFill className={`${size} text-yellow-400 drop-shadow-md pointer-events-none`} />
              ) : displayRating >= halfValue ? (
                  <RiStarHalfFill className={`${size} text-yellow-400 drop-shadow-md pointer-events-none`} />
              ) : (
                  <RiStarLine className={`${size} text-gray-600 pointer-events-none`} />
              )}
          </div>
        );
      })}
      
      {/* Hiển thị điểm số bên cạnh */}
      {!readonly && (
          <span className={`ml-2 font-bold text-lg min-w-[30px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;