<script setup>
    import Header from '@/components/Header.vue';    // import statistic from '@/data/statistic.json'
    import { ref, onMounted } from 'vue';
    import wordModule from '@/store/modules/wordModule';

    const activeTab = ref('By Time');
    const {fakeStaticByTime} = wordModule.state();
    const {fakeStaticByWord} = wordModule.state();
    let data = fakeStaticByTime;
    const singleItemMode = ref(false);
    const singleItemHeader = ref('');
    const singleItemData = ref({});
    const fetchStatistic = async () => {
        // try {
        //     const token = localStorage.getItem('token');
        //     if(!token){
        //         console.warn('Not found the token!');
        //         return;
        //     }
        //     const response = await axios.get('/study', {
        //         headers: {
        //         Authorization: `Bearer ${token}`
        //         }
        //     });
        //     data.value = response.data.data;
        // }
        // catch (error) {
        //     console.error("Error fetching statistics:", error);
        // }
    };

    onMounted(() => {
        fetchStatistic();
    });

    const switchTab = () =>{
        if(activeTab.value == "By Word"){
            activeTab.value = "By Time";
            data = fakeStaticByTime;
        }
        else{
            activeTab.value = "By Word";
            data = fakeStaticByWord;
        }
    }

    function handleSelectAnItem(item){
        singleItemMode.value = true;
        if (activeTab.value == 'By Time') {
            singleItemHeader.value = item.date;
        } else {
            singleItemHeader.value = item.word;
        }
        singleItemData.value = item;
    }

    function outOfSingleItemMode(){
        singleItemMode.value = false;
    }

</script>

<template>
    <Header></Header>
    <div class="container">
        <div class="header">
            <h1 @click.stop="outOfSingleItemMode" >Statistic</h1>
        </div>
        <div class="tabs">
          <button v-if="!singleItemMode" :class="{ active: activeTab == 'By Time' }" @click="switchTab">By Time</button>
          <button v-if="!singleItemMode" :class="{ active: activeTab == 'By Word' }" @click="switchTab">By Word</button>
          <h2 v-if="singleItemMode" class="singleItemHeader">{{ singleItemHeader }}</h2>
        </div>
        <div class="line"></div>
        <div v-if="activeTab == 'By Time'&&!singleItemMode" v-for="d in data"  class="details" @click.stop="handleSelectAnItem(d)">
                <tr>
                    <td>
                        <div class="point"></div>
                    </td>
                    <td class="date">{{ d.date }}</td>
                    <td class="words">{{ d.numberOfWords }} words</td>
                    <td >
                        <div class="bar" :style="{width: d.numberOfWords * 5 + 'px'}" > </div>
                    </td>
                </tr>
        </div>
        <div v-if="activeTab == 'By Word'&&!singleItemMode" v-for="d in data"  class="details" @click.stop="handleSelectAnItem(d)">
                <tr>
                    <td>
                        <div class="point"></div>
                    </td>
                    <td class="date">{{ d.word }}</td>
                    <td class="words">{{ d.timeStudy }} Time</td>
                    <td >
                        <div class="bar" :style="{width: d.numberOfWords * 5 + 'px'}" > </div>
                    </td>
                </tr>
        </div>
        <div v-if="activeTab == 'By Word'&&singleItemMode" v-for="d in singleItemData.dateList"  class="details" >
                <tr>
                    <td>
                        <div class="point"></div>
                    </td>
                    <td class="date">{{ d.date }}</td>
                    <td class="words">{{ d.time }} </td>
                    <td >
                        <div class="words"> {{ d.difficulty }} </div>
                    </td>
                </tr>
        </div>
        <div v-if="activeTab == 'By Time'&&singleItemMode" v-for="d in singleItemData.wordList"  class="details" >
                <tr>
                    <td>
                        <div class="point"></div>
                    </td>
                    <td class="date">{{ d.word }}</td>
                    <td class="words">{{ d.time }} </td>
                    <td >
                        <div class="words"> {{ d.difficulty }} </div>
                    </td>
                </tr>
        </div>
    </div>
</template>

<style scoped>
    .container {
        margin-top: 80px;
        margin-left: 100px;
    }
    .header{
        position: relative;
        margin-bottom: 30px;
    }

    .details{
        display: flex;
        margin-left: 30px;
        cursor: pointer;
    }

    tr{
        height: 50px;
    }

    .date{
        width: 150px;
        font-size: 20px;
        text-align: center;
    }
    .words{
        width: 150px;
        font-size: 20px;
    }
    .point{
        height: 10px;
        width: 10px;
        background-color: #BDEDF5;
        border-radius: 50%;
    }
    .bar{
        border-radius: 20px;
        height: 8px;
        width: 200px;
        background-color: #94e6f5;
    }

    .tabs {
        display: flex;
        gap: 20px;
    }
    
    .tabs button {
        background: none;
        border: none;
        padding: 10px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #333;
    }
    .tabs button.active {
        border-bottom: 2px solid black;
    }
    
    .line {
        /* position: absolute; */
        display: flex;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 1px;
        background-color: rgba(14, 14, 14, 0.1); 
        margin-bottom: 30px;
    
    }

    .header h1{
        cursor: pointer;
    }

    .singleItemHeader{
        flex-grow: 1;
        text-align: center;
    }
</style>