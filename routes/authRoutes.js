import express from "express";
import { loginUser, logoutUser, refresh } from "../controllers/authentication/authenControllers.js";
import { authorization } from "../middlewares/authorization.js";


const routes = express.Router();

routes.post("/login", loginUser)
routes.post("/logout", authorization, logoutUser)
routes.post("/refresh", refresh);

export default routes;