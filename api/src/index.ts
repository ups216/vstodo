import "reflect-metadata";
require("dotenv-safe").config();
import express from "express";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { User } from "./entities/User";
import { join } from "path";
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport";
import jwt from "jsonwebtoken";
import cors from "cors";
import { Todo } from "./entities/Todo";
import { isAuth } from "./isAuth";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "vstodo",
    dropSchema: true,
    password: "postgres",
    username: "postgres",
    entities: [join(__dirname, "./entities/*.*")],
    logging: !__prod__,
    synchronize: !__prod__,
  });

  // const user = await User.create({ name: "John" }).save();
  // console.log({ user });

  const app = express();

  passport.serializeUser(function (user: any, done) {
    done(null, user.accessToken);
  });
  app.use(cors({ origin: "*" }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3002/auth/github/callback",
      },
      async (_, __, profile, cb) => {
        let user = await User.findOne({ where: { githubId: profile.id } });
        if (user) {
          user.name = profile.displayName;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
          }).save();
        }
        cb(null, {
          accessToken: jwt.sign({ userId: user.id }, process.env.JWT_KEY, {
            expiresIn: "1y",
          }),
        });
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { session: false }));

  app.get("/auth/github/callback",
    passport.authenticate("github", {
      failureRedirect: "/login",
      session: false,
    }),
    function (req: any, res) {
      // Successful authentication, redirect home.
      // res.send(req.user.accessToken);
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  app.get("/todo", isAuth, async (req, res) => {
    const todos = await Todo.find({ where: { creatorId: req.userId } });
    res.send({ todos });
  });

  app.post("/todo", isAuth, async (req, res) => { 
    const todo = Todo.create({
      text: req.body.text, 
      creatorId: req.userId,
    }).save();
    res.send({todo});
  });

  app.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log(`authHeader ${authHeader}`)
    if (!authHeader) {
      res.send({ user: null });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log(`token ${token}`)
    if (!token) {
      res.send({ user: null });
      return;
    }

    let userId = "";

    try {
      const payload: any = jwt.verify(token, process.env.JWT_KEY);
      console.log(`payload ${payload}`);
      userId = payload.userId;
      console.log(`UserId ${userId}`);
    } catch {
      res.send({ user: null });
      return;
    }

    if (!userId) {
      res.send({ user: null });
      return;
    }

    const user = await User.findOne(userId);
    console.log(`user ${user}`);

    res.send({ user });
  });

  app.get("/", (_req, res) => {
    res.send("hello");
  });

  app.listen(3002, () => {
    console.log("Server started on port 3002");
  });
};

main();
