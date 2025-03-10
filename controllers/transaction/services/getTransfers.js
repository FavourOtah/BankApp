import { pool } from "../../../db.js"

export const getOneTransfer = async (req, res) => {
    const connection = await pool.connect();
    try {

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong."
        })
    } finally { connection.release() }
};


export const getAllTransfers = async (req, res) => {
    const connection = await pool.connect()
    try {
        //getting account number from params
        const { accNumb } = req.params;

        const accObj = await connection.query(`SELECT * FROM accounts WHERE account_number = $1`, [accNumb]);
        if (accObj.rows.length === 0) {
            return res.status(404).json({ message: "Accout not found" })
        };

        //extracting actual dta
        const accData = accObj.rows[0]

        const transObj = await connection.query(`SELECT *
            FROM transactions WHERE sender_account_id = $1 OR receiver_account_id = $1 `, [accData.id])

        if (transObj.rows.length === 0) {
            return res.status(400).json({
                message: "No transaction record"
            })
        };

        const transData = transObj.rows

        return res.status(200).json({
            message: "List of all transactions",
            transData
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release(); }
}