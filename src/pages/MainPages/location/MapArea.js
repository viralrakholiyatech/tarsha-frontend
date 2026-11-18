import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  Polyline,
} from "@react-google-maps/api";
import { Sun, Moon } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DEFAULT_CENTER = {
  lat: 21.1702,
  lng: 72.8311,
};
const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const CustomMarker = ({ member, position, isActive, onClick }) => {
  const size = isActive ? 40 : 32;
  const zIdx = isActive ? 1000 : 500;

  let statusClass = "status-online";
  let opacity = 1;
  let grayscale = 0;

  if (member.status === "gps-lost") {
    statusClass = "status-gps-lost";
  } else if (member.status === "off") {
    statusClass = "status-off";
    grayscale = 1;
    opacity = 0.7;
  }

  const pos = Array.isArray(position)
    ? { lat: position[0], lng: position[1] }
    : position;

  return (
    <OverlayView position={pos} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div
        className="position-absolute translate-middle"
        style={{ zIndex: zIdx, cursor: "pointer" }}
        onClick={onClick}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm transition-all"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: member.color,
            opacity: opacity,
            filter: `grayscale(${grayscale})`,
            fontSize: isActive ? "0.875rem" : "0.75rem",
          }}
        >
          {member.initials}
          <div
            className={`status-badge-marker ${statusClass} position-absolute bottom-0 end-0 border border-2 border-white rounded-circle`}
            style={{
              width: "12px",
              height: "12px",
              marginBottom: "-2px",
              marginRight: "-2px",
            }}
          ></div>
        </div>
        <div
          className={`position-absolute bottom-100 start-50 translate-middle-x mb-2 bg-white rounded-3 shadow border border-light p-3 z-index-2000 ${
            isActive ? "d-block" : "d-none tooltip-hover"
          }`}
          style={{ width: "192px", zIndex: 2000 }}
        >
          <div className="text-start" style={{ fontFamily: "sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="small text-dark">{member.name}</strong>
              <span
                className={`small fw-bold ${
                  member.battery <= 20 ? "text-danger" : "text-success"
                }`}
              >
                {member.battery}%
              </span>
            </div>
            <div className="small border-top border-light pt-2 text-muted">
              <p className="m-0">
                Status:{" "}
                <span
                  className={
                    member.status === "online"
                      ? "text-success fw-bold"
                      : "text-muted"
                  }
                >
                  {member.status}
                </span>
              </p>
            </div>
          </div>
          <div
            className="position-absolute start-50 translate-middle-x"
            style={{
              top: "100%",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
            }}
          ></div>
        </div>
      </div>
    </OverlayView>
  );
};

const MapArea = ({ currentMode, markersData, polylinesData, memberRoutes }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAl9XsDOkvHUszB3yBzrV4kIkEsGOls-Zc",
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && markersData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersData.forEach((marker) => {
        const pos = Array.isArray(marker.position)
          ? { lat: marker.position[0], lng: marker.position[1] }
          : marker.position;
        bounds.extend(pos);
      });
      map.fitBounds(bounds);
    } else if (map) {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(12);
    }
  }, [map, markersData]);

  if (!isLoaded)
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light">
        Loading Maps...
      </div>
    );

  return (
    <div
      className="flex-grow-1 position-relative d-flex flex-column transition-all"
      style={{ height: "100vh", width: "60%" }}
    >
      {currentMode === "member" && (
        <div
          id="snapshots-panel"
          className="bg-light border-bottom border-light p-4 gap-4 flex-shrink-0 overflow-auto d-flex"
          style={{
            height: memberRoutes && memberRoutes.length > 0 ? "35%" : "64px",
          }}
        >
          {memberRoutes && memberRoutes.length > 0 ? (
            memberRoutes.map((route) => {
              const points = route.points;
              const periodColor = "#6366f1";
              const center = points.length > 0 ? points[0] : DEFAULT_CENTER;

              return (
                <div
                  key={route.id}
                  className="flex-fill bg-white rounded-3 shadow-sm border border-secondary position-relative overflow-hidden d-flex flex-column"
                  style={{ minWidth: "300px" }}
                >
                  <div
                    className="position-absolute top-0 start-0 m-2 z-index-10 px-2 py-1 rounded small fw-bold text-dark shadow-sm border border-light d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(4px)",
                      zIndex: 10,
                    }}
                  >
                    Call {route.id}
                  </div>
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={center}
                    zoom={14}
                    options={{
                      ...options,
                      disableDefaultUI: true,
                      zoomControl: false,
                      draggable: false,
                      scrollwheel: false,
                      disableDoubleClickZoom: true,
                    }}
                    onLoad={(map) => {
                      if (points.length > 0) {
                        const bounds = new window.google.maps.LatLngBounds();
                        points.forEach((p) => bounds.extend(p));
                        map.fitBounds(bounds);
                      }
                    }}
                  >
                    {points.length > 1 ? (
                      <Polyline
                        path={points}
                        options={{ strokeColor: periodColor, strokeWeight: 3 }}
                      />
                    ) : (
                      points.length === 1 && (
                        <OverlayView
                          position={points[0]}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <div
                            className="bg-primary rounded-circle border border-2 border-white shadow-sm position-absolute translate-middle"
                            style={{ width: "12px", height: "12px" }}
                          />
                        </OverlayView>
                      )
                    )}
                  </GoogleMap>
                </div>
              );
            })
          ) : (
            <div
              className="d-flex align-items-center justify-content-center w-100 h-100 text-muted fst-italic"
              style={{ fontSize: "10px" }}
            >
              No record found
            </div>
          )}
        </div>
      )}

      <div
        className="flex-1 position-relative w-100 min-h-0"
        style={{ flex: 1 }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={DEFAULT_CENTER}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={options}
        >
          {markersData.map((marker, idx) => (
            <CustomMarker
              key={idx}
              member={marker.member}
              position={marker.position}
              isActive={marker.isActive}
            />
          ))}

          {polylinesData &&
            polylinesData.map((poly, idx) => {
              const path = poly.positions.map((p) => ({
                lat: p[0],
                lng: p[1],
              }));
              return (
                <Polyline
                  key={idx}
                  path={path}
                  options={{ strokeColor: poly.color, strokeWeight: 3 }}
                />
              );
            })}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapArea;
