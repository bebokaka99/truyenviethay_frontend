import React, { useState, useRef } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef(null);

  // Hàm tính toán điểm dựa trên vị trí con trỏ/ngón tay
  const calculateRating = (clientX, currentTarget) => {
    const { left, width } = currentTarget.getBoundingClientRect();
    const percent = (clientX - left) / width;
    const index = Array.from(containerRef.current.children).indexOf(currentTarget);
    
    // Nếu vị trí ở nửa trái (< 50%) -> X.5, ngược lại -> X.0
    return percent < 0.5 ? index + 0.5 : index + 1;
  };

  // Xử lý cho chuột (PC)
  const handleMouseMove = (e) => {
    if (readonly) return;
    const value = calculateRating(e.clientX, e.currentTarget);
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

  // Xử lý cho cảm ứng (Mobile/Tablet)
  const handleTouchMove = (e) => {
      if (readonly) return;
      // Ngăn chặn hành vi cuộn trang mặc định khi đang kéo trên sao
      e.preventDefault(); 
      const touch = e.touches[0];
      // Tìm element ngôi sao đang được chạm vào
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Kiểm tra xem element đó có phải là một ngôi sao trong component này không
      if (targetElement && containerRef.current.contains(targetElement)) {
           // Tìm thẻ div cha chứa icon ngôi sao (vì targetElement có thể là thẻ svg hoặc path bên trong)
           const starContainer = targetElement.closest('div.relative');
           if (starContainer) {
               const value = calculateRating(touch.clientX, starContainer);
               setHoverRating(value);
           }
      }
  };

  const handleTouchEnd = (e) => {
      if (!readonly && onRate) {
          e.preventDefault();
          // Khi nhấc tay lên, nếu đã có điểm hover thì gửi điểm đó
          if (hoverRating > 0) {
              onRate(hoverRating);
          }
          // Reset hover về 0
          setHoverRating(0);
      }
  };


  const displayRating = hoverRating || rating;

  return (
    <div 
        ref={containerRef}
        className="flex items-center gap-1 touch-none" // touch-none để browser không can thiệp vào sự kiện chạm
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove} // Thêm sự kiện touch
        onTouchEnd={handleTouchEnd}   // Thêm sự kiện touch end
    >
      {[...Array(5)].map((_, i) => {
        const fullValue = i + 1;
        const halfValue = i + 0.5;

        return (
          <div
            key={i}
            className={`relative cursor-${readonly ? 'default' : 'pointer'} transition-transform hover:scale-110 p-0.5`} // Thêm padding nhỏ để dễ chạm hơn
            onMouseMove={handleMouseMove}
            onClick={handleClick}
          >
              {/* Render Icon dựa trên giá trị */}
              {displayRating >= fullValue ? (
                  <RiStarFill className={`${size} text-yellow-400 drop-shadow-md pointer-events-none`} /> // pointer-events-none để sự kiện chạm xuyên qua icon xuống div cha
              ) : displayRating >= halfValue ? (
                  <RiStarHalfFill className={`${size} text-yellow-400 drop-shadow-md pointer-events-none`} />
              ) : (
                  <RiStarLine className={`${size} text-gray-600 pointer-events-none`} />
              )}
          </div>
        );
      })}
      
      {/* Hiển thị điểm số bên cạnh cho rõ */}
      {!readonly && (
          <span className={`ml-2 font-bold text-lg ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;