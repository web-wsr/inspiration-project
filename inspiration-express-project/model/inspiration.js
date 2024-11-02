const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class Inspiration extends Base {
    constructor(props = 'inspiration') {
        super(props);
    }
}

module.exports = new Inspiration();