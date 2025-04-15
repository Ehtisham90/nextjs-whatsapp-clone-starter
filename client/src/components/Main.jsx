import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseauth } from "@/utils/FirebaseConfig";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/ApiRoutes";
import axios from "axios";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";

function Main() {
  const router = useRouter();
  const [
    {
      userInfo,
      currentChatUser,
      messagesSearch,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);
  const socket = useRef();

  // Redirect to login
  useEffect(() => {
    if (redirectLogin) router.push("/login");
  }, [redirectLogin]);

  // Firebase auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseauth, async (currentUser) => {
      if (!currentUser) {
        setRedirectLogin(true);
      } else if (!userInfo && currentUser.email) {
        try {
          const { data } = await axios.post(CHECK_USER_ROUTE, {
            email: currentUser.email,
          });
          if (!data.status) {
            router.push("/login");
          } else if (data.data) {
            const { id, name, email, profilePicture: profileImage } = data.data;
            dispatch({
              type: reducerCases.SET_USER_INFO,
              userInfo: { id, name, email, profileImage, status: "" },
            });
          }
        } catch (err) {
          console.error("User fetch error:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [userInfo, dispatch, router]);

  // Socket connection
  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user", userInfo.id);
      dispatch({ type: reducerCases.SET_SOCKET, socket });
    }
  }, [userInfo]);

  useEffect(() => {
    if (socket.current && !socketEvent) {

    
      socket.current.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType },
        });
      });
  
      socket.current.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType },
        });
      });
      
  
      socket.current.on("voice-call-rejected", () => {
        dispatch({ type: reducerCases.END_CALL });
      });
  
      socket.current.on("video-call-rejected", () => {
        dispatch({ type: reducerCases.END_CALL });
      });
  
      setSocketEvent(true);
    }
  }, [userInfo, socketEvent]);
   

  // Load messages
  useEffect(() => {
    const getMessages = async () => {
      try {
        const {
          data: { messages },
        } = await axios.get(
          `${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`
        );
        dispatch({
          type: reducerCases.SET_MESSAGES,
          messages,
        });
      } catch (err) {
        console.error("Message fetch error:", err);
      }
    };

    if (userInfo?.id && currentChatUser?.id) {
      getMessages();
    }
  }, [userInfo, currentChatUser, dispatch]);

  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}

      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall />
        </div>
      )}

      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}

      {!videoCall && !voiceCall && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
          <ChatList />
          {currentChatUser ? (
            <div
              className={
                messagesSearch
                  ? "grid grid-cols-2 lg:grid-cols-2"
                  : "grid-cols-2 lg:grid-cols-3"
              }
            >
              <Chat />
              {messagesSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
