<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import userService from '@/services/user';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

// 表单验证规则
const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

const formData = ref({
  code: null,
  phone: null,
  checked: true
});

const smsText = ref({
  text: '获取验证码',
  time: 60
}); // 验证码按钮文字
const smsDisabled = ref(false); // 验证码按钮是否禁用
const router = useRouter(); // 路由

async function handleSmsCode(e) {
  console.log(e);
  const phone = formData.value.phone;
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!formData.value.phone || !phoneReg.test(formData.value.phone)) {
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
  const result = await userService.sendCode({ phone });
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
async function handleSubmit(e) {
  console.log(e);
  if (formData.value.phone && formData.value.code) {
    const phone = formData.value.phone;
    const code = formData.value.code;
    const result = await userService.login({ phone, code });
    if (result.code == 200) {
      ElMessage({
        message: '登录成功',
        type: 'success'
      });
      Cookies.set('web_token', result.data.token);
      setTimeout(() => {
        router.push({name: 'ManagerIndex'});
      }, 500);
    } else {
      ElMessage({
        message: result.data.msg,
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
</script>

<template>
  <div class="login-page">
    <div class="company-container">
      <img class="company-info-logo" src="@/assets/images/header-logo.svg" />
      <div class="company-info-desc"> 灵感图库后台管理 </div>
    </div>
    <div class="form-container">
      <div class="login-form-phone">
        <el-form :model="formData" :rules="smsRules">
          <el-form-item prop="phone">
            <el-input
              type="number"
              placeholder="请输手机号"
              v-model="formData.phone"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-col :span="14">
              <el-input
                type="text"
                placeholder="请输入验证码"
                v-model="formData.code"
                autocomplete="off"
              ></el-input>
            </el-col>
            <el-col :span="1"> </el-col>
            <el-col :span="5">
              <el-button :disabled="smsDisabled" @click="handleSmsCode"  class="sms-button">{{
                smsText.text
              }}</el-button>
            </el-col>
          </el-form-item>
          <el-form-item prop="checked">
            <el-checkbox v-model="formData.checked">自动登录</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 100%" type="primary" @click="handleSubmit">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-page {
  display: flex;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  background-position: center;
  padding-top: 160px;
  box-sizing: border-box;
}

.company-container {
  text-align: center;

  .company-info-logo {
    height: 44px;
  }

  .company-info-desc {
    margin-top: 12px;
    font-size: 14px;
    opacity: 0.5;
    text-align: center;
  }
}

.form-container {
  text-align: center;
  max-width: 388px;
  margin: 40px auto;
}
.sms-button {
  width: 120px; 
  white-space: nowrap; 
}
</style>
