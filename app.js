
/**
 * 모듈 import
 * express 프레임 워크를 파일에 include
 */
var express = require('express');
var app = express();


/**
 * 라우트 지정
 * url 구성
 * ex) 사용자가 어떤 메뉴를 클릭했을시 해당하는 화면을 브라우저에 출력
 * 어떤 주소가 요청되어져왔을 때 html 문서 파일을 응답 (라우팅)
 * 주소값이 주소창에 드러나도 상관없을 때에는 get을 쓰고 드러나지 말아야할 때에는 post를 사용함
 */
app.get('/', function(req, res) {
    res.send('Hello World');
});

/**
 * 서버 응답 준비
 * 서버가 클라이언트로부터의 요청을 받을 준비가 완료되었을때 콜백 함수 동작
 * 클라이언트는 서버로 요청할 때 서버 ip(퍼블릭) + 포트로 요청 주소
 */
app.listen(3000, function() {
    console.log('Connected 3000 port!');
});
