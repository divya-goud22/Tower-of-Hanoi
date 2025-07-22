// src/components/TowerOfHanoiGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import Confetti from 'react-confetti';


const errorSound = new Audio('/assets/error.mp3');
const winSound = new Audio('/assets/win.mp3');

function TowerOfHanoiGame({ username, onLogout }) {
  const [numDisks, setNumDisks] = useState(3);
  const [rods, setRods] = useState(generateRods(3));
  const [selectedRod, setSelectedRod] = useState(null);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [stepLog, setStepLog] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  const timerRef = useRef(null);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [history, setHistory] = useState([]);

  function generateRods(n) {
    const firstRod = [];
    for (let i = n; i >= 1; i--) {
      firstRod.push(i);
    }
    return [firstRod, [], []];
  }

  const diskWidth = (diskNum) => 40 + (diskNum - 1) * 20;
  const rodWidth = diskWidth(numDisks) + 40;
  const rodHeight = 40 * numDisks;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const key = `hanoi_${username}`;
    const data = JSON.parse(localStorage.getItem(key)) || {};
    if (data.bestScore) setBestScore(data.bestScore);
    if (data.bestTime) setBestTime(data.bestTime);
    if (data.history) setHistory(data.history);
  }, [username]);

  const getHanoiMoves = (n, from, aux, to, moves = []) => {
    if (n === 1) {
      moves.push([from, to]);
    } else {
      getHanoiMoves(n - 1, from, to, aux, moves);
      moves.push([from, to]);
      getHanoiMoves(n - 1, aux, from, to, moves);
    }
    return moves;
  };

  const showStepLog = () => {
    if (!showSteps) {
      const moves = getHanoiMoves(numDisks, 0, 1, 2);
      const log = moves.map((m, i) => `Step ${i + 1}: Move disk from Rod ${m[0] + 1} to Rod ${m[1] + 1}`);

      setStepLog(log);
    }
    setShowSteps(!showSteps);
  };

  const solveAutomatically = async () => {
  const solutionSteps = getHanoiMoves(numDisks, 0, 1, 2);
  let newRods = generateRods(numDisks);
  setRods(newRods);
  setMoves(0);
  setMessage('');
  setShowConfetti(false);
  clearInterval(timerRef.current);
  setSelectedRod(null);
  setTime(0);

  for (let i = 0; i < solutionSteps.length; i++) {
    const [from, to] = solutionSteps[i];
    const diskToMove = newRods[from].pop();
    newRods[to].push(diskToMove);
    setRods([...newRods]);
    setMoves((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 700)); // ⏱ Delay for animation
  }

  winSound.play();
  setShowConfetti(true);
  setMessage("AI solved it! Now try it yourself.");
};


  const handleRodClick = (i) => {
    setMessage('');
    const nr = rods.map((r) => [...r]);
    if (selectedRod === null) {
      if (!nr[i].length) return;
      setSelectedRod(i);
    } else {
      if (selectedRod === i) return setSelectedRod(null);
      const src = nr[selectedRod], dest = nr[i];
      const disk = src[src.length - 1];
      const top = dest[dest.length - 1];
      if (!top || disk < top) {
        dest.push(src.pop());
        setRods(nr);
        setMoves((m) => m + 1);
        //moveSound.play();
        setSelectedRod(null);
        if (nr[2].length === numDisks) {
          winSound.play();
          setShowConfetti(true);
          clearInterval(timerRef.current);
          saveResult();

          const minMoves = Math.pow(2, numDisks) - 1;
          if (moves + 1 === minMoves) {
            setPopupMessage("Did you know? You solved it using the minimal moves!");
          } else {
           setPopupMessage(`Did you know? This game can be played using ${minMoves} moves as well! Click the Solve Automatically button to learn more!!`);

          }
          setShowPopup(true);
        }
      } else {
        setMessage("Can't place larger over smaller.");
        errorSound.play();
        setSelectedRod(null);
      }
    }
  };

  const saveResult = () => {
    const key = `hanoi_${username}`;

    const data = JSON.parse(localStorage.getItem(key)) || {
      history: [],
      bestScore: Infinity,
      bestTime: Infinity,
    };

    const histItem = {
      date: new Date().toLocaleString(),
      moves,
      time,
    };
    data.history = [...data.history, histItem];
    data.bestScore = Math.min(data.bestScore, moves);
    data.bestTime = Math.min(data.bestTime, time);
    localStorage.setItem(key, JSON.stringify(data));
    setBestScore(data.bestScore);
    setBestTime(data.bestTime);
    setHistory(data.history);
  };

  const restart = () => {
    clearInterval(timerRef.current);
    setRods(generateRods(numDisks));
    setSelectedRod(null);
    setMoves(0);
    setTime(0);
    setMessage('');
    setShowConfetti(false);
    setStepLog([]);
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };

  const handleNumDisksChange = (e) => {
    const newNum = Number(e.target.value);
    setNumDisks(newNum);
    setRods(generateRods(newNum));
    setSelectedRod(null);
    setMoves(0);
    setTime(0);
    setMessage('');
    setShowConfetti(false);
    setPopupMessage('');
    setShowPopup(false);
    setStepLog([]);
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };

  return (
    <div className="game-container">
      {showConfetti && <Confetti />}
      <div className="top-bar">
        <h2>Welcome, {username}</h2>
        <button onClick={onLogout} className="button-red">Logout</button>
      </div>

      <div className="dashboard">
        <label htmlFor="diskSelect">Select number of disks: </label>
        <select id="diskSelect" value={numDisks} onChange={handleNumDisksChange}>
          {[...Array(10).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <div className="stats">
        <p>Moves: {moves}</p>
        <p>Time: {time}s</p>
        {bestScore !== Infinity && (
          <p>🏅 Best: {bestScore} moves, {bestTime}s</p>
        )}
      </div>

      {message && <p className="message-text">{message}</p>}
      <div className="rod-container">
        {rods.map((rod, i) => (
          <div
            key={i}
            className={`rod ${selectedRod === i ? 'selected' : ''}`}

            onClick={() => handleRodClick(i)}

           style={{ height: `${rodHeight}px`, width: `${rodWidth}px` }}
>
  {rod.map((disk, j) => (
    <div key={j} className={`disk disk-${disk}`}>{disk}</div>
  ))}
</div>

        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button onClick={restart}>🔄 Restart</button>
        <button onClick={solveAutomatically}>🤖 Solve Automatically</button>
        <button onClick={showStepLog}>{showSteps ? '❌ Hide Steps' : '🧾 Show Steps'}</button>
      </div>

      {showSteps && stepLog.length > 0 && (
        <div className="step-log" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '20px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <h4>📘 Solution Steps:</h4>
          <ul>
            {stepLog.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <hr />
      <h3>⚙ Game History</h3>
      <ul className="history-list">
        {history.slice(-5).reverse().map((h, i) => (
          <li key={i}>{h.date} — {h.moves} moves, {h.time}s</li>
        ))}
      </ul>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)} className="popup-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TowerOfHanoiGame;