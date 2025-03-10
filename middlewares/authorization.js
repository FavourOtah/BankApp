import jwt from "jsonwebtoken";
import { pool } from "../db.js"


export const authorization = async (req, res, next) => {
    //for authorization we are simply trying to verify if the token provided is valid
    //that is to check if someone too is logged in becasue tokens are only given when a user logs in
    const connection = await pool.connect();
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            return res.status(400).json({
                message: "Log in to continue or kindly refresh your page"
            })
        };

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        if (!decoded) {
            return res.status(403).json({ message: "Invalid or expired token" })
        };

        const userObj = await connection.query(`SELECT id, is_admin FROM users WHERE id = $1`, [decoded.userId])
        //ensuring an empty array is not being returned
        //using rows.length === 0 prevents undefined errors
        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "User not found'"
            })
        };

        const userData = userObj.rows[0]

        //attaching the found user details to req.token
        //In PostgresSql field names are lowercase by default so we use userData.isadmin in place of userData.isAdmin.
        req.token = {
            userId: userData.id,
            isAdmin: userData.is_admin
        };

        next();

    } catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Access token has expired. Please kindly refresh your token" });
        } else if (error.name === "JsonWebTokenError") { return res.status(403).json({ message: "Invalid access token. Please log in again" }); }
        else { return res.status(500).json({ message: "Something went wrong" }) }
    } finally { connection.release(); }

}