const BACKEND_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
  }

  async fetchHardware() {
    try {
      const response = await fetch(`${BACKEND_BASE}/hardware_output`);
      if (!response.ok) throw new Error('Hardware fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Hardware fetch error:', error);
      throw error;
    }
  }

  async fetchPredictions() {
    try {
      const response = await fetch(`${BACKEND_BASE}/predictions`);
      if (!response.ok) throw new Error('Predictions fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Predictions fetch error:', error);
      throw error;
    }
  }

  async fetchLiveLatest() {
    try {
      const response = await fetch(`${BACKEND_BASE}/live_latest`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Live latest fetch error:', error);
      return [];
    }
  }

  async deployHardware(type, action) {
    try {
      const response = await fetch(`${BACKEND_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what: type, action, by: 'frontend' })
      });
      return await response.json();
    } catch (error) {
      console.error('Deploy error:', error);
      throw error;
    }
  }

  async setManualStage(data) {
    try {
      const response = await fetch(`${BACKEND_BASE}/manual_stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Manual stage error:', error);
      throw error;
    }
  }

  connectSSE(callback) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${BACKEND_BASE}/stream/updates`);
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setTimeout(() => {
        if (this.eventSource.readyState === EventSource.CLOSED) {
          this.connectSSE(callback);
        }
      }, 5000);
    };

    return () => {
      if (this.eventSource) {
        this.eventSource.close();
      }
    };
  }

  async ingestHardware(data) {
    try {
      const response = await fetch(`${BACKEND_BASE}/ingest/hardware`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Ingest error:', error);
      throw error;
    }
  }
}

export const api = new ApiService();