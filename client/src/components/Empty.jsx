import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-full border-b-4 border-b-icon-green items-center justify-center p-4 sm:p-6 md:p-8">
      <Image
        src="/whatsapp.gif"
        alt="whatsapp"
        height={200}
        width={200}
        layout="intrinsic"
        className="max-w-full h-auto"
      />
      <p className="mt-4 text-center text-sm sm:text-base md:text-lg">
        No chat selected. Please select a chat to start messaging.
      </p>
    </div>
  );
}

export default Empty;
