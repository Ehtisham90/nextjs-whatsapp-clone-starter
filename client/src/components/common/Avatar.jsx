import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });

  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
  };

  // 👉 Trigger hidden file picker programmatically
  useEffect(() => {
    if (grabPhoto) {
      const fileInput = document.getElementById("photo-picker");
      fileInput?.click();
      document.body.onfocus = () => {
        setTimeout(() => setGrabPhoto(false), 1000);
      };
    }
  }, [grabPhoto]);

  // 📋 Right-click context menu options
  const contextMenuOptions = [
    { name: "Take Photo", callback: () => setShowCapturePhoto(true) },
    { name: "Choose From Library", callback: () => setShowPhotoLibrary(true) },
    { name: "Upload Photo", callback: () => setGrabPhoto(true) },
    { name: "Remove Photo", callback: () => setImage("/default_avatar.png") },
  ];

  const PhotoPickerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const avatarSizes = {
    sm: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-48 w-48 sm:h-52 sm:w-52 lg:h-56 lg:w-56 xl:h-60 xl:w-60",
  };

  const renderAvatar = () => {
    if (type === "sm" || type === "lg") {
      return (
        <div className={`relative ${avatarSizes[type]}`}>
          <Image src={image} alt="avatar" className="rounded-full object-cover" fill />
        </div>
      );
    }

    if (type === "xl") {
      return (
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* 🖱 Hover Overlay for 'Change Photo' */}
          <div
            className={`absolute top-0 left-0 h-full w-full rounded-full z-10 flex flex-col items-center justify-center text-center bg-photopicker-overlay-background gap-2
              ${hover ? "visible" : "hidden"}`}
            onClick={showContextMenu}
            id="context-opener"
          >
            <FaCamera className="text-2xl" />
            <span className="text-xs leading-tight">
              Change <br /> profile <br /> photo
            </span>
          </div>

          {/* 🖼 Avatar */}
          <div className={`flex items-center justify-center ${avatarSizes[type]}`}>
            <Image src={image} alt="avatar" className="rounded-full object-cover" fill />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex items-center justify-center">{renderAvatar()}</div>

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}

      {showCapturePhoto && <CapturePhoto setImage={setImage} hide={setShowCapturePhoto} />}
      {showPhotoLibrary && <PhotoLibrary setImage={setImage} hidePhotoLibrary={setShowPhotoLibrary} />}
      {grabPhoto && <PhotoPicker onChange={PhotoPickerChange} />}
    </>
  );
}

export default Avatar;
