import express from "express";
import { createAccount, deleteAccount, updateAccount } from "../controllers/account/accountControlers.js";
import { adminAuth } from "../middlewares/adminAuth.js";


const routes = express.Router()


routes.post("/create", createAccount)
routes.delete("/delete/:accNumb", adminAuth, deleteAccount)
routes.put("/update/:accNumb", updateAccount)

export default routes