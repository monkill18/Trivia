let currentRiddle;
let correctAnswerCount = 0;
let lives = 3;
let streak = 0;
let availableRiddles = [];
let currentCategory = [];

// 1. INICIO DEL JUEGO
function startGame(categoryName) {
    // Vincular con el objeto de preguntas.js
    currentCategory = riddlesByCategory[categoryName];
    
    // Preparar mazo sin repeticiones
    availableRiddles = [...currentCategory];
    availableRiddles.sort(() => Math.random() - 0.5);

    // Reiniciar variables de estado
    correctAnswerCount = 0;
    lives = 3;
    streak = 0;
    
    // Actualizar Interfaz
    updateLives();
    cambiarColorNivel(0); // Volver al color inicial
    document.getElementById('correctCount').innerText = "0";
    document.getElementById("menu-container").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";

    loadNewRiddle();
}

// 2. CARGAR PREGUNTA
function loadNewRiddle() { 
    const riddleElement = document.getElementById("riddle");
    const optionsContainer = document.getElementById("options-container");
    const resultElement = document.getElementById("result");

    optionsContainer.innerHTML = "";
    resultElement.innerText = "";
    
    // Reiniciar animación de entrada
    riddleElement.classList.remove("fade-in");
    void riddleElement.offsetWidth; 

    // Si el mazo se vacía, lo recargamos
    if (availableRiddles.length === 0) {
        availableRiddles = [...currentCategory];
        availableRiddles.sort(() => Math.random() - 0.5);
    }

    currentRiddle = availableRiddles.pop();
    riddleElement.innerText = currentRiddle.q;
    riddleElement.classList.add("fade-in");

    generateOptions(currentRiddle.a, currentRiddle.inc);
}

// 3. GENERAR BOTONES DE RESPUESTA
function generateOptions(correctAnswer, incorrectAnswers) {
    const optionsContainer = document.getElementById("options-container");
    let choices = [correctAnswer, ...incorrectAnswers];

    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice => {
        const button = document.createElement("button");
        button.innerText = choice;
        button.className = "option-btn";
        button.onclick = () => checkOption(choice);
        optionsContainer.appendChild(button);
    });
}

// 4. VALIDAR RESPUESTA
function checkOption(selectedAnswer) {
    const resultElement = document.getElementById('result');

    if (selectedAnswer === currentRiddle.a) {
        playSound('success');
        correctAnswerCount++;
        streak++;

        // Lógica de Niveles (Cada 10 aciertos)
        if (correctAnswerCount % 10 === 0) {
            const nivelActual = correctAnswerCount / 10;
            launchConfetti();
            cambiarColorNivel(nivelActual);
            resultElement.innerHTML = `<span class="level-up">¡NIVEL ${nivelActual + 1} ALCANZADO!</span>`;
            setTimeout(loadNewRiddle, 1500);
        } else {
            // Lógica de Rachas (Cada 5 seguidas)
            if (streak % 5 === 0) {
                launchConfetti();
                resultElement.innerText = `¡IMPRESIONANTE! Racha de ${streak} 🔥`;
                setTimeout(loadNewRiddle, 800);
            } else {
                resultElement.innerText = '¡Correcto!';
                setTimeout(loadNewRiddle, 600);
            }
        }
        
        document.getElementById('correctCount').innerText = correctAnswerCount;
        resultElement.style.color = 'green';

    } else {
        playSound('error');
        lives--;
        streak = 0;
        updateLives();
        resultElement.innerText = `Incorrecto. La respuesta era: ${currentRiddle.a}`;
        resultElement.style.color = 'red';

        if (lives <= 0) {
            setTimeout(gameOver, 800);
        } else {
            setTimeout(loadNewRiddle, 1200);
        }
    }
}

// 5. EFECTOS VISUALES Y SONIDO
function cambiarColorNivel(nivel) {
    const body = document.body;
    const coloresNiveles = [
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", // Nivel 1
        "#136c38", // Nivel 2
        "#7c359a", // Nivel 3
        "#c86f21", // Nivel 4
        "#c0392b", // Nivel 5
        "#2c3e50"  // Nivel 6+
    ];

    const fondo = coloresNiveles[nivel] || coloresNiveles[coloresNiveles.length - 1];
    
    body.style.transition = "all 1s ease";
    if (nivel === 0) {
        body.style.background = fondo;
    } else {
        body.style.background = "none"; 
        body.style.backgroundColor = fondo;
    }
}

function updateLives() {
    const livesContainer = document.getElementById("lives-container");
    if (livesContainer) {
        livesContainer.innerText = "❤️".repeat(lives);
    }
}

function launchConfetti() {
    const colors = ['#4facfe', '#00f2fe', '#f093fb', '#f5576c', '#ffeb3b'];
    for (let i = 0; i < 60; i++) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.zIndex = '9999';
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-10px';
        div.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(div);

        const animation = div.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(110vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        animation.onfinish = () => div.remove();
    }
}

function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'error') {
        oscillator.type = 'sawtooth'; // Sonido más rasposo para el error
        oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); // Un poco más bajo porque el sawtooth es fuerte
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3); // Dura un poco más
    } else {
        oscillator.type = 'sine'; // Sonido suave para el acierto
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
}

function gameOver() {
    const container = document.querySelector(".game-container");
    container.innerHTML = `
        <div id="menu-container">
            <h1>¡Juego Terminado!</h1>
            <p style="font-size: 1.5rem;">Aciertos totales: ${correctAnswerCount}</p>
            <button class="cat-btn" onclick="location.reload()">Volver al Menú</button>
        </div>
    `;
}

// Bloquear clic derecho
document.addEventListener('contextmenu', event => event.preventDefault());

// Bloquear F12, Ctrl+Shift+I (Inspeccionar) y Ctrl+U (Ver código fuente)
document.onkeydown = function(e) {
    if (e.keyCode == 123 || 
        (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) || 
        (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        return false;
    }
};