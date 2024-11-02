const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class Collection extends Base {
    constructor(props = 'collection') {
        super(props);
    }
}

module.exports = new Collection();