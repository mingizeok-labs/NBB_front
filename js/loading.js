const URL = "https://backend.nbb.mingizeok.com/nbb/api/v1";

// Render 서버면 로딩 연출
const text = document.querySelector(".loading-text");
text.textContent = "밍기적... 밍기적... 실험실로 이동 중.";

const checkServer = async () => {
try {
    await fetch(URL, { 
    mode: 'no-cors',
    cache: 'no-store' // 매번 새로 확인하도록 설정
    });

    // 서버가 응답을 하면 (깨어났으면) 바로 이동
    console.log("실험실 도착 완료! +ㅅ+ ");
    location.replace("main.html");
} catch (error) {
    // 서버가 아직 잠들어있으면 2초 후에 다시 실행
    console.log("실험실 경로 재검색.. 밍기적... 밍기적... 밍기적...");
    setTimeout(checkServer, 2000);
}
};

checkServer(); // 함수 실행