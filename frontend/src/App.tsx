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
    const ws = new WebSocket('ws://localhost:8080/chat');
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
    <div className="app-layout" style={{ display: 'flex', gap: '20px', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="chat-container" style={{ flex: 3 }}>
        <h2>Chatting as: {username}</h2>
        <div className="message-list" style={{ border: '1px solid #ccc', height: '400px', overflowY: 'auto', marginBottom: '10px', padding: '10px' }}>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
      
      <div className="user-sidebar" style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
        <h3>Active Users</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user, index) => (
            <li key={index} style={{ padding: '5px 0', color: user === username ? '#00d8ff' : 'inherit' }}>
              {user} {user === username && '(You)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
