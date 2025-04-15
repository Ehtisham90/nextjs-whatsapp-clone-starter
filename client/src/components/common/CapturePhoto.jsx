import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

function CapturePhoto({ hide, setImage }) {
  const videoRef = useRef(null);

  // 🎥 Start webcam on mount
  useEffect(() => {
    let stream;
    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };
    startCamera();

    // 🛑 Stop webcam on unmount
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 📸 Capture frame and send image data
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 150;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 300, 150);
    setImage(canvas.toDataURL("image/jpeg"));
    hide(false);
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-lg p-4 w-[90vw] max-w-md h-[65vh] flex flex-col justify-between items-center shadow-lg z-50">
      {/* ❌ Close button */}
      <div className="w-full flex justify-end">
        <IoClose
          className="h-8 w-8 text-white cursor-pointer"
          onClick={() => hide(false)}
        />
      </div>

      {/* 📹 Video preview */}
      <div className="flex justify-center">
        <video
          ref={videoRef}
          autoPlay
          className="rounded-md w-full h-auto max-h-52 object-cover"
        />
      </div>

      {/* ⭕ Capture button */}
      <button
        className="h-14 w-14 bg-white rounded-full border-2 border-teal-400 cursor-pointer mb-4"
        onClick={capturePhoto}
      />
    </div>
  );
}

export default CapturePhoto;
