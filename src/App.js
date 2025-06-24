// ✅ Point Academy App – تعديل بيانات اللاعب بدون صور مع خاصية "استلم اللبس"

import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    phone: "",
    birthYear: "",
    position: "",
    joined: "",
    size: "",
    price: "",
    sessions: 0,
    totalSessions: 0,
    renewCount: 0,
    renewed: false,
    uniformReceived: false
  });
  const [editId, setEditId] = useState(null);
  const [expandedYears, setExpandedYears] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, "players"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  const handleAdd = async () => {
    if (!newPlayer.name || !newPlayer.phone) return;

    if (editId) {
      await updateDoc(doc(db, "players", editId), newPlayer);
      setEditId(null);
    } else {
      await addDoc(collection(db, "players"), newPlayer);
    }

    setNewPlayer({
      name: "",
      phone: "",
      birthYear: "",
      position: "",
      joined: "",
      size: "",
      price: "",
      sessions: 0,
      totalSessions: 0,
      renewCount: 0,
      renewed: false,
      uniformReceived: false
    });

    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const deletePlayer = async (id) => {
    if (!window.confirm("هل تريد حذف هذا اللاعب؟")) return;
    await deleteDoc(doc(db, "players", id));
    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const markAttendance = async (id) => {
    const playerRef = doc(db, "players", id);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) return;

    const player = playerSnap.data();
    let newSessions = player.sessions + 1;
    let renewCount = player.renewCount;
    if (newSessions >= 12) {
      newSessions = 0;
      renewCount += 1;
    }

    await updateDoc(playerRef, {
      sessions: newSessions,
      totalSessions: player.totalSessions + 1,
      renewCount
    });

    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const undoAttendance = async (id) => {
    const playerRef = doc(db, "players", id);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) return;

    const player = playerSnap.data();
    const newSessions = Math.max(player.sessions - 1, 0);
    const newTotal = Math.max(player.totalSessions - 1, 0);

    await updateDoc(playerRef, {
      sessions: newSessions,
      totalSessions: newTotal
    });

    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const toggleRenew = async (id) => {
    const playerRef = doc(db, "players", id);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) return;

    const player = playerSnap.data();
    await updateDoc(playerRef, { renewed: !player.renewed });

    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const toggleUniform = async (id) => {
    const playerRef = doc(db, "players", id);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) return;

    const player = playerSnap.data();
    await updateDoc(playerRef, { uniformReceived: !player.uniformReceived });

    const snapshot = await getDocs(collection(db, "players"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlayers(data);
  };

  const startEdit = (player) => {
    setNewPlayer(player);
    setEditId(player.id);
  };

  const grouped = players.reduce((acc, p) => {
    acc[p.birthYear] = acc[p.birthYear] || [];
    acc[p.birthYear].push(p);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort();

  if (!authenticated) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>🔒 أدخل كلمة المرور للدخول</h2>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Password"
        />
        <button onClick={() => passwordInput === "point2025" && setAuthenticated(true)}>
          دخول
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial", direction: "rtl", backgroundColor: "#e6f2ff", minHeight: "100vh" }}>
      <img src="/logo.jpg" alt="شعار الأكاديمية" style={{ width: '120px', marginBottom: '20px' }} />

      <h2>📋 إضافة / تعديل لاعب</h2>
      <input placeholder="الاسم" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
      <input placeholder="الهاتف" value={newPlayer.phone} onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })} />
      <input placeholder="سنة الميلاد" value={newPlayer.birthYear} onChange={e => setNewPlayer({ ...newPlayer, birthYear: e.target.value })} />
      <input placeholder="المركز" value={newPlayer.position} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })} />
      <input type="date" value={newPlayer.joined} onChange={e => setNewPlayer({ ...newPlayer, joined: e.target.value })} />
      <input placeholder="المقاس" value={newPlayer.size} onChange={e => setNewPlayer({ ...newPlayer, size: e.target.value })} />
      <input placeholder="سعر الاشتراك" value={newPlayer.price} onChange={e => setNewPlayer({ ...newPlayer, price: e.target.value })} />
      <button onClick={handleAdd}>{editId ? "💾 حفظ التعديل" : "➕ إضافة"}</button>

      <h2 style={{ marginTop: 30 }}>📌 قائمة اللاعبين حسب المواليد</h2>
      {sortedYears.map(year => (
        <div key={year}>
          <h3 style={{ cursor: "pointer", color: "blue" }} onClick={() => setExpandedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year])}>
            ▶️ {year} ({grouped[year].length} لاعب)
          </h3>
          {expandedYears.includes(year) && (
            <ul>
              {grouped[year].map(player => (
                <li key={player.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 10, margin: "10px 0", listStyle: "none" }}>
                  <strong>{player.name}</strong><br />
                  🎂 {player.birthYear} | 📱 {player.phone} | 📏 {player.size} | 🏟️ {player.position} | 💰 {player.price} د.ك<br />
                  🗓️ تاريخ الانضمام: {player.joined}<br />
                  🧮 الحصص: {player.sessions} / 💯 الكلي: {player.totalSessions} | 🔁 الدفعات: {player.renewCount}
                  <br />
                  👕 اللبس: <span style={{ color: player.uniformReceived ? "green" : "red" }}>{player.uniformReceived ? "استلم" : "لم يستلم"}</span>
                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => markAttendance(player.id)}>✅ حضور</button>
                    <button onClick={() => undoAttendance(player.id)}>↩️ تراجع</button>
                    <button onClick={() => toggleRenew(player.id)} style={{ backgroundColor: player.renewed ? "green" : "gray", color: "#fff", marginLeft: 5 }}>
                      🔄 تجديد
                    </button>
                    <button onClick={() => toggleUniform(player.id)} style={{ backgroundColor: player.uniformReceived ? "green" : "red", color: "#fff", marginLeft: 5 }}>
                      👕 اللبس
                    </button>
                    <button onClick={() => startEdit(player)} style={{ marginLeft: 5 }}>✏️ تعديل</button>
                    <button onClick={() => deletePlayer(player.id)} style={{ backgroundColor: "#f55", color: "white", marginLeft: 5 }}>🗑️ حذف</button>
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
