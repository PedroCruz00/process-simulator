import React from "react";

export const TransitionArrow = ({ from, to }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="w-8 h-1 bg-yellow-400 animate-pulse rounded-full shadow-lg"
        style={{ boxShadow: "0 0 10px #fbbf24" }}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
          <div className="w-0 h-0 border-l-4 border-l-yellow-400 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default TransitionArrow;
