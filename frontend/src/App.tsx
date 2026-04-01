import { useState, useEffect, useRef } from 'react';
import './App.css'

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [username] = useState(() => 'User' + Math.floor(Math.random() * 1000));
  const socket = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize WebSocket connection to the Ktor backend
    const ws = new WebSocket('ws://192.168.0.25:8080/chat');
    socket.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'users') {
          setUsers(data.users);
          return;
        }
        const msg = data;
        setMessages((prev) => [...prev, `${msg.sender}: ${msg.text}`]);
      } catch (e) {
        setMessages((prev) => [...prev, event.data]);
      }
    };

    ws.onclose = () => console.log('WebSocket connection closed');

    return () => {
      ws.close();
    };
  }, []);

  // Automatically scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && socket.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ sender: username, text: input });
      socket.current.send(payload);
      setInput('');
    }
  };

  return (
    <div className="app-layout">
      <div className="chat-container">
        <h2>Chatting as: {username}</h2>
        <div className="message-list">
          {messages.map((msg, index) => {
            const separatorIndex = msg.indexOf(': ');
            if (separatorIndex !== -1) {
              const sender = msg.substring(0, separatorIndex);
              const text = msg.substring(separatorIndex + 2);
              return (
                <div key={index} className="message-item">
                  <strong className={`message-sender ${sender === username ? 'is-me' : ''}`}>{sender}</strong>
                  <span className="message-text">{text}</span>
                </div>
              );
            }
            return <div key={index} className="system-message">{msg}</div>;
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
      
      <div className="user-sidebar">
        <h3>Active Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index} className={`user-item ${user === username ? 'is-me' : ''}`}>
              {user} {user === username && '(You)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
