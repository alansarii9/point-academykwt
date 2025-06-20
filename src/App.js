import React, { useState, useEffect } from "react";

export default function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("players");
    return saved ? JSON.parse(saved) : [];
  });

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    phone: "",
    birthYear: "",
    position: "",
    joined: "",
    size: "",
    sessions: 0,
    totalSessions: 0,
    renewCount: 0,
    renewed: false
  });

  const [expandedYears, setExpandedYears] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  const handleAdd = () => {
    setPlayers(prev => [...prev, { ...newPlayer, id: Date.now() }]);
    setNewPlayer({ name: "", phone: "", birthYear: "", position: "", joined: "", size: "", sessions: 0, totalSessions: 0, renewCount: 0 });
  };

  const toggleYear = (year) => {
    setExpandedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const markAttendance = (id) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newSessions = p.sessions + 1;
          let renewCount = p.renewCount;
          let sessions = newSessions;
          if (newSessions >= 12) {
            sessions = 0;
            renewCount += 1;
          }
          return { ...p, sessions, totalSessions: p.totalSessions + 1, renewCount };
        }
        return p;
      })
    );
  };

  const undoAttendance = (id) => {
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newSessions = Math.max(p.sessions - 1, 0);
          const newTotal = Math.max(p.totalSessions - 1, 0);
          return { ...p, sessions: newSessions, totalSessions: newTotal };
        }
        return p;
      })
    );
  };

  const deletePlayer = (id) => {
    if (window.confirm("هل تريد حذف هذا اللاعب؟")) {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleRenew = (id) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, renewed: !p.renewed } : p
      )
    );
  };

  const grouped = players.reduce((acc, p) => {
    acc[p.birthYear] = acc[p.birthYear] || [];
    acc[p.birthYear].push(p);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort();

  if (!authenticated) {
    return (
      <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
        <h2>🔒 أدخل كلمة المرور للدخول</h2>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Password"
        />
        <button onClick={() => {
          if (passwordInput === "point2025") {
            setAuthenticated(true);
          } else {
            alert("كلمة المرور غير صحيحة");
          }
        }}>دخول</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", direction: "rtl" }}>
      <h2>📋 إضافة لاعب جديد</h2>
      <input placeholder="الاسم" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
      <input placeholder="الهاتف" value={newPlayer.phone} onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })} />
      <input placeholder="سنة الميلاد" value={newPlayer.birthYear} onChange={e => setNewPlayer({ ...newPlayer, birthYear: e.target.value })} />
      <input placeholder="المركز" value={newPlayer.position} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })} />
      <input type="date" value={newPlayer.joined} onChange={e => setNewPlayer({ ...newPlayer, joined: e.target.value })} />
      <input placeholder="المقاس" value={newPlayer.size} onChange={e => setNewPlayer({ ...newPlayer, size: e.target.value })} />
      <button onClick={handleAdd}>➕ إضافة</button>

      <h2 style={{ marginTop: "30px" }}>📌 قائمة اللاعبين حسب المواليد</h2>
      {sortedYears.map(year => (
        <div key={year}>
          <h3 style={{ cursor: "pointer", color: "blue" }} onClick={() => toggleYear(year)}>
            ▶️ {year} ({grouped[year].length} لاعب)
          </h3>
          {expandedYears.includes(year) && (
            <ul>
              {grouped[year].map(player => (
                <li key={player.id} style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  margin: "10px 0",
                  listStyle: "none"
                }}>
                  <strong>{player.name}</strong><br />
                  🎂 {player.birthYear} | 📱 {player.phone} | 📏 {player.size} | 🏟️ {player.position}<br />
                  🗓️ تاريخ الانضمام: {player.joined}<br />
                  🧮 الحصص: {player.sessions} / 💯 الكلي: {player.totalSessions} | 🔁 الدفعات: {player.renewCount}
                  <div style={{ marginTop: "10px" }}>
                    <button onClick={() => markAttendance(player.id)}>✅ حضور</button>
                    <button onClick={() => undoAttendance(player.id)}>↩️ تراجع</button>
                    <button onClick={() => toggleRenew(player.id)} style={{ backgroundColor: player.renewed ? "green" : "gray", color: "#fff", marginLeft: "5px" }}>
                      🔄 تجديد
                    </button>
                    <button onClick={() => deletePlayer(player.id)} style={{ backgroundColor: "#f55", color: "white", marginLeft: "5px" }}>🗑️ حذف</button>
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
