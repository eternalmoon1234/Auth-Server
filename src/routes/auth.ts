import e, { Router } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { auth } from "../utils/auth";

export const router = Router();

const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user)
    return res.status(400).json({ success: false, error: "User not found" });

  try {
    if (await argon2.verify(user.hash, password)) {
      const token = jwt.sign({ userId: user.id }, "secret");

      return res.status(200).json({ success: true, token });
    } else
      return res
        .status(400)
        .json({ success: false, error: "Invalid Password" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  console.log(email, username, password);

  const result = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (result)
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });

  const hash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      hash,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET);

  return res.status(200).json({ success: true, accessToken: token });
});

router.post("/username", auth, (req, res) => {
  return res.send(req.user.username);
});

router.delete("/account/delete", auth, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});

router.patch("/username/update", auth, async (req, res) => {
  const { username } = req.body;

  await prisma.user.update({
    data: {
      username: username,
    },
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});

router.patch("/email/update", auth, async (req, res) => {
  const { email } = req.body;

  await prisma.user.update({
    data: {
      email: email,
    },
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});

router.patch("/password/update", auth, async (req, res) => {
  const { password } = req.body;

  await prisma.user.update({
    data: {
      hash: password,
    },
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});

router.post("/username/availability", async (req, res) => {
  const { username } = req.body;

  const result = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (result) {
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });
  } else {
    return res.json({
      success: true,
      message: `Username ${username} is available!`,
    });
  }
});
