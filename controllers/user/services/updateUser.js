import { pool } from "../../../db.js"

export const updateuser = async (req, res) => {
    const connection = await pool.connect();
    try {
        //getting the id from the token
        const { userId, isAdmin } = req.token

        //getting id from the url
        const { id } = req.params

        //geeting user data from DB
        const userObj = await connection.query(`SELECT * FROM users WHERE id = $1`, [id])
        if (userObj.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        };


        //extracting the user actual
        const userData = userObj.rows[0]

        //ensuring an admin or a true owner of the account can update the accoutn
        if (userId !== userData.id && !isAdmin) {
            return res.status(403).json({
                message: "You are not authorized for this action"
            })
        };

        //updating the DB
        //UPDATE, SET....//COALESCE() is a SQL fxn that returns the first non-null value from a list of arguments.
        //COALESCE can be inefficient for large tables.
        //In the update query, it ensures that only provided fields are updated while keeping existing values unchanged.
        const { email, name, } = req.body

        const updatedUser = await connection.query(`UPDATE users
            SET email = COALESCE($1, email),
            name = COALESCE($2, name)
            WHERE id = $3
            RETURNING  email, name;
            `, [email, name, id]);

        return res.status(200).json({
            message: "User succesffully updated",
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error(error.error)
        return res.status(500).json({
            message: error.message
        })
    } finally { connection.release(); }
}