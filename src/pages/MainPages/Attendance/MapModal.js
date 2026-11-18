import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token
mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapModal = ({ latitude, longitude, outLatitude, outLongitude, show, handleClose }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // Store map instance
  const markersRef = useRef([]); // Store multiple markers

  useEffect(() => {
    if (!latitude || !longitude) return; // Prevent errors if no coordinates
  
    // Remove previous markers from the map
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  
    // Initialize the map only once
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current, // Container ID
        style: "mapbox://styles/mapbox/streets-v11", // Map style
        center: [longitude, latitude], // Center map around check-in
        zoom: 14, // Starting zoom
      });
    }
  
    const map = mapRef.current;
  
    // Add Check-in Marker (Green)
    if (latitude && longitude) {
      const checkInMarker = new mapboxgl.Marker({ color: "green" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setText("Check-in Location"))
        .addTo(map);
      markersRef.current.push(checkInMarker);
    }
  
    // Add Check-out Marker (Red)
    if (outLatitude && outLongitude) {
      const checkOutMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([outLongitude, outLatitude])
        .setPopup(new mapboxgl.Popup().setText("Check-out Location"))
        .addTo(map);
      markersRef.current.push(checkOutMarker);
    }
  
    // Adjust map bounds to fit both markers if they exist
    if (markersRef.current.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markersRef.current.forEach((marker) => bounds.extend(marker.getLngLat()));
      map.fitBounds(bounds, { padding: 50 });
    } else {
      map.setCenter([longitude, latitude]);
      map.setZoom(14);
    }
  }, [latitude, longitude, outLatitude, outLongitude]);
  
  return (
    <div className={`modal ${show ? "show" : ""}`} style={{ display: show ? "block" : "none" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Location Map</h5>
            <button type="button" className="close" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div ref={mapContainerRef} style={{ width: "100%", height: "500px", borderRadius: "8px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
