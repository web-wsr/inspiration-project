var express = require('express');
var router = express.Router();

const aliyunController = require('../controllers/aliyunController')
// 发送短信
router.post('/aliyun-sms', aliyunController.send)
// 获取上传所需的临时凭证
router.post('/alioss-token', aliyunController.ossToken)
// 上传成功后的回调
router.post('/alioss-store', aliyunController.ossStore)
module.exports = router;