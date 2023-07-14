<template>
    <div class="page-wrap">
        <div class="title" v-if="content">
            {{ content.title || ''}}
        </div>
        <div class="content" v-html="content.context">

        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            id: "",
            content: "",
        };
    },
    methods: {
        getContent() {
            const url = `/xsyx/select/srvyxjdsb_apply_notice_select`;
            const req = {
                serviceName: "srvyxjdsb_apply_notice_select",
                colNames: ["*"],
                condition: [{ colName: "id", ruleType: "eq", value: this.id }],
                page: { pageNo: 1, rownumber: 1 },
            };
            this.select('srvyxjdsb_apply_notice_select',req.condition,null, null, null, null, 'xsyx', null, req.colNames, null).then((res)=>{
                if(res.data.state==='SUCCESS'){
                    if(Array.isArray(res.data.data)&&res.data.data.length){
                        this.content = res.data.data[0]
                    }
                }
            })
        },
    },
    created() {
        this.id = this.$route.query.id;
        if (this.id) {
            this.getContent()
        }
    },
};
</script>

<style lang="scss" scoped>
.page-wrap{
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    padding: 71px 46px;
    background-image: url('../assets/img/article_bg.jpg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    .title{
        font-size: 36px;
        font-weight: 700;
        color: #000;
        padding: 70px  0  0 145px ;
        position: relative;
        display: inline-block;
        z-index: 1;
        &::before{
            content: '';
            width: 30px;
            height: 30px;
            border-radius: 50%;
            left: 70px;
            bottom: -10px;
            background-color: #64d2fe;
            position: absolute;
        }
        &::after{
            content: '';
            width: calc(100% - 90px);
            height: 40px;
            border-radius: 30px;
            left: 120px;
            bottom: -10px;
            background-color: #64d2fe;
            position: absolute;
            z-index: -1;
        }
    }
    .content{
        padding: 46px 79px ;

    }
}
</style>
