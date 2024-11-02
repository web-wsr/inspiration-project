<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus'
import { useStore } from '@/stores/index.js'
import customerService from '@/services/customer.js'
const store = useStore()
const userInfo = computed(() => store.userInfo)
const dialogVisible = ref(false)
// 表单验证规则
const myRules = {
  // phone: [
  //   { required: true, message: '请输入手机号', trigger: 'blur' },
  //   { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  // ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  introduction: [
    { max: 100, message: '个人介绍最多100个字', trigger: 'blur' },
    { pattern: /^\s*[\S]+.*$/, message: '个人介绍不能为空白字符', trigger: 'blur' }
  ]
};
const formData = ref({
  id: userInfo.value.id,
  nickName: userInfo.value.name,
  introduction: userInfo.value.introduction
});
async function handleSubmit() {
  try {
    if (formData.value.nickName) {
      const id = userInfo.value.id
      const name = formData.value.nickName
      const introduction = formData.value.introduction
      const result = await customerService.updateUserInfo(id, { name, introduction })
      if (result.code === 200) {
        window.location.reload()
        ElMessage.success('修改成功')
      }
    } else {
      ElMessage.warning('请输入昵称')
    }
  } catch (error) {
    console.log(error);
  }
}

// 更改手机号
const editPhoneData = ref({
  id: userInfo.value.id,
  code: null,
  phone: null,
})
console.log(editPhoneData);

const smsText = ref({
  text: '获取验证码',
  time: 60
}); // 验证码按钮文字
const smsDisabled = ref(false); // 验证码按钮是否禁用

function handleEditPhone() {
  dialogVisible.value = true
}
async function handleSmsCode(e) {
  console.log(e);
  const phone = editPhoneData.value.phone;
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!editPhoneData.value.phone || !phoneReg.test(editPhoneData.value.phone)) {
    return ElMessage({
      message: '请输入正确的手机号',
      type: 'warning'
    });
  }
  let timer = setInterval(() => {
    if (smsText.value.time <= 0) {
      clearInterval(timer);
      smsText.value.time = 60;
      smsDisabled.value = false;
      smsText.value.text = '获取验证码';
    } else {
      smsText.value.time -= 1;
      smsDisabled.value = true;
      smsText.value.text = `重新获取(${smsText.value.time}s)`;
    }
  }, 1000);
  const result = await customerService.sendCode({ phone });
  if (result.code == 200) {
    ElMessage({
      message: result.message,
      type: 'success'
    });
  } else {
    ElMessage({
      message: result.message,
      type: 'error'
    });
  }
}

async function handleEditPhoneSubmit() {
  if (formData.value.phone && formData.value.code) {
    const id = editPhoneData.value.id
    const phone = editPhoneData.value.phone;
    const code = editPhoneData.value.code;
    // 更改手机号的api
    const result = await customerService.updateUserPhone(id, { phone, code });
    if (result.code === 200) {
      editPhoneData.value.phone = null;
      editPhoneData.value.code = null;
      ElMessage({
        message: result.message,
        type: 'success'
      });
    } else {
      ElMessage({
        message: result.message,
        type: 'error'
      });
    }
  } else {
    ElMessage({
      message: '请输入正确的手机号和验证码',
      type: 'warning'
    });
  }
}
function handleEditPhoneQuit() {
  editPhoneData.value.phone = null;
  editPhoneData.value.code = null;
}
</script>

<template>
  <div class="my-page">
    <div class="form-container">
      <div class="my-form">
        <div class="userInfo-avatar-consainer">
          <img class="userInfo-avatar" :src="userInfo.avatar_url" />
        </div>
        <el-form :model="formData" :rules="myRules">
          <el-col :span="9">昵称</el-col>
          <el-form-item prop="nickName">
            <el-input type="text" placeholder="请输入昵称" v-model="formData.nickName" autocomplete="off"></el-input>
          </el-form-item>
          <el-col :span="10">手机号码</el-col>
          <el-form-item>
            <el-col :span="16">
              <el-input type="number" autocomplete="off" v-model="userInfo.phone" disabled></el-input>
            </el-col>
            <el-col :span="3"></el-col>
            <el-col :span="5">
              <el-button @click="handleEditPhone" type="primary" class="editPhone-button">更改手机号码</el-button>
            </el-col>
          </el-form-item>
          <el-col :span="10">个人介绍</el-col>
          <el-form-item prop="introduction">
            <el-input type="textarea" :rows="5" placeholder="请输入个人介绍" v-model="formData.introduction" autocomplete="off"
              maxlength="100" show-word-limit></el-input>
          </el-form-item>
          <el-form-item>
            <el-col :span="18"></el-col>
            <el-button type="primary" @click="handleSubmit" style="width:130px">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 更改手机号码弹窗 -->
      <el-dialog v-model="dialogVisible" width="600px" align-center @close="handleEditPhoneQuit">
        <div class="dialog-header">
          <img class="company-info-logo" src="@/assets/images/icons/header-logo.svg" />
        </div>
        <div class="dialog-form">
          <el-form :model="formData" style="width: 400px;">
            <el-col :span="5">旧手机号码</el-col>
            <el-form-item>
              <el-input type="number" v-model="userInfo.phone" disabled></el-input>
            </el-form-item>
            <el-col :span="5">新手机号码</el-col>
            <el-form-item prop="phone">
              <el-input type="number" placeholder="请输手机号" v-model="editPhoneData.phone" autocomplete="off"></el-input>
            </el-form-item>
            <el-col :span="3">验证码</el-col>
            <el-form-item prop="code">
              <el-col :span="14">
                <el-input type="text" placeholder="请输入验证码" v-model="editPhoneData.code" autocomplete="off"></el-input>
              </el-col>
              <el-col :span="4"></el-col>
              <el-col :span="5">
                <el-button :disabled="smsDisabled" @click="handleSmsCode" class="sms-button">获取验证码</el-button>
              </el-col>
            </el-form-item>
          </el-form>
        </div>
        <div class="dialog-footer">
          <el-button style="width: 400px" type="info" @click="handleEditPhoneSubmit">确认</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.my-page {
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  background: #f0f2f5;
  background-position: center;
  padding-top: 100px;
  box-sizing: border-box;
}

.form-container {
  text-align: center;
  max-width: 520px;
  margin: 40px auto;

  .my-form {
    width: 520px;
    text-align: left
  }

  .el-form-item {
    margin-top: 15px;
  }
}

.editPhone-button {
  width: 110px;
  white-space: nowrap;
}

.userInfo-avatar-consainer {
  text-align: center;
}

.userInfo-avatar {
  display: inline-block;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  background-color: #ccc;
  border-radius: 50%;
  outline: none;
  margin: 0 10px;
  // background-image: url(@/assets/images/icons/user-default.jpg);
  // background-size: cover;
  // background-position: center; 
}

.dialog-form {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.sms-button {
  width: 100px;
  white-space: nowrap;
}

.dialog-footer {
  padding-bottom: 20px;
}
</style>