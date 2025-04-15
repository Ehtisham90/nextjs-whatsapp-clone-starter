import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import { FaPlay, FaStop } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import WaveSurfer from "wavesurfer.js";

function VoiceMessage({ message }) {
  const [isLoading, setIsLoading] = useState(true);
  const [{ currentChatUser, userInfo }] = useStateProvider();
  const [audioMessage, setAudioMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const waveFormRef = useRef(null);
  const waveform = useRef(null);

  // 🔊 Initialize WaveSurfer
  useEffect(() => {
    if (!waveform.current && waveFormRef.current) {
      waveform.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      waveform.current.on("finish", () => {
        setIsPlaying(false);
      });

      return () => {
        waveform.current?.destroy();
        waveform.current = null;
      };
    }
  }, []);

  // 🎧 Load audio and attach listeners
  useEffect(() => {
    if (message?.type === "audio" && message?.message) {
      const audioURL = `${HOST}/${message.message}`;
      const audio = new Audio(audioURL);
      setAudioMessage(audio);

      waveform.current?.load(audioURL);

      waveform.current?.on("ready", () => {
        setTotalDuration(waveform.current.getDuration());
        setIsLoading(false);
      });

      audio.addEventListener("loadeddata", () => setIsLoading(false));
      audio.addEventListener("ended", () => setIsPlaying(false));

      return () => {
        audio.pause();
        audio.removeEventListener("ended", () => setIsPlaying(false));
        audio.removeEventListener("loadeddata", () => setIsLoading(false));
      };
    }
  }, [message.message]);

  // ⏱ Update playback time
  useEffect(() => {
    if (audioMessage) {
      const updateTime = () => setCurrentPlaybackTime(audioMessage.currentTime);
      audioMessage.addEventListener("timeupdate", updateTime);

      return () => {
        audioMessage.removeEventListener("timeupdate", updateTime);
      };
    }
  }, [audioMessage]);

  // 🕓 Format time (MM:SS)
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handlePlayAudio = () => {
    if (audioMessage && !isLoading) {
      waveform.current?.stop();
      waveform.current?.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioMessage && waveform.current?.isPlaying()) {
      waveform.current.pause();
      audioMessage.pause();
      setIsPlaying(false);
    }
  };

  // 🎤 Only render if it's an audio message
  if (message.type !== "audio") return null;

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 md:gap-5 text-white px-3 py-3 sm:px-4 sm:py-4 text-sm rounded-md
        ${
          message.senderId === currentChatUser.id
            ? "bg-incoming-background"
            : "bg-outgoing-background"
        }`}
    >
      {/* 🧑 Sender avatar */}
      <div className="flex-shrink-0">
        <Avatar type="lg" image={currentChatUser?.profilePicture} />
      </div>

      {/* ▶️ Play / Stop button */}
      <div className="cursor-pointer text-lg sm:text-xl">
        {isLoading ? (
          <span className="text-xs sm:text-sm text-secondary">Loading...</span>
        ) : !isPlaying ? (
          <FaPlay onClick={handlePlayAudio} />
        ) : (
          <FaStop onClick={handlePauseAudio} />
        )}
      </div>

      {/* 🌊 Waveform + Timestamps */}
      <div className="relative w-full">
        <div
          className="w-[180px] sm:w-[240px] md:w-[260px]"
          ref={waveFormRef}
        />
        <div className="text-bubble-meta text-[10px] sm:text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
          <span>
            {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
          </span>
          <div className="flex gap-1">
            <span>{calculateTime(message.createdAt)}</span>
            {message.senderId === userInfo.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
