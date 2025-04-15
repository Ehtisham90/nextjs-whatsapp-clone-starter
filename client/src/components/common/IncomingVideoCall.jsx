import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React from "react";

function IncomingVideoCall() {
  const [{ incomingVideoCall, socket }, dispatch] = useStateProvider();

  // ✅ Accept incoming video call
  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...incomingVideoCall,
        type: "in-coming",
      },
    });

    socket.current.emit("accept-incoming-call", {
      id: incomingVideoCall.id,
    });

    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall: undefined,
    });
  };

  // ❌ Reject incoming video call
  const rejectCall = () => {
    socket.current.emit("reject-video-call", {
      from: incomingVideoCall.id,
    });

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="fixed bottom-8 right-6 z-50 w-80 max-w-[90vw] p-4 py-6 flex items-center gap-5 rounded-md bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2">
      <Image
        src={incomingVideoCall.profilePicture}
        alt="avatar"
        width={70}
        height={70}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <span className="text-base font-medium">{incomingVideoCall.name}</span>
        <span className="text-xs">Incoming Video Call</span>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 px-3 py-1 text-sm rounded-full"
            onClick={rejectCall}
          >
            Reject
          </button>
          <button
            className="bg-green-500 px-3 py-1 text-sm rounded-full"
            onClick={acceptCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingVideoCall;
