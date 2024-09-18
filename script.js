const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const resultMessage = document.getElementById('resultMessage');

const DEFAULT_DIFFICULTY = 'medium'; // Chọn độ khó mặc định

let bird = {
    x: 50,
    y: 0,
    width: 30,
    height: 30,
    gravity: 0.2, // Giảm tốc độ rơi
    lift: -5, // Giảm lực đẩy
    velocity: 0,
    isFlapping: false,
};

let pipes = [];
let pipeWidth = 50;
let initialPipeGap = 300; // Khoảng cách giữa các ống ban đầu
let pipeGap = initialPipeGap;
let pipeSpeed = 2; // Giảm tốc độ di chuyển của ống
let isGameOver = false;
let score = 0;
let highScore = 0;
let pipeGapReductionRate = 0.09; // Tốc độ giảm khoảng cách giữa các ống
let initialFlapDelay = 1000; // Thời gian delay ban đầu (1 giây)
let countdownTime = 3; // Thời gian đếm ngược trước khi bắt đầu

function initializeGame() {
    canvas.width = window.innerWidth;
    canvas.height = Math.min(window.innerHeight * 0.8, 500); // Chiều cao tối đa 500px
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    pipeWidth = 50; // Đặt chiều rộng ống về giá trị ban đầu
    pipeGap = initialPipeGap; // Đặt khoảng cách giữa các ống về giá trị ban đầu
    pipeSpeed = getPipeSpeed(DEFAULT_DIFFICULTY);
    isGameOver = false;
    score = 0;
    resultMessage.style.display = 'none';
    restartButton.style.display = 'none'; // Ẩn nút Restart khi trò chơi bắt đầu
    startButton.style.display = 'none'; // Ẩn nút Start khi trò chơi bắt đầu

    // Delay để chim không rơi trong 1 giây
    setTimeout(() => {
        spawnPipe();
        draw();
    }, initialFlapDelay);
}

function startCountdown() {
    let countdown = countdownTime;

    const countdownInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.fillText(countdown, canvas.width / 2 - 20, canvas.height / 2);
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            initializeGame(); // Bắt đầu trò chơi sau khi đếm ngược xong
            canvas.addEventListener('click', handleClick);
        }
    }, 1000);
}

function getPipeSpeed(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 1.5; // Giảm tốc độ ở độ khó dễ
        case 'medium':
            return 2; // Độ khó trung bình
        case 'hard':
            return 2.5; // Tăng tốc độ ở độ khó khó
        default:
            return 2; // Độ khó mặc định
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
        resultMessage.textContent = `Score: ${score} | High Score: ${highScore}`;
        resultMessage.style.display = 'block'; // Hiển thị số điểm và điểm cao khi trò chơi kết thúc
        restartButton.style.display = 'block'; // Hiển thị nút Restart khi trò chơi kết thúc
        return;
    }

    // Draw the bird
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Draw the pipes
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top); // Top pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom); // Bottom pipe
    });

    // Draw the score
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30); // Hiển thị số điểm ở góc trên bên trái

    // Update positions
    updateBird();
    updatePipes();

    if (!isGameOver) {
        requestAnimationFrame(draw);
    }
}

function updateBird() {
    if (!bird.isFlapping) {
        bird.velocity += bird.gravity; // Tính toán tốc độ rơi
    }
    bird.y += bird.velocity;

    if (bird.y < 0) bird.y = 0;
    if (bird.y > canvas.height - bird.height) bird.y = canvas.height - bird.height;

    // Check collision with pipes
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
            isGameOver = true;
        }
    });

    // Check collision with ground
    if (bird.y >= canvas.height - bird.height) {
        isGameOver = true;
    }
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
        pipes.shift();
        score++;
    }

    // Giảm tần suất xuất hiện ống
    if (pipes.length === 0 || (pipes[pipes.length - 1].x < canvas.width - 200 && Math.random() < 0.01)) {
        spawnPipe();
    }

    // Reduce pipe gap over time
    if (pipeGap > 100) { // Ensure pipe gap doesn't get too small
        pipeGap -= pipeGapReductionRate;
    }
}

function spawnPipe() {
    let top = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50; // Ensuring space between pipes
    let bottom = canvas.height - pipeGap - top;
    pipes.push({ x: canvas.width, top, bottom });
}

function handleClick() {
    if (!isGameOver) {
        bird.isFlapping = true; // Đánh dấu chim đang bay lên
        bird.velocity = bird.lift; // Đặt tốc độ lên
        setTimeout(() => {
            bird.isFlapping = false; // Đặt lại trạng thái bay sau 1 khoảng thời gian ngắn
        }, 100);
    } else {
        initializeGame();
    }
}

function startGame() {
    startButton.style.display = 'none'; // Ẩn nút Start khi trò chơi bắt đầu
    startCountdown(); // Bắt đầu bộ đếm giờ
}

function restartGame() {
    initializeGame();
    restartButton.style.display = 'none'; // Ẩn nút Restart khi trò chơi bắt đầu lại
}

// Load high score from local storage
function loadHighScore() {
    const storedHighScore = localStorage.getItem('highScore');
    if (storedHighScore) {
        highScore = parseInt(storedHighScore, 10);
    }
}

// Save high score to local storage
function saveHighScore() {
    localStorage.setItem('highScore', highScore);
}

// Check if current score is higher than the high score
function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

window.addEventListener('resize', initializeGame);

// Initialize the game for the first time
loadHighScore(); // Load high score from local storage
startButton.style.display = 'block'; // Hiển thị nút Start khi trò chơi chưa bắt đầu
