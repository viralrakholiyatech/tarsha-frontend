import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { db } from "../../../firebase";
import { ref, get } from "firebase/database";

mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function MapShowComponent() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); 

  const loadData = async () => {
    try {
      const now = new Date();
      const formattedDate = now
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");

      const dataRef = ref(db, `employee_live_locations/${formattedDate}`);
      const snapshot = await get(dataRef);

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (snapshot.exists()) {
        const data = snapshot.val();
        let initialized = false;

        for (const userId in data) {
          const locationEntries = data[userId]?.location;
          if (!locationEntries) continue;

          // Get latest entry based on `date`
          const sortedEntries = Object.values(locationEntries).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          const latestEntry = sortedEntries[0];
          if (!latestEntry?.latitude || !latestEntry?.longitude) continue;

          const { latitude, longitude, name, date } = latestEntry;
          const locationDate = new Date(date);
          const diffMinutes = (now - locationDate) / (1000 * 60); // Difference in minutes

          // Decide marker color
          const color = diffMinutes <= 30 ? "green" : "red";

          // Initialize map
          if (!initialized) {
            mapRef.current = new mapboxgl.Map({
              container: mapContainerRef.current,
              style: "mapbox://styles/mapbox/streets-v11",
              center: [longitude, latitude],
              zoom: 13,
            });
            initialized = true;
          }

          // Add marker
          const marker = new mapboxgl.Marker({ color })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup().setText(
                `${name} (ID: ${userId})\nLast Update: ${locationDate.toLocaleTimeString()}`
              )
            )
            .addTo(mapRef.current);

          markersRef.current.push(marker);
        }
      } else {
        console.log("No location data found for today");
      }
    } catch (error) {
      console.error("Error loading map data:", error);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      console.log("Refreshing map...");
      loadData();
    }, 5 * 60 * 1000); // every 5 minutes

    return () => {
      clearInterval(interval);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default MapShowComponent;
