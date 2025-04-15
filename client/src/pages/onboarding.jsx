import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStateProvider } from "@/context/StateContext";
import Input from "@/components/common/Input";
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { useRouter } from "next/router";
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";

function Onboarding() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [name, setName] = useState(userInfo?.name || "");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState("/default_avatar.png");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userInfo?.email) {
      router.push("/login"); // User is not logged in
    } else if (!newUser) {
      router.push("/"); // User is already onboarded
    }
  }, [newUser, userInfo, router]);

  const onboardUserHandler = async () => {
    if (validateDetails()) {
      const email = userInfo?.email;
      try {
        const { data } = await axios.post(ONBOARD_USER_ROUTE, {
          email,
          name,
          about,
          image,
        });

        if (data.status) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: false,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id: data.user?.id,
              name,
              email,
              profileImage: image,
              status: about,
            },
          });
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setErrorMessage("Name must be at least 3 characters long");
    }
  };

  const validateDetails = () => {
    return name.length >= 3;
  };

  return (
    <div className="bg-panel-header-background h-screen w-screen text-white flex items-center justify-center flex-col gap-4 p-4 sm:p-8">
      <div className="flex items-center justify-center gap-2">
        <Image src="/whatsapp.gif" alt="whatsapp" height={200} width={200} />
        <span className="text-4xl sm:text-5xl md:text-6xl">Whatsapp</span>
      </div>
      <h2 className="text-2xl sm:text-3xl">Create your Profile</h2>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-8 mt-6 w-full sm:w-auto">
        <div className="flex flex-col items-center sm:items-start gap-6 w-full sm:w-[300px]">
          <Input name="Display Name" state={name} setState={setName} label />
          <Input name="About" state={about} setState={setAbout} label />
          <button
            className="flex items-center justify-center gap-3 bg-search-input-container-background p-4 rounded-lg w-full"
            onClick={onboardUserHandler}
          >
            Create a Profile
          </button>
        </div>

        <div className="flex items-center justify-center w-full sm:w-auto">
          <Avatar type="xl" image={image} setImage={setImage} />
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
