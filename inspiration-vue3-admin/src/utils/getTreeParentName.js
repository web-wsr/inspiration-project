export function getTreeParentName(node) {
    if (!node.parent) {
        return '';
    }
    const parentData = node.parent.data;
    const parentName = parentData.name;
    const ancestorNames = getTreeParentName(node.parent);
    return ancestorNames ? `${ancestorNames}-${parentName}` : parentName;
}