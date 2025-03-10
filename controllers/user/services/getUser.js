import { pool } from "../../../db.js"

export const getOneUser = async (req, res) => {
    const connection = await pool.connect()
    try {
        //extracting the id from the params
        const { id } = req.params;

        //running query//
        const userObj = await connection.query(`SELECT u.id AS user_id,
            u.name,
            u.email,
            COALESCE(
            json_agg(
            json_build_object(
            'account_id', a.id,
            'account_number', a.account_number,
            'balance', a.balance,
            'account_type', a.account_type))
            FILTER (WHERE a.id IS NOT NULL),'[]')AS accounts 
            FROM users u
            LEFT JOIN accounts a ON u.id = a.user_id
            WHERE u.id = $1
            GROUP BY u.id`, [id])

        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        };

        const userData = userObj.rows[0];
        const { password: _password, refresh_token: _refreshToken, ...others } = userData

        return res.status(200).json({
            message: "Request successful",
            user: others
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
};

export const getAllUsers = async (req, res) => {
    const connection = await pool.connect()
    try {
        const userObj = await connection.query(`SELECT 
            u.id AS user_id,
            u.name,
            u.email,
            COALESCE(
            json_agg(json_build_object(
            'account_id', a.id,
            'account_number', a.account_number,
            'balance', a.balance,
            'account_type', a.account_type))
            FILTER (WHERE a.id IS NOT NULL), '[]') AS accounts
            FROM users u
            LEFT JOIN accounts a ON u.id = a.user_id
            GROUP BY u.id`)

        if (userObj.rows.length === 0) {
            return res.status(404).json({ message: "No user found, be the first to create a new user." })
        };

        //not .rows[0] because I am returning all the users
        const userData = userObj.rows
        //using destructuring to remove passwprd and refresh_token here wouldnt work because
        //the userData returned is an array of users not just a single user.
        //thus we use .map
        const users = userData.map(({ password, refresh_token, ...others }) => others)

        return res.status(200).json({
            message: "List of users",
            users
        })

    } catch (error) {
        console.error("Error fetchings users", error);
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
};