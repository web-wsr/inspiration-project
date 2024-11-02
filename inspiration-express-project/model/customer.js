const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class Customer extends Base {
    constructor(props = 'customers') {
        super(props);
    }
}

module.exports = new Customer();