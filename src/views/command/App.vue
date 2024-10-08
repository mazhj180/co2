<script setup>
import { onMounted, ref } from 'vue'

const command = ref('')
const keyup = () => {
    if (command.value){
        main_process.sendCommand(command.value)
    }
    
}



</script>

<template>
    <div class=" input-container">
        <div class=" input" >
            <input @keyup.enter="keyup" type="text" v-model="command"></input>
        </div>
    </div>    
</template>

<style scoped lang="stylus">
    .input-container
        width 100%
        height 100%
        display flex
        justify-content center
        align-items center
        border-radius 10px
        .input
            width 100%
            height 75px
            display flex
            justify-content center
            align-items center
            border-radius 10px
            input
                width 100%
                height 80%
                background-color rgba(0,0,10,0.5)
                padding-left 20px
                padding-right 10px
                font-size 18px 
                // box-sizing border-box
                border-radius 10px
                outline none  // 默认情况下去除 outline
                &:focus
                    outline none  // 聚焦时去除 outline
</style>