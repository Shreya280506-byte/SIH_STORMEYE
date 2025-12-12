// src/hooks/useTelemetry.js
import { useEffect, useState } from "react";

/**
 * Poll /api/live_latest every `intervalMs`.
 * Returns { rows, loading, error }
 */
export default function useTelemetry({ url = "/api/live_latest", intervalMs = 5000 } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(Array.isArray(json) ? json : []);
    } catch (e) {
      setErr(e);
      console.error("useTelemetry load error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [url, intervalMs]);

  return { rows, loading, error: err };
}
