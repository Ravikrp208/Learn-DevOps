import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from "../context/userContext.jsx";

import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";

const presetImages = [image2, image1, image3, image4, image5];

const Customize = () => {
  const navigate = useNavigate();
  const inputImage = useRef(null);

  const context = useContext(userDataContext) || {};
  const {
    selectedImage,
    setSelectedImage,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
  } = context;

  const [frontendImg, setFrontendImg] = useState(frontendImage || null);
  const [selected, setSelected] = useState(selectedImage || null);
  const [uploadedFile, setUploadedFile] = useState(backendImage || null);

  const handleSelectPreset = (img) => {
    setSelected(img);
    if (setSelectedImage) setSelectedImage(img);
    if (setBackendImage) setBackendImage(null);
  };

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (setBackendImage) setBackendImage(file);
      const imageUrl = URL.createObjectURL(file);
      setFrontendImg(imageUrl);
      setSelected(imageUrl);
      if (setFrontendImage) setFrontendImage(imageUrl);
      if (setSelectedImage) setSelectedImage(imageUrl);
    }
  };

  const handleSelectCustom = () => {
    if (frontendImg) {
      setSelected(frontendImg);
      if (setSelectedImage) setSelectedImage(frontendImg);
      if (setBackendImage && uploadedFile) setBackendImage(uploadedFile);
    }
  };

  const handleNext = () => {
    navigate("/customize2");
  };

  const isSelected = selected || selectedImage || frontendImg;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#030353] via-[#020230] to-[#000015] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-8 text-center text-white drop-shadow-md z-10">
        Select your <span className="text-blue-300 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Assistant Image</span>
      </h1>

      {/* Preset Cards & Custom Upload */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 max-w-5xl my-6 z-10">
        {presetImages.map((img, index) => (
          <Card
            key={index}
            image={img}
            selected={selected === img}
            onClick={() => handleSelectPreset(img)}
          />
        ))}

        {/* Uploaded Custom Image Card */}
        {frontendImg && (
          <Card
            image={frontendImg}
            selected={selected === frontendImg}
            onClick={handleSelectCustom}
          />
        )}

        {/* Upload Button Card */}
        <label
          htmlFor="custom-image-upload"
          className="w-[80px] h-[150px] sm:w-[120px] sm:h-[210px] lg:w-[150px] lg:h-[250px] bg-[#020235] border-2 border-blue-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500 cursor-pointer hover:border-4 hover:border-white flex flex-col items-center justify-center transition-all duration-300 group z-10"
        >
          <RiImageAddLine className="text-white w-[25px] h-[25px] sm:w-[32px] sm:h-[32px] lg:w-[40px] lg:h-[40px] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs text-slate-300 mt-2 font-semibold group-hover:text-white transition-colors">
            {frontendImg ? "Upload New" : "Upload"}
          </span>
        </label>

        {/* Native File Input */}
        <input
          id="custom-image-upload"
          type="file"
          ref={inputImage}
          onChange={handleImage}
          onClick={(e) => {
            e.target.value = null;
          }}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Next Button - Appears instantly when an image is selected */}
      {isSelected && (
        <button
          onClick={handleNext}
          className="min-w-[180px] h-[55px] px-8 mt-[30px] text-black font-bold bg-white rounded-full hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-lg shadow-[0_0_25px_rgba(255,255,255,0.4)] z-10"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Customize;