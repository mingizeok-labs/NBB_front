const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const API_BASE_URL = "https://backend.nbb.mingizeok.com/nbb/api/v1";

// 공통 fetch 옵션 (세션 쿠키 포함)
const fetchOptions = {
    credentials: 'include', 
};

// 1. 게임 시작
async function initGame() {
    try {
        const response = await fetch(`${API_BASE_URL}/start`, { 
            method: 'POST',
            ...fetchOptions 
        });
        await response.json(); // 필요시 로그용
        appendMessage('pc', "⚾ 게임이 시작되었습니다! <br>0~9 사이 숫자 4개를 입력하세요.");
    } catch (error) {
        console.error("시작 에러:", error);
        appendMessage('pc', "❌ 서버 연결에 실패했습니다.");
    }
}

// 2. 메시지 전송 및 결과 확인
async function sendMessage() {
    const value = userInput.value.trim();

    // 숫자 4자리 체크
    if (value.length !== 4 || isNaN(value)) {
        alert("4자리 숫자 입력해주세요:)");
        return;
    }

    appendMessage('user', value);
    userInput.value = "";

    try {
        const response = await fetch(`${API_BASE_URL}/lets_play`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: value }),
            ...fetchOptions
        });

        const data = await response.json();

        setTimeout(() => {
            // 422 등 ValidationError 처리
            if (data.detail) {
                appendMessage('pc', "⚠️ " + data.detail[0].msg);
                return;
            }

            // 정상 응답 처리
            const turnInput = Object.keys(data.input)[0];
            const turnResult = data.input[turnInput];
            appendMessage('pc', `${turnInput} → ${turnResult}`);

            // 홈런 또는 게임 종료 체크
            if (data.status === 'end') {
                appendMessage('pc', "정답입니다!");

                const restart = confirm("게임이 종료되었습니다. 새 게임을 시작하시겠습니까?");
                if (restart) {
                    resetGame(); // 세션 초기화 + 새 게임
                } else {
                    appendMessage('pc', "게임 종료. 새로 시작하려면 새 게임 버튼을 눌러주세요.");
                    // 이 시점에서 추가 입력은 막아야 함
                    userInput.disabled = true;
                }
            }

            // 전체 히스토리 표시 (선택 사항)
            /*
            data.history.forEach((turnObj, idx) => {
                const turnNum = idx + 1;
                const inputKey = Object.keys(turnObj[turnNum])[0];
                const resultValue = turnObj[turnNum][inputKey];
                appendMessage('pc', `턴 ${turnNum}: ${inputKey} → ${resultValue}`);
            });
            */
        }, 500);

    } catch (error) {
        console.error(error);
        appendMessage('pc', "❌ 통신 중 오류가 발생했습니다.");
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

// 메시지 표시
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 엔터 입력 처리
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 초기화
document.addEventListener('DOMContentLoaded', initGame);

const giveUpBtn = document.getElementById('give-up-btn');

giveUpBtn.addEventListener('click', async () => {
    const confirmGiveUp = confirm("게임을 포기하시겠습니까? 세션이 초기화됩니다.");
    if (confirmGiveUp) {
        chatBox.innerHTML = "";        // 화면 초기화
        userInput.disabled = false;    // 새 게임 대비 입력 가능
        await resetGame();             // 세션 초기화 + 새 게임 시작
    }
});
