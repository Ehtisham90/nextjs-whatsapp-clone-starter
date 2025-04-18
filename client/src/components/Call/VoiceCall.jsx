import React, { useEffect } from "react";
import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
const Container = dynamic(() => import("./Container"), { ssr: false });

function VoiceCall() {
  const [{ voiceCall, socket, userInfo }] = useStateProvider();

  useEffect(() => {
    if (voiceCall.type === "out-going") {
      socket.current.emit("outgoing-voice-call", {
        to: voiceCall.id,
        from: {
          id: userInfo.id,
          name: userInfo.name,
          profilePicture: userInfo.profileImage,
        },
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  }, [voiceCall]);

  return <Container data={voiceCall} />;
}

export default VoiceCall;
