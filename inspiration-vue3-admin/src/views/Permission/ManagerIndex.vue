<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
// import { Search } from '@element-plus/icons-vue'
import roleService from '@/services/role';
import managerService from '@/services/manager';

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const enableRoleList = ref();
const managerList = ref();
const managerFormRef = ref(null);
const pageParams = ref({
  page: 1, //第几页
  pageSize: 1, //每页几条数据
  totalItems: 0
});
const managerForm = ref({
  id: null,
  name: null,
  phone: null,
  roles: null
});
// 表单验证规则
const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'blur' }]
};


// 获取管理员列表
async function getManagerList() {
  const page = pageParams.value.page;
  const pageSize = pageParams.value.pageSize;
  try {
    const { data, total } = await managerService.getManagerList({ page, pageSize });
    managerList.value = data;
    pageParams.value.totalItems = total[0].sum;
    // 针对每一行数据添加一个编辑标记
    // 添加动态属性，使其不具备响应式特点
    // managerList.value.forEach((item) => {
    //   item.isEdit = false;
    //   item.editRow = {
    //     name: item.name,
    //     slug: item.slug,
    //     description: item.description
    //   };
    // });
  } catch (error) {
    console.log('获取管理员列表失败', error);
  }
}
getManagerList();

// 分页事件处理
function handleCurrentChange(newPage) {
  pageParams.value.page = newPage;
  getManagerList();
}

// 创建管理员弹窗及可获取角色
async function handleCreateManager() {
  const { data } = await roleService.getEnableRoleList();
  enableRoleList.value = data;
  showCreateDialog.value = true;
}
// 创建管理员确认事件处理
async function handleAddManagerConfirm() {
  const name = managerForm.value.name;
  const phone = managerForm.value.phone;
  const roles = managerForm.value.roles;
  // 转化为数组
  const roleIds = Array.from(roles).map((id) => +id);
  try {
    const res = await managerService.managerAdd({ name, phone, roleIds });
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
    }
    showCreateDialog.value = false;
    getManagerList();
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}

// 创建管理员取消事件处理
function handleAddManagerQuit() {
  managerFormRef.value.resetFields();
  managerForm.value = {
    id: null,
    name: null,
    phone: null,
    roles: null
  }
  showCreateDialog.value = false;
}

// 编辑管理员弹窗及获取对应角色
async function handleEditManager(row) {
  showEditDialog.value = true;
  // 获取该管理员的信息：id,姓名，手机号，和绑定的角色
  managerForm.value.id = row.id;
  managerForm.value.name = row.name;
  managerForm.value.phone = row.phone;
  const { data } = await roleService.getEnableRoleList();
  enableRoleList.value = data;
  const roleNames = row.roles.map((role) => role);
  const filteredRoleNames = roleNames.filter((name) =>
    enableRoleList.value.some((item) => item.name === name)
  );
  managerForm.value.roles = filteredRoleNames
    .map((name) => {
      const matchedRole = enableRoleList.value.find((item) => item.name === name);
      if (matchedRole) {
        return matchedRole.id;
      }
      return null; // 如果找不到匹配项，返回 null 或抛出错误
    })
    .filter((id) => id !== null); // 去除 null 值
}

// 编辑管理员确认事件处理
async function handleEditManagerConfirm() {
  const id = managerForm.value.id;
  const name = managerForm.value.name;
  const phone = managerForm.value.phone;
  const roles = managerForm.value.roles;
  // 转化为数组
  const roleIds = Array.from(roles).map((id) => +id);
  try {
    const res = await managerService.managerUpdate(id, { name, phone, roleIds });
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
    }
    showEditDialog.value = false;
    managerFormRef.value.resetFields();
    getManagerList();
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}
// 编辑管理员取消事件处理
function handleEditManagerQuit() {
  managerFormRef.value.resetFields();
  managerForm.value = {
    id: null,
    name: null,
    phone: null,
    roles: null
  }
  showEditDialog.value = false;
}

// 删除角色确认处理事件
async function delManagerConfirm(id) {
  try {
    const res = await managerService.managerDelete(id);
    if (res.code === 200) {
      ElMessage({
        message: res.message,
        type: 'success'
      });
      if (managerList.value.length === 1) pageParams.value.page--;
      getManagerList();
    }
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}
</script>

<template>
  <div class="container">
    <div class="app-container">
      <!-- <div class="left">
                <el-input style="margin-bottom: 10px;" type="text" placeholder="请输入搜索角色" :prefix-icon="Search"></el-input>
            </div> -->
      <div class="right">
        <el-row class="opeate-tool" type="flex" justify="end">
          <el-button color="#14AF64" size="small" type="primary" @click="handleCreateManager">创建管理员</el-button>
        </el-row>
      </div>
    </div>
    <el-table style="width: 100%" :data="managerList">
      <el-table-column align="center" prop="id" label="id"></el-table-column>
      <el-table-column align="center" prop="name" label="姓名"></el-table-column>
      <el-table-column align="center" prop="phone" label="手机号"></el-table-column>
      <el-table-column align="center" label="角色">
        <template #default="{ row }">
          <div style="display: inline-block" v-for="(role, index) in row.roles" :key="index">
            <el-tag color="#E5FFFB" size="small">{{ role }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <!-- 放置操作按钮 -->
        <template v-slot="{ row }">
          <el-button type="success" link @click="handleEditManager(row)">编辑</el-button>
          <!-- <el-button type="danger" link @click="handleDeleteManager(row)">删除</el-button> -->
          <el-popconfirm width="200" title="确定删除这条内容吗？" @confirm="delManagerConfirm(row.id)">
            <template #reference>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-row type="flex" justify="end" align="middle" style="height: 60px">
      <el-pagination background v-model:current-page="pageParams.page" :page-size="pageParams.pageSize"
        layout="total,prev, pager, next" :total="pageParams.totalItems" @current-change="handleCurrentChange" />
    </el-row>
    <!-- 放置弹窗（创建管理员） -->
    <el-dialog v-model="showCreateDialog" title="创建管理员" width="500px" @close="handleAddManagerQuit">
      <!-- 表单内容 -->
      <el-form ref="managerFormRef" :model="managerForm" :rules="smsRules" label-width="120px">
        <el-form-item prop="name" label="姓名">
          <el-input type="text" style="width: 300px" size="small" v-model="managerForm.name" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input type="text" style="width: 300px" size="small" v-model="managerForm.phone" />
        </el-form-item>
        <el-form-item prop="roles" label="角色">
          <el-select v-model="managerForm.roles" multiple placeholder="请选择角色" style="width: 300px">
            <el-option v-for="item in enableRoleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col class="button-group">
              <el-button color="#14AF64" type="primary" size="small" @click="handleAddManagerConfirm">确定</el-button>
              <el-button color="#14AF64" size="small" @click="handleAddManagerQuit">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 放置弹窗（编辑管理员） -->
    <el-dialog v-model="showEditDialog" title="编辑管理员" width="500px" @close="handleEditManagerQuit">
      <!-- 表单内容 -->
      <el-form ref="managerFormRef" :model="managerForm" :rules="smsRules" label-width="120px">
        <el-form-item prop="name" label="姓名">
          <el-input type="text" style="width: 300px" size="small" v-model="managerForm.name" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input type="text" style="width: 300px" size="small" v-model="managerForm.phone" />
        </el-form-item>
        <el-form-item prop="roles" label="角色">
          <el-select v-model="managerForm.roles" multiple placeholder="请选择角色" style="width: 300px">
            <el-option v-for="item in enableRoleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col class="button-group">
              <el-button color="#14AF64" type="primary" size="small" @click="handleEditManagerConfirm">确定</el-button>
              <el-button color="#14AF64" size="small" @click="handleEditManagerQuit">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: calc(100% - 10px);
  padding: 5px;
  background-color: #fff;

  .app-container {
    display: flex;

    .left {
      width: 280px;
      padding: 20px;
    }

    .right {
      flex: 1;
      padding: 20px;

      .opeate-tool {
        margin: 5px;
      }
    }
  }
}
</style>
