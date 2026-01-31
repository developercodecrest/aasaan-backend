import { createUser, getUser, getUsers, getUserByCompanyId, updateSelfWallet, updateUsers } from "@/controllers/user";
import { Router } from "express";

const userRouter = Router()

userRouter.get("/", getUser)
userRouter.get("/all", getUsers)
userRouter.post("/", createUser)
userRouter.put("/", updateUsers)

export default userRouter