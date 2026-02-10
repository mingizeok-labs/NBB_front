let answer = [];
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// 1. 4자릿수 랜덤 숫자 생성 (중복 없음)
function generateAnswer() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    answer = [];
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        answer.push(numbers[randomIndex]);
        numbers.splice(randomIndex, 1);
    }
    console.log("정답(테스트용):", answer.join(''));
}

// 초기 실행
generateAnswer();

function sendMessage() {
    const value = userInput.value.trim();
    
    // 유효성 검사 (4자리 숫자인지)
    if (value.length !== 4 || isNaN(value) || new Set(value).size !== 4) {
        alert("중복 없는 숫자 4자리를 입력해주세요!");
        return;
    }

    // 사용자 메시지 표시
    appendMessage('user', value);
    userInput.value = "";

    // 결과 판정
    const result = checkScore(value);
    
    // PC 메시지 표시 (결과)
    setTimeout(() => {
        appendMessage('pc', result);
    }, 500);
}

function checkScore(input) {
    const userArray = input.split('').map(Number);
    let strikes = 0;
    let balls = 0;

    userArray.forEach((num, i) => {
        if (num === answer[i]) {
            strikes++;
        } else if (answer.includes(num)) {
            balls++;
        }
    });

    if (strikes === 4) {
        generateAnswer(); // 게임 리셋
        return "🎊 홈런! 정답입니다. 새로운 게임을 시작합니다.";
    } else if (strikes === 0 && balls === 0) {
        return "OUT (아웃)입니다!";
    } else {
        return `${strikes} Strike, ${balls} Ball`;
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 엔터키 지원
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.addEventListener('DOMContentLoaded', () => {
    const rankingToggle = document.getElementById('ranking-toggle');
    const rankingPanel = document.getElementById('ranking-panel');

    if (rankingToggle && rankingPanel) {
        rankingToggle.addEventListener('change', () => {
            if (rankingToggle.checked) {
                rankingPanel.classList.add('active'); // 패널 보여주기
            } else {
                rankingPanel.classList.remove('active'); // 패널 숨기기
            }
        });
    }
});

// 1. 임시 랭킹 데이터 (나중에 API로 가져올 부분)
const dummyRankings = [
    { name: "홈런왕", score: 3 },
    { name: "야구천재", score: 4 },
    { name: "NBB마스터", score: 5 },
    { name: "기록파괴자", score: 6 },
    { name: "초보자", score: 10 }
];

// 2. 랭킹을 화면에 그리는 함수
function displayRankings(data) {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    // 기존 내용 비우기
    rankingList.innerHTML = "";

    // 데이터를 반복하며 li 태그 생성
    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem;";
        
        li.innerHTML = `
            <span><strong>${index + 1}.</strong> ${item.name}</span>
            <span style="color: #007aff; font-weight: bold;">${item.score}회</span>
        `;
        rankingList.appendChild(li);
    });
}

// 3. 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    displayRankings(dummyRankings); // 함수 실행!
    
    // 이전에 넣었던 토글 이벤트 코드도 여기에 함께 있어야 합니다.
    const rankingToggle = document.getElementById('ranking-toggle');
    const rankingPanel = document.getElementById('ranking-panel');
    if(rankingToggle && rankingPanel) {
        rankingToggle.addEventListener('change', () => {
            rankingPanel.classList.toggle('active', rankingToggle.checked);
        });
    }
});