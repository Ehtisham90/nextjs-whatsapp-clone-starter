import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const audioRef = useRef(null);
  const mediaRecordedRef = useRef(null);
  const waveFormRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (waveFormRef.current) {
        const wavesurfer = WaveSurfer.create({
          container: waveFormRef.current,
          waveColor: "#ccc",
          progressColor: "#4a9eff",
          cursorColor: "#7ae3c3",
          barWidth: 2,
          height: 30,
          responsive: true,
        });
  
        setWaveform(wavesurfer);
        wavesurfer.on("finish", () => setIsPlaying(false));
      }
    }, 100); // 🕐 slight delay lets DOM mount
  
    return () => clearTimeout(timeout);
  }, []);
  


  // 🎵 Load waveform when blob is ready
  useEffect(() => {
    if (recordedBlob && waveform) {
      const audioURL = URL.createObjectURL(recordedBlob);
      waveform.load(audioURL);
    }
  }, [recordedBlob, waveform]);

  // ⏱ Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 📤 Send audio recording to backend
  const sendRecording = async () => {
    if (isSending || !recordedBlob) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("audio", recordedBlob, "recording.ogg");

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });

      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser.id,
          from: userInfo.id,
          message: response.data.message,
        });

        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: response.data.message,
          fromSelf: true,
        });

        // ✅ Reset and hide after send
        setRecordedBlob(null);
        setRecordedAudio(null);
        setIsRecording(false);
        setIsPlaying(false);
        setRecordingDuration(0);
        setCurrentPlaybackTime(0);
        setTotalDuration(0);
        hide();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSending(false);
    }
  };

  // ⏯️ Sync playback time display
  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () =>
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
    }
  }, [recordedAudio]);

  // 🎙 Start recording
  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setRecordedAudio(null);
    setRecordedBlob(null);
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecordedRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          setRecordedBlob(blob);
          const audioURL = URL.createObjectURL(blob);
          setRecordedAudio(new Audio(audioURL));
        };
        mediaRecorder.start();
      })
      .catch((err) => console.error("Mic access error:", err));
  };

  // 🛑 Stop recording
  const handleStopRecording = () => {
    if (mediaRecordedRef.current && isRecording) {
      mediaRecordedRef.current.stop();
      setIsRecording(false);
    }
  };

  // ▶️ Play recording
  const handlePlayRecording = () => {
    if (recordedAudio && waveform) {
      waveform.stop(); // Ensure waveform exists before stopping
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  

  // ⏸ Pause recording
  const handlePauseRecording = () => {
    if (waveform?.isPlaying()) {
      waveform.pause();
      recordedAudio.pause();
      setIsPlaying(false);
    }
  };

  // ⏱ Format duration
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-wrap gap-2 w-full justify-end items-center text-2xl px-2 sm:px-4">
      {/* 🗑 Close/Delete */}
      <FaTrash className="text-panel-header-icon cursor-pointer" onClick={hide} />

      {/* 🎛 Recording + waveform UI */}
      <div className="flex flex-1 max-w-[75%] sm:max-w-[60%] md:max-w-[50%] items-center gap-3 bg-search-input-container-background rounded-full px-4 py-2 text-white text-base drop-shadow-md">
        {isRecording ? (
          <div className="text-red-500 animate-pulse whitespace-nowrap">
            Recording <span>{recordingDuration}s</span>
          </div>
        ) : recordedAudio && (
          <>
            {!isPlaying ? (
              <FaPlay onClick={handlePlayRecording} className="cursor-pointer" />
            ) : (
              <FaPauseCircle onClick={handlePauseRecording} className="cursor-pointer" />
            )}
            <div className="w-32 sm:w-40 md:w-60" ref={waveFormRef} />
            <span className="min-w-[40px] text-sm">
              {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
            </span>
          </>
        )}
        <audio ref={audioRef} hidden />
      </div>

      {/* 🎤 Mic / Stop */}
      {!isRecording ? (
        <FaMicrophone
          className="text-red-500 cursor-pointer"
          onClick={handleStartRecording}
        />
      ) : (
        <FaStop
          className="text-red-500 cursor-pointer"
          onClick={handleStopRecording}
        />
      )}

      {/* 📤 Send */}
      <MdSend
        className="text-panel-header-icon cursor-pointer"
        title="Send"
        onClick={sendRecording}
      />
    </div>
  );
}

export default CaptureAudio;
