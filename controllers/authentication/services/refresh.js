import { pool } from "../../../db.js"
import jwt from "jsonwebtoken"

export const refresh = async (req, res) => {

    const connection = await pool.connect()
    try {
        //getting the refreshToken
        const { refreshToken } = req.cookies

        if (!refreshToken) {
            return res.status(403).json({
                message: "No refresh token provided."
            })
                ;
        };


        //verifying the Token provided....verifying even before doing a query on the database
        let verifiedToken;
        try {
            verifiedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        } catch (error) {
            return res.status(403).json({ message: "invaild token" })

        }


        //checking if the refreshToken is linked to an account
        const userObj = await connection.query(`SELECT * FROM users WHERE refresh_token = $1`, [refreshToken])
        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "refreshToken expired or not linked to any account"
            })
        };

        //getting user data
        const userData = userObj.rows[0]


        //cerating a new access token
        const newAccessToken = jwt.sign({ userId: userData.id, isAdmin: userData.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10min" })

        //returning new access toke via cookie
        res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: false, maxAge: 10 * 60 * 1000 })
        return res.status(200).json({
            message: "Token successfully refreshed."
        })



    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
}