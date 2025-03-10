import { pool } from "../../../db.js"

export const externalTransfer = async (req, res) => {
    const connection = await pool.connect()
    try {
        //starting a transaction in sql
        await connection.query("BEGIN");

        //FETCHING USERiD FROM COOKIES
        const { userId } = req.token

        //fetching the payload for the transaction 
        const { sender_account_num, receiver_account_num, amount, type } = req.body;

        //checking for same account number
        if (sender_account_num === receiver_account_num) {
            return res.status(400).json({
                message: "You provided the same account number twice."
            })
        };


        //fetching the account from DB
        const senderObj = await connection.query(`SELECT * 
            FROM accounts
            WHERE account_number = $1`, [sender_account_num]);

        const receiverObj = await connection.query(`SELECT *
                FROM accounts
                WHERE account_number = $1`, [receiver_account_num])

        //if data was found
        if (senderObj.rows.length === 0 || receiverObj.rows.length === 0) {
            return res.status(404).json({ message: "Provide valid account numbers" })
        };

        const senderData = senderObj.rows[0];
        const receiverData = receiverObj.rows[0];

        //me trying to add the type of transfer
        const computedType = senderData.user_id === receiverData.user_id ? "internal" : "external";


        //ensuring the userId from logged in token is same with the account the transfer is being made from 
        if (userId !== senderData.user_id) {
            return res.status(403).json({
                message: "You are not authorised."
            })
        };
        //checking if sender has sufficient funds
        if (senderData.balance < amount) {
            return res.status(400).json({
                message: "Insufficient funds"
            })
        };

        //performing the maths
        const newSenderBalance = senderData.balance - amount
        const newReceiverBalance = receiverData.balance + amount

        //updating the accounts
        const newSenderAccountObj = await connection.query(`UPDATE accounts
            SET balance = $1
            WHERE id = $2`, [newSenderBalance, senderData.id])

        const newReceiverAccountObj = await connection.query(`UPDATE accounts
                SET balance =$1
                WHERE id = $2`, [newReceiverBalance, receiverData.id])


        if (newSenderAccountObj.rowCount === 0 || newReceiverAccountObj.rowCount === 0) {
            await connection.query("ROLLBACK");
            return res.status(500).json({
                message: "Accounts not updated."
            })
        };


        //documenting the transaction...create a new record of the transaction
        const newTransactionObj = await connection.query(`INSERT INTO transactions
            (type, amount, sender_account_id, receiver_account_id, user_id)
            VALUES ($1, $2, $3,$4,$5)
            RETURNING *`,
            [computedType, amount, senderData.id, receiverData.id, userId])

        //checking that transaction was created
        if (newTransactionObj.rowCount === 0) {
            await connection.query("ROLLBACK");
            return res.status(500).json({
                message: "Transaction record not created"
            })
        }
        //concluding and commiting the transaction
        await connection.query("COMMIT")


        //response
        return res.status(201).json({
            message: "Transfer successful",
            transaction: newTransactionObj.rows[0]
        })

    } catch (error) {
        console.error(error);
        await connection.query("ROLLBACK")
        return res.status(500).json({
            message: "Something went wrong."
        })

    };
};