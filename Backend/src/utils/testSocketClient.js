import { io } from "socket.io-client";

const userId = "ee5b7769-09cb-4f6e-a096-509e266ab6ea"; // replace with a real user ID
const socket = io("http://localhost:3000", {
  query: { userId },
});

socket.on("connect", () => console.log("✅ Connected:", socket.id));
socket.on("payment-success", (data) => {
  console.log("💰 Payment received:", data);
});
