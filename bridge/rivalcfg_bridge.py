#!/usr/bin/env python3
"""rivalcfgUI bridge: single Python helper the Electron main process talks to.

Protocol: one JSON request per stdin line, one JSON response per stdout line.
Requests:  {"op": "ping"|"devices"|"detect"|"run", "args": [...]}
  devices  -> catalog of all supported devices (from src/data/devices.json)
  detect   -> {"plugged": [pidhex, ...]} via rivalcfg.devices.list_plugged_devices()
  run      -> run rivalcfg CLI with args, return stdout/stderr/returncode
"""
import json
import os
import shutil
import subprocess
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
CATALOG = os.path.join(BASE, "..", "src", "data", "devices.json")
RIVALCFG = os.environ.get("RIVALCFG_BIN", shutil.which("rivalcfg") or "rivalcfg")


def respond(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def detect():
    try:
        import rivalcfg.devices as rdev
        out = [
            {"vendor_id": format(d["vendor_id"], "04x"),
             "product_id": format(d["product_id"], "04x"),
             "name": d["name"]}
            for d in rdev.list_plugged_devices()
        ]
        return {"plugged": out, "ok": True}
    except Exception as exc:  # noqa: BLE001
        return {"plugged": [], "ok": False, "error": str(exc)}


def run(args):
    try:
        proc = subprocess.run([RIVALCFG] + list(args), capture_output=True, text=True, timeout=15)
        return {"ok": proc.returncode == 0, "stdout": proc.stdout, "stderr": proc.stderr,
                "returncode": proc.returncode}
    except FileNotFoundError:
        return {"ok": False, "stdout": "", "stderr": "rivalcfg binary not found", "returncode": -1}
    except subprocess.TimeoutExpired:
        return {"ok": False, "stdout": "", "stderr": "rivalcfg timed out", "returncode": -2}


def load_catalog():
    try:
        with open(CATALOG, encoding="utf-8") as fh:
            return {"catalog": json.load(fh), "ok": True}
    except Exception as exc:  # noqa: BLE001
        return {"catalog": [], "ok": False, "error": str(exc)}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError as exc:
            respond({"id": None, "ok": False, "error": "bad json: %s" % exc})
            continue
        rid = req.get("id")
        op = req.get("op")
        wrap = lambda obj, _rid=rid: {**obj, "id": _rid}
        if op == "ping":
            respond(wrap({"ok": True, "rivalcfg": RIVALCFG}))
        elif op == "devices":
            respond(wrap(load_catalog()))
        elif op == "detect":
            respond(wrap(detect()))
        elif op == "run":
            respond(wrap(run(req.get("args", []))))
        else:
            respond(wrap({"ok": False, "error": "unknown op: %s" % op}))


if __name__ == "__main__":
    main()