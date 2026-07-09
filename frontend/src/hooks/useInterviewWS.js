import { useEffect, useState, useRef, useCallback } from 'react';

export const useInterviewWS = (wsUrl, onMessage, onError) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const intentionalClose = useRef(false);

  useEffect(() => {
    if (!wsUrl) return;

    const token = localStorage.getItem('token');
    const urlWithToken = `${wsUrl}?token=${token}`;
    const ws = new WebSocket(urlWithToken);
    intentionalClose.current = false;

    ws.onopen = () => {
      console.log('WS Connected to agent');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log(data.message);
        } else if (data.type === 'agent_response') {
          onMessage(data);
        } else if (data.type === 'error') {
          console.error('WS agent error:', data.message);
          if (onError) onError(data.message);
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WS Closed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WS Error:', error);
      if (onError) onError('Connection error. Please check your network.');
    };

    wsRef.current = ws;

    return () => {
      intentionalClose.current = true;
      ws.close();
    };
  }, [wsUrl, onMessage, onError]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WS not connected');
    }
  }, []);

  const closeWS = useCallback(() => {
    intentionalClose.current = true;
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return { sendMessage, isConnected, closeWS };
};