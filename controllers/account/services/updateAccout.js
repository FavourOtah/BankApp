import { pool } from "../../../db.js"

export const updateAccount = async (req, res) => {
    const connection = await pool.connect();
    try {
        //getting the account Number of the account to be updated.
        const { accNumb } = req.params;

        const existObj = await connection.query(`SELECT id 
            FROM accounts
            WHERE account_number = $1`, [accNumb]);

        if (existObj.rows.length === 0) {
            return res.status(400).json({ message: "Account not found" })
        };

        //extracting update data
        const { account_type, balance, } = req.body;

        //ensuring bal is not a negative
        if (balance !== undefined && balance < 0) {
            return res.status(400).json({
                message: "Balance cant be a negative."
            })
        };

        const updatedAccount = await connection.query(`
                UPDATE accounts
                SET account_type = COALESCE($1, account_type),
                balance = COALESCE($2, balance)
                WHERE account_number =$3
                RETURNING *`, [account_type, balance, accNumb]);

        //ensuring update was successful
        //for SELECT queries ---- .rows.length === 0 to check if any record is found
        //for INSERT/UPDATE --- .rowCount === 0 because these queries return the number of affected rows, not an array of results
        if (updatedAccount.rowCount === 0) {
            return res.status(500).json({
                message: "Update was not successful"
            })
        };

        const accountData = updatedAccount.rows[0]

        return res.status(200).json({
            message: "Account successfully updated",
            account: accountData
        })


        //updating the account

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
};

