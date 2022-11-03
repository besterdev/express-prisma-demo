import jwt from "jsonwebtoken";

type userType = {
  id: number;
  username: string;
  password: string;
};

export const generateToken = (user: userType | null) => {
  return jwt.sign(
    { username: user?.username, id: user?.id },
    "jwtsecretplschange",
    { expiresIn: "1h" }
  );
};
