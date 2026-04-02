"""WebSocket endpoint for real-time notifications."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from api.core.security import decode_token
from api.realtime.ws_manager import manager

router = APIRouter()

@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket, token: str = Query(...)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001, reason="Unauthorized")
        return
    user_id = payload["sub"]
    await manager.connect(user_id, websocket)
    try:
        await websocket.send_json({"type": "connected", "user_id": user_id})
        while True:
            data = await websocket.receive_json()
            # Echo back for ping/pong
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
