import express, { Request, Response, NextFunction } from "express";

import consola, { Consola } from "consola";
import cors from "cors";
import * as bodyParser from "body-parser";

import * as dotENV from "dotenv";

import { PORT } from "./utils/PORT.json";
import { router as authV1 } from "./routes/auth";

export class Server {
  public app: express.Application;
  public logger: Consola = consola;

  public constructor() {
    this.app = express();

    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();
  }

  public start() {
    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();

    this.app.listen(PORT, () => {
      this.logger.success(`Server started on port ${PORT}`);
    });
  }

  private setConfig() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    dotENV.config();
  }

  private setRequestLogger() {
    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      console.log(`[${req.method} - ${req.path}]`);

      next();
    });
  }

  private setRoutes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("App");
    });

    this.app.use("/v1/auth", authV1);
  }
}
