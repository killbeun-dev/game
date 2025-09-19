class OmokGame {
    constructor() {
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black'; // 'black' 또는 'white'
        this.gameOver = false;
        this.winner = null;
        
        this.initializeBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
            }
        }
    }
    
    bindEvents() {
        const gameBoard = document.getElementById('game-board');
        const resetBtn = document.getElementById('reset-btn');
        
        // 클릭 이벤트
        gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });
        
        // 터치 이벤트 (모바일)
        gameBoard.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });
        
        // 터치 시작 시 스크롤 방지
        gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
        
        // 키보드 이벤트 (데스크톱)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });
        
        // 모바일에서 스크롤 방지
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-board')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 줌 방지
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    handleCellClick(cell) {
        if (this.gameOver) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (this.board[row][col] !== null) return; // 이미 돌이 있는 자리
        
        // 터치 피드백 (모바일)
        this.addTouchFeedback(cell);
        
        // 돌 놓기
        this.board[row][col] = this.currentPlayer;
        cell.classList.add(this.currentPlayer);
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 승리 확인
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.highlightWinningCells(row, col);
            this.updateUI();
            
            // 승리 시 진동
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            return;
        }
        
        // 무승부 확인
        if (this.isBoardFull()) {
            this.gameOver = true;
            this.updateUI();
            return;
        }
        
        // 다음 플레이어로 변경
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateUI();
    }
    
    addTouchFeedback(cell) {
        // 터치 시 시각적 피드백
        cell.style.transform = 'scale(0.9)';
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        
        setTimeout(() => {
            cell.style.transform = '';
            cell.style.backgroundColor = '';
        }, 150);
    }
    
    checkWin(row, col) {
        const directions = [
            [0, 1],   // 가로
            [1, 0],   // 세로
            [1, 1],   // 대각선 \
            [1, -1]   // 대각선 /
        ];
        
        for (const [dx, dy] of directions) {
            if (this.checkDirection(row, col, dx, dy)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDirection(row, col, dx, dy) {
        const player = this.board[row][col];
        let count = 1;
        const winningCells = [{row, col}];
        
        // 양방향으로 확인
        for (let direction = 1; direction >= -1; direction -= 2) {
            let currentRow = row + direction * dx;
            let currentCol = col + direction * dy;
            
            while (this.isValidPosition(currentRow, currentCol) && 
                   this.board[currentRow][currentCol] === player) {
                count++;
                winningCells.push({row: currentRow, col: currentCol});
                currentRow += direction * dx;
                currentCol += direction * dy;
            }
        }
        
        // 정확히 5개인지 확인 (6개 이상은 무효)
        if (count === 5) {
            this.winningCells = winningCells;
            return true;
        }
        
        return false;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    highlightWinningCells(row, col) {
        if (this.winningCells) {
            this.winningCells.forEach(cell => {
                const cellElement = document.querySelector(
                    `[data-row="${cell.row}"][data-col="${cell.col}"]`
                );
                if (cellElement) {
                    cellElement.classList.add('winning');
                }
            });
        }
    }
    
    isBoardFull() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    updateUI() {
        const currentPlayerElement = document.getElementById('current-player');
        const gameStatusElement = document.getElementById('game-status');
        
        if (this.gameOver) {
            if (this.winner) {
                const playerName = this.winner === 'black' ? '흑돌' : '백돌';
                gameStatusElement.textContent = `🎉 ${playerName} 승리!`;
                gameStatusElement.style.color = '#28a745';
                currentPlayerElement.textContent = '게임 종료';
            } else {
                gameStatusElement.textContent = '무승부!';
                gameStatusElement.style.color = '#6c757d';
                currentPlayerElement.textContent = '게임 종료';
            }
        } else {
            const playerName = this.currentPlayer === 'black' ? '흑돌' : '백돌';
            currentPlayerElement.textContent = playerName;
            gameStatusElement.textContent = '게임 진행 중...';
            gameStatusElement.style.color = '#6c757d';
        }
    }
    
    resetGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.winner = null;
        this.winningCells = null;
        
        // 보드 초기화
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });
        
        this.updateUI();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new OmokGame();
    
    // 모바일에서 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
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
});
