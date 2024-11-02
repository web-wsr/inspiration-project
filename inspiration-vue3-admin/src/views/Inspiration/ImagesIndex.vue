<script setup>
import { ref, onMounted } from 'vue';
import { ElTree, ElMessage } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import inspirationService from '@/services/inspiration';
import { getTreeParentName } from '@/utils/getTreeParentName';
import { UploadFilled } from '@element-plus/icons-vue'
import ossService from '@/services/oss';


// 图片预览
const dialogVisible = ref(false);
const previewImageUrl = ref('');
const previewWidth = ref(0);
const previewHeight = ref(0);
// 编辑和添加图片弹窗
const editDialogVisible = ref(false)
// 细分类目
const categoryTree = ref();
const treeData = ref([]);
// 存储图片数据
const images = ref([]);
// 判定图片是否加载完毕
const imagesList = ref([])
// 定义并初始化 defaultExpandKeys
const defaultExpandKeys = ref([]);
const categoryId = ref([]);
const pageParams = ref({
  page: 1, //第几页
  pageSize: 20, //每页几条数据
  totalItems: 0,
});
const loading = ref(false);  // 加载状态

const fetchData = async () => {
  // 这 API 接口来获取分类数据
  const { data } = await inspirationService.getCategoryList();
  treeData.value = data
};

onMounted(() => {
  fetchData();

});


const loadImages = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    let id = categoryId.value;
    const response = await inspirationService.getInspirationList(id, { page: pageParams.value.page, pageSize: pageParams.value.pageSize });
    imagesList.value = response.data
    pageParams.value.totalItems = response.total[0].sum

    images.value.push(...response.data);
    return true
  } catch (error) {
    console.error('加载图片失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCurrentChange = (newPage) => {
  pageParams.value.page = newPage;
  images.value = []
  loadImages();

}

// 记录节点事件 用于定位当前节点
const handleNodeClick = async (node, data) => {
  console.log('点击节点---data', data.id);
  console.log('点击节点---node', node);
  // 获取细分类目
  const ancestorNames = getTreeParentName(data);
  const fullName = ancestorNames ? `${ancestorNames}-${node.name}` : node.name;
  categoryTree.value = fullName
  defaultExpandKeys.value.push(node.id)  //记录当前点击节点，并push给默认展开的节点的 key 的数组
  categoryId.value = node.id;
  pageParams.value.page = 1;
  images.value = []
  loadImages();

}


// mask蒙层显示和隐藏
const showActions = (item) => {
  item.showActions = true;
};

const hideActions = (item) => {
  item.showActions = false;
};

// 字典用于决定层级标签
const tagType = (level) => {
  const levelToType = {
    0: 'primary',
    1: 'success',
    2: 'warning',
  };
  return levelToType[level] || 'info';
}
// 图片预览
const openPreview = (item) => {
  dialogVisible.value = true;
  previewImageUrl.value = item.img_url;
  previewWidth.value = item.width || 800;
  previewHeight.value = item.height || 600;
  console.log(item);
};

// 添加图片和编辑图片的数据
const handleImageType = ref()
const imageId = ref()
const imageTitle = ref('')
const imageData = ref({
  imageHeight: null,
  imageWidth: null,
  fileUrl: ''
})

const handleCreateImage = () => {
  // 添加图片 
  handleImageType.value = 1
  imageTitle.value = '添加图片'
  editDialogVisible.value = true;
}

const handleEditImage = (item) => {
  // 编辑图片
  console.log('item', item);
  handleImageType.value = 2
  imageTitle.value = '编辑图片'
  imageData.value.imageHeight = item.heigth
  imageData.value.imageWidth = item.width
  imageData.value.fileUrl = item.img_url
  imageId.value = item.id
  editDialogVisible.value = true;
}
const handleImageConfirm = async () => {
  let id;
  if (handleImageType.value === 1) {
    id = categoryId.value
    // 需要跳转渲染最后一页
    const lastPage = Math.ceil((pageParams.value.totalItems + 1) / pageParams.value.pageSize)
    pageParams.value.page = lastPage
  } else {
    id = imageId.value
  }
  // 请求封装函数
  const newImage = await handleImageServer(id, handleImageType.value, imageData.value)
  if (newImage.code === 200) {
    ElMessage({
      message: newImage.message,
      type: 'success'
    });
    // 重新更新渲染列表的状态
    images.value = []
    loadImages();
  }
  editDialogVisible.value = false;
  imageData.value = {
    imageHeight: null,
    imageWidth: null,
    fileUrl: ''
  }
}
const handleDeleteImage = async (item) => {
  const res = await inspirationService.inspirationDelete(item.id)
  if (res.code === 200) {
    ElMessage({
      message: res.message,
      type: 'success'
    });
    if (imagesList.value.length === 1) pageParams.value.page--;
    // 重新更新渲染列表的状态
    images.value = []
    loadImages();
  }
}
const handleImageQuit = () => {
  imageData.value = {
    imageHeight: null,
    imageWidth: null,
    fileUrl: ''
  }
  editDialogVisible.value = false;
}
// APi封装函数
const handleImageServer = (id, type, data) => {
  if (type === 1) {
    return inspirationService.inspirationAdd(id, data)
  } else {
    return inspirationService.inspirationUpdate(id, data)
  }
}

// OSS 上传图片
const uploadRef = ref()
const beforeUpload = async (file) => {
  loading.value = true
  try {
    await ossService.upload(
      { file, space: 'materrial', folder: 'images' },
      (uploadRes) => {
        console.log('文件上传成功:', uploadRes);
      },
      (err) => {
        ElMessage.error('上传失败，请重试');
        console.error('上传失败:', err);
      },
      () => {
        console.log('上传结束');
      },
      (storeRes) => {
        if (storeRes.code === 200) {
          loading.value = false;
          imageData.value.fileUrl = storeRes.data.url;
          imageData.value.imageWidth = Number(storeRes.data.image_width);
          imageData.value.imageHeight = Number(storeRes.data.image_height);
          ElMessage.success('文件上传成功');
        } else {
          ElMessage.error('文件上传失败');
        }
      }
    );
    return false; // 阻止默认上传行为
  } catch (err) {
    loading.value = false;
    ElMessage.error('上传前处理失败');
    console.error('上传前处理失败:', err);
    return false;
  }
};
const handleChange = () => {
  imageData.value.fileUrl = null
};

const handleDelete = () => {
  uploadRef.value.clearFiles()
  imageData.value.fileUrl = null
}



</script>

<template>
  <div class="images">
    <div class="tree">
      <div class="tit">图库类目列表</div>
      <div class="category-tree">
        <el-tree :data="treeData" node-key="id" @node-click="handleNodeClick"
          :default-expanded-keys="defaultExpandKeys">
          <template #default="{ data }">
            <span class="custom-tree-node">
              <!-- 使用字典来决定标签的类型 -->
              <el-tag :type="tagType(data.level_id)">
                {{ data.name }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div class="images-list">
      <div class="tit">
        <div>{{ categoryTree ? `当前类目：${categoryTree}` : '' }}</div>
        <el-button v-if="categoryTree" type="success" style="margin-right: 20px;" size="default"
          @click="handleCreateImage">添加图片</el-button>
      </div>
      <div class="images-list-content" v-if="imagesList.length">
        <div class="waterfall-container">
          <Waterfall :list="images" :width="200" :gutter="10" class="waterfall-container">
            <template #default="{ item }">
              <div class="image-item" @mouseover="showActions(item)" @mouseleave="hideActions(item)"
                @click="openPreview(item)">
                <LazyImg :url="item.img_url" :alt="item.name" @click="() => console.log(item.img_url)" />
                <div class="actions" v-if="item.showActions">
                  <!-- <svg-icon name="icon-clue" width="24px" hight="24px" @click="handleImageClick(item)"></svg-icon> -->
                  <el-button :icon="Edit" circle @click.stop="handleEditImage(item)"></el-button>
                  <el-button :icon="Delete" circle @click.stop="handleDeleteImage(item)"></el-button>
                </div>
              </div>
            </template> 
          </Waterfall>
        </div>
        <!-- 分页 -->
        <el-row type="flex" justify="end" align="middle" style="height: 60px">
          <el-pagination background v-model:current-page="pageParams.page" :page-size="pageParams.pageSize"
            layout="total,prev, pager, next" :total="pageParams.totalItems" @current-change="handleCurrentChange" />
        </el-row>
      </div>
      <el-empty v-else description="该分类下没有图片" />
    </div>
    <!-- 图片预览弹窗 -->
    <el-dialog v-model="dialogVisible" :width="`${previewWidth}px`" :height="`${previewHeight}px`" top>
      <img :src="previewImageUrl" alt="预览图片" style="width: 100%; height: 100%;" />
    </el-dialog>
    <!-- 图片编辑和添加弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="imageTitle" :style="{ 'width': '400px', 'height': '450px' }"
      @close="handleImageQuit">
      <el-upload class="upload-demo" drag action="#" :before-upload="beforeUpload" :on-change="handleChange" :limit=1
        ref="uploadRef">
        <div v-if="!imageData.fileUrl" v-loading="loading">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
        </div>
        <!-- 回显及遮罩层 -->
        <div class="mask" v-else>
          <img :src="imageData.fileUrl" alt="上传的图片" style=" width: 100%; height: 100%; object-fit: contain;" />
          <div class="mask-cover">
            <el-icon size="50">
              <Edit />
            </el-icon>
            <el-icon size="50" @click.stop="handleDelete">
              <Delete />
            </el-icon>
          </div>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            jpg/png files with a size less than 500kb
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleImageQuit">取消</el-button>
          <el-button type="primary" @click="handleImageConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.images {
  display: flex;
  width: calc(100% - 10px);
  margin-top: 10px;
  padding: 5px;

  .tit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    line-height: 50px;
    background-color: #d6dbd9;
    color: #fff;
    font-size: 14px;
    padding-left: 20px;
  }

  .tree {
    width: 200px;
    margin-right: 20px;
    background-color: #fff;
    border: 1px solid #eee;

  }

  .category-tree {
    height: 80vh;
    overflow-y: auto;
  }

  .images-list {
    flex: 1;
    background-color: #fff;
  }

  .images-list-content {
    width: 100%;
    height: 80vh;
    padding: 10px;

  }

  .waterfall-container {
    width: 100%;
    height: calc(100% - 60px);
    overflow-y: auto;
  }

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
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 5px;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    pointer-events: none;
  }

  .image-item:hover .actions {
    opacity: 1;
    pointer-events: auto;
    /* 允许在显示状态下触发点击事件 */
  }

  .actions .el-button {
    padding: 5px;
    margin: 0 5px;
  }

  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.el-upload) {
    height: 100%;
  }

  :deep(.el-upload-dragger) {
    height: 100%;
    margin-left: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
  }

  .upload-demo {
    height: 300px;
    width: 300px;
  }

  :deep(.el-upload__tip) {
    margin-left: 20%;
  }

  :deep(.el-dialog__footer) {
    margin-top: 40px;
  }

  // .tip {
  //   color: red;
  // }
  // 遮罩层
  .mask-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(100, 100, 100, 0.5);
    color: #ffffff;
    opacity: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      opacity: 1;
    }

    .el-icon {
      margin: 0 10px;

      &:hover {
        color: #70aeed
      }
    }
  }
}
</style>