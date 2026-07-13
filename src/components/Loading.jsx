import React from "react";

const Loading = ({ size = "md", fullScreen = false, text = "Đang tải..." }) => {
  // Định nghĩa kích thước của spinner
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  // Style cơ bản cho spinner (hiệu ứng quay tròn)
  const spinnerStyle = `${sizeClasses[size] || sizeClasses.md} border-gray-200 border-t-blue-500 rounded-full animate-spin`;

  // Nếu là loading toàn màn hình (phủ lên tất cả)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
          <div className={spinnerStyle}></div>
          {text && (
            <p className="mt-3 text-sm font-medium text-gray-700 animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Nếu là loading component bình thường (nhét vào đâu cũng được)
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full min-h-[100px]">
      <div className={spinnerStyle}></div>
      {text && <p className="mt-2 text-sm font-medium text-gray-500">{text}</p>}
    </div>
  );
};

export default Loading;
