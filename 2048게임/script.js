class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.won = false;
        this.over = false;
        this.previousGrid = []; // 이전 상태 저장용
        this.animating = false; // 애니메이션 중인지 확인
        
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessageElement = document.getElementById('game-message');
        this.restartBtnElement = document.getElementById('restart-btn');
        this.keepPlayingBtnElement = document.getElementById('keep-playing-btn');
        this.retryBtnElement = document.getElementById('retry-btn');
        this.tileContainerElement = document.getElementById('tile-container');
    }
    
    bindEvents() {
        this.restartBtnElement.addEventListener('click', () => this.startNewGame());
        this.keepPlayingBtnElement.addEventListener('click', () => this.keepPlaying());
        this.retryBtnElement.addEventListener('click', () => this.startNewGame());
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.over) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 마우스 드래그 이벤트 (게임 보드에만)
        let mouseStartX, mouseStartY, mouseEndX, mouseEndY;
        let isMouseDown = false;
        
        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('mousedown', (e) => {
            if (this.over) return;
            e.preventDefault();
            isMouseDown = true;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown || this.over) return;
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!isMouseDown || this.over) return;
            isMouseDown = false;
            mouseEndX = e.clientX;
            mouseEndY = e.clientY;
            
            const deltaX = mouseEndX - mouseStartX;
            const deltaY = mouseEndY - mouseStartY;
            
            // 참조 소스와 동일한 로직
            if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move('left');
            } else if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move('right');
            } else if (deltaY > 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
                this.move('down');
            } else if (deltaY < 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
                this.move('up');
            }
        });
        
        // 터치 이벤트 (모바일) - 게임 보드에만
        let touchStartX, touchStartY, touchEndX, touchEndY;
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (this.over) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (this.over) return;
            e.preventDefault();
            const touch = e.changedTouches[0];
            touchEndX = touch.clientX;
            touchEndY = touch.clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 참조 소스와 동일한 로직
            if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move('left');
            } else if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
                this.move('right');
            } else if (deltaY > 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
                this.move('down');
            } else if (deltaY < 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
                this.move('up');
            }
        }, { passive: false });
        
        // 게임 보드에서만 스크롤 방지
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-container')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    startNewGame() {
        this.grid = [];
        this.score = 0;
        this.won = false;
        this.over = false;
        
        // 4x4 그리드 초기화
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        this.updateScore();
        this.hideMessage();
        this.clearTiles();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% 확률로 2, 10% 확률로 4
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            
            // 새 타일을 화면에 즉시 표시 (애니메이션과 함께)
            setTimeout(() => {
                this.addTile(randomCell.x, randomCell.y, this.grid[randomCell.x][randomCell.y], true);
            }, 100);
        }
    }
    
    move(direction) {
        if (this.over || this.animating) return;
        
        // 이전 상태 저장
        this.previousGrid = this.grid.map(row => [...row]);
        
        let moved = false;
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.animating = true;
            this.animateMove();
            this.addRandomTile();
            
            setTimeout(() => {
                this.updateDisplay();
                this.updateScore();
                this.animating = false;
                
                if (this.checkWin() && !this.won) {
                    this.won = true;
                    this.showMessage('승리!', 'game-won');
                } else if (this.checkGameOver()) {
                    this.over = true;
                    this.showMessage('게임 오버!', 'game-over');
                }
            }, 200);
        }
    }
    
    moveUp() {
        let moved = false;
        const newData = [[],[],[],[]];
        
        // 위쪽으로 이동 및 합치기
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j]) {
                    const currentRow = newData[j];
                    const prevData = currentRow[currentRow.length - 1];
                    if (prevData === this.grid[i][j]) {
                        // 합치기
                        const score = parseInt(this.scoreElement.textContent);
                        this.scoreElement.textContent = score + currentRow[currentRow.length - 1] * 2;
                        currentRow[currentRow.length - 1] *= -2;
                    } else {
                        // 새로 추가
                        newData[j].push(this.grid[i][j]);
                    }
                }
            }
        }
        
        // 결과를 원본 그리드에 적용
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const newValue = Math.abs(newData[j][i]) || 0;
                if (this.grid[i][j] !== newValue) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        const newData = [[],[],[],[]];
        
        // 아래쪽으로 이동 및 합치기
        for (let i = this.size - 1; i >= 0; i--) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j]) {
                    const currentRow = newData[j];
                    const prevData = currentRow[currentRow.length - 1];
                    if (prevData === this.grid[i][j]) {
                        // 합치기
                        const score = parseInt(this.scoreElement.textContent);
                        this.scoreElement.textContent = score + currentRow[currentRow.length - 1] * 2;
                        currentRow[currentRow.length - 1] *= -2;
                    } else {
                        // 새로 추가
                        newData[j].push(this.grid[i][j]);
                    }
                }
            }
        }
        
        // 결과를 원본 그리드에 적용
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const newValue = Math.abs(newData[j][this.size - 1 - i]) || 0;
                if (this.grid[i][j] !== newValue) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        
        return moved;
    }
    
    moveLeft() {
        let moved = false;
        const newData = [[],[],[],[]];
        const mergedTiles = []; // 합쳐진 타일 추적
        
        // 왼쪽으로 이동 및 합치기
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j]) {
                    const currentRow = newData[i];
                    const prevData = currentRow[currentRow.length - 1];
                    if (prevData === this.grid[i][j]) {
                        // 합치기
                        const score = parseInt(this.scoreElement.textContent);
                        this.scoreElement.textContent = score + currentRow[currentRow.length - 1] * 2;
                        currentRow[currentRow.length - 1] *= -2;
                        mergedTiles.push({row: i, col: currentRow.length - 1, value: Math.abs(currentRow[currentRow.length - 1])});
                    } else {
                        // 새로 추가
                        newData[i].push(this.grid[i][j]);
                    }
                }
            }
        }
        
        // 결과를 원본 그리드에 적용
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const newValue = Math.abs(newData[i][j]) || 0;
                if (this.grid[i][j] !== newValue) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        
        // 합쳐진 타일 애니메이션 적용
        if (mergedTiles.length > 0) {
            setTimeout(() => {
                mergedTiles.forEach(tile => {
                    const tileElement = this.tileContainerElement.querySelector(`[style*="grid-column: ${tile.col + 1}"][style*="grid-row: ${tile.row + 1}"]`);
                    if (tileElement) {
                        tileElement.classList.add('tile-merged');
                        setTimeout(() => {
                            tileElement.classList.remove('tile-merged');
                        }, 250);
                    }
                });
            }, 100);
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        const newData = [[],[],[],[]];
        
        // 오른쪽으로 이동 및 합치기
        for (let i = 0; i < this.size; i++) {
            for (let j = this.size - 1; j >= 0; j--) {
                if (this.grid[i][j]) {
                    const currentRow = newData[i];
                    const prevData = currentRow[currentRow.length - 1];
                    if (prevData === this.grid[i][j]) {
                        // 합치기
                        const score = parseInt(this.scoreElement.textContent);
                        this.scoreElement.textContent = score + currentRow[currentRow.length - 1] * 2;
                        currentRow[currentRow.length - 1] *= -2;
                    } else {
                        // 새로 추가
                        newData[i].push(this.grid[i][j]);
                    }
                }
            }
        }
        
        // 결과를 원본 그리드에 적용
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const newValue = Math.abs(newData[i][this.size - 1 - j]) || 0;
                if (this.grid[i][j] !== newValue) {
                    moved = true;
                }
                this.grid[i][j] = newValue;
            }
        }
        
        return moved;
    }
    
    
    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // 빈 셀이 있으면 게임 오버 아님
        if (this.grid.flat().includes(0)) {
            return false;
        }
        
        // 인접한 셀과 합칠 수 있는지 확인
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                
                // 오른쪽 셀과 비교
                if (j < this.size - 1 && this.grid[i][j + 1] === current) {
                    return false;
                }
                
                // 아래 셀과 비교
                if (i < this.size - 1 && this.grid[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    animateMove() {
        // 이전 타일들의 위치를 저장하고 잔상 생성
        const tiles = this.tileContainerElement.querySelectorAll('.tile');
        const ghostTiles = [];
        
        tiles.forEach(tile => {
            // 현재 타일의 위치와 값 저장
            const currentRow = parseInt(tile.style.gridRow) - 1;
            const currentCol = parseInt(tile.style.gridColumn) - 1;
            const value = tile.textContent;
            
            // 잔상 타일 생성
            const ghostTile = this.createGhostTile(currentRow, currentCol, value);
            ghostTiles.push(ghostTile);
            
            // 원본 타일에 이동 애니메이션 클래스 추가
            tile.classList.add('tile-moving');
        });
        
        // 잔상들을 컨테이너에 추가
        ghostTiles.forEach(ghost => {
            this.tileContainerElement.appendChild(ghost);
        });
        
        // 애니메이션 완료 후 클래스 제거 및 잔상 제거
        setTimeout(() => {
            tiles.forEach(tile => {
                tile.classList.remove('tile-moving');
            });
            
            // 잔상 제거
            ghostTiles.forEach(ghost => {
                if (ghost.parentNode) {
                    ghost.parentNode.removeChild(ghost);
                }
            });
        }, 200);
    }
    
    createGhostTile(row, col, value) {
        const ghostTile = document.createElement('div');
        
        // 기본 클래스 설정
        ghostTile.className = 'tile-ghost';
        ghostTile.textContent = value;
        
        // 그리드 위치 설정
        ghostTile.style.gridColumn = col + 1;
        ghostTile.style.gridRow = row + 1;
        
        // 타일 값에 따른 잔상 색상 클래스 추가
        if (value >= 4096) {
            ghostTile.classList.add('tile-ghost-super');
        } else {
            ghostTile.classList.add(`tile-ghost-${value}`);
        }
        
        return ghostTile;
    }
    
    updateDisplay() {
        this.clearTiles();
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.addTile(i, j, this.grid[i][j]);
                }
            }
        }
    }
    
    addTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        
        if (value >= 4096) {
            tile.className = `tile tile-super tile-${value}`;
        } else {
            tile.className = `tile tile-${value}`;
        }
        
        tile.textContent = value;
        
        // 그리드 위치 설정
        tile.style.gridColumn = col + 1;
        tile.style.gridRow = row + 1;
        
        this.tileContainerElement.appendChild(tile);
        
        // 새 타일인 경우 애니메이션 추가
        if (isNew) {
            tile.classList.add('tile-new');
            setTimeout(() => {
                tile.classList.remove('tile-new');
            }, 300);
        }
    }
    
    clearTiles() {
        this.tileContainerElement.innerHTML = '';
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('bestScore', this.bestScore.toString());
        }
    }
    
    showMessage(message, type) {
        this.gameMessageElement.querySelector('p').textContent = message;
        this.gameMessageElement.className = `game-message ${type}`;
        this.gameMessageElement.style.display = 'flex';
        
        if (type === 'game-won') {
            this.keepPlayingBtnElement.style.display = 'inline-block';
            this.retryBtnElement.style.display = 'none';
        } else {
            this.keepPlayingBtnElement.style.display = 'none';
            this.retryBtnElement.style.display = 'inline-block';
        }
    }
    
    hideMessage() {
        this.gameMessageElement.style.display = 'none';
    }
    
    keepPlaying() {
        this.won = false;
        this.hideMessage();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
