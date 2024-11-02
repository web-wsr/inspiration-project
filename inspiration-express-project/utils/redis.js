const { createClient } = require('redis');

// async function init() {
//     const client = await createClient()
//         .on('error', err => console.log('Redis Client Error', err))
//         .connect();
//     console.log('连上了');
//     client.set('code', '666');

// }
/**
 * 存储数据到redis
 * @param {*} mobile 
 * @param {*} code 
 */
async function saveCode(mobile, code) {
    const client = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();
    client.set(mobile, code, {
        EX: 3000 // 过期时间 300s
    });
}

/**
 * 从redis中获取数据
 * @param {*} mobile 
 * @param {*} code 
 */
async function getCode(mobile) {
    const client = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();
    const code = await client.get(mobile);
    return code;
}


module.exports = {
    saveCode,
    getCode
}



