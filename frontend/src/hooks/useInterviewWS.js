import { useEffect, useState, useRef } from 'react';

export const useInterviewWS = (wsUrl, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!wsUrl) return;

    const token = localStorage.getItem('token');
    const urlWithToken = `${wsUrl}?token=${token}`;  // For backend auth
    const ws = new WebSocket(urlWithToken);

    ws.onopen = () => {
      console.log('WS Connected to agent');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'connected') {
        console.log(data.message);
      } else if (data.type === 'agent_response') {
        onMessage(data);  // Callback to handle response (e.g., add to transcript + TTS)
      }
    };

    ws.onclose = () => {
      console.log('WS Closed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WS Error:', error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [wsUrl, onMessage]);

  const sendMessage = (message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WS not connected');
    }
  };

  return { sendMessage, isConnected };
};