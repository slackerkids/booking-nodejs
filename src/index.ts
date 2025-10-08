// index.ts
import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json());

const port = process.env.PORT ?? "9001";

const connectionString = process.env.POSTGRES_DATABASE_URI;

const pool = new Pool({
  connectionString,
});

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

export interface RegisterBody {
  password: string;
  username: string;
}

// 2 Step Make api for creating new user (Register and Login)
app.post("/register", async (req: Request, res: Response) => {
  const { password, username } = req.body as RegisterBody;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows[0]) {
      res.json({ message: "User already exists" });
    } else {
      // TODO: Hash the password
      await pool.query(
        "INSERT INTO users (username, password) VALUES($1, $2)",
        [username, password],
      );
      res.json({ message: "User created succesfully" });
    }
  } catch (error) {
    console.error(error);
  }

  res.sendStatus(200);
});

// Login

// 3 Step realize the booking reserve (if user already registered reject)

// app.post("/api/bookings/reserve", (req: Request, res: Response) => {

// });

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
