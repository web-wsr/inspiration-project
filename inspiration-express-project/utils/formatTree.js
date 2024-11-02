const formatTree = (data, parentId = null) => {
    return data
        .filter(item => item.parent_id === parentId) // 筛选出父级为parentId的数据
        .map(item => {
            return {
                ...item,
                children: formatTree(data, item.id) // 递归调用，获取子级数据
            };
        });
}

module.exports = formatTree