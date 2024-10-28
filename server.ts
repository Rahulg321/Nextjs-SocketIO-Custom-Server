import { createServer } from "node:http";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.use((socket, next) => {
    console.log("middleware function executed before a request");
    next();
  });

  io.on("connection", (socket: Socket) => {
    // ...
    console.log("connection was made successfully");

    socket.on("chat message", (msg) => {
      console.log("message: " + msg);

      // this will send the event to everyone
      io.emit("chat message", msg);
    });

    socket.on("hello", (arg, callback) => {
      console.log("a hello event was received");
      console.log(arg); // "world"
      callback("got it");
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
