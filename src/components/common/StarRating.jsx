import React, { useState, useRef, useCallback } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef(null);

  // --- HÀM TÍNH TOÁN CHUNG (CHO CẢ MOUSE VÀ TOUCH) ---
  // Hàm này xác định điểm dựa trên element cụ thể đang được tương tác
  const calculateRatingInStar = useCallback((clientX, starContainer) => {
    const { left, width } = starContainer.getBoundingClientRect();
    // Lấy index từ attribute data-index đã gán
    const index = parseInt(starContainer.getAttribute('data-index'), 10);
    
    // Tính vị trí tương đối trong sao đó
    // Math.max/min để đảm bảo nếu chạm hơi lệch ra ngoài padding vẫn tính đúng rìa
    const relativeX = Math.max(0, Math.min(clientX - left, width));
    const percent = relativeX / width;

    // Nếu vị trí ở nửa trái (< 50%) -> X.5, ngược lại -> X.0
    // Sử dụng ngưỡng 0.5 là chuẩn xác nhất.
    return percent < 0.5 ? index + 0.5 : index + 1;
  }, []);


  // --- HANDLERS CHO PC (MOUSE) ---
  // Mouse thì đơn giản vì e.currentTarget chính là element đang hover
  const handleMouseMove = (e) => {
    if (readonly) return;
    const value = calculateRatingInStar(e.clientX, e.currentTarget);
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
  // Touch phức tạp hơn vì phải tìm element dựa trên tọa độ
  const handleTouchMove = (e) => {
      if (readonly || !containerRef.current) return;
      
      // Ngăn browser cuộn trang khi đang kéo sao
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      // Tìm element tại vị trí ngón tay
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      // Kiểm tra:
      // 1. Có tìm thấy target không?
      // 2. Target đó có nằm trong component StarRating này không?
      if (!target || !containerRef.current.contains(target)) {
          // Nếu trượt ra ngoài khu vực sao, có thể reset hover hoặc giữ nguyên cái cuối cùng
          // Ở đây chọn giữ nguyên để trải nghiệm tốt hơn.
          return; 
      }

      // Tìm thẻ div chứa sao gần nhất (có attribute data-index)
      const starContainer = target.closest('[data-index]');

      if (starContainer) {
          // Nếu tìm thấy, tính toán điểm trong sao đó
          const value = calculateRatingInStar(touch.clientX, starContainer);
          setHoverRating(value);
      }
  };

  // Xử lý khi vừa chạm vào (tương tự touchmove)
  const handleTouchStart = (e) => {
       handleTouchMove(e);
  }

  const handleTouchEnd = (e) => {
      if (!readonly && onRate) {
          if (e.cancelable) e.preventDefault();
          
          // Gửi điểm số hiện tại (hoverRating) đi
          // Đảm bảo điểm > 0 mới gửi
          if (hoverRating >= 0.5) {
              onRate(hoverRating);
          }
          // Reset hover sau khi chọn xong
          setHoverRating(0);
      }
  };

  const displayRating = hoverRating || rating;

  return (
    <div 
        ref={containerRef}
        // touch-action: none cực kỳ quan trọng để browser không can thiệp vào thao tác vuốt
        className="flex items-center gap-1 select-none touch-none" 
        onMouseLeave={handleMouseLeave}
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
            data-index={i} // <-- QUAN TRỌNG: Gán index vào DOM để tìm lại sau này
            // Thêm padding (p-1 hoặc p-1.5) để tăng diện tích chạm cho dễ
            className={`relative cursor-${readonly ? 'default' : 'pointer'} transition-transform hover:scale-110 p-1.5`} 
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          >
              {/* Icon ngôi sao */}
              {/* pointer-events-none bắt buộc để document.elementFromPoint bỏ qua icon và trúng vào div cha */}
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
          <span className={`ml-2 font-bold text-lg min-w-[35px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;