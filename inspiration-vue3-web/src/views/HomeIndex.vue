<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next';
import 'vue-waterfall-plugin-next/dist/style.css';
import { Star, Check } from '@element-plus/icons-vue';
import inspirationService from '@/services/inspiration';
import collectionService from '@/services/collection';
import { ElMessage } from 'element-plus';
import { useStore } from '@/stores/index.js';
import { useRouter } from 'vue-router';

const store = useStore()
const userInfo =  store.userInfo
console.log('userInfo', userInfo);

const router = useRouter();
const categoriesData = ref([]);
const categoryId = ref();
const secondLevelCategories = ref([]);
const thirdLevelCategories = ref([]);
const radio1 = ref(1);
const radio2 = ref(2);
const radio3 = ref(3);

// 存储图片数据
const images = ref([]);
// 判定图片是否加载完毕
const imagesList = ref([])
const loading = ref(true)

// 收藏夹相关数据
const inspirationIds = ref([])
const collectionlist = ref()
const disalogVisible = ref(false)
const imageId = ref(null)

// 分页数据
const pageParams = ref({
  page: 1, //第几页
  pageSize: 50, //每页几条数据
  totalItems: 0,
});

// mask蒙层显示和隐藏
const showActions = (item) => {
  item.showActions = true;
};

const hideActions = (item) => {
  item.showActions = false;
  item.showFavoriteLibrary = false; // 确保收藏库在鼠标离开时隐藏
};


async function getCategory() {
    const res = await inspirationService.getCategoryList()
    categoriesData.value = res.data
    console.log('categoriesData', categoriesData.value)
}
async function getCategoryImages(id) {
        categoryId.value = id
        const res = await inspirationService.getCategoryImages(categoryId.value, { page: pageParams.value.page, pageSize: pageParams.value.pageSize })
        if(res.code === 200){
            imagesList.value = res.data;
            pageParams.value.totalItems = res.total[0].sum
            images.value.push(...res.data);
            console.log('images', images.value);
            loading.value = false
        }
}
// 点击分页
const handleCurrentChange = (newPage) => {
  pageParams.value.page = newPage;
  images.value = []
  getCategoryImages(categoryId.value);

}

// 初始化当前收藏的图片ids
async function initFavoriteImage() {
    const res = await collectionService.collectionList()
    if(res.code === 200){
        inspirationIds.value = res.data.inspirationIds
    }
    
}
onMounted(() => {
    getCategory();
    getCategoryImages(radio3.value)
    initFavoriteImage()
});


const filterFirstCategory = computed(() => {
    return categoriesData.value.filter(item => item.parent_id === null)
})
const updateSecondLevelCategories = () => {
    secondLevelCategories.value = categoriesData.value.filter(item => item.parent_id === radio1.value);
};
const updateThirdLevelCategories = () => {
    thirdLevelCategories.value = categoriesData.value.filter(item => item.parent_id === radio2.value);
};

watch(radio1, (newVal) => {
    if (newVal !== null) {
        updateSecondLevelCategories();
    }
}, { immediate: true });

watch(radio2, (newVal) => {
    if (newVal !== null) {
        updateThirdLevelCategories();
    }
}, { immediate: true });
// 确保在数据加载完成后更新二级和三级分类
watch(categoriesData, () => {
    updateSecondLevelCategories();
    updateThirdLevelCategories();
});
function selectFirstCategory(item) {
    console.log('item', item)
    radio2.value = ''
    radio3.value = ''
    images.value = []
    // categoryId.value = item.id
    pageParams.value.page = 1;
    getCategoryImages(item.id)
}

function selectSecondCategory(item) {
    console.log('item', item)
    radio3.value = ''
    images.value = []
    // categoryId.value = item.id
    pageParams.value.page = 1;
    getCategoryImages(item.id)
}
function selectThirdCategory(item) {
    console.log('item', item)
    images.value = []
    // categoryId.value = item.id
    pageParams.value.page = 1;
    getCategoryImages(item.id)
}

async function handleFavoriteImage(item) {
    console.log('handleFavoriteImage', item)
    if(!userInfo.id){
        ElMessage({
            message: '请先登录',
            type: 'warning'
        });
        router.push({name: 'AccountLogin'})
        return
    }else{
        imageId.value = item.id
        const res = await collectionService.collectionList()
        if(res.code === 200){
        collectionlist.value = res.data.collectionList
        disalogVisible.value = true
        }
    }
}

async function handleFavoriteImageComfirm(item) {
    console.log('item',item);
    let id = item.id
    const res = await collectionService.addCollectionImage(id, { imageId: imageId.value })
    console.log('res', res);
    if(res.code === 200){
        ElMessage({
        message: res.message,
        type: 'success'
      });
        disalogVisible.value = false
        initFavoriteImage()
    }
}


</script>






<template>
    <div class="home-page">
        <div class="category_list">
            <div class="category_item">
                <div class="category_title">一级分类</div>
                <div class="category_content">
                    <el-radio-group v-model="radio1">
                        <el-radio-button class="radio-button" v-for="item in filterFirstCategory" :key="item.id"
                            :label="item.name" :value="item.id" @change="selectFirstCategory(item)" />
                    </el-radio-group>
                </div>
            </div>
            <div class="category_item" v-if="secondLevelCategories.length > 0">
                <div class="category_title">二级分类</div>
                <div class="category_content">
                    <el-radio-group v-model="radio2">
                        <el-radio-button class="radio-button" v-for="item in secondLevelCategories" :key="item.id"
                            :label="item.name" :value="item.id" @change="selectSecondCategory(item)" />
                    </el-radio-group>
                </div>
            </div>
            <div class="category_item" v-if="thirdLevelCategories.length > 0">
                <div class="category_title">三级分类</div>
                <div class="category_content">
                    <el-radio-group v-model="radio3">
                        <el-radio-button class="radio-button" v-for="item in thirdLevelCategories" :key="item.id"
                            :label="item.name" :value="item.id" @change="selectThirdCategory(item)" />
                    </el-radio-group>
                </div>
            </div>

        </div>
        <div class="images-list">
            <div class="images-list-content" v-if="imagesList.length" v-loading="loading">
                <div class="waterfall-container">
                    <Waterfall :list="images" :width="200" :gutter="10" class="waterfall-container">
                        <template #default="{ item }">
                            <div class="image-item" @mouseover="showActions(item)" @mouseleave="hideActions(item)">
                                <LazyImg :url="item.img_url" :alt="item.name"
                                    @click.stop="() => console.log(item.img_url)"
                                />
                                <div class="actions" v-if="item.showActions">
                                    <div class="star" v-if="!inspirationIds.includes(item.id)">
                                        <el-button :icon="Star" type="danger" circle  @click.stop="handleFavoriteImage(item)"></el-button>
                                        <span>收藏</span>
                                    </div>
                                    <div class="check" v-else>
                                        <el-button :icon="Check" type="success" circle></el-button>
                                        <span>已收藏</span>
                                    </div>
                                </div> 
                            </div>
                            <!-- 收藏库 -->
                           
                        </template>
             
                    </Waterfall>
                </div>
                <!-- 分页 -->
                <el-row type="flex" justify="end" align="middle" style="height: 80px">
                    <el-pagination background v-model:current-page="pageParams.page" :page-size="pageParams.pageSize"
                        layout="total,prev, pager, next" :total="pageParams.totalItems" @current-change="handleCurrentChange" />
                </el-row>
            </div>
            <el-empty v-else description="该分类下没有图片" />
        </div>
        
        <el-dialog v-model="disalogVisible" width="300px" center title="添加至收藏库" >
            <ul class="collection-list">
              <li class="collection-item" v-for="item in collectionlist" :key="item.id">
                <span>{{ item.collection_name }}</span>
                <el-button type="danger" class="hidden-button" @click="handleFavoriteImageComfirm(item)">收藏</el-button>
              </li>   
            </ul>  
        </el-dialog>  
    </div>
</template>


<style type="text/css" lang="less" scoped>
.home-page {
    display: flex;
    height: calc(100vh - 101px);
    .images-list {
        flex: 1;
        .images-list-content {
            width: 100%;
            height: calc(100% - 60px);
            padding: 10px;
            .waterfall-container {
            width: 100%;
            height: 100%;
            overflow-y: auto;
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
                align-items: end;
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
            .check,
            .star{
                width: 100px;
                display: flex;
                align-items: center;
                gap: 5px;
                justify-content: flex-start;
            }
        }
        }
    }

    .category_list {
        width: 330px;
        padding: 20px 15px 0 40px;
        border-right: 1px solid #e4e7ed;
        box-shadow: 0px 10px 0px px rgba(0, 0, 0, 0.05)
    }

    .category_title {
        font-size: 20px;
        color: #111111;
        line-height: 28px;
        font-weight: 600;
        margin-bottom: 20px;

    }

    .radio-button {
        margin-right: 15px;
        margin-bottom: 16px;

    }

    /* 使用 :deep 选择器覆盖 Element Plus 的默认样式 */
    :deep(.el-radio-button__inner) {
        border: 1px solid #e4e7ed;
        color: #333;
        /* 默认文本颜色 */
        background-color: #fff;
        /* 默认背景颜色 */
        border-color: #dcdfe6;
        /* 默认边框颜色 */
    }
    .collection-list {
        list-style-type: none; 
        padding: 10px;
        margin: 0;
        max-height: 300px; 
        overflow-y: auto; 
    }
    .collection-item {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    }
    .collection-item:hover {
    background-color: #f0f0f0; /* 鼠标悬停时背景颜色变化 */
    }

    .hidden-button {
    display: none; /* 默认隐藏按钮 */
    }

    .collection-item:hover .hidden-button {
    display: inline-block; /* 鼠标悬停时显示按钮 */
    }
}
</style>