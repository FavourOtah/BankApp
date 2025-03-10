import express from "express"
import { createUser, deleteUser, getAllUsers, getOneUser, updateuser } from "../controllers/user/userControllers.js"
import { adminAuth } from "../middlewares/adminAuth.js"
import { authorization } from "../middlewares/authorization.js"


const routes = express.Router()


routes.post("/create", createUser)
routes.delete("/delete/:id", authorization, adminAuth, deleteUser)
routes.put("/update", authorization, adminAuth, updateuser)
routes.get("/getOne/:id", authorization, adminAuth, getOneUser)
routes.get("/getAll", authorization, adminAuth, getAllUsers)

export default routes