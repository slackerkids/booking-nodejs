// index.js
import express from "express";

const app = express();
const port = process.env.PORT ?? "9001";

app.get("/", (req, res) => {
  res.send("Booking System");
  console.log("Response send");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
