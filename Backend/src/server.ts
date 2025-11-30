import app from "./app.js";
import { initSocket } from "./utils/socket.js";
import http from "http";
const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
