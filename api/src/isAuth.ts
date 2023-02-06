import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const isAuth:RequestHandler<{}, any, any, {}> = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`isAuth middleware | authHeader ${authHeader}`)
    if (!authHeader) {
      throw new Error("Not authenticated.");
    }

    const token = authHeader.split(" ")[1];
    console.log(`token ${token}`)
    if (!token) {
        throw new Error("Not authenticated.");
    }

    try {
      const payload: any = jwt.verify(token, process.env.JWT_KEY);
      console.log(`isAuth middleware | payload ${payload.userId}`);
      req.userId = payload.userId;
      console.log(`isAuth middleware | UserId ${req.userId}`);
      next();
      return;
    } catch {
        throw new Error("Not authenticated.");
    }

    throw new Error("Not authenticated.");
};