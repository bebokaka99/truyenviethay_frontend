import React, { useState, useRef, useCallback } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  // Ref này sẽ gắn vào lớp phủ tàng hình
  const overlayRef = useRef(null);

  // --- HÀM TÍNH TOÁN TOÁN HỌC THUẦN TÚY ---
  // Tính điểm dựa trên vị trí X tương đối trên tổng chiều rộng của lớp phủ
  const calculateRating = useCallback((clientX) => {
    if (!overlayRef.current) return 0;
    const { left, width } = overlayRef.current.getBoundingClientRect();
    
    // 1. Tính vị trí tương đối của điểm chạm so với mép trái
    let relativeX = clientX - left;

    // 2. Giới hạn (Clamp) để đảm bảo không vượt quá mép trái/phải container
    relativeX = Math.max(0, Math.min(relativeX, width));

    // 3. Tính tỷ lệ phần trăm (0.0 -> 1.0)
    const percent = relativeX / width;

    // 4. Quy đổi ra thang điểm 5
    let rawScore = percent * 5;

    // 5. Làm tròn thông minh về mức 0.5 gần nhất.
    // Sử dụng Math.ceil để tạo cảm giác nhạy hơn: chỉ cần chạm nhẹ vào vùng sao tiếp theo là tính điểm.
    // VD: 4.1 -> 8.2 -> ceil(9) -> 4.5
    let finalScore = Math.ceil(rawScore * 2) / 2;

    // Đảm bảo tối thiểu là 0.5 khi đã chạm vào vùng đánh giá, tối đa là 5
    return Math.max(0.5, Math.min(5, finalScore));
  }, []);


  // --- HANDLERS CHO CẢ MOUSE VÀ TOUCH (Dùng chung logic) ---
  const handleMove = (clientX) => {
    if (readonly) return;
    const value = calculateRating(clientX);
    setHoverRating(value);
  };

  const handleLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const handleClickEnd = (e, clientX) => {
      if (!readonly && onRate) {
          // Ngăn sự kiện click ảo trên mobile
          if (e.cancelable && e.type === 'touchend') e.preventDefault();

          // Tính toán điểm lần cuối tại vị trí nhấc tay/click
          const finalScore = calculateRating(clientX);

          if (finalScore >= 0.5) {
              onRate(finalScore);
          }
          setHoverRating(0);
      }
  };

  const displayRating = hoverRating || rating;

  return (
    // Container chính: relative để làm mốc cho lớp phủ absolute
    <div className="relative inline-block py-2">
      
      {/* --- LỚP HIỂN THỊ (VISUAL LAYER) --- */}
      {/* Lớp này chỉ để nhìn, không nhận sự kiện chuột/chạm (pointer-events-none) */}
      <div className="flex items-center gap-1 pointer-events-none">
        {[...Array(5)].map((_, i) => {
          const fullValue = i + 1;
          const halfValue = i + 0.5;
          return (
            // Thêm p-0.5 để tạo khoảng cách thị giác nhỏ nếu muốn, không ảnh hưởng vùng chạm
            <div key={i} className="relative transition-transform p-0.5">
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
      </div>
      
      {/* --- LỚP PHỦ CẢM ỨNG TÀNG HÌNH (TOUCH OVERLAY) --- */}
      {/* Đây là nơi duy nhất nhận sự kiện */}
      {!readonly && (
        <div
            ref={overlayRef}
            // absolute inset-0: Phủ kín container cha
            // z-10: Nằm đè lên trên lớp hiển thị
            // touch-none: Chặn scroll trên mobile
            // cursor-pointer: Hiển thị con trỏ tay trên PC
            className="absolute inset-0 z-10 cursor-pointer touch-none"
            
            // Sự kiện Chuột (PC)
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseLeave={handleLeave}
            onClick={(e) => handleClickEnd(e, e.clientX)}

            // Sự kiện Chạm (Mobile)
            onTouchStart={(e) => handleMove(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={(e) => handleClickEnd(e, e.changedTouches[0].clientX)}
        ></div>
      )}

      {/* Hiển thị số điểm bên cạnh (nằm ngoài khu vực sao) */}
      {!readonly && (
          <span className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 font-bold text-lg min-w-[35px] ${hoverRating > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          </span>
      )}
    </div>
  );
};

export default StarRating;