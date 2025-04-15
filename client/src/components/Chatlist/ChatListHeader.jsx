import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from 'react-icons/bs';
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { Router, useRouter } from "next/router";


function ChatListHeader() {
  const [{ userInfo },dispatch] = useStateProvider();
const router= useRouter();

const [contextMenuCordinates, setContextMenuCordinates] = useState({
  x:0,
  y:0,
})
const [iscontextMenuVisible, setIsContextMenuVisible] = useState(false);

const showContextMenu = (e)=>{
  e.preventDefault();
  setContextMenuCordinates({
    x:e.pageX ,
    y:e.pageY,
  })
  setIsContextMenuVisible(true);
}

const contextMenuOptions=[
  {
    name:"Logout",
    callback:async()=>{
      setIsContextMenuVisible(false);
      router.push("/logout")
    }
  }
]


const handleAllContactPage=()=>{

  dispatch({type: reducerCases.SET_ALL_CONTACTS_PAGE})


  dispatch({type: 'SET_CURRENT_CHAT_UNREAD_COUNT', payload: 0})

  dispatch({type: 'SET_CURRENT_CHAT_LAST_MESSAGE_TIME', payload: null})
}

  return <div className="h-16 px-3 py-3 flex justify-between items-center">
    
<div className="cursor-pointer">
     <Avatar type="sm" image={userInfo?.profileImage}/>
</div>
<div className="flex gap-6">
<BsFillChatLeftTextFill 
className="text-panel-header-icon cursor-pointer text-xl"
 title="New Chat"
 onClick={handleAllContactPage}
/>
  <>
  <BsThreeDotsVertical
  className="text-panel-header-icon cursor-pointer text-xl"
 title="Menu"
 onClick={(e)=> showContextMenu(e)}
 id="context-opener"
  />
  {iscontextMenuVisible && (
        
        <ContextMenu
        options={contextMenuOptions}
        cordinates={contextMenuCordinates}
        contextMenu={iscontextMenuVisible}
        setContextMenu={setIsContextMenuVisible}
/>
      )}
  </>
  
</div>
  </div>;
}

export default ChatListHeader;
