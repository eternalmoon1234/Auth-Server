import { Router } from "express";
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

  const token = jwt.sign({ userId: user.id }, "secret");

  return res.status(200).json({ success: true, token });
});

router.post("/username", auth, (req, res) => {
  return res.send(req.user.username);
});

router.delete("/", auth, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});

router.patch("/username", auth, async (req, res) => {
  const { username } = req.body;

  await prisma.user.update({
    data: {
      username,
    },
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({ success: true });
});
