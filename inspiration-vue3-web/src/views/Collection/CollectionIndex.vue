<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import collectionService from '@/services/collection';
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const collectionList = ref([])
async function getCollectionList() {
  const res = await collectionService.collectionList()
  if(res.code === 200){
    collectionList.value = res.data.collectionList
    loading.value = false
  }
  console.log(res)
}
onMounted(() => {
  getCollectionList()
})
// mask蒙层显示和隐藏
const showActions = (item) => {
  item.showActions = true;
};

const hideActions = (item) => {
  item.showActions = false;
};

const dialogVisible = ref(false);
const handleCollectionType = ref();
const collectionId = ref()
const formTitle = ref();
const formRef = ref();
const formData = ref({
  collection_name: '',
  description: ''
})

// 表单验证规则
const formRules = {
  collection_name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    {max: 10, message: '名称最多10个字', trigger: 'blur' },
    { pattern: /^\s*[\S]+.*$/, message: '名称不能为空白字符', trigger: 'blur' }
  ],
  description: [
    { max: 100, message: '描述最多80个字', trigger: 'blur' },
    { pattern: /^\s*[\S]+.*$/, message: '描述不能为空白字符', trigger: 'blur' }
  ]
};
async function handleCreateCollection(e){
    formTitle.value = '创建收藏夹';
    handleCollectionType.value = 1
    dialogVisible.value = true
    
    console.log(e);
    
}
async function handleEditCollection(item){
    console.log(item);
    collectionId.value = item.id
    formData.value.collection_name = item.collection_name
    formData.value.description = item.description
    formTitle.value = '编辑收藏夹';
    handleCollectionType.value = 2
    dialogVisible.value = true
    
     
}
const handleConfirm = async () => {
    if(formData.value.collection_name){
        let type = handleCollectionType.value
        let id = collectionId.value
        let data = formData.value
        const res = await handleCollectionService(id, type, data)
        if(res.code === 200){
            console.log('res1111',res);
            dialogVisible.value = false
            ElMessage({
              message: res.message,
              type: 'success'
            });
            getCollectionList()
        }
    }else{
        ElMessage.warning('请输入收藏夹名称')
    }
}
const handleQuit = () => {
    dialogVisible.value = false;
    formData.value = {
      collection_name: '',
      description: ''
    }
}
// 删除收藏夹
const handleDeleteCollection = async (item) => {
   //console.log(item);
   const res = await collectionService.deleteCollection(item.id)
   if(res.code === 200){
        dialogVisible.value = false
        ElMessage({
            message: res.message,
            type: 'success'
        });
        getCollectionList()
   }
} 
// 跳转收藏夹详情
 const handleDetailCollection = (item) => {
    router.push({ name: 'CollectionDetail', params: { id: item.id }})
}
// 封装api
const handleCollectionService = (id = null, type, data) =>{
    if(type === 1){
        return collectionService.addCollection(data)
    }else{
        return collectionService.updateCollection(id, data)
    }
}


</script>

<template>
    <div class="collection-page" v-loading="loading">
        <div class="collection-title">
            <span class="collection-title-name">我的收藏</span>
            <div class="collection-create">
                <el-button class="collection-title-plus" type="info" circle :icon="Plus"  @click="handleCreateCollection" >
                    <button class="create-btn">
                    <span class="create-btn-txt">创建收藏夹</span>
                    </button>
                </el-button>
            </div>
        </div>
        <div class="collection-list" v-if="collectionList.length">
            <div class="collection-item" v-for=" item in collectionList " :key="item.id">
                <div class="collection-card" @click="handleDetailCollection(item)"  @mouseover="showActions(item)" @mouseleave="hideActions(item)">
                    <div class="collection-card-left">
                        <img class="collection-card-img" :src="item.inspirations[0]?.img_url" alt="" v-if="item.inspirations[0]"/>
                    </div>
                    <div class="collect-card-right">
                        <img class="collection-card-img-right" :src="item.inspirations[1]?.img_url" alt="" v-if="item.inspirations[1]"/>
                        <img class="collection-card-img-right" :src="item.inspirations[2]?.img_url" alt="" v-if="item.inspirations[2]"/>
                    </div>
                    <div class="collect-shade" v-if="item.showActions">
                        <div class="collect-shade-content">
                            <el-button class="collection-edit" circle :icon="Edit" @click.stop="handleEditCollection(item)"></el-button>
                         </div>
                    </div>
                </div>
                <div class="collection-info">
                    <h2 class="collection-info-class">{{ item.collection_name }}</h2>
                    <span class="collection-info-num">{{item.inspirations.length}}张</span>
                </div>
                <!-- 表单模态框 -->
                <el-dialog class="collection-dialog" v-model="dialogVisible" :title="formTitle" width="600px" center @close="handleQuit">
                    <el-form ref="formRef" :model="formData" :rules="formRules">
                        <el-col :span="5" style="margin-bottom: 5px;">昵称</el-col>
                        <el-form-item prop="collection_name">
                            <el-input type="text" 
                            placeholder="请输入昵称" 
                            v-model="formData.collection_name" 
                            autocomplete="off" 
                            maxlength="10" 
                            show-word-limit></el-input>
                        </el-form-item>
                        <el-col :span="10" style="margin-bottom: 5px;">描述（选填）</el-col>
                        <el-form-item prop="description">
                            <el-input type="textarea" 
                            :rows="5" 
                            placeholder="请输入个人介绍" 
                            v-model="formData.description" 
                            autocomplete="off"
                            maxlength="60" 
                            show-word-limit></el-input>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                    <span class="dialog-footer" v-if="handleCollectionType === 1">
                        <el-button type="info" link @click="handleQuit">取消</el-button>
                        <el-button type="info" @click="handleConfirm">确定</el-button>
                    </span>
                    <span class="dialog-footer" v-else>
                        <div class="dialog-footer-delete">
                            <el-button type="danger" @click="handleDeleteCollection(item)">移除收藏夹</el-button>
                        </div>
                        <div class="dialog-footer-swich">
                            <el-button type="default" @click="handleQuit">取消</el-button>
                            <el-button type="info" @click="handleConfirm">保存</el-button>
                        </div>
                    </span>
                    </template>
                </el-dialog>
            </div>
        </div>
        <el-empty v-else description="暂时没有任何收藏" />
    </div>
</template>

<style lang="less" scoped>
.collection-page{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    .collection-title{
        width: calc(100% - 700px);
        margin-top: 40px;
        height: 42px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .collection-title-name{
            width: 120px;
            height: 42px;
            text-align: center;
            line-height: 42px;
            color: rgba(51, 51, 51, 1);
            font-family: PingFang SC;
            font-weight: 600;
            font-size: 30px;
        }
        .collection-create{
            position: relative;
            .collection-title-plus{
            display: flex;
            align-items: center;
            width: 40px;
            height: 40px;
            border: none;
                
            :deep(.el-icon) {
                margin-left: 6px;
            }
        }
        .collection-title-plus:hover .create-btn {
            display: block;
        }
        .create-btn {
            display: none;
            position: absolute;
            top: 50px;
            left: 10px;
            width: 76px;
            height: 25px;
            padding: 4px 8px;
            background: rgba(51, 51, 51, 1);
            color: #fff;
            border: 1px solid rgba(51, 51, 51, 1);
            transition: all 2s ease;
            cursor: pointer;
        }

        .create-btn-txt {
            display: inline-block;
            width: 60px;
            height: 17px;
            line-height: 17px;
            text-align: center;
            font-family: PingFang SC;
            font-size: 12px;
        }
        }
        
    }
    .collection-list{
        width: calc(100% - 700px);
        overflow-y: auto;
        margin-top: 30px;
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        .collection-card{
            position: relative;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            width: 290px;
            height: 217px;
            border-radius: 4px;
            background: rgba(204, 204, 204, 1);
            cursor: pointer;
            .collect-shade {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                display: flex;
                z-index: 2;
                align-items: flex-end;
                transition: opacity 300ms ease;
                border-radius: 4px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                opacity: 1;
                .collect-shade-content {
                width: 270px;
                height: 40px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                    .collection-edit{
                        width: 40px;
                        height: 40px;
                        border: none;
                    }
                }


            }
            // .collect-card:hover .collect-shade {
            //     opacity: 1;
            // }
            .collection-card-left{
                width: 189px;
                height: 217px;
            }
            .collect-card-right{
                width: 100px;
                height: 217px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .collection-card-img{
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .collection-card-img-right{
                width: 100%;
                height: 50%;
                object-fit: cover;
            } 
            
        }
        .collection-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-top: 20px;
            .collection-info-class{
                width: 240px;
                height: 34px;
                line-height: 34px;
                text-align: left;
                color: rgba(51, 51, 51, 1);
                font-family: PingFang SC;
                font-weight: 600;
                font-size: 24px;
            }
            .collection-info-num{
                width: 44px;
                height: 20px;
                margin-top: 5px;
                line-height: 20px;
                text-align: left;
                color: rgba(102, 102, 102, 1);
                font-family: PingFang SC;
                font-size: 14px; 
            }
            
        }
        :deep(.el-dialog){
            padding: 30px
        }
        .dialog-footer{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
    
</style>