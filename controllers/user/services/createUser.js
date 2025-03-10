import { pool } from "../../../db.js"
import bcrypt from "bcryptjs"
import { createTokens } from "../../../utils/token.js";

export const createUser = async (req, res) => {
    const connection = await pool.connect();
    try {
        //getting the payload
        const { password, ...others } = req.body;

        //ensuring all required fields are provided
        if (!password || !others.email || !others.name) {
            return res.status(400).json({ message: "All fields are required." })
        };

        //checking if the email provided already  belongs to  another account
        const queryObj = await connection.query(`SELECT * FROM users WHERE email = $1`, [others.email]);

        //.rows is an array containing the actual results of our query, so if .rows.length is greater than 0, that means the query found matching data
        if (queryObj.rows.length > 0) {
            return res.status(400).json({ message: "Email already linked to an account" })
        };

        //we go on to now hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //saving or creating new user. Done by inserting data into database
        //INSERT for create, UPDATE for updating
        const resultObj = await connection.query(`INSERT INTO users (email, password, name) 
            VALUES ($1, $2, $3) 
            RETURNING id, email `,
            [others.email, hashedPassword, others.name]);
        const userData = resultObj.rows[0];

        //creating a refresh token
        const { refreshToken } = createTokens(userData)

        //now we update the user accoutn with the refresh token created
        await connection.query(`UPDATE users
            SET refresh_token = $1
            WHERE id = $2`, [refreshToken, userData.id])


        return res.status(200).json({
            message: "New User successfully created",
            data: {
                id: userData.id,
                email: userData.email
            }
        });

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Something went wrong"
        })
    } finally { connection.release() }
};