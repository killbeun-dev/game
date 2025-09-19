const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 정적 파일 서빙을 위한 미들웨어
app.use(express.static('.'));

// 메인 페이지 라우트
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>게임 모음</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                }
                h1 {
                    color: #333;
                    margin-bottom: 30px;
                    font-size: 2.5em;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }
                .games-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }
                .game-card {
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    text-decoration: none;
                    color: inherit;
                }
                .game-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                .game-title {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .game-description {
                    color: #6c757d;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                .game-features {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .game-features li {
                    color: #495057;
                    margin: 5px 0;
                    padding-left: 20px;
                    position: relative;
                }
                .game-features li:before {
                    content: "🎮";
                    position: absolute;
                    left: 0;
                }
                .play-btn {
                    background: linear-gradient(45deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 15px;
                    display: inline-block;
                    text-decoration: none;
                }
                .play-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎮 게임 모음</h1>
                <p>다양한 HTML5 게임들을 즐겨보세요!</p>
                
                <div class="games-grid">
                    <div class="game-card">
                        <div class="game-title">🏁 백기청기 게임</div>
                        <div class="game-description">
                            음성 명령에 따라 빠르게 반응하는 반응 속도 게임입니다.
                        </div>
                        <ul class="game-features">
                            <li>음성 인식 및 음성 출력</li>
                            <li>난이도 증가 시스템</li>
                            <li>변주 명령어</li>
                            <li>효과음 시스템</li>
                        </ul>
                        <a href="/백기청기게임/" class="play-btn">게임 시작</a>
                    </div>
                    
                    <div class="game-card">
                        <div class="game-title">⚫ 오목 게임</div>
                        <div class="game-description">
                            전통적인 오목 게임으로 5개를 연속으로 놓으면 승리합니다.
                        </div>
                        <ul class="game-features">
                            <li>15x15 오목판</li>
                            <li>정확한 교차점 배치</li>
                            <li>승리 조건 검사</li>
                            <li>게임 리셋 기능</li>
                        </ul>
                        <a href="/오목/" class="play-btn">게임 시작</a>
                    </div>
                    
                    <div class="game-card">
                        <div class="game-title">🎨 다른색 맞추기</div>
                        <div class="game-description">
                            그리드에서 다른 색을 찾아 클릭하는 관찰력 게임입니다.
                        </div>
                        <ul class="game-features">
                            <li>4x4 및 3x3 그리드</li>
                            <li>시간 제한</li>
                            <li>점수 시스템</li>
                            <li>반응형 디자인</li>
                        </ul>
                        <a href="/다른색맞추기/" class="play-btn">게임 시작</a>
                    </div>
                    
                    <div class="game-card">
                        <div class="game-title">🎯 같은색 맞추기</div>
                        <div class="game-description">
                            카드를 뒤집어서 같은 색을 찾는 메모리 게임입니다.
                        </div>
                        <ul class="game-features">
                            <li>10라운드 진행</li>
                            <li>라운드별 카드 수 증가</li>
                            <li>메모리 테스트</li>
                            <li>점수 시스템</li>
                        </ul>
                        <a href="/같은색 맞추기/" class="play-btn">게임 시작</a>
                    </div>
                    
                    <div class="game-card">
                        <div class="game-title">🔢 2048 게임</div>
                        <div class="game-description">
                            숫자 타일을 합쳐서 2048을 만드는 퍼즐 게임입니다.
                        </div>
                        <ul class="game-features">
                            <li>4x4 그리드</li>
                            <li>화살표 키 조작</li>
                            <li>터치 스와이프 지원</li>
                            <li>최고점수 저장</li>
                        </ul>
                        <a href="/2048게임/" class="play-btn">게임 시작</a>
                    </div>
                    
                </div>
                
                <div style="margin-top: 40px; padding: 20px; background: #e9ecef; border-radius: 10px;">
                    <h3>🚀 서버 정보</h3>
                    <p>서버가 정상적으로 실행 중입니다!</p>
                    <p><strong>포트:</strong> ${PORT} | <strong>URL:</strong> http://localhost:${PORT}</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 게임별 라우트 설정
app.get('/백기청기게임/', (req, res) => {
    res.sendFile(path.join(__dirname, '백기청기게임', 'index.html'));
});

app.get('/오목/', (req, res) => {
    res.sendFile(path.join(__dirname, '오목', 'index.html'));
});

app.get('/다른색맞추기/', (req, res) => {
    res.sendFile(path.join(__dirname, '다른색맞추기', 'index.html'));
});

app.get('/같은색맞추기/', (req, res) => {
    res.sendFile(path.join(__dirname, '같은색 맞추기', 'index.html'));
});

app.get('/2048게임/', (req, res) => {
    res.sendFile(path.join(__dirname, '2048게임', 'index.html'));
});

// 404 에러 처리
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - 페이지를 찾을 수 없습니다</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 { color: #e74c3c; font-size: 3em; margin-bottom: 20px; }
                p { color: #6c757d; font-size: 1.2em; margin-bottom: 30px; }
                a {
                    background: linear-gradient(45deg, #3498db, #2980b9);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                a:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <p>요청하신 페이지를 찾을 수 없습니다.</p>
                <a href="/">홈으로 돌아가기</a>
            </div>
        </body>
        </html>
    `);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
    console.log(`📁 사용 가능한 게임들:`);
    console.log(`   - 백기청기 게임: http://localhost:${PORT}/백기청기게임/`);
    console.log(`   - 오목 게임: http://localhost:${PORT}/오목/`);
    console.log(`   - 다른색 맞추기: http://localhost:${PORT}/다른색맞추기/`);
    console.log(`   - 같은색 맞추기: http://localhost:${PORT}/같은색맞추기/`);
    console.log(`   - 2048 게임: http://localhost:${PORT}/2048게임/`);
    console.log(`\n💡 서버를 중지하려면 Ctrl+C를 누르세요.`);
});
