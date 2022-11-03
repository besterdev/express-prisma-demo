import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ error: "User not Authenticated!" });
  }
  try {
    const decoded = verify(token, "jwtsecretplschange");
    if (decoded) {
      return next();
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

module.exports = verifyToken;
