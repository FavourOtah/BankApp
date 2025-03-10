import { pool } from "../../../db.js"

export const deleteAccount = async (req, res) => {
    const connection = await pool.connect();
    try {
        //getting the account number from the params// same can be done using account id
        const { accNumb } = req.params;

        //checking if the account exists
        //in place of SELECT *, SELECT id inorder to reduce the load on the database
        const existObj = await connection.query(`SELECT id 
            FROM accounts
            WHERE account_number = $1`, [accNumb])

        if (existObj.rows.length === 0) {
            return res.status(404).json({
                message: "Account not found."
            })
        };


        //deleting the account
        const accountObj = await connection.query(`DELETE 
            FROM accounts
            WHERE account_number = $1`, [accNumb])

        //confirming the delete happened
        if (accountObj.rowCount === 0) {
            return res.status(500).json({ message: "Unable to delete" })
        }

        return res.status(200).json({
            message: "Account successfully deleted"
        })



    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong."
        })
    } finally { connection.release(); }
};