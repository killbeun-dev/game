class ColorMatchGame {
    constructor() {
        this.grid = document.getElementById("grid");
        this.scoreEl = document.getElementById("score");
        this.timeEl = document.getElementById("time");
        this.levelEl = document.getElementById("level");
        this.messageEl = document.getElementById("message");
        this.startBtn = document.getElementById("start");
        this.restartBtn = document.getElementById("restart");
        
        this.score = 0;
        this.time = 30;
        this.level = 1;
        this.timer = null;
        this.gameRunning = false;
        this.correctIndex = -1;
        this.streak = 0;
        
        this.initializeEventListeners();
        this.updateUI();
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener("click", () => this.startGame());
        this.restartBtn.addEventListener("click", () => this.restartGame());
        
        // 터치 이벤트 지원
        this.grid.addEventListener("touchstart", (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // 키보드 지원 (데스크톱)
        document.addEventListener("keydown", (e) => {
            if (!this.gameRunning) return;
            
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                this.generateGrid();
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.time = 30;
        this.level = 1;
        this.streak = 0;
        
        this.startBtn.disabled = true;
        this.restartBtn.disabled = false;
        
        this.updateUI();
        this.generateGrid();
        this.startTimer();
        
        this.showMessage("게임 시작! 다른 색을 찾아보세요!", "info");
    }
    
    restartGame() {
        this.startGame();
    }
    
    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.time--;
            this.updateUI();
            
            if (this.time <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    endGame() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        this.startBtn.disabled = false;
        this.restartBtn.disabled = true;
        
        this.showMessage(`게임 종료! 최종 점수: ${this.score}`, "info");
        
        // 모바일에서 진동 피드백 (지원하는 경우)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    generateGrid() {
        if (!this.gameRunning) return;
        
        // 레벨에 따른 그리드 크기 결정
        const gridSize = Math.min(4, Math.floor(this.level / 3) + 3);
        const isTutorial = this.level === 1;
        
        // 그리드 클래스 설정
        this.grid.className = `grid grid-${gridSize}x${gridSize}`;
        this.grid.innerHTML = "";
        
        // 색상 생성
        const baseColor = this.getRandomColor();
        const diffColor = this.adjustColor(baseColor, isTutorial ? 40 : 25);
        this.correctIndex = Math.floor(Math.random() * gridSize * gridSize);
        
        // 셀 생성
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.style.backgroundColor = i === this.correctIndex ? diffColor : baseColor;
            
            // 클릭/터치 이벤트
            cell.addEventListener("click", () => this.handleCellClick(i, cell));
            cell.addEventListener("touchend", (e) => {
                e.preventDefault();
                this.handleCellClick(i, cell);
            });
            
            this.grid.appendChild(cell);
        }
    }
    
    handleCellClick(index, cell) {
        if (!this.gameRunning) return;
        
        if (index === this.correctIndex) {
            this.handleCorrect(cell);
        } else {
            this.handleWrong(cell);
        }
    }
    
    handleCorrect(cell) {
        this.streak++;
        this.score += this.streak * 10; // 연속 보너스
        this.level = Math.floor(this.score / 100) + 1;
        
        cell.classList.add("correct");
        this.showMessage(`정답! +${this.streak * 10}점`, "success");
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        this.updateUI();
        
        // 잠시 후 다음 그리드 생성
        setTimeout(() => {
            this.generateGrid();
        }, 800);
    }
    
    handleWrong(cell) {
        this.streak = 0;
        this.score = Math.max(0, this.score - 5);
        
        cell.classList.add("wrong");
        this.showMessage("틀렸어요! -5점", "error");
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
        this.updateUI();
        
        // 잠시 후 다음 그리드 생성
        setTimeout(() => {
            this.generateGrid();
        }, 1000);
    }
    
    showMessage(text, type) {
        this.messageEl.textContent = text;
        this.messageEl.className = `message ${type}`;
        
        // 메시지 자동 사라짐
        setTimeout(() => {
            if (this.gameRunning) {
                this.messageEl.textContent = "다른 색을 찾아보세요!";
                this.messageEl.className = "message info";
            }
        }, 2000);
    }
    
    updateUI() {
        this.scoreEl.textContent = this.score;
        this.timeEl.textContent = this.time;
        this.levelEl.textContent = this.level;
    }
    
    getRandomColor() {
        const r = Math.floor(Math.random() * 200) + 30;
        const g = Math.floor(Math.random() * 200) + 30;
        const b = Math.floor(Math.random() * 200) + 30;
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    adjustColor(color, diff) {
        const rgb = color.match(/\d+/g).map(Number);
        const index = Math.floor(Math.random() * 3);
        rgb[index] = Math.min(255, rgb[index] + diff);
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new ColorMatchGame();
});

// 모바일에서 스크롤 방지
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.grid')) {
        e.preventDefault();
    }
}, { passive: false });

// 모바일에서 줌 방지
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// PWA 지원을 위한 서비스 워커 등록 (선택사항)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}