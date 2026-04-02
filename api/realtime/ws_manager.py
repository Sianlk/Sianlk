"""WebSocket connection manager for real-time notifications."""
from fastapi import WebSocket
from typing import Dict, List
import json, asyncio

class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(user_id, []).append(ws)

    def disconnect(self, user_id: str, ws: WebSocket):
        if user_id in self._connections:
            self._connections[user_id] = [c for c in self._connections[user_id] if c != ws]
            if not self._connections[user_id]:
                del self._connections[user_id]

    async def send_to_user(self, user_id: str, message: dict):
        sockets = self._connections.get(user_id, [])
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)

    async def broadcast(self, message: dict):
        for user_id, sockets in list(self._connections.items()):
            await self.send_to_user(user_id, message)

    @property
    def active_connections(self) -> int:
        return sum(len(v) for v in self._connections.values())

manager = ConnectionManager()
