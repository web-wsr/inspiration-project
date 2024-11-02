
<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next';
import 'vue-waterfall-plugin-next/dist/style.css';
import { ElMessage } from 'element-plus'
import { Back, Delete } from '@element-plus/icons-vue';
import inspirationService from '@/services/inspiration';

const router = useRouter();
const route = useRoute();
// 存储图片数据
const images = ref([]);
// 判定图片是否加载完毕
const imagesList = ref([])
const loading = ref(true)
// mask蒙层显示和隐藏
const showActions = (item) => {
  item.showActions = true;
};

const hideActions = (item) => {
  item.showActions = false;
};

async function getCollectionImages(id) {
    const res = await inspirationService.getCollectionImages(id)
    if(res.code === 200){
        imagesList.value = res.data[0]
        console.log('imagesList',imagesList.value);
        
        images.value.push(...res.data[0].inspirations);
        loading.value = false
    }
}
onBeforeMount(() => {
    route.params.id && getCollectionImages(route.params.id)
})

async function handleDeleteImage(item ,index) {
    // console.log('item', item);
    // console.log('index', index);
    const res = await inspirationService.deleteCollectionImages(item.id)
    if(res.code === 200){
        images.value.splice(index, 1)
        ElMessage({
            message: res.message,
            type: 'success'
        });
    }

    
}

</script>""

<template>
    <div class="detail-page" v-loading="loading">
        <div class="detail-title">
            <el-button class="detail-back" type="default" :icon="Back" circle @click="router.push({name: 'Collection'})"></el-button>
            <span class="detail-title-name">{{ imagesList.collection_name }}</span>
            <span class="detail-title-description">{{ imagesList.description }}</span>
        </div>
        <div class="images-list" >
            <div class="images-list-content" v-if="imagesList">
                <div class="waterfall-container">
                    <Waterfall :list="images" :width="200" :gutter="10" class="waterfall-container">
                        <template #default="{ item, index }">
                            <div class="image-item" @mouseover="showActions(item)" @mouseleave="hideActions(item)">
                                <LazyImg :url="item.img_url" 
                                   
                                />
                                <div class="actions" v-if="item.showActions"  @click.stop="() => console.log(item.img_url)">
                                    <div class="delete" >
                                        <el-button :icon="Delete" type="danger" circle @click.stop="handleDeleteImage(item, index)"></el-button>
                                    </div>
                                    
                                </div> 
                            </div>
                            <!-- 收藏库 -->
                           
                        </template>
             
                    </Waterfall>
                </div>
                <!-- 分页 -->
                <!-- <el-row type="flex" justify="end" align="middle" style="height: 60px">
                <el-pagination background v-model:current-page="pageParams.page" :page-size="pageParams.pageSize"
                    layout="total,prev, pager, next" :total="pageParams.totalItems"
                    @current-change="handleCurrentChange" />
            </el-row> -->
            </div>
            <el-empty v-else description="该收藏夹下没有图片" />
            <!-- <div v-else></div> -->
        </div>
        
    </div>
</template>

<style lang="less" scoped>
    .detail-page{
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        .detail-title{
            position: relative;
            width: calc(100% - 700px);
            margin-top: 40px;
            height: 42px;
            display: flex;
            flex-direction: column;
            .detail-back{
                width: 40px;
                height: 40px;
                position: absolute;
                left: -50px;
                top: 50%;
                transform: translate(-100%, -45%);
                cursor: pointer;
            }
            .detail-title-name{
            height: 42px;
            text-align: left;
            line-height: 42px;
            color: rgba(51, 51, 51, 1);
            font-family: PingFang SC;
            font-weight: 600;
            font-size: 30px;  
            }
            .detail-title-description{
                display: block;
                white-space: wrap;
                width: 100%;
                height: 20px;
                margin: 10px 0;
                line-height: 20px;
                font-size: 14px;
                font:'PingFang SC';
                color: #999999;
            }
        }
        .images-list{
            width: calc(100% - 600px);
            margin-top: 50px;
            .waterfall-container {
            background-color: #f8fafc;
            .image-item {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 10px;
            position: relative;
            cursor: pointer;
            }
            .actions {
                width: 100%;
                height: 100%;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                align-items: flex-end;
                padding: 10px;
                color: white;
                background-color: rgba(0, 0, 0, 0.3);
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                pointer-events: none;
            }
            .image-item:hover .actions {
                opacity: 1;
                pointer-events: auto;
                /* 允许在显示状态下触发点击事件 */
            }
         }
        }
    }
</style>