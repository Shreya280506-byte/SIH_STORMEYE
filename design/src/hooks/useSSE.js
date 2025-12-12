// src/hooks/useSSE.js
import { useEffect, useState, useRef } from "react";

/**
 * Connects to SSE endpoint and collects incoming events.
 * `url` default '/stream/updates'
 * incoming events payloads may be various types; this hook collects a lightweight event list.
 */
export default function useSSE(url = "/stream/updates") {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    try {
      const es = new EventSource(url);
      esRef.current = es;
      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        // generic onmessage fallback
        try {
          const parsed = JSON.parse(e.data);
          setEvents(prev => [parsed, ...prev].slice(0, 200));
        } catch {
          setEvents(prev => [{ raw: e.data }, ...prev].slice(0, 200));
        }
      };
      es.addEventListener("update", (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          setEvents(prev => [parsed, ...prev].slice(0, 200));
        } catch {
          setEvents(prev => [{ raw: ev.data }, ...prev].slice(0, 200));
        }
      });
      es.onerror = (err) => {
        console.error("SSE error", err);
        es.close();
        setConnected(false);
      };
      return () => {
        es.close();
        setConnected(false);
      };
    } catch (e) {
      console.error("SSE init failed", e);
    }
  }, [url]);

  return { events, connected };
}
