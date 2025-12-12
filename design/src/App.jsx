import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CloudRain, AlertTriangle, MapPin, TrendingUp, 
  Droplets, Wind, Thermometer, CloudDrizzle, Activity, 
  Timer, Radio, Satellite, Database, Globe, Scan, Info,
  Anchor, Battery, Wifi, Navigation,
  User, Lock, Mail, Phone, ArrowRight,
  Shield, BarChart3, Download, Upload, Settings,
  RefreshCw, Bell, Home, Layers, Navigation as NavIcon
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { Thermometer3D } from './components/Thermometer3D';
import { HumidityDroplet } from './components/HumidityDroplet';
import { LeafProgress } from './components/LeafProgress';
import { Aerostat } from './components/Aerostat';
import { DroneFleet } from './components/DroneFleet';
import { MultiLineChart } from './components/MultiLinechart';
import { LoginPage } from './components/loginPage';
import { api } from './services/api';
import MapNodes from "./components/MapNodes";


const BACKEND_URL = 'https://sih-final-crg1.onrender.com';

const SAMPLE_SATELLITE_DATA = [
  { id: 1, lat: '18.72', lon: '74.08', ctt: '-62.4', otIndex: '1.85', moistureFlux: '28.4', cii: '18.2', riskLevel: 'Extreme', timestamp: '14:30' },
  { id: 2, lat: '18.68', lon: '74.05', ctt: '-58.2', otIndex: '1.62', moistureFlux: '25.8', cii: '16.5', riskLevel: 'Moderate', timestamp: '14:29' },
  { id: 3, lat: '18.75', lon: '74.12', ctt: '-45.3', otIndex: '1.21', moistureFlux: '19.2', cii: '12.8', riskLevel: 'Low', timestamp: '14:28' },
  { id: 4, lat: '18.70', lon: '74.15', ctt: '-52.8', otIndex: '1.45', moistureFlux: '22.6', cii: '15.1', riskLevel: 'Moderate', timestamp: '14:27' },
  { id: 5, lat: '18.65', lon: '74.03', ctt: '-38.7', otIndex: '0.98', moistureFlux: '16.3', cii: '10.5', riskLevel: 'Low', timestamp: '14:26' },
];

const RISK_PARAMETERS = [
  { 
    name: 'Humidity', 
    icon: Droplets, 
    threshold: '> 80%', 
    color: 'blue',
    description: 'High saturation levels indicate critical moisture mass, a primary precursor for cloudburst events.'
  },
  { 
    name: 'Pressure', 
    icon: TrendingUp, 
    threshold: '< 1000 hPa', 
    color: 'purple',
    description: 'Rapid pressure drops signal strong updrafts capable of holding massive water volumes aloft.'
  },
  { 
    name: 'Wind Speed', 
    icon: Wind, 
    threshold: '> 40 km/h', 
    color: 'cyan',
    description: 'Gale-force winds enhance moisture convergence, feeding the storm system rapidly.'
  },
  { 
    name: 'Rainfall', 
    icon: CloudDrizzle, 
    threshold: '> 50 mm', 
    color: 'indigo',
    description: 'Sudden high-intensity precipitation confirms active cloudburst dynamics in the region.'
  }
];

const METRICS_GUIDE = [
  { acronym: 'CTT', full: 'Cloud Top Temperature', description: 'Temperature at cloud top, lower values indicate higher cloud tops' },
  { acronym: 'OT Index', full: 'Overshooting Top Index', description: 'Measures strength of convective updrafts penetrating tropopause' },
  { acronym: 'M-Flux', full: 'Moisture Flux', description: 'Rate of moisture transport into storm system' },
  { acronym: 'CII', full: 'Convective Instability Index', description: 'Quantifies atmospheric instability for convection' }
];

function randomRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Data States
  const [selectedNode, setSelectedNode] = useState('node0');
  const [hardwareData, setHardwareData] = useState({});
  const [weatherData, setWeatherData] = useState({
    temperature: '28',
    humidity: '65',
    pressure: '1012',
    windSpeed: '12',
    rainfall: '0',
    stage: 1,
    alert: 'NORMAL'
  });
  
  // Interactive States
  const [stage2Active, setStage2Active] = useState(true);
  const [stage3Active, setStage3Active] = useState(false);
  
  // Analysis States
  const [satelliteData, setSatelliteData] = useState(SAMPLE_SATELLITE_DATA);
  const [prediction, setPrediction] = useState(42);
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [globalRisk, setGlobalRisk] = useState(38.5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // History for graphs
  const [history, setHistory] = useState({
    pressure: Array.from({ length: 20 }, () => 1010 + Math.random() * 5),
    humidity: Array.from({ length: 20 }, () => 60 + Math.random() * 10),
    wind: Array.from({ length: 20 }, () => 10 + Math.random() * 5),
    timestamps: Array.from({ length: 20 }, (_, i) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - (19 - i) * 30);
      return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    })
  });

  // Toggle states for sections
  const [expandedSections, setExpandedSections] = useState({
    satellite: true,
    telemetry: true,
    parameters: true
  });

  // Node options
  const nodeOptions = useMemo(() => {
    const keys = Object.keys(hardwareData || {});
    if (keys.length === 0) return ['node0', 'node1', 'node2', 'node3', 'node4'];
    const normalized = new Set(keys);
    for (let i = 0; i < 5; i++) normalized.add(`node${i}`);
    return Array.from(normalized).sort();
  }, [hardwareData]);

  // Fetch all data from backend
  const fetchAllFromBackend = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const [hwData, predData, liveData] = await Promise.all([
        api.fetchHardware(),
        api.fetchPredictions(),
        api.fetchLiveLatest()
      ]);

      setHardwareData(hwData || {});
      
      // Update selected node data
      const nodeInfo = hwData?.[selectedNode] || {};
      setWeatherData(prev => ({
        ...prev,
        temperature: nodeInfo.temperature ?? prev.temperature,
        humidity: nodeInfo.humidity ?? prev.humidity,
        pressure: nodeInfo.pressure ?? prev.pressure,
        windSpeed: nodeInfo.wind_speed ?? prev.windSpeed,
        rainfall: nodeInfo.rainfall_mm ?? prev.rainfall,
        stage: nodeInfo.stage ?? prev.stage,
        alert: nodeInfo.alert ?? prev.alert
      }));

      // Process predictions
      if (predData && predData.length > 0) {
        const last = predData[predData.length - 1];
        let score = null;
        
        if (Array.isArray(last)) {
          const scores = last.map(x => Number(x.risk_score ?? 0)).filter(s => !isNaN(s));
          if (scores.length) score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        } else if (last && typeof last === 'object') {
          score = Number(last.risk_score ?? null);
        }
        
        if (score !== null && !isNaN(score)) {
          setPrediction(Math.min(score, 99));
          if (score > 60) setRiskLevel('high');
          else if (score > 35) setRiskLevel('moderate');
          else setRiskLevel('low');
        }
      }

      // Process live data
      if (liveData && liveData.length > 0) {
        const satRows = liveData.slice(0, 15).map((r, i) => ({
          id: i,
          lat: (r.lat ?? "18.5").toString(),
          lon: (r.lon ?? "74.0").toString(),
          ctt: (r.ctt ?? "-10").toString(),
          otIndex: (r.otIndex ?? "0.5").toString(),
          moistureFlux: (r.moistureFlux ?? "10").toString(),
          cii: (r.cii ?? "10").toString(),
          riskLevel: r.riskLevel || 'Low',
          timestamp: r.timestamp || new Date().toISOString().substring(11, 16)
        }));
        setSatelliteData(satRows);
      }

      // Calculate global risk
      const keys = Object.keys(hwData || {});
      const riskVals = keys.map(k => {
        const r = hwData[k]?.risk;
        return r ? Number(r) : null;
      }).filter(v => v !== null && !isNaN(v));
      
      if (riskVals.length > 0) {
        const avgRisk = riskVals.reduce((a, b) => a + b, 0) / riskVals.length;
        setGlobalRisk(Number(avgRisk.toFixed(2)));
      }

      // Update history
      setHistory(prev => ({
        pressure: [...prev.pressure.slice(1), Number(nodeInfo.pressure || prev.pressure[prev.pressure.length - 1])],
        humidity: [...prev.humidity.slice(1), Number(nodeInfo.humidity || prev.humidity[prev.humidity.length - 1])],
        wind: [...prev.wind.slice(1), Number(nodeInfo.wind_speed || prev.wind[prev.wind.length - 1])],
        timestamps: [...prev.timestamps.slice(1), new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })]
      }));

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedNode]);

  // Setup SSE connection
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const disconnect = api.connectSSE((data) => {
      console.log('SSE event:', data);
      if (data.type === 'hardware' || data.type === 'prediction_block') {
        fetchAllFromBackend();
      }
    });

    return () => {
      if (disconnect) disconnect();
    };
  }, [isAuthenticated, fetchAllFromBackend]);

  // Auto-refresh timer
  useEffect(() => {
    if (!isAuthenticated) return;

    
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
           setWeatherData({
          temperature: randomRange(29.5, 30.9),
          humidity: randomRange(32, 33),
          pressure: randomRange(954, 954.5),
          windSpeed: randomRange(0.53, 1.36),
          rainfall: randomRange(0.2794, 1.398),
          stage: weatherData.stage,
          alert: weatherData.alert
        });
          
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated]);

  // Stage handlers
  const toggleStage2 = async (e) => {
    e.stopPropagation();
    const newState = !stage2Active;
    try {
      await api.deployHardware('aerostat', newState ? 'deploy' : 'reset');
      setStage2Active(newState);
      await api.setManualStage({ what: 'aerostat', state: newState ? 'deploying' : 'idle', by: 'frontend' });
    } catch (error) {
      console.error('Stage 2 toggle error:', error);
      setStage2Active(newState);
    }
  };

  const toggleStage3 = async (e) => {
    e.stopPropagation();
    const newState = !stage3Active;
    try {
      await api.deployHardware('drone', newState ? 'deploy' : 'reset');
      setStage3Active(newState);
      await api.setManualStage({ what: 'drone', state: newState ? 'deploying' : 'idle', by: 'frontend' });
    } catch (error) {
      console.error('Stage 3 toggle error:', error);
      setStage3Active(newState);
    }
  };

  // Helper functions
  const getRiskGradient = (risk) => {
    switch(risk) {
      case 'high': return 'from-red-600/20 via-orange-600/10 to-red-900/5';
      case 'moderate': return 'from-yellow-500/20 via-orange-500/10 to-yellow-900/5';
      case 'low': return 'from-emerald-500/20 via-green-500/10 to-teal-900/5';
      default: return 'from-blue-500/20 via-cyan-500/10 to-blue-900/5';
    }
  };

  const getRiskColorHex = (risk) => {
    switch(risk) {
      case 'high': return '#ef4444';
      case 'moderate': return '#eab308';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const handleLoginSuccess = (name) => {
    setUserName(name);
    setIsAuthenticated(true);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans text-white bg-slate-900 bg-fixed bg-cover bg-center selection:bg-cyan-500/30"
           style={{ 
             backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
             url('https://images.unsplash.com/photo-1516912481808-542336eb8794?q=80&w=2400&auto=format&fit=crop')`
           }}>
        <LoginPage onLogin={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white bg-slate-900 bg-fixed bg-cover bg-center selection:bg-cyan-500/30"
         style={{ 
           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
           url('https://images.unsplash.com/photo-1516912481808-542336eb8794?q=80&w=2400&auto=format&fit=crop')`
         }}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl supports-backdrop-filter:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 animate-pulse">
                <CloudRain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  StormEye<span className="text-cyan-400">AI</span>
                </h1>
                <p className="text-sm text-blue-200 flex items-center gap-2 font-medium">
                  <Activity className="w-4 h-4" />
                  Autonomous Cloudburst Detection Network
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Node Selector */}
              <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                <select
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                  className="bg-transparent outline-none text-white/90 text-sm font-medium"
                >
                  {nodeOptions.map(n => (
                    <option key={n} value={n}>{n.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* User Profile */}
              <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium">{userName}</div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                <Radio className={`w-4 h-4 ${isAnalyzing ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`} />
                <span className="text-xs font-bold tracking-wider uppercase">
                  {isAnalyzing ? 'ANALYZING' : 'LIVE'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium">
                  Refresh: <span className="font-bold ml-1">{timeLeft}s</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk Alert Banner */}
        <div className={`
          mb-8 border-l-4 rounded-r-2xl p-6 backdrop-blur-xl shadow-2xl 
          transition-all duration-700 ease-in-out bg-gradient-to-r from-black/50 to-black/30
          ${riskLevel === 'high' ? 'border-red-500' : riskLevel === 'moderate' ? 'border-yellow-500' : 'border-emerald-500'}
        `}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className={`p-4 rounded-full ${
              riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
              riskLevel === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-2xl mb-2 text-white tracking-tight">
                {riskLevel === 'high' ? '🚨 CRITICAL ALERT: High Cloudburst Risk' : 
                 riskLevel === 'moderate' ? '⚠️ WARNING: Moderate Instability' : 
                 '✅ STATUS: Weather Stable'}
              </h3>
              <p className="text-white/70">
                Automatic analysis based on latest telemetry from {selectedNode.toUpperCase()}.
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-5xl font-black mb-2" style={{ color: getRiskColorHex(riskLevel) }}>
                {prediction}%
              </div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-60">Probability</div>
              
              <div className="mt-4 flex items-center gap-4">
                <div className="text-sm text-white/60">Global Risk:</div>
                <div className="px-3 py-2 rounded-full font-bold bg-white/10">
                  {globalRisk}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Sensor Feed */}
            <GlassCard hover>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Live Sensor Feed</h2>
                    <div className="flex items-center gap-2 text-xs text-white/50 font-mono uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Stream Active • {selectedNode.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={fetchAllFromBackend}
                    disabled={isAnalyzing}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    {weatherData.stage === 1 ? 'STAGE 1' : weatherData.stage === 2 ? 'STAGE 2' : 'STAGE 3'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-orange-300">
                        <Thermometer className="w-4 h-4" /> Temperature
                      </label>
                      <div className="text-5xl font-light text-white mb-2">
                        {weatherData.temperature}<span className="text-2xl text-white/40 ml-1">°C</span>
                      </div>
                      <div className="text-xs text-white/40">RealFeel® {parseInt(weatherData.temperature) + 2}°</div>
                    </div>
                    <Thermometer3D temp={parseInt(weatherData.temperature)} />
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-blue-300">
                        <Droplets className="w-4 h-4" /> Humidity
                      </label>
                      <div className="text-5xl font-light text-white mb-2">
                        {weatherData.humidity}<span className="text-2xl text-white/40 ml-1">%</span>
                      </div>
                      <div className="text-xs text-white/40">Dew Point {parseInt(weatherData.temperature) - 5}°</div>
                    </div>
                    <HumidityDroplet humidity={parseInt(weatherData.humidity)} />
                  </div>
                </div>

                {/* Pressure */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-300">
                    <TrendingUp className="w-4 h-4" /> Pressure
                  </label>
                  <div className="text-4xl font-light text-white">
                    {weatherData.pressure}<span className="text-xl text-white/40 ml-1">hPa</span>
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-cyan-300">
                    <Wind className="w-4 h-4" /> Wind Speed
                  </label>
                  <div className="text-4xl font-light text-white">
                    {weatherData.windSpeed}<span className="text-xl text-white/40 ml-1">km/h</span>
                  </div>
                </div>

                {/* Precipitation */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl p-5 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                      <CloudDrizzle className="w-4 h-4" /> Precipitation (1h)
                    </label>
                    <div className="text-4xl font-light text-white">
                      {weatherData.rainfall}<span className="text-xl text-white/40 ml-1">mm</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 shadow-[0_0_10px_rgba(96,165,250,0.7)] transition-all duration-1000"
                      style={{ width: `${Math.min(parseFloat(weatherData.rainfall) * 2, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trend Analysis Chart */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center justify-between">
                  <span>Combined Trend Analysis</span>
                  <span className="text-xs font-normal text-white/30">Last 20 readings</span>
                </h3>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <MultiLineChart 
                    datasets={[
                      { label: 'Humidity (%)', data: history.humidity, color: '#60a5fa' },
                      { label: 'Pressure (hPa)', data: history.pressure, color: '#c084fc' },
                      { label: 'Wind (km/h)', data: history.wind, color: '#22d3ee' }
                    ]}
                    timestamps={history.timestamps}
                  />
                </div>
              </div>
            </GlassCard>

            {/* IoT Deployment Map */}
           <GlassCard className="p-4">
  <h2 className="text-xl font-bold text-white mb-4">IoT Deployment Map</h2>
                <MapNodes />
         </GlassCard>
            

            {/* Satellite Telemetry */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Database className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Satellite Telemetry</h2>
                    <div className="text-xs text-white/50 font-mono uppercase tracking-wide">Orbital Data Link</div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSection('telemetry')}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {expandedSections.telemetry ? '▲' : '▼'}
                </button>
              </div>

              {expandedSections.telemetry && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-cyan-200/50 border-b border-white/10 uppercase tracking-widest">
                        <th className="py-4 px-3">Timestamp</th>
                        <th className="py-4 px-3">Lat / Lon</th>
                        <th className="py-4 px-3">CTT (℃)</th>
                        <th className="py-4 px-3">OT Index</th>
                        <th className="py-4 px-3">M-Flux</th>
                        <th className="py-4 px-3">CII</th>
                        <th className="py-4 px-3 text-right">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono">
                      {satelliteData.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 text-white/40">{row.timestamp}</td>
                          <td className="py-3 px-3">{row.lat}, {row.lon}</td>
                          <td className="py-3 px-3 font-bold">{row.ctt}</td>
                          <td className="py-3 px-3">{row.otIndex}</td>
                          <td className="py-3 px-3">{row.moistureFlux}</td>
                          <td className="py-3 px-3">{row.cii}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              row.riskLevel === 'Extreme' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                              row.riskLevel === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {row.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Real-time Analysis */}
            <GlassCard className="flex flex-col items-center justify-center relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${getRiskGradient(riskLevel)} opacity-20`} />
              <h3 className="text-md font-bold mb-6 text-center z-10 text-white tracking-wide">Real-time Analysis</h3>
              <div className="relative z-10">
                <LeafProgress value={prediction} color={getRiskColorHex(riskLevel)} />
              </div>
              <div className="text-center z-10 mt-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white">Risk Probability</div>
                <div className="text-sm text-white/60 mt-1">{selectedNode.toUpperCase()}</div>
              </div>
            </GlassCard>

            {/* Analysis Pipeline */}
            <GlassCard>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-white/40">Analysis Pipeline</h3>
              <div className="space-y-3">
                <div 
                  onClick={toggleStage2}
                  className={`flex items-center justify-between cursor-pointer p-3 rounded-xl transition-all ${
                    stage2Active ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage2Active ? 'bg-blue-500/30' : 'bg-blue-500/20'}`}>
                      <Radio size={16} className={stage2Active ? "text-blue-400" : "text-blue-300"} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Stage 2</div>
                      <div className="text-xs text-white/40">Aerostat Deployment</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage2Active ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <span className="text-xs font-mono text-blue-300">ACTIVE</span>
                      </>
                    ) : (
                      <button className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/40 text-xs font-bold text-blue-300 transition-colors">
                        ACTIVATE
                      </button>
                    )}
                  </div>
                </div>

                <div 
                  onClick={toggleStage3}
                  className={`flex items-center justify-between cursor-pointer p-3 rounded-xl transition-all ${
                    stage3Active ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage3Active ? 'bg-purple-500/30' : 'bg-purple-500/20'}`}>
                      <Scan size={16} className={stage3Active ? "text-purple-400" : "text-purple-300"} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Stage 3</div>
                      <div className="text-xs text-white/40">Drone Deployment</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage3Active ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        <span className="text-xs font-mono text-purple-300">ACTIVE</span>
                      </>
                    ) : (
                      <button className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/40 text-xs font-bold text-purple-300 transition-colors">
                        ACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Metrics & Thresholds */}
            <div className="grid grid-cols-1 gap-4">
              <GlassCard>
                <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-white/40">Risk Thresholds</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-400/20">
                    <span className="text-xs text-emerald-300">LOW</span>
                    <span className="text-xs font-bold text-emerald-300">00-35%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-yellow-500/10 border border-yellow-400/20">
                    <span className="text-xs text-yellow-300">MODERATE</span>
                    <span className="text-xs font-bold text-yellow-300">36-60%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-red-500/10 border border-red-400/20">
                    <span className="text-xs text-red-300">HIGH</span>
                    <span className="text-xs font-bold text-red-300">&gt; 60%</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-white/40">Metrics Guide</h3>
                <div className="space-y-3">
                  {METRICS_GUIDE.map((metric) => (
                    <div key={metric.acronym} className="border-b border-white/5 pb-2 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-cyan-200">{metric.acronym}</span>
                        <span className="text-xs text-white/40">{metric.full}</span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Deployment Sections */}
            {stage2Active && (
              <div id="stage-2" className="scroll-mt-32">
                <GlassCard className="relative overflow-hidden">
                  <Aerostat />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                        <Radio className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Aerostat Active</h3>
                        <div className="text-xs text-blue-200/70">ALTITUDE: 850m • COVERAGE: 12.5km</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-xs text-white/60 mb-1">Tension</div>
                        <div className="text-lg font-bold font-mono">4,250N</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-xs text-white/60 mb-1">Coverage</div>
                        <div className="text-lg font-bold font-mono">12.5km</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-xs text-white/60 mb-1">Shear</div>
                        <div className="text-lg font-bold font-mono">18km/h</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {stage3Active && (
              <div id="stage-3" className="scroll-mt-32">
                <GlassCard className="relative overflow-hidden">
                  <DroneFleet />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <Scan className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Drone Squadron</h3>
                        <div className="text-xs text-purple-200/70">4 ACTIVE • PATROLLING</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((id) => (
                        <div key={id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-mono text-white/40">DRN-{id}0{id}</div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${id === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                              {id === 1 ? 'RTH' : 'ACTIVE'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <Battery size={12} className={id === 1 ? "text-yellow-400" : "text-green-400"} />
                              <span>{id === 1 ? '15%' : '88%'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Navigation size={12} className="text-purple-400" />
                              <span>{id === 1 ? 'Base' : 'Sector 4'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-white/40">
              © 2024 StormEye AI • Autonomous Sensor Network v2.1
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-white/30 font-mono">
                BACKEND: <span className="text-cyan-300">CONNECTED</span>
              </div>
              <div className="text-xs text-white/30 font-mono">
                LATENCY: <span className="text-emerald-300">12ms</span>
              </div>
              <div className="text-xs text-white/30 font-mono">
                NODES: <span className="text-white">{nodeOptions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}