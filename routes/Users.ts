import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/user";
import { verify } from "jsonwebtoken";

const router = express.Router();
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const auth = require("../middleware/auth");

router.get("/", async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();
  res.json(user);
});

router.get("/byId/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(user);
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (user) {
      res.status(401).json("username already exist, please login");
    }

    const hash = await bcrypt.hashSync(password, 10);

    await prisma.user.create({
      data: {
        username: username,
        password: hash,
      },
    });

    res.json("create user success ✅");
  } catch (error) {
    console.log(error);
  }
});

router.post("/createManyUsers", async (req: Request, res: Response) => {
  const { userList } = req.body;
  const user = await prisma.user.createMany({
    data: userList,
  });
  res.json(user);
});

router.put("/", async (req: Request, res: Response) => {
  const { id, username } = req.body;
  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      username: username,
    },
  });
  res.json(updatedUser);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const deletedUser = await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(deletedUser);
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    res.status(400).json({ error: `user ${username} Doesn't exist` });
  }

  const dbPassword = user?.password;
  const match = await bcrypt.compare(password, dbPassword);

  if (!match) {
    res.status(400).json({ error: `wrong username and password combination` });
  } else {
    const token = generateToken(user);
    res.cookie("access-token", token, {
      maxAge: 60 * 60 * 24 * 30 * 1000,
      httpOnly: true,
    });
    res.json({ token: token, message: "logged in ✅" });
  }
});

router.get("/me", auth, async (req: Request, res: Response) => {
  const token = req.headers.authorization;

  if (token) {
    const decoded: any = verify(token, "jwtsecretplschange");

    const user = await prisma.user.findUnique({
      where: {
        id: Number(decoded.id),
      },
    });

    res.status(200).json(user);
  }
});

module.exports = router;
