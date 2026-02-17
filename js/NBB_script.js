const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const API_BASE_URL = "https://backend.nbb.mingizeok.com/nbb/api/v1";

// 공통 fetch 옵션 (세션 쿠키 포함)
const fetchOptions = {
    credentials: 'include', 
};

// 1. 게임 시작
// [시작] 게임 진행을 위한 초기화 (기존 initGame 유지 및 보완)
async function initGame() {
    try {
        await fetch(`${API_BASE_URL}/start`, { method: 'POST', ...fetchOptions });
        
        chatBox.innerHTML = "";     // 화면 비우기
        userInput.disabled = false; // 입력창 활성화
        userInput.focus();          // 바로 입력 가능하게 포커스
        
        appendMessage('pc', "⚾ 게임이 시작되었습니다! <br>0~9 사이 숫자 4개를 입력하세요.");
    } catch (error) {
        console.error("시작 에러:", error);
        appendMessage('pc', "❌ 서버 연결에 실패했습니다.");
    }
}

// [종료] 완전 끝내기 및 세션 삭제
async function terminateSession() {
    try {
        await fetch(`${API_BASE_URL}/reset`, { method: 'POST', ...fetchOptions });
        
        userInput.disabled = true;  // 입력창 막기
        userInput.value = "";
        appendMessage('pc', "🚫 게임이 완전히 종료되었습니다. 다시 시작하려면 새로고침 버튼을 눌러주세요.");
    } catch (error) {
        console.error("종료 에러:", error);
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

                // 메시지가 화면에 찍힐 시간을 주기 위해 100ms 정도 지연
                setTimeout(async () => {
                    const restart = confirm("새 게임을 바로 시작하시겠습니까?");
                    
                    if (restart) {
                        // 사용자가 원하면 start API 호출하여 새 게임 세팅
                        await initGame(); 
                    } else {
                        // 원하지 않으면 미리 정의해둔 종료 함수 호출
                        // 이 안에서 /reset 호출 및 userInput.disabled 처리가 다 일어납니다.
                        await terminateSession();
                        appendMessage('pc', "게임이 종료되었습니다. 다시 하시려면 새로고침을 해주세요.");
                    }
                }, 100);
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
    if (confirm("정말 종료하시겠습니까? 데이터가 사라집니다.")) {
        await terminateSession();
        chatBox.innerHTML = "";
        appendMessage('pc', "세션이 삭제되었습니다.");
    }
});

// 숫자 버튼 클릭 시 호출되는 함수
function appendNum(n) {
    // 기존에 선언된 userInput 변수를 그대로 사용합니다.
    if (userInput.value.length < 4) {
        userInput.value += n;
    }
}

// ← 버튼 클릭 시 호출되는 함수
function deleteNum() {
    userInput.value = userInput.value.slice(0, -1);
}

// C 버튼 클릭 시 호출되는 함수
function clearAll() {
    userInput.value = "";
}
