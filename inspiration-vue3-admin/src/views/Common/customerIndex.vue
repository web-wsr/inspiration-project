<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import clueService from '@/services/clue';
const formData = ref({
  name: null,
  phone: null
});
// 表单验证规则
const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

async function handleSubmit() {
  if (formData.value.name && formData.value.phone) {
    const res = await clueService.assignClue({ ...formData.value });
    if (res.code === 200) {
      ElMessage.success('预约成功');
    } else {
      ElMessage.error(res.message);
    }
  } else {
    ElMessage.error('请输入姓名和手机号');
  }
}
</script>

<template>
  <div class="wrapper">
    <div class="content-section">
      <img src="../../assets/images/mercedes-benz-logo-desktop.png" alt="" />
    </div>
    <h1 class="content-title">预约试驾</h1>
    <div class="form-section">
      <div class="form-container">
        <el-form :model="formData" :rules="smsRules">
          <el-form-item prop="name">
            <el-input
              style="width: 50%"
              type="text"
              placeholder="请输入姓名"
              v-model="formData.name"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              style="width: 50%"
              type="number"
              placeholder="请输手机号"
              v-model="formData.phone"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 50%" type="info" @click="handleSubmit">马上抢占名额</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="content-footer">Copyright © 2019 极客学院体验技术部出品</div>
  </div>
</template>

<style lang="less" scoped>
body {
  font:
    14px 'Lucida Grande',
    Helvetica,
    Arial,
    sans-serif;
}

.wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-section {
  padding: 10px;
  text-align: left;
  background-color: #000000;
}

.content-title {
  text-align: center;
  font-size: 30px;
  font-weight: 500;
  margin-top: 10px;
}

.form-section {
  flex: 1;
  padding: 80px 80px 0;
  background: url(../../assets/images/testdrivebg.jpg) no-repeat;
  background-position: right center;
  background-size: 609px 470px;
}

.form-container {
  margin-left: 20vw;
}

.form-title {
  text-align: left;
  font-size: 16px;
  padding-bottom: 20px;
}

.form-item {
  width: 400px;
  margin-top: 20px;
}

.form-input {
  display: block;
  width: 100%;
  height: 40px;
  line-height: 40px;
  border: none;
  outline: 0;
  padding: 10px;
  border-bottom: 2px solid #e4e4e4;
  font-size: 14px;
  background-color: transparent;
}

.form-button {
  display: block;
  width: 100%;
  height: 40px;
  text-align: center;
  outline: 0;
  border: none;
  font-size: 16px;
  color: #fff;
  background-color: black;
}

.content-footer {
  padding: 10px;
  text-align: center;
  font-size: 12px;
  color: #999;
  background-color: #000000;
}
</style>
