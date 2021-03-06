/**
 * 익스프레스 설정 파일이 담겨있는 핵심 코드입니다.
 * morgan: 클라이언트의 HTTP 요청 정보를 로깅하기 위한 모듈
 * body-parser: 클라이언트의 HTTP 요청 중 POST 요청의 바디 데이터에 접근하기 위한 모듈
 * cookie-parser: 접속한 클라이언트의 쿠키 정보에 접근하기 위한 모듈
 * express.static(): 정적 파일 호스팅을 위한 경로 설정
 * app.use('/', routes): 라우팅 설정. 세부 라우팅은 /routes 폴더에 구현됨
 */

/**
 * 모듈 import
 * express 프레임 워크를 파일에 include
 */
const express = require('express');
const app = express();
const request = require('request');
const fs = require('fs');
const zlib = require('zlib');
const unzip = require('unzip-stream');
const multer = require('multer');
const path = require('path');
const upload = multer({dest: __dirname + '/upload/'});
const docUpload = multer({dest: __dirname + '/document/'});

// client page에서 불러올때 사용할 경로, js파일이 있는 실제 경로
app.use('/', express.static(__dirname + '/script'));
app.use('/', express.static(__dirname + '/views'));
app.use('/', express.static(__dirname + '/upload'));
app.use('/', express.static(__dirname + '/document'));


/**
 * 라우트 지정
 * url 구성
 * ex) 사용자가 어떤 메뉴를 클릭했을시 해당하는 화면을 브라우저에 출력
 * 어떤 주소가 요청되어져왔을 때 html 문서 파일을 응답 (라우팅)
 * 주소값이 주소창에 드러나도 상관없을 때에는 get을 쓰고 드러나지 말아야할 때에는 post를 사용함
 */

// express api 앤드포인트 미들웨어 관리측면에서 router사용이 더 나은방법이라고한다.
// 하지만 express js 문제접은 express 메인 app객체를 사용하지 말아야하는 이유에 대해 정확한 이유가 없다.
// 응용프로그램 관리 측면에서 기능 등의 사용 분리가 필요 (구성, 템플릿, 데이터베이스 연결 등)
app.get('/', (req, res) => {
    fs.readFile('index.html', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    });
});

/**
 * uploadImage 요청받음
 * upload.single: multer 미들웨어, uploadImage에서 file로 넘어온 인자를 지정한 디렉토리에 upload 한다.
 */
app.post('/uploadImage', upload.single('imageFile'), (req, res) => {
    const imageFile = req.file;
    const fileName = imageFile.filename;
    const filePath = imageFile.path;
    const extension = req.body.extension || imageFile.mimetype.split('/')[1];

    fs.renameSync(filePath + '', filePath + '.' + extension);
    res.json({
        uploadPath: fileName + '.' + extension
    });
});

const DOC_FILE_PATH = './document/nodejsTestFile.docx';
const ZIP_FILE_PATH = './document/zip/document.pb.zip';
const UNZIP_FILE_PATH = './document/unzip';
const CONVERT_SERVER = 'http://synapeditor.iptime.org:7419/convertNdoc';
const DOCUMENT_URL_CONVERT_SERVER = 'http://synapeditor.iptime.org:7419/documentUrlConvert';

// docFile getSerialize pb Data 구하기
app.post('/getSerializedPbData', docUpload.single('docFile'), (req, res) => {
    // file copy
    let arr = [];
    const convertDocToPbData = () => new Promise((resolve, reject) => {
        request.post({
            url: CONVERT_SERVER,
            formData: {
                file: fs.createReadStream(DOC_FILE_PATH)
            }
        }).on('data', (data) => {
            arr.push(data);
        }).on('end', () => {
            res.json({serializedData: JSON.parse(Buffer.concat(arr)).serializedData});
            resolve();
        });


        /*
        pipe(fs.createWriteStream(ZIP_FILE_PATH)).on('close', (err) => {
            console.log("@@");
            if (err) {
                console.log(err);
                return;
            }
            console.log("##");
            resolve();
        });*/
    });

    /*
    // file 압축 해제
    const unZipFile = () => new Promise((resolve) => {
        fs.createReadStream(ZIP_FILE_PATH).pipe(unzip.Extract({
            path: UNZIP_FILE_PATH
        })).on('close', () => {
            console.log('unzip success!');
            const serializedData = [];

            fs.createReadStream(UNZIP_FILE_PATH + '/document.word.pb', {
                start: 16
            }).pipe(zlib.createUnzip()).on('data', (data) => {
                for (let i = 0, len = data.length; i < len; i++) {
                    serializedData.push(data[i] & 0xFF);
                }
            }).on('close', () => {
                console.log('[controller.js] Successful Serialize!');
                resolve(serializedData);
            });
        });
    });

    convertDocToPbData().then(() => {
        return unZipFile();
    });*/

    convertDocToPbData();
});

app.post('/getSerializedPbDataToUrl', (req, res) => {
    let arr = [];
    request.post({
        url: DOCUMENT_URL_CONVERT_SERVER,
        qs: {
            downloadUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx'
        }
    }).on('data', (data) => {
        arr.push(data);
    }).on('end', () => {
        res.json({serializedData: JSON.parse(Buffer.concat(arr)).serializedData});
    });
});

/*
 * 서버 응답 준비
 * 서버가 클라이언트로부터의 요청을 받을 준비가 완료되었을때 콜백 함수 동작
 * 클라이언트는 서버로 요청할 때 서버 ip(퍼블릭) + 포트로 요청 주소
 */
app.listen(3000, function() {
    console.log('Connected 3000 port!');
});
