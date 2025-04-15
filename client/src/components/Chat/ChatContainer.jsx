import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants"; // Added
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo, socket }, dispatch] =
    useStateProvider();
  const lastMessageRef = useRef(null);

  // 🔄 Scroll to last message when messages update
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // 🔔 Handle incoming message in real-time via socket
  useEffect(() => {
    if (socket?.current) {
      socket.current.on("msg-receive", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...data.message,
          },
          fromSelf: false,
        });
      });
    }

    return () => {
      if (socket?.current) {
        socket.current.off("msg-receive");
      }
    };
  }, [socket, dispatch]);

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar px-2 sm:px-4 md:px-6">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 top-0 z-0"></div>
      <div className="relative z-40">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-2">
            {messages.length === 0 && (
              <div className="text-center text-gray-400">No messages yet</div>
            )}

            {messages.map((message, index) => {
              const messageKey = message.id || message._id || index;
              const isLastMessage = index === messages.length - 1;

              return (
                <div
                  key={messageKey}
                  className={`flex ${
                    message.senderId === currentChatUser?.id
                      ? "justify-start"
                      : "justify-end"
                  } px-1 sm:px-0`}
                  ref={isLastMessage ? lastMessageRef : null}
                >
                  {message.type === "text" && (
                    <div
                      className={`text-white px-3 py-2 text-sm rounded-md flex gap-2 items-end max-w-[75%] sm:max-w-[60%] md:max-w-[45%] ${
                        message.senderId === currentChatUser?.id
                          ? "bg-incoming-background"
                          : "bg-outgoing-background"
                      }`}
                    >
                      <span className="break-words">{message.message}</span>
                      <div className="flex gap-1 items-end">
                        <span className="text-bubble-meta text-[11px] pt-1 min-w-fit whitespace-nowrap">
                          {calculateTime(message.createdAt)}
                        </span>
                        {message.senderId === userInfo.id && (
                          <MessageStatus
                            messageStatus={message.messageStatus}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {message.type === "image" && (
                    <ImageMessage message={message} />
                  )}

                  {message.type === "audio" && (
                    <VoiceMessage message={message} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
