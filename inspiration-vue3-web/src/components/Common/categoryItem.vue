<template>
    <div class="category_item">
        <div class="category_title">
            {{ getCategoryTitle(category.level_id) }} - {{ category.name }}
        </div>
        <div class="category_content" v-if="selectedCategory && selectedCategory.id === category.id">
            <el-radio-group v-model="localSelectedCategory">
                <el-radio-button v-for="child in category.children" :key="child.id" :label="child.id"
                    @change="selectCategory(child)">
                    {{ child.name }}
                </el-radio-button>
            </el-radio-group>
            <CategoryItem v-for="child in category.children" :key="child.id" :category="child"
                :selectedCategory="localSelectedCategory" @select-category="selectCategory" />
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
    category: Object,
    selectedCategory: Object
});

const emit = defineEmits(['select-category']);

const localSelectedCategory = ref(props.selectedCategory);

watch(() => props.selectedCategory, (newVal) => {
    localSelectedCategory.value = newVal;
});

const getCategoryTitle = (levelId) => {
    switch (levelId) {
        case 0:
            return '一级分类';
        case 1:
            return '二级分类';
        case 2:
            return '三级分类';
        default:
            return `${levelId + 1}级分类`;
    }
};

const selectCategory = (category) => {
    emit('select-category', category);
};
</script>

<style type="text/css" lang="less" scoped>
.category_title {
    font-weight: bold;
    margin-bottom: 10px;
}

.category_content {
    margin-left: 20px;
}
</style>