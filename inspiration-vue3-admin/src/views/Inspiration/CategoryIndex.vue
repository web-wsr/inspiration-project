<script setup>
import { ref, onMounted } from 'vue';
import { ElTree, ElButton, ElMessage } from 'element-plus';
import inspirationService from '@/services/inspiration';
import { getTreeParentName } from '@/utils/getTreeParentName';
const treeData = ref([]);
const fetchData = async () => {
  // 这 API 接口来获取数据
  const res = await inspirationService.getCategoryList();
  treeData.value = res.data
  
};

onMounted(() => {
  fetchData();
});

// 字典用于决定层级标签
const tagType = (level) => {
  const levelToType = {
    0: 'primary',
    1: 'success',
    2: 'warning',
  };
  return levelToType[level] || 'info';
}
// 细分类目
const categoryTree = ref();
// 定义并初始化 defaultExpandKeys
const defaultExpandKeys = ref([]);
const formRef = ref();
const dialogVisible = ref(false);
const formTitle = ref();
// 表单提交类型： 新增分类 编辑分类 增加一级分类
const formType = ref();
const formData = ref({
  id: null,
  name: '',
  description: '',
  parent_id: null,
  level_id: null
});
const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' }
  ]
};
const handleCreatFirstNode = (e) =>{
  console.log('一级分类-----',e);
  formTitle.value = '新增一级类目';
  formData.value = {
    id: null,
    name: '',
    description: '',
    parent_id: null,
    level_id: 0
  };
  formType.value = 0;
  dialogVisible.value = true;
  defaultExpandKeys.value = []
};
// 新增节点事件处理
const handleCreateNode= (node, data) => {
  console.log('插入----',data.id);
  // 获取细分类目
  const ancestorNames = getTreeParentName(node);
  const fullName = ancestorNames ? `${ancestorNames}-${data.name}` : data.name;
  categoryTree.value = fullName
  formTitle.value = '新增子类目';
  formData.value = {
    id: null,
    name: '',
    description: '',
    parent_id: data.id,
    level_id: data.level_id + 1
  };
  formType.value = 1;

  dialogVisible.value = true;
};
//  编辑节点事件处理
const handleEditNode = (node,data) => {
  // 这里可以弹出一个对话框来编辑节点名称
  console.log('编辑节点:', data.id);
  console.log('编辑节点:', node);
  const ancestorNames = getTreeParentName(node);
  const fullName = ancestorNames ? `${ancestorNames}-${data.name}` : data.name;
  categoryTree.value = fullName
  formTitle.value = '编辑类目';
  formType.value = 2;
  formData.value.id = data.id;
  formData.value.name = data.name;
  formData.value.description = data.description;
  dialogVisible.value = true;
  
  
};
// 弹窗确认事件处理
const handleConfirm = async () => {
    const newChild = {
      name: formData.value.name,
      description: formData.value.description,
      parent_id: formData.value.parent_id,
      level_id: formData.value.level_id
    };
    const id = formData.value.id;
    // 请求封装函数
    const newNode = await handleServer(id, formType.value, newChild)
    if(newNode.code === 200){
      ElMessage({
        message: newNode.message,
        type: 'success'
      });
      fetchData();
    }
    dialogVisible.value = false;
    
    formRef.value.resetFields();
    console.log('Node added:', newNode);
};
// APi封装函数
const handleServer = (id, type, data) => {
  if(type === 1){
    return inspirationService.categoryAdd(data)
  }else if(type === 2){
    return inspirationService.categoryUpdate(id, data)
  }else{
    return inspirationService.categoryAdd(data)
  }
}

// 提交表单取消事件处理
const handleQuit = () => {
  dialogVisible.value = false;
  formRef.value.resetFields();
  formData.value = {
    name: '',
    description: ''
  }
  setTimeout(() => {
    categoryTree.value = ''
  }, 200)
  
}

// 节点删除事件
const handleDeleteNode = async (node,data) => {
  console.log('删除节点---data', data);
  console.log('删除节点---node', node);
  const res = await inspirationService.categoryDelete(data.id);
  if(res.code === 200){
    ElMessage({
      message: res.message,
      type: 'success'
    });
    fetchData();
  }
}
// 记录节点事件 用于定位当前节点
const handleNodeClick = (node, data) => {
  console.log('点击节点---data', data);
  defaultExpandKeys.value = []
  defaultExpandKeys.value.push(node.id)  //记录当前点击节点，并push给默认展开的节点的 key 的数组
}

</script>

<template>
<div class="container">
    <div class="app-container">
        <div class="category-header">
            <el-button  color="#14AF64" type="primary" @click="handleCreatFirstNode">新增一级导航类目</el-button>
        </div>
        <div class="category-tree">
          <el-tree
            :data="treeData"
            node-key="id"
            @node-click="handleNodeClick"
            :default-expanded-keys="defaultExpandKeys"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <!-- 使用字典来决定标签的类型 -->
                <el-tag :type="tagType(data.level_id)">
                  {{ data.name }}
                </el-tag>
                
                <span class="node-buttons">
                  <!-- 需要冒泡 -->
                  <el-button type="primary" link  @click="handleCreateNode(node, data)">添加</el-button>
                  <el-button type="success" link @click="handleEditNode(node,data)">编辑</el-button>
                  <el-button type="danger" link @click="handleDeleteNode(node, data)">删除</el-button>
                </span>
              </span>
            </template>
          </el-tree>
          <!-- 表单模态框 -->
          <el-dialog v-model="dialogVisible" :title="formTitle" @close="handleQuit">
            <div class="dialog-header" v-if="categoryTree">
              <span>当前类目：{{ categoryTree}}</span>
            </div>
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
              <el-form-item label="名称" prop="name">
                <el-input v-model="formData.name"></el-input>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input v-model="formData.description"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="handleQuit">取消</el-button>
                <el-button type="primary" @click="handleConfirm">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </div> 
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: calc(100% - 10px);
  padding: 5px;
  background-color: #fff;

  .app-container {
    display: flex;
    flex-direction: column;
  }
  .category-header{
    padding: 10px;
  }
 .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .node-buttons {
    display: inline-flex;
    gap: 4px;
  } 
  .dialog-header{
    padding-bottom: 10px
  }
  }
</style>

