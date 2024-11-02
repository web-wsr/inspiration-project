const Core = require('@alicloud/pop-core');

const aliyun = {
    sms: function ({ PhoneNumbers, SignName, TemplateCode, TemplateParam }) {
        const client = new Core({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });

        const params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": PhoneNumbers,
            "SignName": SignName,
            "TemplateCode": TemplateCode,
            "TemplateParam": TemplateParam
        }

        const requestOption = {
            method: 'POST'
        };

        // return client.request('SendSms', params, requestOption);
        return new Promise((resolve, reject) => {
            client.request('SendSms', params, requestOption)
                .then((result) => {
                    resolve({ status: 1, data: result })
                })
                .catch((ex) => {
                    resolve({ status: 0, data: ex.data })
                })
        })
    }
}

module.exports = aliyun;