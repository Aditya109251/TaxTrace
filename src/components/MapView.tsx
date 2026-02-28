import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapViewProps {
  projects: any[];
  onMarkerClick: (project: any) => void;
}

// Mock coordinates for demo projects to spread them out
const MOCK_COORDS: Record<string, [number, number]> = {
  'p1': [28.6139, 77.2090], // Delhi
  'p2': [19.0760, 72.8777], // Mumbai
  'p3': [13.0827, 80.2707], // Chennai
};

export const MapView: React.FC<MapViewProps> = ({ projects, onMarkerClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Ensure the container is clean
      if ((containerRef.current as any)._leaflet_id) {
        (containerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(containerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: false
      });
      
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);

      // Fix for default marker icons
      const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  // Update markers when projects change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    const getMarkerColor = (risk: string) => {
      switch (risk) {
        case 'HIGH': return '#ef4444'; // Red
        case 'MEDIUM': return '#f59e0b'; // Amber
        default: return '#10b981'; // Emerald
      }
    };

    projects.forEach((project) => {
      const position = MOCK_COORDS[project.id] || [20.5937 + (Math.random() - 0.5) * 10, 78.9629 + (Math.random() - 0.5) * 10];
      const color = getMarkerColor(project.risk_level);
      const size = project.risk_level === 'HIGH' ? 20 : 16;
      const pulseClass = project.risk_level === 'HIGH' ? 'animate-pulse' : '';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="${pulseClass}" style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${color}88; display: flex; align-items: center; justify-content: center;">
                 <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
               </div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });

      const marker = L.marker(position, { icon: customIcon });
      
      marker.bindTooltip(`
        <div class="px-3 py-2 bg-white border-2 border-royal-gold rounded-sm shadow-xl">
          <div class="font-display font-black text-sm text-royal-crimson uppercase tracking-widest">${project.title}</div>
          <div class="text-[10px] text-ink/60 font-bold uppercase tracking-tighter">${project.risk_level} RISK LEVEL</div>
        </div>
      `, { direction: 'top', offset: [0, -10] });

      marker.bindPopup(`
        <div class="p-2 font-sans" style="min-width: 150px">
          <h4 class="font-display font-black text-royal-crimson text-base border-b border-royal-gold/20 pb-1 mb-2">${project.title}</h4>
          <div class="space-y-1 mb-3">
            <p class="text-xs text-ink/80 font-bold flex justify-between">
              <span>STATUS:</span>
              <span class="text-royal-crimson">${project.status}</span>
            </p>
            <p class="text-xs text-ink/80 font-bold flex justify-between">
              <span>BUDGET:</span>
              <span>₹${(project.budget_allocated / 10000000).toFixed(1)} Cr</span>
            </p>
          </div>
          <button id="popup-btn-${project.id}" class="w-full py-2 bg-royal-crimson text-royal-gold font-display font-black text-[10px] uppercase tracking-widest hover:bg-royal-crimson/90 transition-colors border border-royal-gold">
            View Royal Dossier
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${project.id}`);
        if (btn) {
          btn.onclick = () => onMarkerClick(project);
        }
      });

      marker.on('click', () => onMarkerClick(project));

      marker.addTo(markersRef.current!);
    });
  }, [projects, onMarkerClick]);

  return (
    <div className="w-full h-full rounded-sm overflow-hidden border-4 border-royal-gold shadow-2xl bg-parchment relative">
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-parchment/95 backdrop-blur-md p-4 rounded-sm border-2 border-royal-gold shadow-2xl space-y-3">
        <div className="text-[10px] font-black text-royal-crimson uppercase tracking-[0.2em] font-display border-b border-royal-gold/30 pb-1 mb-2">Risk Ledger</div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-white shadow-lg animate-pulse" />
          <span className="text-[10px] font-black text-ink uppercase tracking-widest">High Risk</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b] border-2 border-white shadow-lg" />
          <span className="text-[10px] font-black text-ink uppercase tracking-widest">Medium Risk</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white shadow-lg" />
          <span className="text-[10px] font-black text-ink uppercase tracking-widest">Low Risk</span>
        </div>
      </div>
    </div>
  );
};
