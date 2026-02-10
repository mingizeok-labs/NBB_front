const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const API_BASE_URL = "https://backend.nbb.mingizeok.com/nbb/api/v1";

// 공통 fetch 옵션 (세션 쿠키 포함)
const fetchOptions = {
    credentials: 'include', // 👈 이게 있어야 서버 세션이 유지됨!
};

// 1. 게임 시작
async function initGame() {
    try {
        const response = await fetch(`${API_BASE_URL}/start`, { 
            method: 'POST',
            ...fetchOptions 
        });
        const data = await response.json();
        appendMessage('pc', "⚾ 게임이 시작되었습니다! <br>0~9 사이 숫자 4개를 입력하세요.");
    } catch (error) {
        console.error("시작 에러:", error);
        appendMessage('pc', "❌ 서버 연결에 실패했습니다.");
    }
}

// 2. 메시지 전송 및 결과 확인
async function sendMessage() {
    const value = userInput.value.trim();
    
    if (value.length !== 4 || isNaN(value)) {
        alert("중복 없는 숫자 4자리를 입력해주세요!");
        return;
    }

    appendMessage('user', value);
    userInput.value = "";

    try {
        const response = await fetch(`${API_BASE_URL}/lets_play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess: value }),
            ...fetchOptions // 👈 세션 정보 포함
        });

        const data = await response.json();
        
        setTimeout(() => {
            // 서버 응답 필드명이 다를 수 있으니 확인 필요! (예: data.message 혹은 data.result)
            appendMessage('pc', data.result || data.message);
            
            if (data.is_homerun) {
                appendMessage('pc', "🎊 홈런! 정답입니다!");
            }
        }, 500);

    } catch (error) {
        appendMessage('pc', "⚠️ 통신 중 오류가 발생했습니다.");
    }
}

// 3. 게임 리셋
async function resetGame() {
    try {
        await fetch(`${API_BASE_URL}/reset`, { 
            method: 'POST',
            ...fetchOptions 
        });
        chatBox.innerHTML = "";
        initGame();
    } catch (error) {
        alert("리셋 실패");
    }
}

// (이하 appendMessage, 이벤트 리스너 함수는 기존과 동일)
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.addEventListener('DOMContentLoaded', initGame);