import { useEffect, useState } from 'react';
import { wsClient } from '../services/websocket';
import { useAppStore } from '../store/useAppStore';
import type { WebSocketMessage, Alert, Person, Camera } from '../types';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const { addAlert, upsertPerson, updateCamera } = useAppStore();

  useEffect(() => {
    wsClient.connect();

    const removeStatus = wsClient.onStatus(setConnected);
    const removeMessage = wsClient.onMessage((msg: WebSocketMessage) => {
      switch (msg.type) {
        case 'alert':
          addAlert(msg.payload as Alert);
          break;
        case 'detection':
          upsertPerson(msg.payload as Person);
          break;
        case 'camera_status':
          updateCamera((msg.payload as Camera).id, msg.payload as Partial<Camera>);
          break;
      }
    });

    return () => {
      removeStatus();
      removeMessage();
    };
  }, [addAlert, upsertPerson, updateCamera]);

  return { connected };
}
