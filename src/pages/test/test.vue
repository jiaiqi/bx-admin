<template>
  <div class="ddd">
    I am test
    <LcMain :config="config"></LcMain>
  </div>
</template>

<script>
export default {
  props: {},

  data() {
    return {
      config: [
        {
          type: "LcPage",
          attribute: {
            style: "background:red",
          },
          async:true,
          data: {
            user: "no one",
            items: ["A", "B", "C"],
          },
          body: [
            "我是测试-------",
            {
              type: "LcDiv",
              attribute: {
                style: "color:black;font-weight:800;",
              },
              body:[
                "我是Lcdiv"
              ]
            },
            {
              type: "LcTest",

              body: [
                "LcTest-------------",
                {
                  type: "LcPage",
                  attribute: {
                    style:
                      "background:green;padding:30px 30px;display:flex;align-items:center;justify-content:center;",
                  },
                  body: [
                    "我是张张+王浩东",
                    {
                      type: "LcPage",
                      attribute: {
                        style:
                          "width:30px;height:30px;border-radius:15px;background:black",
                      },
                      body: ["您好"],
                    },
                  ],
                },
              ],
            },
            {
              type: "LcTitle",
              body: ["LcTitle--------------"],
            },
          ],
        },
      ],
    };
  },

  methods: {},

  created: function () {
    window.h = this.$createElement;
  },

  mounted: function () {
    // this.getColumns();
  },
};
</script>

<style scoped>
</style>

<style lang="scss" scoped>
</style>
