mport React, { useState, useEffect } from "react";

/* ===========================
   エクササイズ定義
=========================== */
const exercises = [
  { id: 1, name: "スクワット", emoji: "🦵" },
  { id: 2, name: "プッシュアップ", emoji: "💪" },
  { id: 3, name: "クランチ", emoji: "🔥" },
  { id: 4, name: "ランジ", emoji: "🏃" },
  { id: 5, name: "バーピー", emoji: "⚡" },
  { id: 6, name: "デッドバグ", emoji: "🧘" }
];

/* ===========================
   週間メニュー（id参照に修正）
=========================== */
const weeklyPlan = [
  { day: "月", exercises: [1, 2] },
  { day: "火", exercises: [3, 6] },
  { day: "水", exercises: [1, 4] },
  { day: "木", exercises: [2, 5] },
  { day: "金", exercises: [1, 3] },
  { day: "土", exercises: [4, 5] },
  { day: "日", exercises: [6] }
];

export default function MuscleApp() {
  const [logs, setLogs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [apiKey, setApiKey] = useState("");

  /* ===========================
     LocalStorage 読み込み
  =========================== */
  useEffect(() => {
    const savedLogs = localStorage.getItem("muscleLogs");
    const savedKey = localStorage.getItem("muscleGeminiKey");

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedKey) setApiKey(savedKey);
  }, []);

  /* ===========================
     保存処理
  =========================== */
  const saveLog = (exerciseName) => {
    const newLog = {
      id: Date.now(),
      exercise: exerciseName,
      date: new Date().toLocaleString()
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("muscleLogs", JSON.stringify(updated));
  };

  const saveApiKey = () => {
    localStorage.setItem("muscleGeminiKey", apiKey);
    alert("APIキーを保存しました");
  };

  /* ===========================
     今日のメニュー取得
  =========================== */
  const todayIndex = new Date().getDay(); // 0=日曜
  const planIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayPlan = weeklyPlan[planIndex];

  /* ===========================
     Gemini API 呼び出し
  =========================== */
  const sendToGemini = async () => {
    if (!apiKey) {
      alert("Google Gemini APIキーを入力してください");
      return;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: chatInput }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    alert(data?.candidates?.[0]?.content?.parts?.[0]?.text || "エラー");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🏋️ 筋トレ管理アプリ</h1>

      <h2>📅 今日のメニュー（{todayPlan.day}）</h2>
      {todayPlan.exercises.map((id) => {
        const ex = exercises.find((e) => e.id === id);
        return (
          <button
            key={ex.id}
            onClick={() => saveLog(ex.name)}
            style={{ margin: 5 }}
          >
            {ex.emoji} {ex.name}
          </button>
        );
      })}

      <h2>📊 トレーニング履歴</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.exercise} - {log.date}
          </li>
        ))}
      </ul>

      <h2>🤖 AI相談（Google Gemini）</h2>
      <input
        type="password"
        placeholder="Google Gemini APIキー"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button onClick={saveApiKey}>保存</button>

      <br />
      <textarea
        placeholder="相談内容を書く"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        rows={4}
        style={{ width: "100%", marginTop: 10 }}
      />
      <button onClick={sendToGemini} style={{ marginTop: 5 }}>
        送信
      </button>
    </div>
  );
}