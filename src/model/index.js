const db = require("../db");
const v4 = require('uuid4');
const self = {};

// get요청 테스트
self.getDbTest = async () => {
    const Account = db("user_table");
    const ret = await Account;

    console.log(ret);
    return ret;

}

// 로그인 모듈
self.login = async (userId, userPw) => {
    const Account = db("user_table");
    let ret = {
        msg: "success",
        userNum: "",
        userName: "",
        userId: ""
    }

    const userInfo = await Account.select("user_num","user_id", "user_pw","user_name").where({
        "user_id": userId,
        "user_pw": userPw
    });
    
    if(userInfo[0] === undefined)
        ret.msg = "login_err";
    else {
        if(userId == userInfo[0].user_id && userPw == userInfo[0].user_pw){
            ret.userNum = userInfo[0].user_num;
            ret.userName = userInfo[0].user_name;
            ret.userId = userInfo[0].user_id;
        }
    }

    return ret;
}

//기기 등록 모듈
self.addDevice = async (devInfo) => {
    const dev = db("device_table");
    const Account = db("user_table");
    const date = new Date();

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const today = date.getFullYear() + '-' + month + '-' + day + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    const uuid = v4();
    let ret = {
        devNum: "",
        devName: "",
        msg: "code1"
    };
    const devCheck = await dev.select("serial_num").where({
        serial_num: devInfo.devSerialNum
    })

    if(devCheck[0] === undefined){
        await dev.insert({
            dev_num: uuid,
            dev_type: devInfo.devType,
            dev_name: devInfo.devName,
            serial_num: devInfo.devSerialNum,
            dev_status: "off"
        }).then(e => {
            ret.devNum = uuid;
            ret.devName = devInfo.devName;
            ret.msg = "success";
        })
        .catch(e => {
            ret.msg = "err";
        })

        await Account.update({
            last_update: today
        }).where({
            user_num: devInfo.userNum
        })
    }

    return ret;
}

// 기기 리스트 요청 모듈
self.devList = async () => {
    const dev = db("device_table");
    const date = db("user_table");
    const ret = {
        // devArr: [],
        devNum: "",
        devName: "",
        devStatus: "",
        lastUpdate: ""
    }

    const retDev = await dev.select("dev_num", "dev_type", "dev_name", "dev_status");
    const retDate = await date.select("last_update");
    
    // for(let i = 0; i < retDev.length; i++) ret.devArr[i] = retDev[i];

    ret.devName = retDev[0].dev_name;
    ret.devNum = retDev[0].dev_num;
    ret.devStatus = retDev[0].dev_status
    ret.lastUpdate = retDate[0].last_update;

    return ret;

}

//기기 삭제 모듈
self.removeDevice = async (devNum, userNum) => {
    const dev = db("device_table");
    const Account = db("user_table");
    const date = new Date();

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const today = date.getFullYear() + '-' + month + '-' + day + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    let ret = "del_fail";

    console.log(devNum);
    const flag = await dev.where({
        dev_num: devNum
    }).del();

    if(flag == 1 ) 
    {
        ret = "del_done";

        await Account.update({
            last_update: today
        }).where({
            user_num: userNum
        })
    }

    return ret;
}

//유저 자료 요청 모듈
self.viewMyPage = async (userNum) =>{
    const Account = db('user_table');
    let ret= {
        userId: "",
        userName: "",
        msg: "done",
    };
    const flag = await Account.select("user_id", "user_name").where({
        user_num: userNum
    });
    
    console.log(flag);
    if(flag[0] === undefined) ret.msg = "err_01";
    else {
        ret.userId = flag[0].user_id;
        ret.userName = flag[0].user_name;
    }

    return ret;
}

// LED 켜기
self.ledOn = async (devNum) => {
    const dev = db("device_table");

    let ret = await dev.select("dev_status").where({
        dev_num: devNum
    }).update({
        dev_status: "on"
    });

    return ret;
}

// LED 끄기
self.ledOff = async (devNum) => {
    const dev = db("device_table");

    let ret = await dev.select("dev_status").where({
        dev_num: devNum
    }).update({
        dev_status: "off"
    });

    return ret;
}

module.exports = self;