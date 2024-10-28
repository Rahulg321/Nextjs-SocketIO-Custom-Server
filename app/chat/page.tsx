"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";
import { FormEvent, useEffect, useState, useTransition } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("chat message", (msg) => {
      console.log("message: ", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat message");
    };
  }, []);

  const formSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    startTransition(() => {
      e.preventDefault();
      console.log("Sending message...");
      socket.emit("chat message", message, (response) => {
        console.log(response);
      });
      setMessage("");
    });
  };

  return (
    <div className="block-space big-container">
      <h1>Socket.io Client</h1>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>

      <div>
        <h2>Chat Messages</h2>
        <span>Total messages Recieved {messages.length}</span>
        <ul className="space-y-2 list-disc pl-4">
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>

      <div className="container">
        <h2 className="mb-4">Send Chat Message</h2>
        <form action="" className="space-y-4" onSubmit={formSubmitHandler}>
          <Input
            className=""
            type="text"
            placeholder="type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
      {/* <Button
        onClick={() => {
          console.log("Sending event...");
          socket.emit("hello", "world", (response) => {
            console.log(response); // "got it"
          });
          console.log("done......");
        }}
      >
        Send Event
      </Button> */}
    </div>
  );
}
