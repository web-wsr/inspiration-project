const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class InspirationCollection extends Base {
    constructor(props = 'inspiration_collection') {
        super(props);
    }
}

module.exports = new InspirationCollection();