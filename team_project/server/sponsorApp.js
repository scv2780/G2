const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const sponsorRouter = require("./routes/sponsorRoute");

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// 라우터
// app.use('/api', testRouter);
app.use("/", sponsorRouter);

// const port = process.env.PORT;
const port = process.env.PORT;
app.listen(port, () => {
  console.log("[ server app.js 가동 완료 | http://localhost:3000/ ]");
});
