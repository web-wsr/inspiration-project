<template>
  <div>
    <el-dialog v-model="showDialog" title="添加角色" width="500px">
      <!-- 表单内容 -->
      <el-form ref="roleForm" :model="roleForm" :rules="smsRules" label-width="120px">
        <el-form-item prop="slug" label="英文名称">
          <el-input type="text" style="width: 300px" size="small" v-model="roleForm.slug" />
        </el-form-item>
        <el-form-item prop="name" label="角色展示名称">
          <el-input type="text" style="width: 300px" size="small" v-model="roleForm.name" />
        </el-form-item>
        <el-form-item prop="description" label="角色描述">
          <el-input
            type="textarea"
            :rows="3"
            style="width: 300px"
            size="small"
            v-model="roleForm.description"
          />
        </el-form-item>
        <el-form-item>
          <el-row type="flex" justify="center">
            <el-col class="button-group">
              <el-button @click="handleAddRoleConfirm" type="primary" size="small">确定</el-button>
              <el-button @click="handleAddRoleQuit" size="small">取消</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import roleService from '@/services/role';

const showDialog = ref(false);
// 表单验证规则
const smsRules = {
  name: [{ require: true, message: '请输入展示名称', trigger: 'blur' }],
  slug: [{ require: true, message: '请输入英文名称', trigger: 'blur' }],
  description: [{ require: true, message: '请输入角色描述', trigger: 'blur' }]
};

// 表单数据
const roleForm = ref({
  name: null,
  slug: null,
  description: null
});
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
      // getRoleList()
    }
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error'
    });
  }
}

function handleAddRoleQuit() {
  showDialog.value = false;
}
</script>

<style lang="less" scoped></style>
