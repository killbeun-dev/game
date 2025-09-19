class FlagGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.currentCommand = null;
        this.voiceSpeed = 1.5;
        this.totalCommands = 0;
        this.correctCommands = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.timerElement = document.getElementById('timer');
        this.currentCommandElement = document.getElementById('current-command');
        this.resultDisplayElement = document.getElementById('result-display');
        this.resultTextElement = document.getElementById('result-text');
        this.whiteFlagElement = document.getElementById('white-flag');
        this.blueFlagElement = document.getElementById('blue-flag');
        this.startBtnElement = document.getElementById('start-btn');
        this.stopBtnElement = document.getElementById('stop-btn');
        this.resetBtnElement = document.getElementById('reset-btn');
        this.voiceSpeedElement = document.getElementById('voice-speed');
        this.speedValueElement = document.getElementById('speed-value');
        this.gameOverModalElement = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.bestStreakElement = document.getElementById('best-streak');
        this.accuracyElement = document.getElementById('accuracy');
        this.playAgainBtnElement = document.getElementById('play-again-btn');
        
        // 버튼 요소들
        this.whiteUpBtnElement = document.getElementById('white-up-btn');
        this.whiteDownBtnElement = document.getElementById('white-down-btn');
        this.blueUpBtnElement = document.getElementById('blue-up-btn');
        this.blueDownBtnElement = document.getElementById('blue-down-btn');
        this.standBtnElement = document.getElementById('stand-btn');
        this.sitBtnElement = document.getElementById('sit-btn');
        
        // 효과음 배열
        this.soundEffects = [
            '아싸~!', '지화자!', '좋아!', '완벽해!', '대단해!', 
            '훌륭해!', '멋져!', '최고야!', '잘했어!', '정말 좋아!'
        ];
        
        this.wrongSoundEffects = [
            '아이고!', '어머!', '앗!', '아!', '어라!', 
            '이런!', '아쉬워!', '다시!', '힘내!', '포기하지 마!'
        ];
        
        // 난이도 시스템
        this.difficultyLevel = 1;
        this.maxDifficulty = 5;
    }
    
    
    bindEvents() {
        // 깃발 버튼 클릭 이벤트
        this.whiteUpBtnElement.addEventListener('click', () => this.handleButtonClick('white-up'));
        this.whiteDownBtnElement.addEventListener('click', () => this.handleButtonClick('white-down'));
        this.blueUpBtnElement.addEventListener('click', () => this.handleButtonClick('blue-up'));
        this.blueDownBtnElement.addEventListener('click', () => this.handleButtonClick('blue-down'));
        this.standBtnElement.addEventListener('click', () => this.handleButtonClick('stand'));
        this.sitBtnElement.addEventListener('click', () => this.handleButtonClick('sit'));
        
        // 컨트롤 버튼 이벤트
        this.startBtnElement.addEventListener('click', () => this.startGame());
        this.stopBtnElement.addEventListener('click', () => this.stopGame());
        this.resetBtnElement.addEventListener('click', () => this.resetGame());
        
        // 음성 속도 설정 이벤트
        this.voiceSpeedElement.addEventListener('input', (e) => {
            this.voiceSpeed = parseFloat(e.target.value);
            this.speedValueElement.textContent = this.voiceSpeed.toFixed(1) + 'x';
        });
        
        // 모달 이벤트
        this.playAgainBtnElement.addEventListener('click', () => {
            this.gameOverModalElement.classList.remove('show');
            this.resetGame();
        });
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            if (e.key === '1') {
                this.handleButtonClick('white-up');
            } else if (e.key === '2') {
                this.handleButtonClick('white-down');
            } else if (e.key === '3') {
                this.handleButtonClick('blue-up');
            } else if (e.key === '4') {
                this.handleButtonClick('blue-down');
            } else if (e.key === '5') {
                this.handleButtonClick('stand');
            } else if (e.key === '6') {
                this.handleButtonClick('sit');
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.timeLeft = 60;
        this.score = 0;
        this.streak = 0;
        this.totalCommands = 0;
        this.correctCommands = 0;
        this.difficultyLevel = 1;
        
        this.startBtnElement.disabled = true;
        this.stopBtnElement.disabled = false;
        
        this.startTimer();
        this.generateCommand();
        this.updateUI();
    }
    
    stopGame() {
        this.gameRunning = false;
        
        this.startBtnElement.disabled = false;
        this.stopBtnElement.disabled = true;
        
        this.showGameOver();
    }
    
    resetGame() {
        this.gameRunning = false;
        this.score = 0;
        this.streak = 0;
        this.timeLeft = 60;
        this.currentCommand = null;
        this.totalCommands = 0;
        this.correctCommands = 0;
        this.difficultyLevel = 1;
        
        this.startBtnElement.disabled = false;
        this.stopBtnElement.disabled = true;
        
        this.clearResult();
        this.updateUI();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            
            // 난이도 업데이트 (12초마다 1단계씩 증가)
            const newDifficulty = Math.min(this.maxDifficulty, Math.floor((60 - this.timeLeft) / 12) + 1);
            if (newDifficulty > this.difficultyLevel) {
                this.difficultyLevel = newDifficulty;
            }
            
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.stopGame();
            }
        }, 1000);
    }
    
    generateCommand() {
        if (!this.gameRunning) return;
        
        // 난이도별 명령어 생성
        const command = this.generateCommandByDifficulty();
        this.currentCommand = command.action;
        
        this.currentCommandElement.textContent = command.text;
        
        // 음성으로 명령어 읽기
        this.speakCommand(command.text);
        
        this.totalCommands++;
    }
    
    generateCommandByDifficulty() {
        const basicCommands = [
            { action: 'white-up', text: '백기 올려!' },
            { action: 'white-down', text: '백기 내려!' },
            { action: 'blue-up', text: '청기 올려!' },
            { action: 'blue-down', text: '청기 내려!' },
            { action: 'stand', text: '일어서기!' },
            { action: 'sit', text: '앉기!' }
        ];
        
        const variationCommands = [
            { action: 'white-up', text: '백기 내리지 말고 올려!' },
            { action: 'white-down', text: '백기 올리지 말고 내려!' },
            { action: 'blue-up', text: '청기 내리지 말고 올려!' },
            { action: 'blue-down', text: '청기 올리지 말고 내려!' },
            { action: 'stand', text: '앉지 말고 일어서기!' },
            { action: 'sit', text: '일어서지 말고 앉기!' }
        ];
        
        const complexCommands = [
            { action: 'white-up', text: '백기만 올려! 청기는 건드리지 마!' },
            { action: 'white-down', text: '백기만 내려! 청기는 올리지 마!' },
            { action: 'blue-up', text: '청기만 올려! 백기는 건드리지 마!' },
            { action: 'blue-down', text: '청기만 내려! 백기는 올리지 마!' },
            { action: 'stand', text: '일어서기! 앉지 마!' },
            { action: 'sit', text: '앉기! 일어서지 마!' }
        ];
        
        const trickCommands = [
            { action: 'white-up', text: '백기 올리지 말고 내려!' },
            { action: 'white-down', text: '백기 내리지 말고 올려!' },
            { action: 'blue-up', text: '청기 올리지 말고 내려!' },
            { action: 'blue-down', text: '청기 내리지 말고 올려!' },
            { action: 'stand', text: '일어서지 말고 앉기!' },
            { action: 'sit', text: '앉지 말고 일어서기!' }
        ];
        
        let availableCommands = basicCommands;
        
        // 난이도에 따라 명령어 선택
        if (this.difficultyLevel >= 2) {
            availableCommands = [...basicCommands, ...variationCommands];
        }
        if (this.difficultyLevel >= 3) {
            availableCommands = [...availableCommands, ...complexCommands];
        }
        if (this.difficultyLevel >= 4) {
            availableCommands = [...availableCommands, ...trickCommands];
        }
        if (this.difficultyLevel >= 5) {
            // 최고 난이도에서는 모든 명령어가 동일한 확률
            availableCommands = [...basicCommands, ...variationCommands, ...complexCommands, ...trickCommands];
        }
        
        return availableCommands[Math.floor(Math.random() * availableCommands.length)];
    }
    
    speakCommand(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.voiceSpeed;
            utterance.lang = 'ko-KR';
            speechSynthesis.speak(utterance);
        }
    }
    
    playSoundEffect() {
        if ('speechSynthesis' in window) {
            const randomEffect = this.soundEffects[Math.floor(Math.random() * this.soundEffects.length)];
            const utterance = new SpeechSynthesisUtterance(randomEffect);
            utterance.rate = this.voiceSpeed * 1.5; // 효과음은 더 빠르게
            utterance.pitch = 1.3; // 효과음은 조금 더 높게
            utterance.lang = 'ko-KR';
            speechSynthesis.speak(utterance);
        }
    }
    
    playWrongSoundEffect() {
        if ('speechSynthesis' in window) {
            const randomEffect = this.wrongSoundEffects[Math.floor(Math.random() * this.wrongSoundEffects.length)];
            const utterance = new SpeechSynthesisUtterance(randomEffect);
            utterance.rate = this.voiceSpeed * 1.2; // 틀렸을 때도 빠르게
            utterance.pitch = 0.9; // 틀렸을 때는 조금 낮게
            utterance.lang = 'ko-KR';
            speechSynthesis.speak(utterance);
        }
    }
    
    
    handleButtonClick(clickedButton) {
        if (!this.gameRunning || !this.currentCommand) return;
        
        // 명령어와 버튼이 일치하는지 확인
        const isCorrect = clickedButton === this.currentCommand;
        
        if (isCorrect) {
            this.score += 10 + (this.streak * 2);
            this.streak++;
            this.correctCommands++;
            
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
            }
            
            // 효과음 재생
            this.playSoundEffect();
            this.showResult('정답!', 'correct');
            this.animateButton(clickedButton, 'correct');
        } else {
            this.streak = 0;
            this.playWrongSoundEffect();
            this.showResult('틀렸어요!', 'wrong');
            this.animateButton(clickedButton, 'wrong');
        }
        
        this.updateUI();
        // 약간의 지연 후 다음 명령어 생성 (더 빠른 템포)
        setTimeout(() => {
            this.generateCommand();
        }, 500);
    }
    
    animateButton(buttonType, result) {
        let buttonElement;
        switch(buttonType) {
            case 'white-up':
                buttonElement = this.whiteUpBtnElement;
                break;
            case 'white-down':
                buttonElement = this.whiteDownBtnElement;
                break;
            case 'blue-up':
                buttonElement = this.blueUpBtnElement;
                break;
            case 'blue-down':
                buttonElement = this.blueDownBtnElement;
                break;
            case 'stand':
                buttonElement = this.standBtnElement;
                break;
            case 'sit':
                buttonElement = this.sitBtnElement;
                break;
        }
        
        if (buttonElement) {
            buttonElement.classList.remove('correct', 'wrong');
            setTimeout(() => {
                buttonElement.classList.add(result);
            }, 10);
        }
    }
    
    showResult(text, type) {
        this.resultTextElement.textContent = text;
        this.resultTextElement.className = `result-text ${type}`;
        this.resultTextElement.classList.add('show');
        
        setTimeout(() => {
            this.clearResult();
        }, 1500);
    }
    
    clearResult() {
        this.resultTextElement.classList.remove('show', 'correct', 'wrong');
    }
    
    showGameOver() {
        const accuracy = this.totalCommands > 0 ? Math.round((this.correctCommands / this.totalCommands) * 100) : 0;
        
        this.finalScoreElement.textContent = this.score;
        this.bestStreakElement.textContent = this.bestStreak;
        this.accuracyElement.textContent = accuracy + '%';
        
        this.gameOverModalElement.classList.add('show');
        
        clearInterval(this.timerInterval);
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
        this.timerElement.textContent = this.timeLeft;
        
        // 난이도 표시 업데이트
        const difficultyDisplay = document.getElementById('difficulty');
        if (difficultyDisplay) {
            difficultyDisplay.textContent = `난이도: ${this.difficultyLevel}`;
        }
        
        if (!this.gameRunning) {
            this.currentCommandElement.textContent = '게임을 시작하려면 시작 버튼을 클릭하세요!';
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new FlagGame();
});
