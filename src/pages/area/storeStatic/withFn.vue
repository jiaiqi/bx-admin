<template>
   <div>
    恶趣味
    <slot name="name"></slot>

           <div id="1" key="2" style="border-top:1px solid red">

         </div>
   </div>



</template>

<script>
import _ from "lodash";
import "@/assets/common.scss";
let $ = require("jquery");

import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/popover";

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="tooltip"]').popover();
});

export default {
    components: {},
    name:'jsajdjsadjsajdjs',
    mixins: [],

    props: {},

    data() {
        return {
         
        };
    },

    methods: {
   
    },

    created: function () {
    
      
    },
    mounted: function () {
     let h = this.$createElement;
      console.log(this.$slots['name']=<div>2132</div>,"您好我是withFn")
      this.$forceUpdate();
      console.log(this.$slots.default,"==this.$slots.default==")
    },
};
</script>

<style scoped>

</style>
