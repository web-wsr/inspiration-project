const aliyunModel = require('./../model/aliyun');
const randCode = require('./../utils/randCode');
const { saveCode } = require('../utils/redis');
const { STS } = require('ali-oss');
const OSS = require('ali-oss');

const ALIYUN_OSS_ACCESSKEY_ID = process.env.ALIYUN_OSS_ACCESSKEY_ID;
const ALIYUN_OSS_ACCESSKEY_SECRET = process.env.ALIYUN_OSS_ACCESSKEY_SECRET;
const ALIYUN_OSS_BUCKET_PUBLIC = process.env.ALIYUN_OSS_BUCKET_PUBLIC;
const ALIYUN_OSS_REGION_ID = process.env.ALIYUN_OSS_REGION_ID;
const ALIYUN_OSS_ROLE_ARN = process.env.ALIYUN_OSS_ROLE_ARN;
const ALIYUN_OSS_ROLE_SESSION_NAME = process.env.ALIYUN_OSS_ROLE_SESSION_NAME;

// 创建 STS 客户端
const client = new STS({
    accessKeyId: ALIYUN_OSS_ACCESSKEY_ID,
    accessKeySecret: ALIYUN_OSS_ACCESSKEY_SECRET,
    bucket: ALIYUN_OSS_BUCKET_PUBLIC,
    region: ALIYUN_OSS_REGION_ID
});

const aliyunController = {
    send: async function (req, res, next) {
        try {
            const sendPhone = req.body.phone;

            if (!sendPhone) {
                res.json({ code: 0, message: '缺少参数' });
                return
            }
            const code = randCode(1000, 9999)
            const TemplateParam = "{\"code\":\"" + code + "\"}" // 模板参数

            const smsResult = await aliyunModel
                .sms({
                    PhoneNumbers: sendPhone,
                    SignName: '阿里云短信测试',
                    TemplateCode: 'SMS_154950909',
                    TemplateParam
                });
            console.log('smsResult', smsResult.data);
            await saveCode(sendPhone, code)
            if (smsResult.status === 1) {
                res.json({ code: 200, message: '短信发送成功', data: smsResult.data });
            } else {
                res.json({ code: 0, message: '短信发送失败', data: smsResult.data });
            }
        } catch (e) {
            res.json({ code: 0, message: '服务器错误' });
        }
    },
    ossToken: async function (req, res, next) {
        try {
            const { file_name, bucket, space, folder } = req.body;
            console.log('file_name', file_name);

            // 这里假设你有一个后端服务来生成临时凭证
            // 你可以根据实际需求生成临时凭证
            const sts = await client.assumeRole(ALIYUN_OSS_ROLE_ARN, ``, '3000', ALIYUN_OSS_ROLE_SESSION_NAME);
            console.log(sts);

            const key = `${space}/${folder}/${file_name}`;
            res.json({
                code: 200,
                data: {
                    region: ALIYUN_OSS_REGION_ID,
                    accessKeyId: sts.credentials.AccessKeyId,
                    accessKeySecret: sts.credentials.AccessKeySecret,
                    stsToken: sts.credentials.SecurityToken,
                    bucket: bucket || ALIYUN_OSS_BUCKET_PUBLIC,
                    key
                }
            })
        } catch (err) {
            console.error('Error getting OSS token:', err)
            res.json({ code: 0, message: '获取OSS临时凭证失败' })
        }
    },
    ossStore: async function (req, res, next) {
        try {
            const { file_name, path, bucket, title, image_width, image_height } = req.body;
            // 记录日志
            console.log('File uploaded successfully:', { file_name, path, bucket, title, image_width, image_height });

            // 更新数据库（示例）
            // const result = await updateDatabase(file_name, path, bucket, title);

            // 生成文件的 URL
            const fileUrl = `https://${bucket}.${ALIYUN_OSS_REGION_ID}.aliyuncs.com/${path}`;
            // 返回成功响应
            res.json({
                code: 200,
                message: '文件上传成功',
                data: {
                    file_name,
                    path,
                    bucket,
                    title,
                    url: fileUrl,
                    image_width: image_width.value,
                    image_height: image_height.value
                }
            })
        } catch (err) {
            console.error('Error in store callback:', err);
            res.json({ code: 0, message: '文件上传失败' });
        }
    },

}

module.exports = aliyunController;