import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineCallEnd } from "react-icons/md";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  // 📞 Call 
  //  logic
  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => {
        console.log("📞 Call accept hua (outgoing)");
        setCallAccepted(true);
      });
    } else {
      setTimeout(() => {
        console.log("📞 Call accept hua (incoming)");
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  // 🔐 Get Token from backend
  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        console.log("✅ Token mila:", returnedToken);
        setToken(returnedToken);
      } catch (error) {
        console.error("❌ Token fetch karne mein error:", error);
      }
    };
    if (callAccepted) {
      getToken();
    }
  }, [callAccepted]);

  // 🔁 Token milne ke baad startCall chalayen
  useEffect(() => {
    if (token) {
      console.log("🚀 Token mil gaya, ab startCall chalayenge...");
      startCall();
    }
  }, [token]);

  const startCall = async () => {
    const { ZegoExpressEngine } = await import("zego-express-engine-webrtc");
    console.log("📦 Zego SDK loaded...");

    const zg = new ZegoExpressEngine(
      process.env.NEXT_PUBLIC_ZEGO_APP_ID,
      process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
    );
    setZgVar(zg);

    const callType = data.callType || "audio";
    console.log("📞 Call Type:", callType);
    console.log("👤 User Info:", userInfo);
    console.log("🛑 Room ID:", data.roomId);

    // 👂 Listen to remote stream
    zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
      console.log("📡 Stream Update:", { roomID, updateType, streamList });

      if (updateType === "ADD") {
        const rmVideo = document.getElementById("remote-video");

        const mediaElement = document.createElement(
          callType === "video" ? "video" : "audio"
        );
        mediaElement.id = streamList[0].streamID;
        mediaElement.autoplay = true;
        mediaElement.playsInline = true;
        mediaElement.muted = false;

        if (rmVideo) {
          rmVideo.appendChild(mediaElement);
          console.log("✅ Media element appended:", mediaElement);
        }

        try {
          const remoteStream = await zg.startPlayingStream(
            streamList[0].streamID,
            {
              audio: true,
              video: callType === "video",
            }
          );
          mediaElement.srcObject = remoteStream;
          console.log("📡 Remote stream playing:", remoteStream);
        } catch (err) {
          console.error("❌ Error playing remote stream:", err);
        }
      }

      if (
        updateType === "DELETE" &&
        zg &&
        localStream &&
        streamList[0]?.streamID
      ) {
        console.log("🚫 Stream removed, cleaning up...");
        zg.destroyStream(localStream);
        zg.stopPublishingStream(streamList[0].streamID);
        zg.logoutRoom(data.roomId.toString());
        dispatch({ type: reducerCases.END_CALL });
      }
    });

    // 🔐 Join room
    try {
      await zg.loginRoom(
        data.roomId.toString(),
        token,
        {
          userID: userInfo.id.toString(),
          userName: userInfo.name,
        },
        { userUpdate: true }
      );
      console.log("🔓 Joined room successfully.");
    } catch (err) {
      console.error("❌ Error logging into room:", err);
      return;
    }

    // 🎥 Create and publish local stream
    try {
      const streamConfig = {
        audio: true,
        video: callType === "video",
      };

      const localStream = await zg.createStream(streamConfig);
      console.log("🎙️ Local stream created:", localStream);

      // ✅ Validate audio/video tracks
      const audioTracks = localStream.getAudioTracks();
      const videoTracks = localStream.getVideoTracks();

      if (streamConfig.audio && (!audioTracks || audioTracks.length === 0)) {
        console.error("❌ No audio tracks found in localStream");
        return;
      }
      if (streamConfig.video && (!videoTracks || videoTracks.length === 0)) {
        console.error("❌ No video tracks found in localStream");
        return;
      }

      setLocalStream(localStream);

      const localContainer = document.getElementById("local-audio");
      if (localContainer) {
        const localMediaElement = document.createElement(
          callType === "video" ? "video" : "audio"
        );
        localMediaElement.id = "local-media";
        localMediaElement.autoplay = true;
        localMediaElement.playsInline = true;
        localMediaElement.muted = true;
        localMediaElement.srcObject = localStream;
        localContainer.appendChild(localMediaElement);
        console.log("✅ Local media element added:", localMediaElement);
      }

      const streamID = `${userInfo.id}_${Date.now()}`;
      setPublishStream(streamID);
      await zg.startPublishingStream(streamID, localStream);
      console.log("🚀 Publishing local stream...");
    } catch (err) {
      console.error("❌ Error creating or publishing local stream:", err);
    }
  };

  // ❌ End call handler
  const endCall = () => {
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }

    const id = data.id;

    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: id });
    } else {
      socket.current.emit("reject-video-call", { from: id });
    }

    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="border-conversation-border border-l bg-conversation-panel-background flex flex-col h-screen overflow-hidden items-center justify-center text-white px-4 sm:px-6 md:px-4 lg:px-12">
      {/* User Info */}
      <div className="flex flex-col gap-2 items-center text-center">
        <span className="text-3xl sm:text-3xl md:text-5xl  lg:text-6xl">{data.name}</span>
        <span className="text-base sm:text-lg md:text-xl">
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling..."}
        </span>
      </div>
  
      {/* Avatar for Audio or Before Accepting Video */}
      {(!callAccepted || data.callType === "audio") && (
        <div className="my-12 sm:my-16 md:my-16 lg:my-16 flex justify-center">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full object-cover max-w-[70vw] sm:max-w-[250px] md:max-w-[280px] lg:max-w-[300px]"
          />
        </div>
      )}
  
      {/* Video Stream Area */}
      <div className="my-4 sm:my-5 relative w-full max-w-[95vw] md:max-w-[90%] lg:max-w-[80%]" id="remote-video">
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-5 md:right-5 z-10" id="local-audio"></div>
      </div>
  
      {/* End Call Button */}
      <div
        className="h-14 w-14 sm:h-16 sm:w-16 p-1 bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center rounded-full mb-6 sm:mb-8 transition-all duration-300 cursor-pointer"
        onClick={endCall}
      >
        <MdOutlineCallEnd className="text-white text-2xl sm:text-3xl" />
      </div>
    </div>
  );
  
}

export default Container;
