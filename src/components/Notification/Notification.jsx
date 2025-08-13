import React from "react";

export const Notification = ({ message, type, timestamp }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === "error"
          ? "bg-red-500/90 text-white"
          : type === "success"
          ? "bg-green-500/90 text-white"
          : "bg-blue-500/90 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="font-medium">{message}</span>
      </div>
      <div className="text-xs mt-1 opacity-80">
        {timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Notification;
