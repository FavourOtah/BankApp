import { pool } from "../../../db.js"


export const internalTransfer = async (req, res) => {
    const connection = await pool.connect();
    try {
        //starting a transaction in raw sql
        await connection.query("BEGIN");

        //getting user id from the req.token
        const { userId } = req.token;

        //fetching payload of the transaction from the body
        const { sender_account_num, receiver_account_num, amount, type } = req.body;

        //checking if the account numbers are the same
        if (sender_account_num === receiver_account_num) {
            return res.status(400).json({
                message: "The account numbers provided are the same"
            })
        };



        //checking if the provided account numbers belong to an account
        const senderObj = await connection.query(`SELECT * 
            FROM accounts
            WHERE account_number = $1
        `, [sender_account_num]);

        const receiverObj = await connection.query(`SELECT * 
            FROM accounts 
            WHERE account_number = $1`, [receiver_account_num])

        if (senderObj.rows.length === 0 || receiverObj.rows.length === 0) {
            return res.status(400).json({
                message: "Provide valid account numbers"
            })
        };


        //extracting sender and receiver data
        const senderData = senderObj.rows[0]
        const receiverData = receiverObj.rows[0]

        //me trying to add the type of transfer
        const computedType = senderData.user_id === receiverData.user_id ? "internal" : "external";

        //ensuring the id of the person making the transfer is same with the id associated with the account
        if (userId !== senderData.user_id) {
            return res.status(403).json({ message: "You are not authorised  for this action." })
        };

        //checking both accounts belong to the same user
        if (senderData.user_id !== receiverData.user_id) {
            return res.status(400).json({
                message: "Both accounts should belong to you for an internal transfer"
            })
        };

        //checking if sender has sufficient funds
        if (senderData.balance < amount) {
            return res.status(400).json({
                message: "Insufficient funds"
            })
        };

        //performing the maths
        const newUserBalance = senderData.balance - amount;
        const newReceiverBalance = receiverData.balance + amount;

        //updating their accounts
        const newSenderObj = await connection.query(`UPDATE accounts
                SET balance = $1 
                WHERE id = $2`, [newUserBalance, senderData.id])


        const newReceiverObj = await connection.query(`UPDATE accounts
                    SET balance = $1
                    WHERE id = $2`, [newReceiverBalance, receiverData.id])

        if (newSenderObj.rowCount === 0 || newReceiverObj.rowCount === 0) {
            await connection.query("ROLLBACK");
            return res.status(500).json({
                message: "Accounts not updated"
            })
        };

        //documenting this transaction
        const newTransaction = await connection.query(`INSERT INTO
                        transactions(type,amount, sender_account_id, receiver_account_id, user_id)
                        VALUES($1,$2,$3,$4,$5)
                        RETURNING *`,
            [computedType, amount, senderData.id, receiverData.id, userId])

        //commiting the transaction
        await connection.query("COMMIT")




        return res.status(200).json({
            message: "Transaction successful",
            transaction: newTransaction.rows[0],
            sender_account_num: sender_account_num,
            receiver_account_num: receiver_account_num
        })

    } catch (error) {
        console.error(error);
        await connection.query("ROLLBACK")
        return res.status(500).json({ message: "Something went wrong" })

    } finally { connection.release() }

} 