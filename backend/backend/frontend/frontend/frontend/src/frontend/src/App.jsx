import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND, { transports: ["websocket","polling"] });

export default function App(){
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  useEffect(()=>{
    socket.on("reply", m => setMsgs(prev => [...prev, {from:'aivana', text: m}]));
    return () => socket.off("reply");
  },[]);

  const sendSocket = () => {
    if(!text) return;
    setMsgs(prev => [...prev, {from:'you', text}]);
    socket.emit("message", text);
    setText("");
  };

  const askHTTP = async () => {
    if(!text) return;
    setMsgs(prev => [...prev, {from:'you', text}]);
    const r = await fetch(`${BACKEND}/api/assistant`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ prompt: text })
    });
    const data = await r.json();
    setMsgs(prev => [...prev, {from:'aivana', text: data.reply}]);
    setText("");
  };

  return (
    <div className="wrap">
      <h1>Aivana — your Jarvis (demo)</h1>
      <div className="chat">
        {msgs.map((m,i)=>(<div key={i} className={"msg "+(m.from==="you"?"you":"ai")}>
          <b>{m.from}:</b> {m.text}
        </div>))}
      </div>
      <div className="row">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Ask anything..." />
        <button onClick={sendSocket}>Send</button>
        <button onClick={askHTTP}>Ask</button>
      </div>
    </div>
  );
  }
