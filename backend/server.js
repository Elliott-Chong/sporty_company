const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("config");
const session = require("express-session");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const PORT = 5001;
const dotenv = require("dotenv");
const yes = dotenv.config({ path: "../.env" }).parsed;
const production = yes.REACT_APP_PRODUCTION === "true";
app.use(
  cors({
    origin: production
      ? "https://sportbuddy-elle.netlify.app"
      : "http://localhost:3000",
    credentials: true,
  })
);
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://sportbuddy-elle.netlify.app"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Application-Type, application-type"
//   );
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,DELETE");

//   req.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   req.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Application-Type, application-type"
//   );
//   req.header("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,DELETE");
//   next();
// });

app.use(express.json({ extended: false }));
app.use(
  session({
    secret: config.get("session_secret"),
    resave: false,
    saveUninitialized: false,
  })
);

connectDB();

app.get("/", (req, res) => res.send("SportBuddy api running updated 5"));

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("new message", (data) => {
    io.emit("new message", data);
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/listing", require("./routes/listing"));

server.listen(process.env.PORT || PORT, () =>
  console.log(
    production ? "Production: " : "Development: ",
    "Server Running on http://localhost:5001"
  )
);
