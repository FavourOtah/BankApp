import { pool } from "../../../db.js"


export const createAccount = async (req, res) => {
    const connection = await pool.connect()
    try {
        const { userId } = req.token

        //fetching the user data
        const userObj = await connection.query(`SELECT * 
            FROM users
            WHERE id = $1`, [userId]);

        if (userObj.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid user id or user not found"
            })
        };

        //extracting actual user data
        const userData = userObj.rows[0]


        //getting payload from the body
        const { account_number, account_type } = req.body;

        if (!account_number || !account_type) {
            return res.status(400).json({
                message: "Provide both an account number and account type"
            })
        };

        //ensuring thw account number is unique
        const uniqueObj = await connection.query(`SELECT * 
            FROM accounts
            WHERE account_number = $1`, [account_number]);

        if (uniqueObj.rows.length > 0) {
            return res.status(400).json({ message: "Account number already in use" });
        }

        const accountObj = await connection.query(`INSERT INTO
            accounts(account_number, account_type, user_id)
            VALUES($1, $2, $3)
            RETURNING *`, [account_number, account_type, userData.id])

        if (accountObj.rowCount === 0) {
            return res.status(500).json({
                message: "Something went wrong with account creation"
            })
        }

        const accountData = accountObj.rows[0];

        return res.status(201).json({
            message: "Account successfully created",
            data: {
                userId: accountData.user_id,
                account_number: accountData.account_number,
                account_type: accountData.account_type,
                balance: accountData.balance
            }
        })




    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong."
        })

    } finally { connection.release() }
}