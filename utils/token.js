import jwt from "jsonwebtoken"

export const createTokens = (user) => {
    const accessToken = jwt.sign({ userId: user.id, isAdmin: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10Min" })

    const refreshToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7 days" })


    return { accessToken, refreshToken }
}