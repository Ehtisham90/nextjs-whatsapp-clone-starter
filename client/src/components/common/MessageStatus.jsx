import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ messageStatus }) {
  return (
    <>
      {messageStatus === "sent" && <BsCheck className="text-base md:text-lg" />}
      {messageStatus === "delivered" && <BsCheckAll className="text-base md:text-lg" />}
      {messageStatus === "read" && (
        <BsCheckAll className="text-base md:text-lg text-icon-ack" />
      )}
    </>
  );
}

export default MessageStatus;
