import { pool } from "../../../db.js"

export const deleteUser = async (req, res) => {
    const connection = await pool.connect();
    try {
        //getting user id from params
        const { id } = req.params

        //getting userId from the token
        const { userId } = req.token

        //checking user existence
        const userObj = await connection.query(`SELECT * 
            FROM users
            WHERE id = $1`, [id])

        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "No user associated with the id provided"
            })
        };

        const userData = userObj.rows[0]

        if (!req.token.isAdmin) {
            return res.status(403).json({
                message: "you are not authorised for the action"
            })
        };


        //deleting the usr
        const userDeleteObj = await connection.query(`DELETE 
                FROM users
                WHERE id = $1`, [id])

        //consfirming the delete
        if (userDeleteObj.rows.length > 0) {
            return res.status(500).json({
                message: "delete was not successful"
            })
        };


        return res.status(200).json({
            messag: "Account successfully deleted"
        })


    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong"
        })

    } finally { connection.release() }
};