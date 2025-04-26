import express from "express";
const router=express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import {getUsersForSideBar,getMessages,sendMessages} from "../controllers/message.controller.js";
router.get("/users",protectRoute,getUsersForSideBar);

router.get("/:id",protectRoute,getMessages);

router.post("/send/:id",protectRoute,sendMessages)
export default router;