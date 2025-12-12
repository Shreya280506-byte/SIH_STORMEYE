# --------------------------------------------------------------
# src/api/app.py — FINAL FIXED VERSION
# --------------------------------------------------------------
# ✔ node0 = REAL ONLY (never touched by simulation or stage deploy)
# ✔ Stage 2 & 3 effects apply ONLY to node1–node4
# ✔ hardware_output ALWAYS includes valid node0
# ✔ ingest/hardware only updates node0
# ✔ Predictions & Live CSV fully App.jsx compatible
# ✔ SSE /api/updates stable and push full snapshots
# --------------------------------------------------------------

import os
import json
import random
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse


# --------------------------------------------------------------
# PATHS
# --------------------------------------------------------------
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA = os.path.join(ROOT, "data")
os.makedirs(DATA, exist_ok=True)

HW_JSON = os.path.join(DATA, "hardware_output.json")
PRED_JSON = os.path.join(DATA, "predictions.json")
DEPLOY_JSON = os.path.join(DATA, "deploy_state.json")
SMS_LOG = os.path.join(DATA, "sms_log.json")
LIVE_CSV = os.path.join(DATA, "live.csv")

NODE_IDS = ["node0", "node1", "node2", "node3", "node4"]


# --------------------------------------------------------------
# UTILITIES
# --------------------------------------------------------------
def now_iso() -> str:
    return datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()


def safe_read(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return default


def safe_write(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, default=str)


# --------------------------------------------------------------
# INITIALIZE BASE HARDWARE FILE
# --------------------------------------------------------------
if not os.path.exists(HW_JSON):
    base = {
        nid: {
            "node_id": nid,
            "stage": 1,
            "temperature": 25.0,
            "pressure": 1012.0,
            "humidity": 60.0,
            "rainfall_mm": 0.0,
            "wind_speed": 2.0,
            "risk": 5.0,
            "updated_at": now_iso(),
        }
        for nid in NODE_IDS
    }
    safe_write(HW_JSON, base)

if not os.path.exists(PRED_JSON):
    safe_write(PRED_JSON, [])

if not os.path.exists(DEPLOY_JSON):
    safe_write(DEPLOY_JSON, {"aerostat": "idle", "drone": "idle"})


# --------------------------------------------------------------
# SSE PUB/SUB
# --------------------------------------------------------------
_SUBS: List[asyncio.Queue] = []


async def push_sse(event: Dict[str, Any]):
    event["ts"] = now_iso()
    dead = []
    for q in _SUBS:
        try:
            await q.put(event)
        except:
            dead.append(q)
    for q in dead:
        try:
            _SUBS.remove(q)
        except:
            pass


# --------------------------------------------------------------
# STAGE 2 & 3 EFFECTS — ONLY NODES 1–4
# --------------------------------------------------------------
def apply_stage2_effects(hw: Dict[str, Any], active: bool):
    """Apply Stage 2 ONLY to node1–node4."""
    for nid in NODE_IDS:
        if nid == "node0":
            continue     # NEVER modify node0

        node = hw.get(nid, {})
        if active:
            node["stage"] = 2
            node["cloud_env_radar_dbz"] = node.get("cloud_env_radar_dbz", 5) + random.uniform(8, 18)
            node["cloud_env_echo_top"] = node.get("cloud_env_echo_top", 5000) + random.uniform(500, 1200)
            node["cloud_env_moisture_column"] = node.get("cloud_env_moisture_column", 20) + random.uniform(3, 7)
            node["cloud_env_ctc"] = node.get("cloud_env_ctc", 0) + random.uniform(0.2, 0.8)
            node["risk"] = min(99, node.get("risk", 10) + random.uniform(12, 28))
        else:
            node["stage"] = 1

        node["updated_at"] = now_iso()
        hw[nid] = node

    return hw


def apply_stage3_effects(hw: Dict[str, Any], active: bool):
    """Apply Stage 3 ONLY to node1–node4."""
    for nid in NODE_IDS:
        if nid == "node0":
            continue     # NEVER modify node0

        node = hw.get(nid, {})
        if active:
            node["stage"] = 3
            node["burst_dbz_growth"] = random.uniform(5, 22)
            node["burst_rainfall_burst"] = random.uniform(10, 40)
            node["micro_vertical_wind"] = random.uniform(0.5, 4)
            node["risk"] = min(99, node.get("risk", 25) + random.uniform(20, 35))
        else:
            node["stage"] = 1

        node["updated_at"] = now_iso()
        hw[nid] = node

    return hw


# --------------------------------------------------------------
# FASTAPI APP
# --------------------------------------------------------------
app = FastAPI(title="StormEye Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/")
def home():
    return {"ok": True, "msg": "StormEye backend running"}


# --------------------------------------------------------------
# API: HARDWARE OUTPUT
# --------------------------------------------------------------
@app.get("/api/hardware_output")
def api_hw_output():
    """Frontend main hardware fetch."""
    hw = safe_read(HW_JSON, {})
    # Always ensure node0 exists
    if "node0" not in hw:
        hw["node0"] = {
            "node_id": "node0",
            "stage": 1,
            "temperature": 25,
            "pressure": 1012,
            "humidity": 60,
            "rainfall_mm": 0,
            "wind_speed": 2,
            "risk": 5,
            "updated_at": now_iso(),
        }
        safe_write(HW_JSON, hw)
    return hw


# --------------------------------------------------------------
# API: PREDICTIONS
# --------------------------------------------------------------
@app.get("/api/predictions")
def api_predictions():
    preds = safe_read(PRED_JSON, [])
    if isinstance(preds, list) and preds:
        last = preds[-1]
        if isinstance(last, dict) and "risk_score" in last:
            return [{"risk": last["risk_score"]}]
    return [{"risk": 5}]


# --------------------------------------------------------------
# INGEST HARDWARE — ONLY node0
# --------------------------------------------------------------
@app.post("/ingest/hardware")
async def ingest_hw(payload: Dict[str, Any]):
    """
    Raspberry Pi must send:
        { "node_id": "node0", temperature, pressure, humidity, ... }
    """
    nid = payload.get("node_id")
    if nid != "node0":
        raise HTTPException(400, "Only node0 can ingest real hardware input")

    hw = safe_read(HW_JSON, {})

    if "node0" not in hw:
        hw["node0"] = {"node_id": "node0"}

    for k in ["temperature", "pressure", "humidity", "rainfall_mm", "wind_speed"]:
        if k in payload:
            hw["node0"][k] = float(payload[k])

    hw["node0"]["stage"] = int(payload.get("stage", 1))
    hw["node0"]["updated_at"] = now_iso()

    safe_write(HW_JSON, hw)

    asyncio.create_task(push_sse({
        "type": "hardware_update",
        "node": "node0",
        "data": hw["node0"]
    }))

    return {"ok": True}


# --------------------------------------------------------------
# DEPLOY STAGE 2 / STAGE 3
# --------------------------------------------------------------
@app.post("/api/deploy")
async def api_deploy(payload: Dict[str, Any]):
    what = payload.get("what")
    action = payload.get("action", "deploy")

    if what not in ["aerostat", "drone"]:
        raise HTTPException(400, "Invalid 'what' value")

    active = (action == "deploy")

    hw = safe_read(HW_JSON, {})

    if what == "aerostat":
        hw = apply_stage2_effects(hw, active)
    else:
        hw = apply_stage3_effects(hw, active)

    safe_write(HW_JSON, hw)

    await push_sse({"type": "hardware_update", "data": hw})
    return {"ok": True, "what": what, "active": active}


# --------------------------------------------------------------
# SSE STREAM
# --------------------------------------------------------------
@app.get("/api/updates")
async def api_updates(request: Request):

    async def event_stream(queue: asyncio.Queue):
        hw = safe_read(HW_JSON, {})
        await queue.put({"type": "hardware_update", "data": hw})

        while True:
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(queue.get(), timeout=20)
                yield {"event": "message", "data": json.dumps(event)}
            except asyncio.TimeoutError:
                yield {"event": "message",
                       "data": json.dumps({"type": "keepalive", "ts": now_iso()})}

        try:
            _SUBS.remove(queue)
        except:
            pass

    q = asyncio.Queue()
    _SUBS.append(q)
    return EventSourceResponse(event_stream(q))


# --------------------------------------------------------------
# DIRECT SMS (Frontend)
# --------------------------------------------------------------
@app.post("/api/sms_alert")
async def sms_alert(payload: Dict[str, Any]):
    to = payload.get("numbers", [])
    msg = payload.get("message", "")
    # Logging only (Twilio optional)
    log = safe_read(SMS_LOG, [])
    log.append({"ts": now_iso(), "to": to, "msg": msg})
    safe_write(SMS_LOG, log)
    return {"ok": True}


# --------------------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------------------
@app.get("/_health")
def health():
    return {"ok": True, "subscribers": len(_SUBS)}
