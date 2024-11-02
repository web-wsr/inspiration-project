<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import roleService from '@/services/role';

const roleList = ref();
const showDialog = ref(false);
const showPermissonDialog = ref(false);
const roleFormRef = ref(null);
const permissionData = ref([]);
const currentRoleId = ref();
const permIds = ref([]);
const permTree = ref();

// 表单验证规则
const smsRules = {
  name: [{ required: true, message: '请输入展示名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入英文名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
};
// 表单数据
const roleForm = ref({
  name: null,
  slug: null,
  description: null
});
// 分页数据
const pageParams = ref({
  page: 1, //第几页
  pageSize: 5, //每页几条数据
  totalItems: 0
});

// 获取角色列表
async function getRoleList() {
  const page = pageParams.value.page;
  const pageSize = pageParams.value.pageSize;
  try {
    const { data, total } = await roleService.getRoleList({ page, pageSize });
    roleList.value = data;
    pageParams.value.totalItems = total[0].sum;
    // 针对每一行数据添加一个编辑标记
    // 添加动态属性，使其不具备响应式特点
    roleList.value.forEach((item) => {
      item.isEdit = false;
      item.editRow = {
        name: item.name,
        slug: item.slug,
        description: item.description
      };
    });
  } catch (error) {
    console.log('获取角色列表失败', error);
  }
}
getRoleList();

// 分页事件处理
function handleCurrentChange(newPage) {
  pageParams.value.page = newPage;
  getRoleList();
}

// 添加角色确认事件处理
async function handleAddRoleConfirm() {
  const name = roleForm.value.name;
  const slug = roleForm.value.slug;
  const description = roleForm.value.description;
  try {
    const res = await roleService.addRole({ name, slug, description });
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
      showDialog.value = false;
      getRoleList();
    }
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}
// 取消新增角色表单提交并重置表单
function handleAddRoleQuit() {
  roleFormRef.value.resetFields();
  showDialog.value = false;
}

// 编辑行数据
function handleEditRow(row) {
  row.isEdit = true; //改变行的编辑标记状态为true
  // 更新缓存数据
  row.editRow.slug = row.slug;
  row.editRow.name = row.name;
  row.editRow.description = row.description;
}

//编辑角色确认处理事件
async function handleEditRoleConfirm(row) {
  const id = row.id;
  if (row.editRow.slug && row.editRow.name && row.editRow.description) {
    try {
      const res = await roleService.updateRole(id, { ...row.editRow });
      if (res.code === 200) {
        ElMessage({
          message: res.message,
          type: 'success'
        });
        // 行与行之间同时编辑受影响
        row.name = row.editRow.name;
        row.slug = row.editRow.slug;
        row.description = row.editRow.description;
        row.isEdit = false;
      }
    } catch (error) {
      ElMessage({
        message: error.message,
        type: 'error'
      });
    }
  } else {
    ElMessage({
      message: '请输入完整信息',
      type: 'error'
    });
  }
}

// 删除角色确认处理事件
async function delRoleConfirm(id) {
  try {
    const res = await roleService.deleteRole(id);
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
      if (roleList.value.length === 1) pageParams.value.page--;
      getRoleList();
    }
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}

// 分配权限弹窗及提交
async function handleAssignPermissions(id) {
  const { permissionsTransformAll, permissions } = await roleService.getRolePermissions(id);
  currentRoleId.value = id;
  console.log('currentRoleId', currentRoleId.value);

  permissionData.value = permissionsTransformAll;
  permIds.value = permissions;
  showPermissonDialog.value = true;
}

// 提交分配权限确认
async function handlePermissionConfirm() {
  const id = currentRoleId.value;
  try {
    const res = await roleService.assignRolePermissions(id,{
      permissions: permTree.value.getCheckedKeys(true)
    });
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
    }
    showPermissonDialog.value = false;
  } catch (error) {
    console.log('分配权限失败', error);
  }
}
</script>

<template>
  <div class="container">
    <div class="app-container">
      <!-- 角色管理内容 -->
      <div class="role-operate">
        <el-button size="small" color="#14AF64" type="primary" @click="showDialog = true">添加角色</el-button>
        <!-- 放置table表格 -->
        <el-table style="width: 100%" :data="roleList">
          <el-table-column align="center" prop="id" label="id"></el-table-column>
          <el-table-column align="center" prop="slug" label="名称">
            <template v-slot="{ row }">
              <el-input v-if="row.isEdit" v-model="row.editRow.slug" size="small" />
              <span v-else>{{ row.slug }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="name" label="角色展示名称">
            <!-- 将行数据设置为可编辑状态 -->
            <template v-slot="{ row }">
              <el-input v-if="row.isEdit" v-model="row.editRow.name" size="small" />
              <span v-else>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="description" label="角色描述">
            <template v-slot="{ row }">
              <el-input v-if="row.isEdit" v-model="row.editRow.description" type="textarea" size="small" />
              <span v-else>{{ row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <!-- 放置操作按钮 -->
            <template v-slot="{ row }">
              <template v-if="row.isEdit">
                <!-- 编辑状态 -->
                <el-button type="primary" color="#14AF64" @click="handleEditRoleConfirm(row)">确定</el-button>
                <el-button @click="row.isEdit = false">取消</el-button>
              </template>
              <!-- 非编辑状态 -->
              <template v-else>
                <el-button type="primary" link @click="handleAssignPermissions(row.id)">分配权限</el-button>
                <el-button type="primary" link @click="handleEditRow(row)">编辑</el-button>
                <el-popconfirm width="200" title="确定删除这条内容吗？" @confirm="delRoleConfirm(row.id)">
                  <template #reference>
                    <el-button type="danger" link>删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 放置分页组件 -->
        <el-row type="flex" style="height: 60px" align="middle" justify="end">
          <el-pagination v-model:current-page="pageParams.page" :page-size="pageParams.pageSize"
            :total="pageParams.totalItems" @current-change="handleCurrentChange" layout="prev, pager, next" />
        </el-row>
      </div>
      <!-- 放置添加角色弹窗 -->
      <el-dialog v-model="showDialog" title="添加角色" width="500px" @close="handleAddRoleQuit">
        <!-- 表单内容 -->
        <el-form ref="roleFormRef" :model="roleForm" :rules="smsRules" label-width="120px">
          <el-form-item prop="slug" label="英文名称">
            <el-input type="text" style="width: 300px" size="small" v-model="roleForm.slug" />
          </el-form-item>
          <el-form-item prop="name" label="角色展示名称">
            <el-input type="text" style="width: 300px" size="small" v-model="roleForm.name" />
          </el-form-item>
          <el-form-item prop="description" label="角色描述">
            <el-input type="textarea" :rows="3" style="width: 300px" size="small" v-model="roleForm.description" />
          </el-form-item>
          <el-form-item>
            <el-row type="flex" justify="center">
              <el-col class="button-group">
                <el-button color="#14AF64" @click="handleAddRoleConfirm" type="primary" size="small">确定</el-button>
                <el-button @click="handleAddRoleQuit" size="small">取消</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!-- 放置分配权限弹窗 -->
      <el-dialog v-model="showPermissonDialog" title="分配权限" width="700px">
        <el-tree ref="permTree" node-key="tree_id" :data="permissionData" :props="{ label: 'name', children: 'children' }"
          :show-checkbox="true" default-expand-all :default-checked-keys="permIds" />
        <el-row type="flex" justify="center">
          <el-col :span="6">
            <el-button color="#14AF64" @click="handlePermissionConfirm" type="primary" size="small">确定</el-button>
            <el-button @click="showPermissonDialog = false" size="small">取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.app-container {
  width: calc(100% - 10px);
  padding: 5px;
}

.role-operate {
  padding: 10px;
  background-color: #fff;
}

.button-group {
  margin-left: 100px;
}
</style>
