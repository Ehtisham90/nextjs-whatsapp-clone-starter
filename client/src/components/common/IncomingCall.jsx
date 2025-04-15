import { reducerCases } from "@/context/constants";
import React, { useEffect } from "react";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";

function IncomingCall() {
  const [{ incomingVoiceCall, socket }, dispatch] = useStateProvider();

  useEffect(() => {
    if (!socket?.current) return;

    const handleIncomingVoiceCall = (data) => {
      console.log("📞 Incoming voice call:", data);
      dispatch({
        type: reducerCases.SET_INCOMING_VOICE_CALL,
        incomingVoiceCall: {
          ...data.from,
          callType: data.callType,
          roomId: data.roomId,
        },
      });
    };

    socket.current.on("incoming-voice-call", handleIncomingVoiceCall);

    // 🧹 Cleanup listener when component unmounts
    return () => {
      socket.current.off("incoming-voice-call", handleIncomingVoiceCall);
    };
  }, [socket?.current]); // 🛠 precise dependency

  if (!incomingVoiceCall) return null;

  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...incomingVoiceCall,
        type: "in-coming",
      },
    });

    socket.current.emit("accept-incoming-call", {
      id: incomingVoiceCall.id,
    });

    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };

  const rejectCall = () => {
    socket.current.emit("reject-voice-call", {
      from: incomingVoiceCall.id,
    });

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="fixed bottom-8 right-6 z-50 w-80 max-w-[90vw] p-4 py-6 flex items-center gap-5 rounded-md bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2">
      <Image
        src={incomingVoiceCall.profilePicture}
        alt="avatar"
        width={70}
        height={70}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <span className="text-base font-medium">{incomingVoiceCall.name}</span>
        <span className="text-xs">Incoming Voice Call</span>
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

export default IncomingCall;
