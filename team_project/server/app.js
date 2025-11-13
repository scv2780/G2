// app.js
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const testRouter = require("./routes/testRoute");
const surveyRoute = require("./routes/surveyRoute");
const orgRouter = require("./routes/orgRoute");
const eventRouter = require("./routes/eventRoute");
const sponsorRouter = require("./routes/sponsorRoute");
const approvalRouter = require("./routes/approvalRoute.js");
const authRouter = require("./routes/authUser");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// 라우터
// app.use('/api', testRouter);

app.use("/test", testRouter);
app.use("/sponsor", sponsorRouter);
app.use("/survey", surveyRoute);
app.use("/organization", orgRouter);
app.use("/approvals", approvalRouter);
app.use("/event", eventRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 첨부파일
app.use("/user", authRouter);

// const port = process.env.PORT;
const port = process.env.PORT;
app.listen(port, () => {
  console.log("[ server app.js 가동 완료 | http://localhost:3000/ ]");
});
