export const adminAuth = (req, res, next) => {
    try {
        if (!req.token.userId || !req.token.isAdmin) {
            return res.status(403).json({
                message: "Admins only."
            })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong."
        })

    }
    next()
};