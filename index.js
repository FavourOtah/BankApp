import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"


import transRoutes from "./routes/transRoutes.js"
import accountRoutes from "./routes/accountRoutes.js"
import { authorization } from "./middlewares/authorization.js"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"


dotenv.config();
const app = express();

app.use(cookieParser())
app.use(cors())
app.use(express.json());

const PORT = process.env.PORT



//routes
app.use("/transfer", authorization, transRoutes)
app.use("/accounts", authorization, accountRoutes)
app.use("/user", userRoutes)
app.use(authRoutes)
app.listen(PORT, () => {
    console.log("Server is running on port 2025")
});