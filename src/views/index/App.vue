<script setup>
import { onMounted, reactive, ref } from 'vue'

const base64 = ref('')
const list = reactive([])

onMounted(async () => {
    // const data = await main_process.startApp('/Applications/Medis.app')
    // console.log(data)
    // const icns =  Icns.from(data)
    
    // const blob = new Blob([icns.data], { type: 'image/png' })
    // base64.value = URL.createObjectURL(blob)

    // let apps = await main_process.getApps()
    // console.log(apps)
    // list.push(...apps)
})

// onMounted(async () => {
//     base64.value = await main_process.startApp('/Applications/Medis.app')
//     console.log(base64.value)

// })
</script>

<template>
    <div>
        我是 index
        <img :src="base64">
        <div v-for="item in list">
            <div> {{ item.appPath }} </div>
            <img :src="item.icon">
        </div>
    </div>
</template>

<style scoped></style>