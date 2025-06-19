// src/App.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    phone: "",
    birthYear: "",
    position: "",
    joined: "",
    size: ""
  });
  const [expandedYears, setExpandedYears] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    const playerToAdd = {
      ...newPlayer,
      sessions: 0,
      sessionCycles: 0,
      renewed: false
    };
    await addDoc(collection(db, "players"), playerToAdd);
    setNewPlayer({
      name: "",
      phone: "",
      birthYear: "",
      position: "",
      joined: "",
      size: ""
    });
  };

  const toggleYear = (year) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const markRenewed = async (id, value) => {
    const playerRef = doc(db, "players", id);
    await updateDoc(playerRef, { renewed: value });
  };

  const markAttendance = async (id) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;

    let updatedSessions = player.sessions + 1;
    let updatedCycles = player.sessionCycles;

    if (updatedSessions >= 12) {
      updatedSessions = 0;
      updatedCycles += 1;
    }

    const playerRef = doc(db, "players", id);
    await updateDoc(playerRef, {
      sessions: updatedSessions,
      sessionCycles: updatedCycles
    });
  };

  const removeAttendance = async (id) => {
    const player = players.find((p) => p.id === id);
    if (!player || player.sessions === 0) return;

    const updatedSessions = Math.max(player.sessions - 1, 0);
    const playerRef = doc(db, "players", id);
    await updateDoc(playerRef, { sessions: updatedSessions });
  };

  const deletePlayer = async (id) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا اللاعب؟");
    if (confirmed) {
      await deleteDoc(doc(db, "players", id));
    }
  };

  const grouped = players.reduce((acc, p) => {
    acc[p.birthYear] = acc[p.birthYear] || [];
    acc[p.birthYear].push(p);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", direction: "rtl" }}>
      <h2>📋 إضافة لاعب جديد</h2>
      <input
        placeholder="الاسم"
        value={newPlayer.name}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, name: e.target.value })
        }
      />
      <input
        placeholder="الهاتف"
        value={newPlayer.phone}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, phone: e.target.value })
        }
      />
      <input
        placeholder="سنة الميلاد"
        value={newPlayer.birthYear}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, birthYear: e.target.value })
        }
      />
      <input
        placeholder="المركز"
        value={newPlayer.position}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, position: e.target.value })
        }
      />
      <input
        type="date"
        value={newPlayer.joined}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, joined: e.target.value })
        }
      />
      <input
        placeholder="المقاس"
        value={newPlayer.size}
        onChange={(e) =>
          setNewPlayer({ ...newPlayer, size: e.target.value })
        }
      />
      <button onClick={handleAdd}>➕ إضافة</button>

      <h2 style={{ marginTop: "30px" }}>📌 قائمة اللاعبين حسب المواليد</h2>
      {sortedYears.map((year) => (
        <div key={year}>
          <h3
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => toggleYear(year)}
          >
            ▶️ {year}
          </h3>
          {expandedYears.includes(year) && (
            <ul style={{ padding: 0 }}>
              {grouped[year].map((player) => (
                <li
                  key={player.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    listStyle: "none"
                  }}
                >
                  <strong>{player.name}</strong> - {player.phone} - {player.size}
                  <div>📆 التاريخ: {player.joined}</div>
                  <div>🎯 المركز: {player.position}</div>
                  <div>
                    ✅ الحصص الحالية:{" "}
                    <strong
                      style={{
                        color: player.sessions >= 12 ? "red" : "black"
                      }}
                    >
                      {player.sessions}
                    </strong>
                    {" / "}
                    {player.sessionCycles}️⃣
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={() => markAttendance(player.id)}
                      style={{
                        marginRight: "5px",
                        backgroundColor: "#4caf50",
                        color: "white"
                      }}
                    >
                      تسجيل حضور
                    </button>
                    <button
                      onClick={() => removeAttendance(player.id)}
                      style={{ marginRight: "5px" }}
                    >
                      تراجع
                    </button>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        marginRight: "5px"
                      }}
                    >
                      حذف
                    </button>
                    <button
                      onClick={() => markRenewed(player.id, !player.renewed)}
                      style={{
                        backgroundColor: player.renewed ? "#4caf50" : "#ccc",
                        color: "white",
                        marginRight: "5px"
                      }}
                    >
                      {player.renewed ? "✅ تم التجديد" : "🔄 تجديد"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
