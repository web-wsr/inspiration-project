<script setup>
import { RouterView } from 'vue-router';
import BasicLayoutHeader from './BasicLayoutHeader.vue';
import BasicLayoutFooter from './BasicLayoutFooter.vue';
</script>


<template>
    <div class="page-basic-layout">
        <BasicLayoutHeader class="page-basic-header" />
        <RouterView class="page-basic-body" />
        <BasicLayoutFooter class="page-basic-footer" />
    </div>
</template>



<style lang="less" scoped>
.page-basic-layout {
    height: 100vh;
    min-width: 1080px;
    display: flex;
    flex-direction: column;
}

.page-basic-body {
    padding-top: 60px;
    flex: 1;
    background-color: #f8fafc;
}
</style>