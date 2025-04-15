import React, { useEffect } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseauth } from "@/utils/FirebaseConfig";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import axios from "axios";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

function Login() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();

  useEffect(() => {
    if (userInfo?.id && !newUser) router.push("/");
  }, [userInfo, newUser]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseauth, provider);
      const { displayName: name, email, photoURL: profilePicture } = result.user;

      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, { email });
        console.log({ data });

        if (!data.status) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profilePicture,
              status: "",
            },
          });
          router.push("/onboarding");
        } else {
          const { id, name, email, profilePicture: profileImage, status } = data.data;
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id,
              name,
              email,
              profileImage,
              status: "",
            },
          });
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-white">
        <Image src="/whatsapp.gif" alt="whatsapp" height={150} width={150} />
        <span className="text-4xl sm:text-5xl md:text-6xl">Whatsapp</span>
      </div>
      <button
        className="flex items-center justify-center gap-4 sm:gap-6 bg-search-input-container-background p-4 sm:p-5 rounded-lg w-full sm:w-auto"
        onClick={handleLogin}
      >
        <FcGoogle className="text-3xl sm:text-4xl" />
        <span className="text-white text-xl sm:text-2xl">Login with Google</span>
      </button>
    </div>
  );
}

export default Login;
