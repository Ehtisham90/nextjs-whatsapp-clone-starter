import React, { useState, useMemo } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { v4 as uuidv4 } from "uuid";
import ContextMenu from "../common/ContextMenu";

function ChatHeader() {
  const [{ currentChatUser, onlineUsers }, dispatch] = useStateProvider();
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

  const showContextMenu = (e) => {
    e.preventDefault();
    const x = Math.min(e.pageX - 50, window.innerWidth - 150); // Prevent overflow
    const y = Math.min(e.pageY + 20, window.innerHeight - 100);
    setContextMenuCordinates({ x, y });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = useMemo(
    () => [
      {
        name: "Exit",
        callback: async () => {
          dispatch({ type: reducerCases.SET_EXIT_CHAT });
        },
      },
    ],
    [dispatch]
  );

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
      {/* Avatar and user status section */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10">
        {/* Avatar with smaller size for mobile screens */}
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong text-sm sm:text-base">
            {currentChatUser?.name}
          </span>
          <span className="text-secondary text-xs sm:text-sm">
            {onlineUsers.includes(currentChatUser?.id) ? "online" : "offline"}
          </span>
        </div>
      </div>

      {/* Icons section for voice/video call, search, and context menu */}
      <div className="flex gap-4 sm:gap-6 md:gap-8">
        {/* Voice Call Icon */}
        <MdCall
          className="text-panel-header-icon cursor-pointer text-lg sm:text-xl"
          onClick={handleVoiceCall}
          aria-label="Start Voice Call"
        />
        {/* Video Call Icon */}
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-lg sm:text-xl"
          onClick={handleVideoCall}
          aria-label="Start Video Call"
        />
        {/* Search Icon */}
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-lg sm:text-xl"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGE_SEARCH })}
          aria-label="Search Messages"
        />
        {/* Context Menu Icon */}
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-lg sm:text-xl"
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
          aria-label="Open Context Menu"
        />
        {/* Context Menu Component */}
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
