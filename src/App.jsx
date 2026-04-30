import [useState, useEffect, useRef] from“react”

const exercises = [
{
id: 1,
name: “スクワット”,
emoji: “🦵”,
category: “下半身”,
sets: 3,
reps: 10,
rest: 60,
color: “#FF6B35”,
description: “足を肩幅に開き、背筋を伸ばしてゆっくり腰を下ろします。膝がつま先より前に出ないように注意しましょう。”,
tips: [“背筋をまっすぐに”, “膝をつま先の方向に向ける”, “かかとに体重をかける”],
muscles: [“大腿四頭筋”, “ハムストリングス”, “臀筋”],
videoId: “aclHkVaku9U”,
},
{
id: 2,
name: “プッシュアップ”,
emoji: “💪”,
category: “上半身”,
sets: 3,
reps: 8,
rest: 60,
color: “#4ECDC4”,
description: “手を肩幅より少し広く置き、体をまっすぐに保ちながら胸が床につくまで下ろします。”,
tips: [“体をまっすぐ保つ”, “肘を45度に開く”, “ゆっくり下ろして速く上げる”],
muscles: [“大胸筋”, “三角筋”, “上腕三頭筋”],
videoId: “IODxDxX7oi4”,
},
{
id: 3,
name: “プランク”,
emoji: “🧘”,
category: “体幹”,
sets: 3,
reps: 30,
rest: 45,
isTime: true,
color: “#A78BFA”,
description: “肘とつま先で体を支え、体をまっすぐに保ちます。お腹に力を入れて30秒キープしましょう。”,
tips: [“お腹を引き締める”, “お尻を上げすぎない”, “呼吸を止めない”],
muscles: [“腹直筋”, “腹斜筋”, “脊柱起立筋”],
videoId: “ASdvN_XEl_c”,
},
{
id: 4,
name: “ランジ”,
emoji: “🏃”,
category: “下半身”,
sets: 3,
reps: 10,
rest: 60,
color: “#F59E0B”,
description: “片足を大きく前に踏み出し、後ろの膝が床に近づくまで体を下ろします。左右交互に行います。”,
tips: [“前の膝を90度に曲げる”, “上体をまっすぐ保つ”, “ゆっくりコントロールして動く”],
muscles: [“大腿四頭筋”, “ハムストリングス”, “臀筋”],
videoId: “QOVaHwm-Q6U”,
},
{
id: 5,
name: “バーピー”,
emoji: “⚡”,
category: “全身”,
sets: 3,
reps: 5,
rest: 90,
color: “#EF4444”,
description: “立位からスクワット→プランク→プッシュアップ→スクワット→ジャンプの流れで行う全身運動です。”,
tips: [“ゆっくりから始める”, “フォームを崩さない”, “休憩をしっかり取る”],
muscles: [“全身”],
videoId: “dZgVxmf6jkA”,
},
{
id: 6,
name: “デッドバグ”,
emoji: “🐛”,
category: “体幹”,
sets: 3,
reps: 10,
rest: 45,
color: “#10B981”,
description: “仰向けで手足を天井に向け、対角線の手足をゆっくり床に近づけます。腰を床に密着させ続けます。”,
tips: [“腰を床から離さない”, “呼吸を意識する”, “ゆっくり動く”],
muscles: [“腹横筋”, “多裂筋”, “腸腰筋”],
videoId: “4XLEnwUr1d8”,
},
];

const weeklyPlan = [
{ day: “月”, label: “月曜”, focus: “上半身”, exercises: [1, 2] },
{ day: “火”, label: “火曜”, focus: “休息”, exercises: [] },
{ day: “水”, label: “水曜”, focus: “下半身”, exercises: [0, 3] },
{ day: “木”, label: “木曜”, focus: “休息”, exercises: [] },
{ day: “金”, label: “金曜”, focus: “全身”, exercises: [2, 5, 4] },
{ day: “土”, label: “土曜”, focus: “体幹”, exercises: [2, 5] },
{ day: “日”, label: “日曜”, focus: “休息”, exercises: [] },
];

export default function FitnessApp() {
const [tab, setTab] = useState(“home”);
const [selectedExercise, setSelectedExercise] = useState(null);
const [logs, setLogs] = useState(() => {
try {
return JSON.parse(localStorage.getItem(“fitnessLogs”) || “[]”);
} catch { return []; }
});
const [timer, setTimer] = useState(60);
const [timerRunning, setTimerRunning] = useState(false);
const [timerInitial, setTimerInitial] = useState(60);
const intervalRef = useRef(null);
const chatEndRef = useRef(null);
const [chatMessages, setChatMessages] = useState([
{
role: “assistant”,
content: “ウィーッス！オレは脳筋トレーナーの『マッスル太郎』だ！💪\nなんでも聞いてくれ！仕事の悩みも恋愛相談も、全部筋トレで解決してやるぜ！！”,
},
]);
const [chatInput, setChatInput] = useState(””);
const [chatLoading, setChatLoading] = useState(false);
const [apiKey, setApiKey] = useState(() => {
try { return LocalStorage.getItem(“muscleGeminiKey”) || “”; } catch { return “”; }
});
const [apiKeyInput, setApiKeyInput] = useState(””);
const [showApiKey, setShowApiKey] = useState(false);
const today = new Date().getDay();
const dayIndex = today === 0 ? 6 : today - 1;

useEffect(() => {
if (timerRunning) {
intervalRef.current = setInterval(() => {
setTimer(t => {
if (t <= 1) {
clearInterval(intervalRef.current);
setTimerRunning(false);
return 0;
}
return t - 1;
});
}, 1000);
} else {
clearInterval(intervalRef.current);
}
return () => clearInterval(intervalRef.current);
}, [timerRunning]);

const startTimer = (seconds) => {
setTimerInitial(seconds);
setTimer(seconds);
setTimerRunning(true);
};

const logWorkout = (exercise) => {
const newLog = {
id: Date.now(),
exerciseId: exercise.id,
name: exercise.name,
emoji: exercise.emoji,
date: new Date().toLocaleDateString(“ja-JP”),
time: new Date().toLocaleTimeString(“ja-JP”, { hour: “2-digit”, minute: “2-digit” }),
sets: exercise.sets,
reps: exercise.reps,
};
const updated = [newLog, …logs].slice(0, 50);
setLogs(updated);
try { localStorage.setItem(“fitnessLogs”, JSON.stringify(updated)); } catch {}
};

const sendMessage = async () => {
if (!chatInput.trim() || chatLoading) return;
if (!apiKey) { setChatMessages(prev => […prev, { role: “assistant”, content: “うおお！APIキーがないぞ！上の⚙️ボタンからキーを設定してくれ！💪” }]); return; }
const userMsg = { role: “user”, content: chatInput };
const newMessages = […chatMessages, userMsg];
setChatMessages(newMessages);
setChatInput(””);
setChatLoading(true);
try {
const systemPrompt = `あなたは「マッスル太郎」という超脳筋トレーナーです。以下のルールを必ず守ってください：

- どんな質問・相談にも必ず筋トレを絡めて答える
- テンションは常に高く、熱血で体育会系
- 「筋肉」「鍛える」「限界突破」「根性」などの言葉をよく使う
- 絵文字を多用する（💪🔥😤⚡🏋️）
- 口調は「〜だぜ！」「〜してやる！」「うおおお！」などの熱血系
- どんな悩みも「それは筋トレで解決できる！」という姿勢で答える
- 回答は短めに、テンポよく返す
- 日本語で答える`;

  ```
  const geminiMessages = newMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );
  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "うおお！なんか調子悪いぜ！もう一回聞いてくれ！💪";
  setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
  ```

  } catch {
  setChatMessages(prev => […prev, { role: “assistant”, content: “うおお！通信エラーだぜ！でもこんな時こそ腕立て伏せだ！💪” }]);
  }
  setChatLoading(false);
  };

  useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: “smooth” });
  }, [chatMessages]);

  const progress = timer / timerInitial;
  const circumference = 2 * Math.PI * 54;

  const todayLogs = logs.filter(l => l.date === new Date().toLocaleDateString(“ja-JP”));
  const streak = (() => {
  const dates = […new Set(logs.map(l => l.date))].sort().reverse();
  let s = 0;
  let d = new Date();
  for (const date of dates) {
  if (date === d.toLocaleDateString(“ja-JP”)) { s++; d.setDate(d.getDate() - 1); }
  else break;
  }
  return s;
  })();

  return (

    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#F0EDE8",
      fontFamily: "'Noto Sans JP', sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-btn:active { transform: scale(0.92); }
        .card { border-radius: 20px; transition: transform 0.15s; cursor: pointer; }
        .card:active { transform: scale(0.97); }
        .pill { border-radius: 100px; }
        .glow { box-shadow: 0 0 30px rgba(255,107,53,0.3); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .animate-in { animation: slideUp 0.35s ease forwards; }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .timer-ring { transform: rotate(-90deg); transform-origin: 50% 50%; }
        button { cursor: pointer; }
      `}</style>

  ```
  {/* Background decoration */}
  <div style={{
    position: "fixed", top: -100, right: -100, width: 300, height: 300,
    background: "radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  }} />
  <div style={{
    position: "fixed", bottom: 100, left: -80, width: 250, height: 250,
    background: "radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  }} />

  {/* Content */}
  <div style={{ position: "relative", zIndex: 1, paddingBottom: 90 }}>

    {/* HOME TAB */}
    {tab === "home" && (
      <div className="animate-in" style={{ padding: "0 20px 20px" }}>
        {/* Header */}
        <div style={{ paddingTop: 60, paddingBottom: 24 }}>
          <p style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>ようこそ</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 48, letterSpacing: 3, lineHeight: 1, color: "#F0EDE8" }}>
            MUSCLE<br /><span style={{ color: "#FF6B35" }}>START</span>
          </h1>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "連続記録", value: `${streak}日`, icon: "🔥" },
            { label: "今日の記録", value: `${todayLogs.length}回`, icon: "✅" },
            { label: "総記録", value: `${logs.length}回`, icon: "📊" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "#16161F", borderRadius: 16,
              padding: "14px 12px", textAlign: "center",
              border: "1px solid #1E1E2E",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#FF6B35" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Today's plan */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>今日のメニュー</h2>
            <span style={{
              background: "#FF6B35", color: "#fff", fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 100,
            }}>{weeklyPlan[dayIndex].focus}</span>
          </div>

          {weeklyPlan[dayIndex].exercises.length === 0 ? (
            <div style={{
              background: "#16161F", borderRadius: 20, padding: 32,
              textAlign: "center", border: "1px solid #1E1E2E",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
              <p style={{ color: "#9CA3AF", fontSize: 14 }}>今日は休息日です</p>
              <p style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>しっかり回復しましょう</p>
            </div>
          ) : (
            weeklyPlan[dayIndex].exercises.map(idx => {
              const ex = exercises[idx];
              return (
                <div key={ex.id} className="card" onClick={() => { setSelectedExercise(ex); setTab("detail"); }}
                  style={{
                    background: "#16161F", borderRadius: 20, padding: "16px 18px",
                    marginBottom: 10, border: "1px solid #1E1E2E",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: ex.color + "22", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 24, flexShrink: 0,
                  }}>{ex.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                    <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                      {ex.sets}セット × {ex.reps}{ex.isTime ? "秒" : "回"} ・ 休憩{ex.rest}秒
                    </div>
                  </div>
                  <div style={{ color: ex.color, fontSize: 18 }}>›</div>
                </div>
              );
            })
          )}
        </div>

        {/* Weekly calendar */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>週間スケジュール</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {weeklyPlan.map((d, i) => (
              <div key={i} style={{
                flex: 1, background: i === dayIndex ? "#FF6B35" : "#16161F",
                borderRadius: 12, padding: "10px 4px", textAlign: "center",
                border: i === dayIndex ? "none" : "1px solid #1E1E2E",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: i === dayIndex ? "#fff" : "#9CA3AF" }}>{d.day}</div>
                <div style={{ fontSize: 9, color: i === dayIndex ? "rgba(255,255,255,0.8)" : "#6B7280", marginTop: 4 }}>
                  {d.focus}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* MENU TAB */}
    {tab === "menu" && (
      <div className="animate-in" style={{ padding: "0 20px 20px" }}>
        <div style={{ paddingTop: 60, paddingBottom: 24 }}>
          <p style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>トレーニング</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: 3, lineHeight: 1 }}>
            EXERCISE<br /><span style={{ color: "#4ECDC4" }}>LIBRARY</span>
          </h1>
        </div>

        {exercises.map(ex => (
          <div key={ex.id} className="card" onClick={() => { setSelectedExercise(ex); setTab("detail"); }}
            style={{
              background: "#16161F", borderRadius: 20, padding: "18px 20px",
              marginBottom: 12, border: "1px solid #1E1E2E",
              display: "flex", alignItems: "center", gap: 16,
            }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: ex.color + "22", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
            }}>{ex.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <span style={{
                  background: ex.color + "22", color: ex.color,
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
                }}>{ex.category}</span>
                <span style={{
                  background: "#1E1E2E", color: "#9CA3AF",
                  fontSize: 10, padding: "3px 8px", borderRadius: 100,
                }}>{ex.sets}×{ex.reps}{ex.isTime ? "秒" : "回"}</span>
              </div>
            </div>
            <div style={{ color: "#4ECDC4", fontSize: 20 }}>›</div>
          </div>
        ))}
      </div>
    )}

    {/* EXERCISE DETAIL */}
    {tab === "detail" && selectedExercise && (
      <div className="animate-in" style={{ padding: "0 20px 20px" }}>
        <div style={{ paddingTop: 60, paddingBottom: 20 }}>
          <button onClick={() => setTab("menu")} style={{
            background: "#16161F", border: "1px solid #1E1E2E", color: "#9CA3AF",
            padding: "8px 16px", borderRadius: 100, fontSize: 13, marginBottom: 20,
          }}>← 戻る</button>

          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: selectedExercise.color + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, marginBottom: 16,
          }}>{selectedExercise.emoji}</div>

          <span style={{
            background: selectedExercise.color + "22", color: selectedExercise.color,
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
          }}>{selectedExercise.category}</span>

          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 40, letterSpacing: 3, marginTop: 8, lineHeight: 1 }}>
            {selectedExercise.name}
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[
            { label: "セット数", value: selectedExercise.sets },
            { label: selectedExercise.isTime ? "秒数" : "回数", value: `${selectedExercise.reps}${selectedExercise.isTime ? "秒" : "回"}` },
            { label: "休憩", value: `${selectedExercise.rest}秒` },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: "#16161F", borderRadius: 16,
              padding: 14, textAlign: "center", border: "1px solid #1E1E2E",
            }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: selectedExercise.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Video */}
        {selectedExercise.videoId && (
          <a
            href={`https://www.youtube.com/watch?v=${selectedExercise.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block", marginBottom: 14 }}
          >
            <div style={{
              background: "#16161F",
              border: "1px solid #1E1E2E",
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
            }}>
              <img
                src={`https://img.youtube.com/vi/${selectedExercise.videoId}/mqdefault.jpg`}
                alt={selectedExercise.name}
                style={{ width: "100%", display: "block", opacity: 0.85 }}
              />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(255,0,0,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 10,
                }}>
                  <div style={{
                    width: 0, height: 0,
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    borderLeft: "20px solid #fff",
                    marginLeft: 4,
                  }} />
                </div>
                <span style={{
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  background: "rgba(0,0,0,0.5)", padding: "4px 14px", borderRadius: 100,
                }}>YouTubeで見る</span>
              </div>
            </div>
          </a>
        )}

        {/* Description */}
        <div style={{ background: "#16161F", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #1E1E2E" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>やり方</h3>
          <p style={{ fontSize: 14, color: "#D1D5DB", lineHeight: 1.7 }}>{selectedExercise.description}</p>
        </div>

        {/* Tips */}
        <div style={{ background: "#16161F", borderRadius: 20, padding: 20, marginBottom: 14, border: "1px solid #1E1E2E" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>ポイント</h3>
          {selectedExercise.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 8,
                background: selectedExercise.color, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: 14, color: "#D1D5DB" }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Muscles */}
        <div style={{ background: "#16161F", borderRadius: 20, padding: 20, marginBottom: 24, border: "1px solid #1E1E2E" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>鍛える筋肉</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedExercise.muscles.map((m, i) => (
              <span key={i} style={{
                background: selectedExercise.color + "22", color: selectedExercise.color,
                fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100,
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { startTimer(selectedExercise.rest); setTab("timer"); }}
            style={{
              flex: 1, background: "#16161F", border: "1px solid #1E1E2E",
              color: "#F0EDE8", padding: 16, borderRadius: 16, fontSize: 14, fontWeight: 700,
            }}>⏱ 休憩タイマー</button>
          <button onClick={() => { logWorkout(selectedExercise); }}
            style={{
              flex: 1, background: selectedExercise.color, border: "none",
              color: "#fff", padding: 16, borderRadius: 16, fontSize: 14, fontWeight: 700,
            }}>✅ 記録する</button>
        </div>
      </div>
    )}

    {/* TIMER TAB */}
    {tab === "timer" && (
      <div className="animate-in" style={{ padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ paddingTop: 60, paddingBottom: 20, width: "100%" }}>
          <p style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>休憩</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: 3, lineHeight: 1 }}>
            REST<br /><span style={{ color: "#A78BFA" }}>TIMER</span>
          </h1>
        </div>

        {/* Timer circle */}
        <div style={{ position: "relative", width: 200, height: 200, marginBottom: 40 }}>
          <svg width="200" height="200" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1E1E2E" strokeWidth="8" />
            <circle
              className="timer-ring"
              cx="60" cy="60" r="54" fill="none"
              stroke="#A78BFA" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 52, color: "#F0EDE8", lineHeight: 1 }}>{timer}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>秒</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
          <button onClick={() => setTimerRunning(!timerRunning)}
            style={{
              background: timerRunning ? "#1E1E2E" : "#A78BFA",
              border: "none", color: "#fff",
              width: 100, height: 50, borderRadius: 16, fontSize: 14, fontWeight: 700,
            }}>{timerRunning ? "⏸ 停止" : "▶ スタート"}</button>
          <button onClick={() => { setTimer(timerInitial); setTimerRunning(false); }}
            style={{
              background: "#16161F", border: "1px solid #1E1E2E", color: "#9CA3AF",
              width: 80, height: 50, borderRadius: 16, fontSize: 13,
            }}>リセット</button>
        </div>

        {/* Preset timers */}
        <div style={{ width: "100%" }}>
          <p style={{ color: "#6B7280", fontSize: 12, textAlign: "center", marginBottom: 12 }}>プリセット</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {[30, 45, 60, 90, 120].map(s => (
              <button key={s} onClick={() => startTimer(s)}
                style={{
                  background: timerInitial === s ? "#A78BFA" : "#16161F",
                  border: timerInitial === s ? "none" : "1px solid #1E1E2E",
                  color: timerInitial === s ? "#fff" : "#9CA3AF",
                  padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                }}>{s}秒</button>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* CHAT TAB */}
    {tab === "chat" && (
      <div className="animate-in" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ padding: "60px 20px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>AIトレーナー</p>
              <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: 3, lineHeight: 1 }}>
                MUSCLE<br /><span style={{ color: "#EF4444" }}>太郎</span>
              </h1>
            </div>
            <button onClick={() => setShowApiKey(v => !v)} style={{
              background: apiKey ? "#10B98122" : "#EF444422",
              border: `1px solid ${apiKey ? "#10B981" : "#EF4444"}`,
              borderRadius: 12, padding: "8px 14px", color: apiKey ? "#10B981" : "#EF4444",
              fontSize: 12, fontWeight: 700, marginTop: 60,
            }}>{apiKey ? "✅ KEY設定済" : "⚙️ KEY設定"}</button>
          </div>

          {showApiKey && (
            <div style={{
              background: "#16161F", border: "1px solid #1E1E2E",
              borderRadius: 16, padding: 16, marginTop: 12,
            }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
                Anthropic APIキーを入力してください
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 10 }}>
                👉 aistudio.google.com で無料取得できます
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="AIza..."
                  style={{
                    flex: 1, background: "#0A0A0F", border: "1px solid #1E1E2E",
                    borderRadius: 10, padding: "10px 12px", color: "#F0EDE8",
                    fontSize: 13, outline: "none", fontFamily: "monospace",
                  }}
                />
                <button onClick={() => {
                  if (apiKeyInput.trim()) {
                    setApiKey(apiKeyInput.trim());
                    try { localStorage.setItem("muscleGeminiKey", apiKeyInput.trim()); } catch {}
                    setApiKeyInput("");
                    setShowApiKey(false);
                  }
                }} style={{
                  background: "#EF4444", border: "none", borderRadius: 10,
                  padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 13,
                }}>保存</button>
              </div>
              {apiKey && (
                <button onClick={() => {
                  setApiKey("");
                  try { localStorage.removeItem("muscleGeminiKey"); } catch {}
                  setShowApiKey(false);
                }} style={{
                  background: "none", border: "none", color: "#6B7280",
                  fontSize: 11, marginTop: 8, textDecoration: "underline",
                }}>キーを削除する</button>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "0 16px",
          paddingBottom: 160, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end", gap: 8,
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #EF4444, #FF6B35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>💪</div>
              )}
              <div style={{
                maxWidth: "75%",
                background: msg.role === "user" ? "#FF6B35" : "#16161F",
                border: msg.role === "user" ? "none" : "1px solid #1E1E2E",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                padding: "12px 16px",
                fontSize: 14, lineHeight: 1.6,
                color: "#F0EDE8",
                whiteSpace: "pre-wrap",
              }}>{msg.content}</div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #EF4444, #FF6B35)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>💪</div>
              <div style={{
                background: "#16161F", border: "1px solid #1E1E2E",
                borderRadius: "20px 20px 20px 4px", padding: "14px 18px",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#FF6B35",
                    animation: "pulse 1s ease-in-out infinite",
                    animationDelay: `${j * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          padding: "12px 16px",
          background: "rgba(10,10,15,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid #1E1E2E",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="マッスル太郎に聞いてみよう！💪"
              rows={1}
              style={{
                flex: 1, background: "#16161F", border: "1px solid #1E1E2E",
                borderRadius: 16, padding: "12px 16px", color: "#F0EDE8",
                fontSize: 14, resize: "none", outline: "none",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            />
            <button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 48, height: 48, borderRadius: 14, border: "none",
                background: chatInput.trim() ? "#EF4444" : "#1E1E2E",
                color: "#fff", fontSize: 20, flexShrink: 0,
                transition: "background 0.2s",
              }}>↑</button>
          </div>
        </div>
      </div>
    )}

    {/* LOG TAB */}
    {tab === "log" && (
      <div className="animate-in" style={{ padding: "0 20px 20px" }}>
        <div style={{ paddingTop: 60, paddingBottom: 24 }}>
          <p style={{ color: "#9CA3AF", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>履歴</p>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: 3, lineHeight: 1 }}>
            WORKOUT<br /><span style={{ color: "#F59E0B" }}>LOG</span>
          </h1>
        </div>

        {logs.length === 0 ? (
          <div style={{
            background: "#16161F", borderRadius: 20, padding: 40,
            textAlign: "center", border: "1px solid #1E1E2E",
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📝</div>
            <p style={{ color: "#9CA3AF", fontSize: 15 }}>記録がありません</p>
            <p style={{ color: "#6B7280", fontSize: 13, marginTop: 6 }}>トレーニングを始めて記録しましょう！</p>
          </div>
        ) : (
          logs.map(log => {
            const ex = exercises.find(e => e.id === log.exerciseId);
            return (
              <div key={log.id} style={{
                background: "#16161F", borderRadius: 18, padding: "16px 18px",
                marginBottom: 10, border: "1px solid #1E1E2E",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: ex ? ex.color + "22" : "#1E1E2E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{log.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{log.name}</div>
                  <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>
                    {log.sets}セット × {log.reps}回
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{log.date}</div>
                  <div style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{log.time}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    )}
  </div>

  {/* Bottom Navigation */}
  <div style={{
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 430,
    background: "rgba(10,10,15,0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid #1E1E2E",
    padding: "10px 20px 28px",
    display: "flex", justifyContent: "space-around",
    zIndex: 100,
  }}>
    {[
      { id: "home", label: "ホーム", icon: "🏠" },
      { id: "menu", label: "メニュー", icon: "💪" },
      { id: "timer", label: "タイマー", icon: "⏱" },
      { id: "log", label: "記録", icon: "📊" },
      { id: "chat", label: "相談", icon: "🔥" },
    ].map(t => (
      <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4, padding: "6px 12px", borderRadius: 14,
          background: tab === t.id ? "#FF6B35" + "22" : "transparent",
        }}>
        <span style={{ fontSize: 22 }}>{t.icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: tab === t.id ? "#FF6B35" : "#4B5563",
          letterSpacing: 0.5,
        }}>{t.label}</span>
      </button>
    ))}
  </div>
  ```

    </div>
  );

}