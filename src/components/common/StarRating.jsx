import React, { useState, useRef, useCallback } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef(null);

  // --- HÀM TÍNH TOÁN ĐIỂM TRÊN MỘT NGÔI SAO CỤ THỂ ---
  // Hàm này chỉ quan tâm đến vị trí tương đối bên trong một starContainer duy nhất
  const calculateRatingInStar = useCallback((clientX, starContainer) => {
    const { left, width } = starContainer.getBoundingClientRect();
    const index = parseInt(starContainer.getAttribute('data-index'), 10);
    
    // Tính vị trí X tương đối của điểm chạm so với mép trái của ngôi sao này
    const relativeX = clientX - left;
    const percent = relativeX / width;

    // Quy tắc: Chạm vào nửa trái (< 50%) -> X.5, ngược lại -> X.0
    return percent < 0.5 ? index + 0.5 : index + 1;
  }, []);


  // --- HANDLERS CHO PC (MOUSE) ---
  const handleMouseMove = (e) => {
    if (readonly) return;
    // Với chuột, e.currentTarget chính là thẻ div bao quanh ngôi sao
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
  const handleTouchMove = (e) => {
      if (readonly || !containerRef.current) return;
      
      // Ngăn browser cuộn trang khi đang vuốt trên khu vực này
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      // 1. Bắn một tia tại vị trí ngón tay để xem nó trúng phần tử nào
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      // 2. Đảm bảo phần tử đó nằm trong component rating này
      if (!target || !containerRef.current.contains(target)) return;

      // 3. Tìm thẻ div bao quanh ngôi sao gần nhất (thẻ có data-index)
      // Nhờ CSS mới, các thẻ này nằm sát nhau nên chắc chắn sẽ tìm thấy.
      const starContainer = target.closest('[data-index]');

      if (starContainer) {
          // 4. Tính toán điểm dựa trên ngôi sao tìm được
          const value = calculateRatingInStar(touch.clientX, starContainer);
          setHoverRating(value);
      }
  };

  const handleTouchStart = (e) => {
       handleTouchMove(e); // Xử lý ngay khi vừa chạm
  }

  const handleTouchEnd = (e) => {
      if (!readonly && onRate) {
          if (e.cancelable) e.preventDefault();
          
          // Gửi điểm số đi
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
        // touch-action: none -> Bắt buộc để chặn scroll trên mobile
        // Loại bỏ 'gap-1' để các vùng chạm sát nhau
        className="flex items-center select-none touch-none py-1"
        onMouseLeave={handleMouseLeave}
        // Gán sự kiện Touch vào container cha để bắt được thao tác vuốt liên tục
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
            data-index={i} // Index để định danh ngôi sao
            // CSS QUAN TRỌNG:
            // 1. flex-1: Để các ngôi sao chia đều không gian
            // 2. p-1: Tạo vùng đệm xung quanh icon, giúp dễ chạm hơn
            // 3. KHÔNG CÓ pointer-events-none: Để nó nhận được sự kiện touch/mouse
            className={`relative flex-1 cursor-${readonly ? 'default' : 'pointer'} transition-transform hover:scale-110 p-1 flex justify-center`} 
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          >
              {/* Icon ngôi sao */}
              {/* pointer-events-none trên icon để sự kiện luôn trúng vào div cha */}
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
      
      {/* Hiển thị điểm số */}
      {!readonly && (
          <span className={`ml-2 font-bold text-lg min-w-[35px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;