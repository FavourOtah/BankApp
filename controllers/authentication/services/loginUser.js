import { pool } from "../../../db.js"
import bcrypt from "bcryptjs";
import { createTokens } from "../../../utils/token.js";
import cookieParser from "cookie-parser";

export const loginUser = async (req, res) => {

    const connection = await pool.connect()
    try {
        //fetching parload from req.body
        const { email, password } = req.body;

        //checking if all the fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Your email and password are required" })
        };

        //checking DB for user
        const userObj = await connection.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "Email provided is not linked to any account."
            })
        };

        const userData = userObj.rows[0]


        //now we compare the hashedpassword with the password saved to the datbase 
        const validPassword = await bcrypt.compare(password, userData.password)
        if (!validPassword) {
            return res.status(403).json({
                message: "Incorrect password"
            })
        };

        //create accessToken and refreshTokens for the User
        const { accessToken, refreshToken } = createTokens({
            id: userData.id,
            isAdmin: userData.isAdmin
        });


        //savoing the new refresh token
        //UPDATE, SET, WHERE, RETURNING
        const updatedUserObj = await connection.query(`UPDATE users
            SET refresh_token = $1
             WHERE id = $2
             RETURNING * `, [refreshToken, userData.id]);

        const updatedUser = updatedUserObj.rows[0]

        //removing fields i dont want to return to the frontend
        const { password: _password, refresh_token: _refreshToken, ...others } = updatedUser

        //returning tokens via cookies
        //unlike password, you cannot compare a plain-text token with a hashed token directly
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, maxAge: 10 * 60 * 1000 })
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            others
        })


    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
}