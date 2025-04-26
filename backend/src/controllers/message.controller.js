// import Message from "../models/message.model.js"
// import User from "../models/user.model.js"
// import cloudinary from "../lib/cloudinary.js";
// export const getUsersForSideBar = async (req, res) => {
//     try {
//         const loggedInUserId = req.user._id;
//         const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
//         res.status(200).json(filteredUser)
//     } catch (error) {
//         console.log("Error in getting user", error.message)
//         res.status(500).json({ error: "internal server error" });
//     }
// }

// export const getMessages = async (req, res) => {
//     try {
//         let { id: userToChatId } = req.params;
//         const myId = req.user._id;

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: userToChatId },
//                 { senderId: userToChatId, receiverId: myId }
//             ]
//         });
//         res.status(200).json(messages)
//     } catch (e) {
//         console.log("Error in getMessage Controller", e.message);
//         res.status(500).json({ message: "Internal Server Error" })
//     }
// }

// export const sendMessages = async (req, res) => {
//     try {
//         const { text, image } = req.body;
//         const { id: receiverId } = req.params;
//         const senderId = req.user._id;
//         let imageUrl;
//         if (image) {
//             const uploadResponse = await cloudinary.uploader.upload(image);
//             imageUrl = uploadResponse.secure_url
//         }
//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             text,
//             image: imageUrl,
//         })
//         await newMessage.save();
//         //realtime functionality here



//         res.status(201).json(newMessage);
//     }
//     catch(e){
//         console.log("Error in sendMessage Controller",e.message);
//     res.status(500).json({message:"Internal Server Error"})
//     }
// }
   
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
  // try {
  //   const currentUser = await User.findById(req.user._id).populate("savedContacts", "username email profilePic");
    
  //   res.status(200).json(currentUser.savedContacts);
  // } catch (error) {
  //   res.status(500).json({ message: "Failed to fetch saved contacts." });
  // }
};

// export const saveContact = async (req, res) => {
//   const { contactId } = req.body;
//   const userId = req.user._id;

//   try {
//     const user = await User.findById(userId);
//     if (!user.savedContacts.includes(contactId)) {
//       user.savedContacts.push(contactId);
//       await user.save();
//     }

//     res.status(200).json({ message: "Contact saved" });
//   } catch (error) {
//     res.status(500).json({ message: "Error saving contact" });
//   }
// };



export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};