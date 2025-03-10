import express from "express"
import { externalTransfer, getAllTransfers, getOneTransfer, internalTransfer } from "../controllers/transaction/transControllers.js"


const routes = express.Router()


routes.post("/internal", internalTransfer)
routes.post("/external", externalTransfer)
routes.get("/getOne/:id", getOneTransfer)
routes.get("/getAll/:accNumb", getAllTransfers)


export default routes;