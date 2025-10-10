// index.ts
import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import session from "express-session";
import { Pool } from "pg";

export interface authBody {
  password: string;
  username: string;
}

export interface eventBody {
  eventName: string;
  totalSeats: number;
}

declare module "express-session" {
  export interface SessionData {
    user: {
      id: number;
      password: string;
      username: string;
    };
  }
}

const app = express();
app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "Hello",
  }),
);

const port = process.env.PORT ?? "9001";

const connectionString = process.env.POSTGRES_DATABASE_URI;

const pool = new Pool({
  connectionString,
});

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.post("/register", async (req: Request, res: Response) => {
  const { password, username } = req.body as authBody;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows[0]) {
      res.json({ message: "User already exists" });
    } else {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      await pool.query(
        "INSERT INTO users (username, password) VALUES($1, $2)",
        [username, hashedPassword],
      );
      res.json({ message: "User created succesfully" });
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { password, username } = req.body as authBody;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (!user.rows[0]) {
      res.json({ message: "User not found" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hashedPassword = user.rows[0].password as string;

    if (await bcrypt.compare(password, hashedPassword)) {
      req.session.regenerate(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        req.session.user = user.rows[0];
        res.json({ message: "User authenticated" });
      });
    } else {
      res.json({ message: "Password is not correct" });
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/events/create", async (req: Request, res: Response) => {
  if (!req.session.user) {
    res.json({ message: "User is not authenticated" });
    return;
  }

  const { eventName, totalSeats } = req.body as eventBody;

  await pool.query("INSERT INTO events (name, total_seats) VALUES($1, $2)", [
    eventName,
    totalSeats,
  ]);

  res.json({ message: "Event created successfully" });
});

// app.post("/api/bookings/reserve", (req: Request, res: Response) => {

// });

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
