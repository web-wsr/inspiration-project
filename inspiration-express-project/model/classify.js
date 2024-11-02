const Base = require('./base.js');
// 定义用户，继承基础模型的方法
class Category extends Base {
    constructor(props = 'classify') {
        super(props);
    }
}

module.exports = new Category();