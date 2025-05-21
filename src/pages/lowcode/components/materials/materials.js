export const materialsTree = [
  {
    value: "layout",
    label: "布局",
    icon: "Layout",
    service: "srvpage_cfg_layout_select",
    nameCol: "layout_name",
  },
  {
    value: "chart",
    label: "图表",
    cond_col: "chart_type",
    icon: "Chart",
    service: "srvpage_cfg_com_chart_select",
    nameCol: "chart_name",
    children: [
      {
        label: "折线图",
        value: "折线图",
      },
      {
        label: "柱状图",
        value: "柱状图",
      },
      {
        label: "条形图",
        value: "条形图",
      },
      {
        label: "饼图",
        value: "饼图",
      },
      {
        label: "环图",
        value: "环图",
      },
      {
        label: "雷达图",
        value: "雷达图",
      },
      {
        label: "图表地图",
        value: "地图",
      },
      // {
      //   label: "热力图",
      //   value: "热力图",
      // },
      // {
      //   label: "散点图",
      //   value: "散点图",
      // },
      {
        label: "词云图",
        value: "词云图",
      },
      // {
      //   label: "仪表盘",
      //   value: "仪表盘",
      // },
      // {
      //   label: "水球图",
      //   value: "水球图",
      // },
      // {
      //   label: "数字翻牌器",
      //   value: "数字翻牌器",
      // },
      // {
      //   label: "排行滚动表",
      //   value: "排行滚动表",
      // },
      // {
      //   label: "地图",
      //   value: "地图",
      // },
    ],
  },
  {
    value: "list",
    label: "列表",
    icon: "List",
    cond_col: "list_type",
    service: "srvpage_cfg_com_list_select",
    nameCol: 'list_name',
    children: [
      {
        label: "表格",
        value: "表格",
      },
      {
        label: "卡片",
        value: "卡片",
      },
      {
        label: "信息",
        value: "信息",
      },
    ],
  },
  {
    value: "grid",
    label: "宫格",
    icon: "Grid",
    service: "srvpage_cfg_com_grid_select",
    nameCol: 'grid_name',
  },
  {
    value: "cardGroup",
    label: "卡片组",
    icon: "Card",
    service: "srvpage_cfg_card_group_select",
    nameCol: 'cardg_name',
  },
  {
    value: "控件",
    label: "控件",
    icon: "IconText",
    service: "srvpage_cfg_meta_col_widget_select",
    nameCol: 'widget_name',
  },
  {
    value: "swiper",
    label: "轮播图",
    icon: "Pic",
    service: "srvpage_cfg_figure_swiper_select",
    nameCol: 'swiper_name',
  },
  // {
  //   value: "videoCard",
  //   label: "视频卡片",
  //   icon: "Video",
  //   service: "srvpage_cfg_com_video_card_select",
  //   nameCol:'video_card_name',
  // },
  // {
  //   value: "richTextCard",
  //   label: "图文卡片",
  // },
  {
    value: "map",
    label: "地图",
    icon: "Map",
    service: "srvpage_cfg_com_map_select",
    nameCol: 'map_name',
  },
  {
    value: "currentInfo",
    label: "个人信息",
    icon: "Avatar",
    service: "srvpage_cfg_com_current_info_select",
    nameCol: 'current_info_name',
  },
  // {
  //   value: "userList",
  //   label: "用户列表卡",
  // },
  // {
  //   value: "addrcard",
  //   label: "地址卡",
  // },
  {
    value: "noticeBar",
    label: "通知条",
    icon: "Notice",
    service: "srvpage_cfg_com_notice_bar_select",
    nameCol: 'noticebar_name',
  },
  // {
  //   value: "steps",
  //   label: "步骤条",
  // },
  {
    value: "tabs",
    label: "标签tabs",
    icon: "Tag",
    service: "srvpage_cfg_com_tabs_select",
    nameCol: 'tabs_name',
  },
  {
    value: "form",
    label: "表单form",
    icon: "Form",
    service: "srvpage_cfg_com_form_select",
    nameCol: 'form_name',
  },
  {
    value: "navBar",
    label: "导航菜单",
    icon: "NavBar",
    service: "srvpage_cfg_page_nav_bar_select",
    nameCol: 'nav_name',
  },
  {
    value: "extPage",
    label: "外部页面",
    icon: "ExtPage",
    service: "srvpage_cfg_com_ext_page_select",
    nameCol: 'extp_name',
  },
  {
    value: "cardPart",
    label: "卡片部件",
    comList: [
      {
        "label": "字符串",
        "value": "string",
        "type": "cardPart",
        "component": "pageItem"
      },
      {
        "label": "图片",
        "value": "iconImg",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAAAXNSR0IArs4c6QAAE7dJREFUeF7tnQlz27iyRlv76k1e4sST3L/9ft67M3EW77KtfbvV9Di2ZNkCRYgAxNNVU5nJgAB00F+RBNHduf///TgTDAIQCI5ATnL/l0PAwa0bE4ZARAAB4wgQCJgAAg548Zg6BBAwPgCBgAkg4IAXj6lDAAHjAxAImAACDnjxmDoEEDA+AIGACSDggBePqUMAAeMDEAiYAAIOePGYOgQQMD4AgYAJIOCAF4+pQwAB4wMQCJgAAg548Zg6BBAwPgCBgAkg4IAXj6lDAAHjAxAImAACDnjxmDoEEDA+AIGACSDggBePqUMAAeMDEAiYAAIOePGYOgQQMD4AgYAJIOCAF4+pQwAB4wMQCJgAAg548Zg6BBAwPgCBgAkg4IAXj6lDAAHjAxAImAACDnjxmDoEEDA+AIGACSDggBdvceq5XE5yWjM29/RPPpeTfD4nea0im9f/fvp7rSqrNp3NRGYik9lMJtOZzKZPfzfVv9b/h3lPAAF7v0RvJ/gs0lIxL7VyQWqVopSLeau/RAXcGUzksTeW4Xgi6NkqXmudIWBrKDfbUaWUl51aKRJsdKd9uommYnovnk1n0umP5a47lOk0lWEZxIAAAjaA5KKJPu7u1ktSrxSlUMhFj8O+2GgylfvuKLo7Y24JIGC3/N+M3qgUpVkvSqWod1rPJrcwHX1vfuiN5b475BHb0VIhYEfgXw+rQt2tlaRZK0qxYPddNo2fN57M5PZxIN3BJI3hGOMVAQTs2B30EfmgWZZiwfPbrQEnfUe+fRxGO9pYOgQQcDqc34xSyOek1SxLvVp0NIPNDKufoX7f9mU4ZqdrM4Tne0XAaVBeGKNUyMtpq+rVxpRtDBd3fekNeaS2zXWxPwS8acIL/VfLBfm0X015VDfDXT8M2KneMHoEvGHAr7vPknj1d+ub8PX9IPp+jG2GAALeDNc3veom1dlhPaXR/BlGT3D9vuvJYMQ78SZWBQFvgupCn3oe+axVi84lZ9F0V/r8usf56g0sPgLeANTFLnW3eadeSmEkf4cYjCby67bv7wQDnRkC3vDCaZDB51Ztw6OE0f3F3UB6Q96Hba4WArZJc0lfRzsVadS261tvEmT/XHafwhgxKwQQsBWMyzvJ6sbVR0j1pJYGQmB2CCBgOxyX9tKsFuVwt7LBEcLs+p+rrkw5bmll8RCwFYxvO9G77+lBTfTIJDZP4Ipvw9ZcAgFbQ/nSke46N2sl78MBN/DTjbrU6KXz665RWxp9TAABW/QQzZTxab8ilVLBYq/b2dXPmx4BDxaWFgFbgKhd6CPz54PsHtaIi/HmYRAlA8CSEUDAyfhFV2t0kX7r9T2DhoWfaq2LzmAsV+2Btf6y2hECTrjyeuf90qoj3pgc9VuwnswaETcck9x8cwScAJ8mmvtyyE5zAoTy46aHiBMARMAJ4Glcr4YIYusT0O/B3wl0WBsgAl4T3X6jJHuN8ppXc9lrAsPRVH7e9oCyBgEEvAY0DVDQQxpsWq0B751LLtt9slqugRMBrwHttFWTiuVSJmtMY6su0UdpPWKJxSOAgOPxkka1KEecb45Jzaz5r1syd5iRemmFgGMS++uozvnmmMxMm48n0yhzB2ZOAAGbs4oqABKcHwPYGk2/X3VJDB+DGwKOAetLqyZa0hPbHAEeo+OxRcCGvHTH+etRg51nQ17rNtMUtBpuiJkRQMBmnKKiY2eH5LYyxLV2M822889lJ8opja0mgIBXM4paaAEyrdeLbZ6AxgprzDC2mgACXs0oavHXYT0qtI1tngDvweaMEbABK33//XbcMGhJExsELttaa5hYYROWCNiAkua10u+/WDoE7h6H0iZzpRFsBGyAifSwBpAsNnnsj6OiaNhqAgh4NaPo269+A8bSIdAfTuT3HWVYTGgjYANKnMAygGSxyXA8FU16h60mgIBXM+IIpQEjm020mqEeqcRWE0DAqxkhYANGNptoviytoYStJoCAVzNCwAaMbDaZzWbyNwI2QoqADTCxiWUAyWITBGwOEwEbsOIctAEki03IzmEOEwEbsOIghwEki03G05mcs4llRBQBG2DS/M9fjzmJZYDKSpPRZCo/yMxhxBIBG2GS6CglpUINYSVsNhhNoqoN2GoCCHg1o6gFeaANQVlopoEMGtCArSaAgFczilrwHmwIykKz++5Ibh+HFnra/i4QcIw1/npUl3yemOAYyNZqevswkHtKjxqxQ8BGmJ4a1coFOdmvxriCpusQuGj3pTeYrHNp5q5BwDGXnMyUMYGt0ZyMHObQELA5qz/vwmeH1AOOiS1W8x/XXRmRE8uIGQI2wjTfiPIqa0CLcYnWSNLTWNhqAgh4NaOlLZrVohxSI2lNeu9fxjHKeEgRcDxec6053JEA3juX8g04HlMEHI/XXGt9F9Z8WZg9ApoLS3NiYWYEELAZp6Wt2JFOAO+dS/UMtJ6FxswIIGAzTktb6Tdh/TaM2SPABlY8lgg4Hq+51q1mWXYot5KA4PylWhfp78uOtf6y0BECTrDK7EQngLfkUs5Ax+eJgOMz+3MFCd8TwFtyKY/P8Xki4PjMeIxOyGzZ5VFZ0auO6J+YOQEEbM5qactGpShHe5WEvXC5Cle/AWtNpNGYXWhTj0DApqQW2lVLBTnYKUcpZzG7BDSxe7szlAdCCleCRcArEb1twFnoNaCtcUmnP5Yripx9SA4Bx3SsSqkgpwfEBMfEtnZzzcyhu9PYcgIIOKZncP45JrCEzfV9+AeFzt6liIBjOFi9WpRjIpBiELPT9L8XHO54jyQCjuFjBC/EgGWxqRY604Jn2FsCCNjQKzTm6OtxQ3IEHxkSs9eMO/D7LBGwoZ+pcL8eIWBDXNaaTSYz+X5NqVEeoRO6FAJOCHDNy3vDiVzcUaUBAa/pQK8vIy+0BYgxu9DvwPo9GFtOgEfoGJ7R2inLTq0U4wqaJiEwnszknMfnDxEi4Jge9p+TRswraL4ugZsHPU7JIY6P+CHgmN71uVWVcpEsHDGxxW4+HE/lJwc4VnJDwCsRzTfQWsF6GovPSTHBxWyup6+ISloNDQGvZvSmxU69KK0mIYRroDO6hI0rI0xRIwRszmqu5X6zLHvkw1qT3vuXaRjhXYf3XlOwCNiU1JJ2u/WSHDTLCXrg0tcEHrojuaEucCynQMCxcL1tXCnmpbVbIbA/AUc95qy7zRT1jg8RAcdntvQKzQ+td+MSGTqMiapwNYn7Zbsv+s0Xi08AAcdn9uEVxAubAX3sjeT6YWjWmFbvEkDAlp2Dag1mQPV8s55zxpIRQMDJ+L25Wt+JT1s1y71uV3ez2Uw0BzQhvsnXFQEnZ/imBwL/P4ba7ozkrsPjsw3XQ8A2KC70cbhTkWatuIGet6NLPSKpRyWx5AQQcHKGb3ooFvJydshj9DK0JKmz63AI2C7PP7192q9KldKjb+j+uu3JYMTd15bbIWBbJBf6qVeKckzJlTkq1D+y72wI2D7TPz1+btU4ofWKrx7Y6A74dGTT5RCwTZoLfVGC5QWIpoX9ftkVzlvZdTgEbJfnXG+agVbvwhyvlOi4JHdf+86GgO0znetRN7J0QyvLNp5M5fy6l2UEG/vtCHhjaF86/rRfk2o5u2VI+e67OSdDwJtj+6fnYiEnejori9btj+WSEqEbW3oEvDG08x3vNUqy38hW8L8W6j7XM88pMc7iMAg4pVXXDa2zo7oU8tkprkRuq807FwLePOO5Eb5lpECaZtjQvM7YZgkg4M3yfdN7FvJo6Xnnn7c9wgVT8C0EnALkxSFO9qpSq2xvcvjvV13R919s8wQQ8OYZvxlBk8KfHmznMUs+GaXrUAg4Xd4vn5byOfl0UBUNPdwG0/vtJWlyUl9KBJw68pcBS4V8JOLQd6Y1yujqnqOSLlwJAbug/mpMFfHpQVXygX5e0vxWl+0BCeoc+RECdgT+9bB6B/5yWBMtnBaS6Z1XA/RJj+Nu1RCwO/ZzI6t2/zpsSD6QV+KJFt++IbOka/dBwK5XYGH8EBLi3WtWye6Q77we+A4C9mARFqegIYjHuxXv3ov1kfmi3Zc+Cdm98RoE7M1SzE9EN7X2GyXZqZW8mKHmcb7vjrjrerEaL5NAwJ4tyOJ0ysV8lNXDlWkqHD2cQfExVyvw8bgI2M91mZuVywAIFe75dTcAStmcIgIOYN1dZrdEwH47CAL2e32i2R3tVkQzXLowBOyCuvmYCNiclbOWLkMQEbCzZTcaGAEbYXLbyGV+aQTsdu1XjY6AVxHy4P9XSnpe2s1ONAL2wAE+mAIC9nt9otm5/JSEgP12EATs9/pEs9PKDl8cfQtGwH47CAL2e32eBFzIR9FKLgwBu6BuPiYCNmflrKXLxPAI2NmyGw2MgI0wuW2EgN3y93l0BOzz6vw7NwQcwCI5miICdgQ+zrAIOA6tbLVFwAGst0sBa35nzfOM+UkAAfu5Ln9mVa8UoyTwTUdnoXUiKmItk9IdjD2nlb3pIWAP11wzclRL+SiY36dslZqJQwP7B6Oph9SyOSUE7MG6azbKUjEntUpRdmsl8T055WA8lbvHoQxHU9GAf8wdAQTsgL0KVEWrRyT3m+Xoz1BtOJ7IzcNIxpNpVAdY80Sj6fRWEwGnxFrzth/sVKRWLgRficEEWXRf/nNzfhL1s8C17pkKXh/F+6NJdCfH1iOAgNfjJhohVCkVorunvqc+p2TP5XLRI7AKVv/9+c81h8nUZSpyfSSfTkUms2mU/fKhO+Yx/QMvQMAfwNHH3GatGIm1kM+Lfs7Rv/P9HXXbVK+P5XqkczSZSm8wkcc+u+HPa4yAX3m73jF3a0Up/3t3Db3o2LYJ+fn36J1axax36E5/nOnSLpkXsN5V9VurfmfVsD0sPAJ6d37sjaQ7nMhonK336UwKWB+Bq6WC7DVK0Xsstj0EBqOJtLuj6O6chd3wTAlYN5vqlYK0mhXeY7dHs0t/yXQ6k+uHp7Kn2yzkTAhY77h6qumgWd5yt+XnLRLQDbCnek7b+Wi99QLW91vNq8zOcbbFPZnN5Md1N/pEtU22tQIuFXJyvFdlY2qbvNXCb+kNxnLZHrycMbHQp8sutlLA+qisj8zcdV26lr9j6ymw64fhVpRJ3SoB6ybVyV6FnWV/tePVzNpaqLwz9GpOcSezNQLWz0En+5XopBQGAVMCukt92e4Hu1O9FQLWjarjvYrpmtEOAnME9JH6120/SlwQmgUvYJd1g0JbbOb7PgHdnf5x0w1OxEELGPEiSdsENP9XSHfiYAXc0O+7PDbb9t/M9xfanThIAWsM7ulBNYq3xSBgm4C+E/+86UkIr8TBCVg1e9aqS6GAeG07Lv29EOgNx3JxN/AeSXAC/rRfFc3aiEFg0wQ0qkmT9/lsQQmYTSufXWn75qYflS7v+lFEk68WjID1gMZfR3WOR/rqSVs6L00WoJ+XfA1JDEbAelBDD2xgEEibgObh0pBEHy0IAbusDeTjojGn9AmcX3ejxHq+WRACZuPKN7fJ3nx8LfLmvYA10dyXVi17HsMv9o7A1X1fOn2/NrS8F3Br5ym2F4OAawK6kaVHLX2qB+W1gNl5du2yjL9I4Pp+4FViea8FzHdfBOQbAb37nkd3YT9m5rWAT/aqUXFrDAI+EdAEAN2BH+/C3gpYTzp/PWn8KRrm0wIyl2wTGI6fgh18MG8FrAnYNaskBgEfCfy67UXlUV2btwJu7VRkp8bJK9cOwvjLCdx3R3LrQaCDtwL+dFCN6hdhEPCRgC8HO7wV8NejelQ4G4OArwQuPIhU8lLAxXxOzo7qvq4b84JAROChN5KbB7fxwl4KmA0sFBICAU29c37tdjfaSwHvN8pR7V4MAr4T0IJpI4dRSl4KWKsJ6iksDAK+E9CUO5p6x5V5KWDCB125A+PGJdAfTuT3nbtgfy8FfHpQk0opH5cl7SGQOgEN8tdgf1fmpYA/t2qiuZ8xCIRA4O9LzZnlJrrBSwF/OaxJqYCAQ3Be5ihRdUNXwQ1eCvjssC6aBwuDQAgEHnujqGC4C/NSwJo+tsApLBf+wJhrEHAZneSlgL8e1ynUvYYjcYkbAi43srwU8LfjBgnc3fgio65BYDqdyT9XbnaivROwvvl+O2msgZFLIOCOwH8vOk4G907A+u6r78AYBEIi4KowuHcCJg90SG7LXJ8JaFCDBjekbd4JWIP4NZgfg0BIBH7c9GQ0RsBREIMGM2AQCImAJrnTz0lpm3d3YM2DpfmwMAiERODXbV8Go/RTzXonYGKBQ3Jb5vpMQCOSNDIpbfNOwK1mRXbqxAKn7QiMl4wAAv6X39FeRRoU8k7mTVydOoGLu4H0huPUx/XuDkwwf+o+wIAWCFy2B9IdIGAhFtiCN9FF6gSu2gPpIGCJinnrYQ4MAiERcFV21LtHaIL5Q3Jb5vpMQOOBNS44bfNOwGeHNSmSjSNtP2C8hAQ0wbsmek/bPBQw2TjSdgLGS05AC51pwbO0zTsBk40jbRdgPBsE7h5H0u6mn1YHAdtYPfrIPIF2ZyR3HQQcxQKTDyvzeggOgFZn0CoNaZt3d2DyYaXtAoxng4Crgt8I2Mbq0UfmCbgqNeqdgL8d1yWXIyd05hURGABXuaE9FDAZKQPzXaYrIp3+WK7uB6mzQMCpI2fAbSSg56D1PHTa5p+ATxrCA3TabsB4SQloJJJGJKVt3gn4P+SETtsHGM8Cgd5wIhcO6gQjYAuLRxcQcFXoGwHjexCwQEAT2mliu7RNBfw/8uO0GNPcEQIAAAAASUVORK5CYII=",
      },
      {
        "label": "字体图标",
        "value": "icon",
        "_default_parts_icon": "ri-account-circle-fill",
        "type": "cardPart",
        "component": "pageItem"
      },
      // {
      //   "label": "金额",
      //   "value": "money",
      //   "type": "cardPart",
      //   "component":"pageItem"
      // },
      // {
      //   "label": "块元素",
      //   "value": "block",
      //   "type": "cardPart",
      //   "component":"pageItem"
      // },
      // {
      //   "label": "行元素",
      //   "value": "row",
      //   "type": "cardPart",
      //   "component":"pageItem"
      // },
      {
        "label": "变量",
        "value": "variable",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_text": "变量"
      },
      {
        "label": "星级评分",
        "value": "rate",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_text": "3"
      },
      {
        "label": "进度条",
        "value": "progress",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_text": "50"

      },
      {
        "label": "富文本",
        "value": "富文本",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_text": "<b>富文本</b>"
      },
      // {
      //   "label": "切换按钮",
      //   "value": "切换按钮",
      //   "type":"switch"
      // },
      // {
      //   "label": "接口多字段显示区",
      //   "value": "接口多字段显示区",
      //   "type":"cols"
      // },
      // {
      //   "label": "数据行按钮区",
      //   "value": "数据行按钮区",
      //   "type":"rowBtns"
      // },
      {
        "label": "时间日期",
        "value": "时间日期",
        "type": "cardPart",
        "component": "pageItem",
        "_default_parts_text": new Date().toLocaleString()
      },
      {
        "label": "视频",
        "value": "视频",
        "type": "cardPart",
        "component": "pageItem"
      },
      {
        "label": "音频",
        "value": "音频",
        "type": "cardPart",
        "component": "pageItem"
      }
    ]
  },
  {
    value: "others",
    label: "其它",
    comList: [
      {
        label: "悬浮组件",
        value: "悬浮组件",
        icon: "ri-radio-button-fill",
        type: "悬浮组件"
      }
    ],
  },
]
