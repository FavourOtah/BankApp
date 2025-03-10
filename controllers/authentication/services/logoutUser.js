import { pool } from "../../../db.js"

export const logoutUser = async (req, res) => {
    const connection = await pool.connect();
    try {
        //i can use the refresh token or the id
        const { refreshToken } = req.cookies

        //checking the database to see if refreshtoken is associated with an account
        const resultObj = await connection.query(`SELECT * 
            FROM users 
            WHERE refresh_token = $1`, [refreshToken])

        if (resultObj.rows.length === 0) {
            return res.status(400).json({
                message: "How are you logged in?? Refresh token not assocciated with any account"
            })
        };
        const userData = resultObj.rows[0]

        //updatinf refreshToken
        const userObj = await connection.query(`UPDATE users
            SET  refresh_token = NULL
            WHERE id = $1
            RETURNING id
            `, [userData.id]);

        //ensuring logging out happened// .rowCount checks how many rows have been updated, if it is zero that would mean the update query for our log out actino failed.

        if (userObj.rowCount === 0) {
            //consoling what might have gone wrong
            console.error(`Logout failed: No rows updated for ${userData.id}`)
            return res.status(500).json({ message: "Failed to log out" })
        };




        res.clearCookie("accessToken", { httpOnly: true, secure: false, });
        res.clearCookie("refreshToken", { httpOnly: true, secure: false });
        return res.status(200).json({
            message: "Hope to see you soon"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    } finally { connection.release() }
}