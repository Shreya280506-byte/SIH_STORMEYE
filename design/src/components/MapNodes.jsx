// src/components/MapNodes.jsx
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import React from "react";

const nodeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

const centerNode = [30.3165, 78.0322]; // Example (Dehradun)

const nodes = [
 { id: "Node 1", coords: [30.3170, 78.0330] }, // NE
  { id: "Node 2", coords: [30.3155, 78.0335] }, // E
  { id: "Node 3", coords: [30.3160, 78.0310] }, // SW
  { id: "Node 4", coords: [30.3175, 78.0315] }, // NW
  { id: "Node 5", coords: [30.3158, 78.0328] }, // Near center
];

export default function MapNodes() {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-xl border border-white/10">
      <MapContainer center={centerNode} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Central Hub Marker */}
        <Marker position={centerNode} icon={nodeIcon}>
          <Popup>Central Hub</Popup>
        </Marker>

        {/* Node Markers + Star Topology Lines */}
        {nodes.map((node) => (
    <React.Fragment key={node.id}>
         <Marker position={node.coords} icon={nodeIcon}>
           <Popup>{node.id}</Popup>
       </Marker>

    <Polyline
      positions={[centerNode, node.coords]}
      pathOptions={{ color: "cyan", weight: 2 }}
    />
  </React.Fragment>
))}

      </MapContainer>
    </div>
  );
}
