class ColorMatchGame {
    constructor() {
        this.currentRound = 1;
        this.score = 0;
        this.maxRounds = 10;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.gameRunning = false;
        this.showingCards = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeElements() {
        this.roundElement = document.getElementById('round');
        this.scoreElement = document.getElementById('score');
        this.remainingElement = document.getElementById('remaining');
        this.messageElement = document.getElementById('message');
        this.cardsContainerElement = document.getElementById('cards-container');
        this.startBtnElement = document.getElementById('start-btn');
        this.restartBtnElement = document.getElementById('restart-btn');
        this.gameOverModalElement = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalRoundElement = document.getElementById('final-round');
        this.playAgainBtnElement = document.getElementById('play-again-btn');
    }
    
    bindEvents() {
        this.startBtnElement.addEventListener('click', () => this.startGame());
        this.restartBtnElement.addEventListener('click', () => this.restartGame());
        this.playAgainBtnElement.addEventListener('click', () => this.playAgain());
        
        // 터치 이벤트 지원
        this.cardsContainerElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // 키보드 이벤트 (데스크톱)
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!this.gameRunning) {
                    this.startGame();
                }
            }
        });
        
        // 모바일에서 스크롤 방지
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.cards-container')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 줌 방지
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.currentRound = 1;
        this.score = 0;
        this.matchedPairs = 0;
        this.totalPairs = 0;
        
        this.startBtnElement.disabled = true;
        this.restartBtnElement.disabled = false;
        
        this.updateUI();
        this.startRound();
    }
    
    restartGame() {
        this.startGame();
    }
    
    playAgain() {
        this.gameOverModalElement.classList.remove('show');
        this.startGame();
    }
    
    startRound() {
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.cards = [];
        
        // 라운드별 카드 수 계산 (1라운드: 4장, 2라운드: 8장, 3라운드: 16장...)
        this.totalPairs = Math.pow(2, this.currentRound);
        this.totalCards = this.totalPairs * 2;
        
        console.log(`라운드 ${this.currentRound} 시작: 총 ${this.totalPairs}쌍 (${this.totalCards}장)`);
        
        this.generateCards();
        this.showCards();
    }
    
    generateCards() {
        // 색상 배열 생성
        const colors = this.generateColors(this.totalPairs);
        
        // 카드 배열 생성 (각 색상당 2장)
        const cardData = [];
        colors.forEach(color => {
            cardData.push({ color, id: Math.random() });
            cardData.push({ color, id: Math.random() });
        });
        
        // 카드 섞기
        this.cards = this.shuffleArray(cardData);
        
        this.renderCards();
    }
    
    generateColors(count) {
        const colors = [];
        const baseColors = [
            '#e74c3c', '#e67e22', '#f39c12', '#f1c40f',
            '#2ecc71', '#1abc9c', '#3498db', '#9b59b6',
            '#e91e63', '#ff5722', '#795548', '#607d8b',
            '#3f51b5', '#009688', '#4caf50', '#ffeb3b'
        ];
        
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        
        return colors;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    renderCards() {
        this.cardsContainerElement.innerHTML = '';
        
        // 그리드 크기 설정
        const gridSize = Math.ceil(Math.sqrt(this.totalCards));
        this.cardsContainerElement.className = `cards-container cards-${gridSize}x${gridSize}`;
        
        // 카드 생성
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            cardElement.dataset.color = card.color;
            cardElement.style.setProperty('--card-color', card.color);
            
            // 이벤트 리스너를 한 번만 등록
            const clickHandler = (e) => {
                e.preventDefault();
                this.handleCardClick(cardElement);
            };
            
            cardElement.addEventListener('click', clickHandler);
            cardElement.addEventListener('touchend', clickHandler);
            
            this.cardsContainerElement.appendChild(cardElement);
        });
    }
    
    showCards() {
        this.showingCards = true;
        this.showMessage(`라운드 ${this.currentRound} 시작! 카드를 기억하세요!`, 'info');
        
        // 모든 카드 뒤집기
        const cardElements = this.cardsContainerElement.querySelectorAll('.card');
        cardElements.forEach(card => {
            card.classList.add('flipped');
        });
        
        // 3초 후 카드 다시 뒤집기
        setTimeout(() => {
            this.hideCards();
        }, 3000);
    }
    
    hideCards() {
        this.showingCards = false;
        const cardElements = this.cardsContainerElement.querySelectorAll('.card');
        cardElements.forEach(card => {
            card.classList.remove('flipped');
        });
        
        this.showMessage('이제 같은 색을 찾아보세요!', 'info');
    }
    
    handleCardClick(cardElement) {
        if (!this.gameRunning || this.showingCards) return;
        
        const index = parseInt(cardElement.dataset.index);
        const color = cardElement.dataset.color;
        
        // 이미 뒤집힌 카드나 매칭된 카드는 무시
        if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) {
            return;
        }
        
        // 이미 2장이 뒤집어져 있으면 무시 (빠른 클릭 방지)
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // 카드 뒤집기
        cardElement.classList.add('flipped');
        this.flippedCards.push({ element: cardElement, color, index });
        
        console.log(`카드 뒤집기: ${this.flippedCards.length}/2`);
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 2장이 뒤집어졌을 때 확인
        if (this.flippedCards.length === 2) {
            console.log('2장 뒤집음, 매칭 확인 시작');
            setTimeout(() => {
                this.checkMatch();
            }, 500);
        }
    }
    
    checkMatch() {
        // flippedCards가 2개가 아니면 무시
        if (this.flippedCards.length !== 2) {
            console.log('매칭 확인 실패: flippedCards가 2개가 아님');
            return;
        }
        
        const [card1, card2] = this.flippedCards;
        console.log(`매칭 확인: ${card1.color} vs ${card2.color}`);
        
        if (card1.color === card2.color) {
            // 매칭 성공
            console.log('매칭 성공!');
            this.handleMatch(card1.element, card2.element);
        } else {
            // 매칭 실패
            console.log('매칭 실패!');
            this.handleMismatch(card1.element, card2.element);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        this.matchedPairs++;
        this.score += 10 * this.currentRound; // 라운드가 높을수록 더 많은 점수
        
        this.showMessage(`매칭 성공! +${10 * this.currentRound}점`, 'success');
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
        this.updateUI();
        
        // 디버깅을 위한 콘솔 로그
        console.log(`매칭된 쌍: ${this.matchedPairs}/${this.totalPairs}, 라운드: ${this.currentRound}`);
        console.log(`조건 확인: ${this.matchedPairs} === ${this.totalPairs} ? ${this.matchedPairs === this.totalPairs}`);
        
        // 모든 쌍이 매칭되었는지 확인
        if (this.matchedPairs === this.totalPairs) {
            console.log('라운드 완료! 다음 라운드로 진행합니다.');
            this.completeRound();
        } else {
            console.log('아직 매칭할 쌍이 남았습니다.');
        }
    }
    
    handleMismatch(card1, card2) {
        card1.classList.add('wrong');
        card2.classList.add('wrong');
        
        this.showMessage('틀렸어요! 다시 시도해보세요.', 'error');
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
        
        // 1초 후 카드 다시 뒤집기
        setTimeout(() => {
            card1.classList.remove('flipped', 'wrong');
            card2.classList.remove('flipped', 'wrong');
        }, 1000);
    }
    
    completeRound() {
        this.showMessage(`라운드 ${this.currentRound} 완료!`, 'success');
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // 다음 라운드로 진행
        setTimeout(() => {
            this.currentRound++;
            console.log(`다음 라운드: ${this.currentRound}`);
            
            if (this.currentRound > this.maxRounds) {
                console.log('게임 종료!');
                this.endGame();
            } else {
                this.updateUI(); // UI 업데이트 추가
                this.startRound();
            }
        }, 2000);
    }
    
    endGame() {
        this.gameRunning = false;
        this.startBtnElement.disabled = false;
        this.restartBtnElement.disabled = true;
        
        this.finalScoreElement.textContent = this.score;
        this.finalRoundElement.textContent = this.currentRound - 1;
        
        this.gameOverModalElement.classList.add('show');
        
        // 모바일에서 진동 피드백
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }
    
    showMessage(text, type) {
        this.messageElement.textContent = text;
        this.messageElement.className = `message ${type}`;
    }
    
    updateUI() {
        this.roundElement.textContent = this.currentRound;
        this.scoreElement.textContent = this.score;
        this.remainingElement.textContent = this.totalPairs - this.matchedPairs;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new ColorMatchGame();
    
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
