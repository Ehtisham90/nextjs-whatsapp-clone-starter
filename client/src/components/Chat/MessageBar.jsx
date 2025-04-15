import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE, GET_LAST_MESSAGE_ROUTE } from "@/utils/ApiRoutes"; // GET_LAST_MESSAGE_ROUTE added
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";

const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [lastMessage, setLastMessage] = useState(""); // Last message storage

  // Fetch last message function
  const fetchLastMessage = async () => {
    try {
      const response = await axios.get(GET_LAST_MESSAGE_ROUTE, {
        params: { to: currentChatUser.id, from: userInfo.id },
      });
      if (response.data && response.data.message) {
        setLastMessage(response.data.message); // Store last message
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (currentChatUser?.id) {
      fetchLastMessage(); // Fetch last message when a user is selected
    }
  }, [currentChatUser]);

  const PhotoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });
      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: response.data.message,
        });
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message,
          },
          fromSelf: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const sendMessage = async () => {
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message,
      });

      socket.current.emit("send-msg", {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message: data.message,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.message,
        },
        fromSelf: true,
      });
      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-open") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  return (
    <div className="bg-panel-header-background h-14 px-4 flex items-center gap-6 relative">
      {/* Last message display */}
      {lastMessage && (
        <div className="text-sm text-gray-500 mb-2">
          <p>Last message: {lastMessage}</p>
        </div>
      )}

      {!showAudioRecorder && (
        <>
          <div className="flex gap-4 sm:gap-6">
            {/* Emoji button */}
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              id="emoji-open"
              onClick={handleEmojiModal}
            />
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div
                className="absolute bottom-24 left-1/4 sm:left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}

            {/* Attachment button */}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach File"
              onClick={() => setGrabPhoto(true)}
            />
          </div>

          {/* Message input */}
          <div className="w-full rounded-lg h-8 flex items-center mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Type a message"
              className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-4 sm:px-5 py-4 w-full"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>

          {/* Send/Record button */}
          <div className="flex w-10 items-center justify-center">
            <button>
              {message.length ? (
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send message"
                  onClick={sendMessage}
                />
              ) : (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Record"
                  onClick={() => setShowAudioRecorder(true)}
                />
              )}
            </button>
          </div>
        </>
      )}

      {/* Photo picker */}
      {grabPhoto && <PhotoPicker onChange={PhotoPickerChange} />}

      {/* Audio recorder */}
      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
