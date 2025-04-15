import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();

  return (
    <div
      className={`p-2 rounded-lg ${
        message.senderId === currentChatUser.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className="relative">
        {/* Image with responsive sizing */}
        <Image
          src={`${HOST}/${message.message}`} // Ensure correct image path is returned from backend
          className="rounded-lg w-full sm:w-[250px] md:w-[300px] lg:w-[350px]"
          alt="asset"
          height={250}
          width={250}
        />

        <div className="absolute bottom-2 right-2 flex items-end gap-1">
          {/* Time and message status */}
          <span className="text-bubble-meta text-[10px] sm:text-[11px] pt-1 min-w-fit">
            {calculateTime(message.createdAt)}
          </span>
          <span className="text-bubble-meta">
            {message.senderId === userInfo.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
