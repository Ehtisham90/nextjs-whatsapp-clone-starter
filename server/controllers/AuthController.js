import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04} from "../utils/TokenGenerator.js"

export const checkUser = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.json({ msg: "Email is required.", status: false });
      }
      const prisma = getPrismaInstance();
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.json({ msg: "User not found.", status: false });
      } else {
        return res.json({ msg: "User found.", status: true, data: user });
      }
    } catch (error) {
      next(error);
    }
  };

  export const onBoardUser = async (req, res, next) => {
    try {
      console.log("REQ BODY", req.body); // 👈 add this line
      const { email, name, about, image: profilePicture } = req.body;
  
      if (!email || !name || !profilePicture) {
        return res.send("Email, Name and Image is required");
      }
  
      const prisma = getPrismaInstance();
      await prisma.user.create({
        data: {
          email,
          name,
          about,
          profilePicture,
        },
      });
  
      return res.json({ msg: "User created successfully", status: true });
    } catch (error) {
      console.log("ERROR IN ONBOARD USER:", error); // 👈 add this too
      next(error);
    }
  };
  
  export const getAllUsers = async (req,res,next) => {

    try {
      const prisma = getPrismaInstance();
      const users = await prisma.user.findMany({
        orderBy:{name:'asc'},
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          about: true
        }
      });

      const usersGroupedByInitialLetter={};

      users.forEach((user)=>{
        const initialLetter = user.name.charAt(0).toUpperCase();
        if(!usersGroupedByInitialLetter[initialLetter]){
          usersGroupedByInitialLetter[initialLetter]=[];
        }
        usersGroupedByInitialLetter[initialLetter].push(user);
      })
      return res.status(200).send({users:usersGroupedByInitialLetter})
    } catch (err) {
      next(err);
    }
  }
  export const generateToken = (req, res, next) => {
    try {
      const appId = parseInt(process.env.ZEGO_APP_ID);
      const serverSecret = process.env.ZEGO_APP_SECRET;
      const userId = req.params.userId;
      const effectiveTime = 3600;
      const payload = "";

      if (appId && serverSecret && userId) {
        const token = generateToken04(appId, userId, serverSecret, effectiveTime, payload);
        return res.status(200).json({ token });
      }
  
     return res.status(400).send("User id, app id and server secret is required.")
      
      
    } catch (error) {
      console.log("❌ Error in generateToken:", error);
      next(error);
    }
  };
  
  


