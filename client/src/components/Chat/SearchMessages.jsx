import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useState } from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

function SearchMessages() {
  const [{ currentChatUser, messages }, dispatch] = useStateProvider();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMessages, setSearchMessages] = useState([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = messages.filter(
        (message) =>
          message.type === "text" &&
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchMessages(filtered);
    } else {
      setSearchMessages([]);
    }
  }, [searchTerm, messages]);

  return (
    <div className="border-l border-conversation-border w-full flex flex-col z-10 max-h-screen bg-conversation-panel-background">
      {/* Header: Title & Close Button */}
      <div className="h-16 px-4 py-5 flex gap-4 items-center bg-panel-header-background text-primary-strong">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGE_SEARCH })}
        />
        <span className="text-base font-medium">Search Messages</span>
      </div>

      {/* Search Input */}
      <div className="flex items-center px-4 sm:px-6 lg:px-8 gap-3 h-14">
        <div className="bg-panel-header-background flex items-center gap-3 px-3 py-2 rounded-lg w-full">
          <BiSearchAlt2 className="text-panel-header-icon text-xl" />
          <input
            type="text"
            autoFocus // UX improvement: focuses input when opened
            placeholder={`Search messages with ${currentChatUser.name}`}
            className="bg-transparent text-sm sm:text-base text-white focus:outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Message Results Section */}
      <div className="overflow-auto custom-scrollbar h-full px-2 sm:px-4">
        {/* Placeholder message when input is empty */}
        {!searchTerm && (
          <div className="text-secondary text-sm flex justify-center mt-10 text-center">
            Search for messages with{" "}
            <span className="ml-1 font-medium text-white">{currentChatUser.name}</span>
          </div>
        )}

        {/* No results found */}
        {searchTerm && searchMessages.length === 0 && (
          <div className="text-secondary text-sm flex justify-center mt-10">
            No messages found
          </div>
        )}

        {/* Matched messages list */}
        {searchTerm && searchMessages.length > 0 && (
          <div className="flex flex-col w-full">
            {searchMessages.map((message, index) => (
              <div
                key={index}
                className="flex flex-col justify-center hover:bg-background-default-hover cursor-pointer w-full px-4 sm:px-5 border-b border-secondary py-4 transition-all duration-200"
              >
                {/* Message Time */}
                <div className="text-xs sm:text-sm text-secondary mb-1">
                  {calculateTime(message.createdAt)}
                </div>

                {/* Message Text */}
                <div className="text-sm sm:text-base text-icon-green break-words">
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchMessages;
