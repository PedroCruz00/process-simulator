import React from "react";

export const Notification = ({ message, type, timestamp }) => {
  return (
    <div
      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-300 text-center backdrop-blur-sm border relative overflow-hidden ${
        type === "error"
          ? "bg-red-500/95 text-white border-red-300/50"
          : type === "success"
          ? "bg-green-500/95 text-white border-green-300/50"
          : "bg-blue-500/95 text-white border-blue-300/50"
      }`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-sm ${
              type === "error"
                ? "bg-red-200"
                : type === "success"
                ? "bg-green-200"
                : "bg-blue-200"
            }`}
          ></div>
          <span className="font-semibold text-xs sm:text-sm">{message}</span>
        </div>
        <div className="text-xs mt-1 sm:mt-2 opacity-80 font-medium">
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Notification;
