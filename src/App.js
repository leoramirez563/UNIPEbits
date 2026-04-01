import React, { useState, useRef } from 'react';
// 1. IMPORTE LA LIBRERÍA DE CONFETI
import confetti from 'canvas-confetti'; 
import './index.css';

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];
const LISTA_OBJETIVOS = [3, 7, 14, 22, 26, 32, 40, 45, 63, 68, 80, 100, 112, 129, 150, 170, 200, 223, 240, 225];

function App() {
  const [bits, setBits] = useState(Array(8).fill(0));
  const [score, setScore] = useState(0);
  const [indiceTarget, setIndiceTarget] = useState(0);
  
  const target = LISTA_OBJETIVOS[indiceTarget];
  const currentSum = bits.reduce((acc, bit, index) => acc + (bit * POWERS[index]), 0);
  const binaryString = bits.join('');

  const isError = currentSum > target;
  const isSuccess = currentSum === target;

  const audioMal = useRef(null);
  const audioBien = useRef(null);
  const audioSiguiente = useRef(null);
  const audioVictoria = useRef(null);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio bloqueado:", e));
    }
  };

  const toggleBit = (index) => {
    const newBits = [...bits];
    const isTurningOn = newBits[index] === 0;
    newBits[index] = isTurningOn ? 1 : 0;
    const nextSum = newBits.reduce((acc, b, i) => acc + (b * POWERS[i]), 0);

    if (isTurningOn) {
      if (nextSum > target) {
        setScore(prev => Math.max(0, prev - 20));
        playSound(audioMal); 
      } else {
        playSound(audioBien);
      }
    }
    setBits(newBits);
  };

  const handleNext = () => {
    if (isSuccess) {
      setScore(score + 20);
      
      if (indiceTarget === LISTA_OBJETIVOS.length - 1) {
        // FINALIZA EL JUEGO - MOMENTO DE CELEBRACIÓN
        playSound(audioVictoria);

        // 💥 2. EFECTO DE CONFETI (Estilo destellos)
        // Estallido central (desde el centro inferior)
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 } // Un poco más arriba del final de la pantalla
        });
        
        // Estallido izquierdo (ligeramente después)
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { x: 0.3, y: 0.6 } 
          });
        }, 250);

        // Estallido derecho (ligeramente después)
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { x: 0.7, y: 0.6 } 
          });
        }, 500);

        // Alerta al final de la secuencia
        setTimeout(() => {
          alert(`¡UNIPEBITS COMPLETADO! 🎉 Puntuación final: ${score + 20} puntos.`);
          // Reiniciamos el juego
          setIndiceTarget(0);
          setScore(0);
          setBits(Array(8).fill(0));
        }, 1500); // 1.5 segundos después del último cohete

      } else {
        // PASA AL SIGUIENTE RETO
        playSound(audioSiguiente);
        setIndiceTarget((prev) => prev + 1);
        setBits(Array(8).fill(0));
      }
    }
  };

  return (
    <div className="app-container">
      
      <audio ref={audioMal} src={process.env.PUBLIC_URL + "/sounds/mal.mp3"} preload="auto" />
      <audio ref={audioBien} src={process.env.PUBLIC_URL + "/sounds/bien.mp3"} preload="auto" />
      <audio ref={audioSiguiente} src={process.env.PUBLIC_URL + "/sounds/siguiente.mp3"} preload="auto" />
      <audio ref={audioVictoria} src={process.env.PUBLIC_URL + "/sounds/victoria.mp3"} preload="auto" />

      <div className={`converter-card ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}>
        <h1 className="title">UNIPEBits</h1>

        <div className="target-container">
          <p style={{margin:0, color: '#8b949e', fontSize: '0.9rem'}}>OBJETIVO DECIMAL</p>
          <h2 className="target-number">{target}</h2>
          <small>Reto {indiceTarget + 1} de {LISTA_OBJETIVOS.length}</small>
        </div>

        <div className="bits-container">
          {POWERS.map((power, index) => (
            <div key={index} className={`bit-module ${bits[index] === 1 ? 'on' : 'off'}`}>
              <div className="bit-power">2<sup>{7 - index}</sup></div>
              <div className="bit-toggle" onClick={() => toggleBit(index)}>
                <div className="toggle-number">{bits[index]}</div>
              </div>
              <div className="bit-decimal">+{power}</div>
            </div>
          ))}
        </div>

        <div className="results-container">
          <div>Suma: <span className="highlight-value">{currentSum}</span> | Binario: <span className="highlight-value">{binaryString}</span></div>
        </div>

        <div className="controls-container">
          <button className={`next-button ${isSuccess ? 'ready' : ''}`} disabled={!isSuccess} onClick={handleNext}>
            {indiceTarget === LISTA_OBJETIVOS.length - 1 ? '¡FINALIZAR!' : 'SIGUIENTE'}
          </button>
          <div className="score-board"> PUNTOS: <span className="highlight-value">{score}</span> </div>
        </div>
      </div>
    </div>
  );
}

export default App;