const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const model = require('./model');
const bodyParser = require('koa-bodyparser');

const { spawn } = require('node:child_process');

const app = new Koa();
const router = new Router();

// ip 192.168.0.49

const main = async (ctx) => {
    const {connect} = ctx.request.body;
    const code = "2222";
    let ret = "none"

    if(connect == code) ret = "done"
    
    ctx.body = ret;
}
router.post('/', bodyParser(), main);


// C언어 Node.js 데이터 교환 Promise start
async function iotInfo(cmd) {
    return new Promise((res, rej) => {
        const ledCtrl = spawn('./src/led_ctrl', [cmd]);
        let output = "";
        
        ledCtrl.stdout.on('data', (data) => {
            output += data;
        });
        
        ledCtrl.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        ledCtrl.on('close', (code) => {
            if(code === 1){
                // ret = code;
                res(code);
            } else {
                rej(code);
            }
        })
    });
}
// C언어 Node.js 데이터 교환 Promise end


// REST API 
// app test log url
const testLog = async (ctx) => {
    const myLog = ctx.request.body;

    console.log("test log1");
    console.log(myLog);

    ctx.body = "ds001";
}
router.post('/test-post', bodyParser(), testLog);

const testLog2 = async (ctx) => {
    const myLog = ctx.request.body;

    console.log("test log2");
    console.log(myLog);

    ctx.body = "ok";
}
router.put('/test-put', bodyParser(), testLog2);

const getTest = async (ctx) => {
    // const {userNum} = ctx.query;
    const ret = model.getDbTest();

    ctx.body = ret;
}
router.get('/test-get',getTest);
// app test log url

// post /login 
// input : userId, userPw 
// return : loginMsg, userNum
const login = async (ctx) => {
    const {userId, userPw} = ctx.request.body;

    const ret = await model.login(userId, userPw);

    ctx.body = ret;
}
router.post('/login', bodyParser(), login);


// get /view-my-page 
// input : userNum 
// return : userId, userName
const viewMyPage = async (ctx) => {
    const {userNum} = ctx.request.body;

    const ret = await model.viewMyPage(userNum);

    ctx.body = ret;
}
router.post('/my-page', bodyParser(), viewMyPage);

// get /dev-list
// input : userNum 
// return : [{devNum, devName, devStatem}], lastUpdate
const devList = async (ctx) => {
    const {userNum} = ctx.request.query;
    console.log("device list" + userNum);
    const ret = await model.devList();

    console.log(ret);

    ctx.body = ret;
}
router.get('/dev-list',devList);


// post /add-device 
// input : devSerialNum, devType, devName 
// return : retMsg
const addDevice = async (ctx) => {
    const devInfo = ctx.request.body;
    const retMsg = await model.addDevice(devInfo);

    ctx.body = retMsg;
}
router.post('/add-device', bodyParser(), addDevice);

// delete /remove-device
// input : devNum
// return : delMsg
const removeDevice = async (ctx) => {
    const {devNum, userNum} = ctx.request.body;

    console.log(devNum)
    const delMsg = await model.removeDevice(devNum, userNum);

    ctx.body = delMsg;
}
router.post('/remove-device', bodyParser(),removeDevice);

// get /led-on
// input: devNum
// return: cmdMsg

const ledOn = async (ctx) => {
    const {devNum} = ctx.request.body;
    
    let iotFlag;

    try {
        iotFlag = await iotInfo("on");
    } catch (err) {
        console.error(err);
    }
    
    const ret = await model.ledOn(devNum);
    
    if(ret === 0) {
        try {
            iotFlag = await iotInfo("off");
        } catch (err) {
            console.error(err);
        }
    }

    ctx.body = ret;
}
router.post('/led-on', ledOn);

// get /led-off
// input: devNum
// return : cmdMsg
const ledOff = async (ctx) => {
    const {devNum} = ctx.request.body;
    let iotFlag;

    try {
        iotFlag = await iotInfo("off");
    } catch (err) {
        console.error(err);
    }
    
    if(iotFlag !== 1)  ctx.body = "iot_err";
    
    const ret = await model.ledOff(devNum);

    if(ret === 0) {
        try {
            iotFlag = await iotInfo("on");
        } catch (err) {
            console.error(err);
        }
    }

    ctx.body = ret;
}
router.post('/led-off', ledOff);

//TODO List
/*
    1.회원탈퇴 기능
    2.회원가입 기능
    3.회원정보 수정 기능
*/


app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(4000, () => {
    console.log("my api port: 4000");
});
