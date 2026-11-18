import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { db } from "../../../firebase";
import { ref, get } from "firebase/database";
import {useParams} from "react-router-dom"

mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function MinutesMapShow() {
  const params = useParams()
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const loadData = async () => {
    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");
  
      const dataRef = ref(db, `employee_live_locations/${formattedDate}/${params.id}`);
      const snapshot = await get(dataRef);
  
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const locationEntries = userData?.location;
  
        if (!locationEntries) return;
  
        const entries = Object.values(locationEntries)
          .map((entry) => ({
            ...entry,
            dateObj: new Date(entry.date),
          }))
          .sort((a, b) => a.dateObj - b.dateObj); // sort by time ascending
  
        const markersToShow = entries.filter((e) => e.latitude && e.longitude);
  
        if (markersToShow.length === 0) return;
  
        let initialized = false;
  
        for (const entry of markersToShow) {
          const { latitude, longitude, name, dateObj } = entry;
  
          if (!initialized) {
            mapRef.current = new mapboxgl.Map({
              container: mapContainerRef.current,
              style: "mapbox://styles/mapbox/streets-v11",
              center: [longitude, latitude],
              zoom: 13,
            });
            initialized = true;
          }
  
          const marker = new mapboxgl.Marker({ color: "blue" })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup().setText(
                `Name: ${name}\nTime: ${dateObj.toLocaleTimeString()}`
              )
            )
            .addTo(mapRef.current);
  
          markersRef.current.push(marker);
        }
      } else {
        console.log("No data found for userId:", params.id);
      }
    } catch (error) {
      console.error("Error loading map data:", error);
    }
  };


  // poly line
  // const loadData = async () => {
  //   try {
  //     const now = new Date();
  //     const formattedDate = now.toLocaleDateString("en-GB").split("/").join("-");
  
  //     const dataRef = ref(db, `employee_live_locations/${formattedDate}/${params.id}`);
  //     const snapshot = await get(dataRef);
  
  //     // Remove old markers
  //     markersRef.current.forEach((m) => m.remove());
  //     markersRef.current = [];
  
  //     if (snapshot.exists()) {
  //       const userData = snapshot.val();
  //       const locationEntries = userData?.location;
  
  //       if (!locationEntries) return;
  
  //       const entries = Object.values(locationEntries)
  //         .map((entry) => ({
  //           ...entry,
  //           dateObj: new Date(entry.date),
  //         }))
  //         .sort((a, b) => a.dateObj - b.dateObj); // sort by time ascending
  
  //       const markersToShow = entries.filter((e) => e.latitude && e.longitude);
  //       if (markersToShow.length === 0) return;
  
  //       let initialized = false;
  //       const pathCoordinates = [];
  
  //       for (const entry of markersToShow) {
  //         const { latitude, longitude, name, dateObj } = entry;
  
  //         if (!initialized) {
  //           mapRef.current = new mapboxgl.Map({
  //             container: mapContainerRef.current,
  //             style: "mapbox://styles/mapbox/streets-v11",
  //             center: [longitude, latitude],
  //             zoom: 13,
  //           });
  
  //           mapRef.current.on("load", () => {
  //             // Add line after map loads
  //             mapRef.current.addSource("route", {
  //               type: "geojson",
  //               data: {
  //                 type: "Feature",
  //                 properties: {},
  //                 geometry: {
  //                   type: "LineString",
  //                   coordinates: pathCoordinates,
  //                 },
  //               },
  //             });
  
  //             mapRef.current.addLayer({
  //               id: "route",
  //               type: "line",
  //               source: "route",
  //               layout: {
  //                 "line-join": "round",
  //                 "line-cap": "round",
  //               },
  //               paint: {
  //                 "line-color": "#3b82f6",
  //                 "line-width": 4,
  //               },
  //             });
  //           });
  
  //           initialized = true;
  //         }
  
  //         pathCoordinates.push([longitude, latitude]);
  
  //         const marker = new mapboxgl.Marker({ color: "blue" })
  //           .setLngLat([longitude, latitude])
  //           .setPopup(
  //             new mapboxgl.Popup().setText(
  //               `Name: ${name}\nTime: ${dateObj.toLocaleTimeString()}`
  //             )
  //           )
  //           .addTo(mapRef.current);
  
  //         markersRef.current.push(marker);
  //       }
  
  //       // Update line source if map already loaded
  //       if (mapRef.current && mapRef.current.getSource("route")) {
  //         mapRef.current.getSource("route").setData({
  //           type: "Feature",
  //           properties: {},
  //           geometry: {
  //             type: "LineString",
  //             coordinates: pathCoordinates,
  //           },
  //         });
  //       }
  //     } else {
  //       console.log("No data found for userId:", params.id);
  //     }
  //   } catch (error) {
  //     console.error("Error loading map data:", error);
  //   }
  // };
  
  
  

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

export default MinutesMapShow;
