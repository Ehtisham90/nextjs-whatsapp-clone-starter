import path from "path";
import { renameSync } from 'fs';
import multer from "multer";
import getPrismaInstance from "../utils/PrismaClient.js";

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          receiver: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      return res.status(201).send({ message: newMessage });
    }
    return res.status(400).send("From, to, and Message are required.");
  } catch (err) {
    next(err);
  }
};



export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: parseInt(from), receiverId: parseInt(to) },
          { senderId: parseInt(to), receiverId: parseInt(from) },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessages = [];
    messages.forEach((message, index) => {
      if (message.messageStatus !== "read" && message.senderId === parseInt(to)) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    if (unreadMessages.length) {
      // Update message status to 'read' in DB
      await prisma.messages.updateMany({
        where: {
          id: { in: unreadMessages },
        },
        data: {
          messageStatus: "read",
        },
      });
    }

    return res.json({ messages });
  } catch (err) {
    next(err);
  }
};


export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      const fileName = "uploads/recordings/" + date + req.file.originalname;  // Correct path
      console.log("Saved audio at: ", fileName); // Check file path in backend console
      
      renameSync(req.file.path, fileName);

      const prisma = getPrismaInstance();
      const { from, to } = req.query;

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,  // Audio file path in the database
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            type: "audio",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From, to are required.");
    }
    return res.status(400).send("Audio file is required.");
  } catch (err) {
    console.log(err);
    next(err);
  }
};







export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      const fileName = "uploads/images/" + date + req.file.originalname;  // Correct path
      console.log("Saved image at: ", fileName); // Check file path in backend console
      
      renameSync(req.file.path, fileName);

      const prisma = getPrismaInstance();
      const { from, to } = req.query;

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,  // Image file path in the database
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            type: "image",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From, to are required.");
    }
    return res.status(400).send("Image file is required.");
  } catch (err) {
    console.log(err);
    next(err);
  }
};


export const getInitialContactwithMessages= async(req,res,next)=>{
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        receivedMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    const messages = [...user.sentMessages, ...user.receivedMessages];
    messages.sort((a,b)=>b.createdAt.getTime() - a.createdAt.getTime());

    const users = new Map()
    const messageStatusChange = [];

    messages.forEach((msg)=>{
      const isSender = msg.senderId ===userId;
      const calculatedId = isSender ? msg.receiverId : msg.senderId;
      if(msg.messageStatus === "sent"){
        messageStatusChange.push(msg.id)
      }
      
      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        receiverId
      } = msg;

      if(!users.get(calculatedId)){

       

        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId
        };
        if(isSender){
          user={
            ...user,
            ...msg.receiver,
            totalUnreadMessages: 0,
          };
        } else{
          user={
          ...user,
          ...msg.sender,
          totalUnreadMessages:messageStatus !== "read" ? 1 : 0,
        }}

        users.set(calculatedId,{...user})
      } else if (messageStatus !== "read" && !isSender) {
        const u = users.get(calculatedId);
        users.set(calculatedId, {
          ...u,
          totalUnreadMessages: u.totalUnreadMessages + 1,
        });
      }
      
      
    });
      if(messageStatusChange.length){
        await prisma.messages.updateMany({
          where: {
            id: { in: messageStatusChange },
          },
          data: {
            messageStatus: "delivered",
          },
        });
      }

      return res.status(200).json({
        users:Array.from(users.values()),
        onlineUsers:Array.from(onlineUsers.keys()),
      })
  } catch (err) {
    next(err) 
  }
}