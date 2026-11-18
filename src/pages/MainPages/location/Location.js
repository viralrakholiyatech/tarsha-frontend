import React, { useState, useEffect } from "react";
import MapArea from "./MapArea";
import ControlPanel from "./ControlPanel";
import { db } from "../../../firebase";
import axios from "axios";
import { getToken } from "../../../services/useLocalStorage";
import { getLiveLocation } from "../../../config/config";
import ApiService from "../../../services/ApiService";


const TODAY = new Date().toISOString().split("T")[0];

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 10; h <= 20; h++) {
    const maxMinutes = h === 20 ? 1 : 60; 
    for (let m = 0; m < maxMinutes; m += 5) {
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      );
    }
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

const Location = ({ mode = "live" }) => {
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    setCurrentMode(mode);
    setMemberRoutes([]);
    setPolylinesData([]);
    setSelectedTime(null);
    if (mode === "live") {
      setSelectedDate(TODAY);
    }
  }, [mode]);

  const [teamMembers, setTeamMembers] = useState([]);
  const [memberHistory, setMemberHistory] = useState({});
  const [todayCall, setTodayCall] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeDataLoading, setEmployeeDataLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedTime, setSelectedTime] = useState(null);

  const [markersData, setMarkersData] = useState([]);
  const [polylinesData, setPolylinesData] = useState([]);
  const [memberRoutes, setMemberRoutes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      setEmployeeDataLoading(true); 
      try {
        const header = {
          Authorization: `Bearer ${getToken()}`,
          ["Content-Type"]: "application/json",
        };

        const res = await ApiService(
          null,
          selectedDate,
          header,
          getLiveLocation.method,
          getLiveLocation.url,
        );

        setTodayCall(res?.data?.data || []);

      } catch (error) {
        console.error("Error fetching technician data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);


  useEffect(() => {
    setTeamMembers([]);
    setEmployeeDataLoading(true);

    if (todayCall.length === 0) {
      setEmployeeDataLoading(false);
      return;
    }

    const todayStr = selectedDate || new Date().toISOString().split("T")[0];
    const unsubscribers = [];
    const technicianIds = todayCall.map((user) => user.user_id).filter(Boolean);


    let loadedCount = 0;
    const totalTechnicians = technicianIds.length;

    technicianIds.forEach(async (techId) => {
      const { collection, query, orderBy, limit, onSnapshot, Timestamp } =
        await import("firebase/firestore");

      const path = `location/${techId}/dates/${todayStr}/entries`;
      const q = query(
        collection(db, path),
        orderBy("timestamp", "desc"),
        limit(1),
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          let latestDoc = null;
          let maxTime = 0;

          if (snapshot.empty) {
           
            loadedCount++;
            if (loadedCount === totalTechnicians) {
              setEmployeeDataLoading(false);
            }
            return;
          }

          if (!snapshot.empty) {
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const t = data.timestamp?.seconds || 0;
              if (t > maxTime) {
                maxTime = t;
                latestDoc = data;
              }
            });
          }

          setTeamMembers((prev) => {
            const existing = prev.find((m) => m.id === techId);
         

            const techInfo = todayCall.find((t) => t.user_id === techId);

            const name =
              techInfo?.name || latestDoc?.userName || `Tech ${techId}`;

            const mobile = latestDoc
              ? latestDoc.model + " " + latestDoc.brand
              : "Unknown Device";
            const battery = latestDoc?.battery || 0;
            const callNo = latestDoc?.callNo || "N/A";

            const colors = [
              "#ef4444",
              "#3b82f6",
              "#10b981",
              "#f59e0b",
              "#8b5cf6",
            ];
            const color =
              existing?.color ||
              colors[parseInt(techId) % colors.length] ||
              "#888"; // Fallback color
            const initials = name.substring(0, 2).toUpperCase();

            let isActive = false;
            let lastUpdateDate = null;
            let address = "No Data";
            let lat = 0;
            let lng = 0;

            if (latestDoc) {
              lastUpdateDate = new Date(maxTime * 1000);
              const now = new Date();
              const diffMinutes = (now - lastUpdateDate) / (1000 * 60);
              isActive = diffMinutes <= 5;
              address = isActive
                ? "Live Update"
                : `Offline (${Math.floor(diffMinutes)}m ago)`;
              lat = latestDoc.latitude;
              lng = latestDoc.longitude;
            }

            const newMember = {
              id: techId,
              name: name,
              color: color,
              initials: initials,
              model: mobile,
              battery: battery,
              callNo: callNo,
              status: isActive ? "online" : "off",
              currentLocation: {
                lat: lat,
                lng: lng,
                address: address,
                lastUpdated: lastUpdateDate,
              },
            };

           
            const others = prev.filter((m) => m.id !== techId);
            const updatedMembers = [...others, newMember];

            
            loadedCount++;
            if (loadedCount === totalTechnicians) {
              setEmployeeDataLoading(false);
            }

            return updatedMembers;
          });
        },
        (error) => {
          console.warn(`Error tracking tech ${techId}:`, error);
          loadedCount++;
          if (loadedCount === totalTechnicians) {
            setEmployeeDataLoading(false);
          }
        },
      );

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [todayCall]);

  useEffect(() => {
    if ((currentMode === "member" || currentMode === "team") && selectedDate) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
          const { collection, getDocs, orderBy, query } =
            await import("firebase/firestore");

          const usersToFetch =
            currentMode === "member" && selectedMemberId
              ? [selectedMemberId.toString()]
              : teamMembers.map((m) => m.id.toString());

          const historyMap = {};

          for (const uid of usersToFetch) {
            const entriesRef = collection(
              db,
              "location",
              uid,
              "dates",
              selectedDate,
              "entries",
            );
            const snap = await getDocs(entriesRef);

            if (!snap.empty) {
              const records = snap.docs.map((d) => d.data());

             
              records.sort(
                (a, b) =>
                  (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0),
              );

              const allPoints = [];

              records.forEach((record) => {
                const dateObj = new Date(record.timestamp.seconds * 1000);
                let h = dateObj.getHours();
                let m = dateObj.getMinutes();

                const remainder = m % 5;
                if (remainder > 7) m += 5 - remainder;
                else m -= remainder;
                if (m === 60) {
                  m = 0;
                  h += 1;
                }

                const timeString = `${h.toString().padStart(2, "0")}:${m
                  .toString()
                  .padStart(2, "0")}`;

                if (!historyMap[uid]) historyMap[uid] = {};
                if (!historyMap[uid][selectedDate])
                  historyMap[uid][selectedDate] = { allPoints: [] }; 

              
                historyMap[uid][selectedDate][timeString] = {
                  lat: record.latitude,
                  lng: record.longitude,
                  address: "History Point",
                  callNo: record.callNo,
                };

               
                allPoints.push({
                  lat: record.latitude,
                  lng: record.longitude,
                  callNo: record.callNo,
                  timestamp: record.timestamp,
                });
              });

              if (historyMap[uid] && historyMap[uid][selectedDate]) {
                historyMap[uid][selectedDate].allPoints = allPoints;
              }
            }
          }

          setMemberHistory((prev) => ({
            ...prev,
            ...historyMap,
          }));
        } catch (e) {
          console.error("Error fetching specific history:", e);
        } finally {
          setHistoryLoading(false);
        }
      };

      fetchHistory();
    }
  }, [currentMode, selectedMemberId, selectedDate, teamMembers]);

  useEffect(() => {
    if (currentMode === "live") {
      const newMarkers = teamMembers
        .filter((member) => !selectedMemberId || String(member.id) === String(selectedMemberId))
        .map((member) => {
          if (member.currentLocation) {
            return {
              position: [
                member.currentLocation.lat,
                member.currentLocation.lng,
              ],
              member: member,
              isActive: false,
            };
          }
          return null;
        })
        .filter(Boolean);

      setMarkersData(newMarkers);
      setPolylinesData([]);
      setMemberRoutes([]);
    } else if (currentMode === "member") {
      const member = teamMembers.find((m) => String(m.id) === String(selectedMemberId));
      const dayData = memberHistory[selectedMemberId]?.[selectedDate];

      if (member && dayData) {
        // Use full resolution points if available, otherwise fallback (legacy safety)
        let sourcePoints = [];
        if (dayData.allPoints) {
          sourcePoints = dayData.allPoints;
        } else {
          sourcePoints = Object.values(dayData).filter(
            (d) => d.lat && d.lng && d.callNo,
          );
        }

        // Filter valid points
        const dataPoints = sourcePoints.filter(
          (p) => p.lat && p.lng && p.callNo,
        );

        // Group by callNo
        const callGroups = {};
        console.log("dataPoints", dataPoints);
        dataPoints.forEach((p) => {
          if (!callGroups[p.callNo]) callGroups[p.callNo] = [];
          callGroups[p.callNo].push({ lat: p.lat, lng: p.lng });
        });

        console.log("callGroups", callGroups);

       
        const routes = Object.keys(callGroups).map((cNo) => ({
          id: cNo,
          points: callGroups[cNo],
        }));
        console.log("routes", routes);

        setMemberRoutes(routes);

       
        if (selectedTime && dayData[selectedTime]) {
          const loc = dayData[selectedTime];
          setMarkersData([
            {
              position: [loc.lat, loc.lng],
              member: member,
              isActive: true, 
            },
          ]);
        } else {
          setMarkersData([]);
        }
      } else {
        setMarkersData([]);
        setMemberRoutes([]);
      }
      setPolylinesData([]);
    } else if (currentMode === "team") {
      setMemberRoutes([]);
      setPolylinesData([]);

      if (selectedTime) {
        const newMarkers = [];
        teamMembers.forEach((member) => {
          const dayData = memberHistory[member.id]?.[selectedDate];
          const loc = dayData?.[selectedTime];
          if (loc) {
            newMarkers.push({
              position: [loc.lat, loc.lng],
              member: member,
              isActive: false,
            });
          }
        });
        setMarkersData(newMarkers);
      } else {
        setMarkersData([]);
      }
    }
  }, [
    currentMode,
    selectedMemberId,
    selectedDate,
    selectedTime,
    teamMembers,
    memberHistory,
  ]);

  const handleMemberSelect = (id) => {
    const stringId = id ? String(id) : null;
    if (currentMode === "member") {
      setSelectedMemberId(stringId);
    } else if (currentMode === "live") {
      setSelectedMemberId((prev) => (String(prev) === stringId ? null : stringId));
    }
  };

  return (
    <div
      className="bg-light vh-100  overflow-hidden d-flex text-dark"
      style={{ fontFamily: "sans-serif" }}
    >
    
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1060, backdropFilter: "blur(4px)" }}
        >
          <div className="d-flex flex-column align-items-center gap-4">
            <div
              className="spinner-border text-primary"
              style={{ width: "4rem", height: "4rem", borderWidth: "0.25rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="fs-5 fw-semibold text-muted">Loading data...</p>
          </div>
        </div>
      )}

     
      {!loading && employeeDataLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1060, backdropFilter: "blur(4px)" }}
        >
          <div className="d-flex flex-column align-items-center gap-4">
            <div
              className="spinner-border text-success"
              style={{ width: "4rem", height: "4rem", borderWidth: "0.25rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="fs-5 fw-semibold text-muted">
              Loading employee data...
            </p>
          </div>
        </div>
      )}

      <main
        className="flex-grow-1 position-relative d-flex flex-column flex-md-row h-100"
        style={{ width: "60%" }}
      >
        <MapArea
          currentMode={currentMode}
          markersData={markersData}
          polylinesData={polylinesData}
          memberRoutes={memberRoutes}
        />

        <ControlPanel
          currentMode={currentMode}
          teamMembers={teamMembers}
          selectedMemberId={selectedMemberId}
          setSelectedMemberId={setSelectedMemberId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          timeSlots={TIME_SLOTS}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          mockData={memberHistory}
          onMemberSelect={handleMemberSelect}
          historyLoading={historyLoading}
        />
      </main>
    </div>
  );
};

export default Location;
