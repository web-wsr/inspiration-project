const Customer = require('../../model/customer');


const userInfoController = {
    index: async function (req, res, next) {
        try {
            if (res.locals.isLogin) {
                const userId = res.locals.userInfo.id;
                const userName = res.locals.userInfo.name;
                const userPhone = res.locals.userInfo.phone;
                const userInfoData = { id: userId, name: userName, phone: userPhone };
                res.json(userInfoData);
            }
        } catch (error) {
            res.json({ error_code: 0, error_message: e.message })
        }
    },
    webUserInfo: async function (req, res, next) {
        if (res.locals.isLogin) {
            const userId = res.locals.userInfo.id;
            const userInfoData = await Customer.select({ id: userId })
            const userInfo = userInfoData[0]
            const data = {
                id: userInfo.id,
                name: userInfo.nickname,
                phone: userInfo.phone,
                avatar_url: userInfo.avatar_url,
                introduction: userInfo.introduction
            }
            res.json(data)
        }
    }
}

module.exports = userInfoController;