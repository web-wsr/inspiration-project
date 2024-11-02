const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class User extends Base {
    constructor(props = 'users') {
        super(props);
    }
}

module.exports = new User();