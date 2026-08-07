import React from 'react';

const Card = ({ image, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-[80px] h-[150px] sm:w-[120px] sm:h-[210px] lg:w-[150px] lg:h-[250px] bg-[#020220] ${
        selected
          ? "border-4 border-white shadow-[0_0_25px_rgba(59,130,246,0.8)] scale-105 z-10"
          : "border-2 border-[#0000ff66] hover:border-4 hover:border-white hover:shadow-2xl hover:shadow-blue-500 hover:scale-[1.02]"
      } rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex items-center justify-center relative group`}
    >
      {image && (
        <img
          src={image}
          alt="AI Assistant"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
    </div>
  );
};

export default Card;