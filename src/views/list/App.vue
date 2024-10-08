<script setup>
import { onMounted, reactive, ref } from 'vue'

const base64 = ref('')
const list = reactive([])

onMounted(async () => {
    // main_process.getAppsByKeywords( data => {
    //     console.log(data)
    //     list.push(...data)
    // })
})

// onMounted(async () => {
//     base64.value = await main_process.startApp('/Applications/Medis.app')
//     console.log(base64.value)

// })
</script>

<template>
    <div>
        我是 list
        <img :src="base64">
        <div v-for="item in list">
            <div> {{ item.appPath }} </div>
            <img :src="item.icon">
        </div>
    </div>
</template>

<style scoped></style>