import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] = useStateProvider();

  // 📥 Fetch initial contacts when user info is available
  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);

        // ✅ Set online users & full contact list
        dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
        dispatch({ type: reducerCases.SET_USER_CONTACTS, userContacts: users });
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    if (userInfo?.id) getContacts();
  }, [userInfo]);

  return (
    <div
      className="bg-search-input-container-background flex-1 overflow-y-auto max-h-full custom-scrollbar
                 sm:min-w-[300px] md:min-w-[340px] xl:min-w-[380px]"
    >
      {/* 👥 Render filtered or full contact list */}
      {(filteredContacts?.length > 0 ? filteredContacts : userContacts).map((contact) => (
        <ChatLIstItem data={contact} key={contact.id} />
      ))}
    </div>
  );
}

export default List;
