<template>
  <div :style="[gridStyle]" class="bx-card">
    <template
      v-if="
        ('static' && listOptions.indexOf('分页') !== -1) ||
        (listOptions.indexOf('分页') == -1 && index < totalMaximum)
      "
      v-for="(cellItemData, index) in cellDataRun"
    >
      <div
        v-for="(cellLayoutJson, i) in cellsLayout"
        :key="index + i"
        class="bx-card-cell"
        :class="{
          checked:
            pageItem &&
            pageItem._refedCol &&
            currentRadio === cellItemData[pageItem._refedCol],
          'is-link': cellLayoutJson && cellLayoutJson.jump_json,
        }"
        :style="[
          cellLayoutJson.style_json
            ? buildColStyleJson(cellLayoutJson.style_json, null, cellLayoutJson)
            : buildColStyleJson(null, null, cellLayoutJson),
        ]"
        v-on:click="onClickCell(cellItemData, cellLayoutJson)"
      >
        <!-- @click.stop="onClickCell(cellItemData,cellLayoutJson)"  -->
        <!-- <div class="radio-box" v-if="pageItem&&pageItem.selectedType==='fkSelector'">
            <radio color="#007AFF" :class="currentRadio===cellItemData[pageItem._refedCol]?'checked blue':'blue'"
              :checked="currentRadio===cellItemData[pageItem._refedCol]?true:false"
              :value="cellItemData[pageItem._refedCol]"></radio>
          </div> -->

        <template
          v-for="(item, n) in cellLayoutJson.parts_json"
          :style="item.parts_type == 'iconImg' ? `display: inline-flex;` : ''"
        >
          <div
            v-if="
              ['视频'].includes(item.parts_type) &&
              partsShow(item, comColMap, cellItemData)
            "
          >
            <video
              controls
              :src="getPartModelData(item, comColMap, cellItemData)"
            ></video>
          </div>
          <div
            v-else-if="
              ['string', '时间日期'].includes(item.parts_type) &&
              partsShow(item, comColMap, cellItemData)
            "
            class="bx-cell-string"
            @click.stop="onClickSubBlock(cellItemData, item, cellLayoutJson)"
            :style="[buildColStyleJson(item.style_json)]"
          >
            {{ getPartModelData(item, comColMap, cellItemData) }}
          </div>
          <div
            v-else-if="
              item.parts_type == 'variable' &&
              partsShow(item, comColMap, cellItemData)
            "
            :class="'bx-cell-' + item.parts_type"
            @click.stop="onClickSubBlock(cellItemData, item, cellLayoutJson)"
            :style="[buildColStyleJson(item.style_json)]"
          >
            {{ getPartModelData(item, comColMap, cellItemData) }}
          </div>
          <el-image
            v-else-if="
              item.parts_type == 'iconImg' &&
              partsShow(item, comColMap, cellItemData)
            "
            @click.stop="onClickSubBlock(cellItemData, item, cellLayoutJson)"
            :loading-img="getImagePath(item.parts_img)"
            :height="
              buildColStyleJson(item.style_json || null).height || 'auto'
            "
            :width="buildColStyleJson(item.style_json || null).width || '100%'"
            :border-radius="
              buildColStyleJson(item.style_json || null)['border-radius']
            "
            :src="
              getImagePath(getPartModelData(item, comColMap, cellItemData), 150)
            "
            class="demo-layout bx-text-cell"
            :style="[buildColStyleJson(item.style_json || null)]"
            mode="aspectFill"
            img-mode="aspectFill"
          ></el-image>
          <el-rate
            :disabled="true"
            v-else-if="item.parts_type == 'rate'"
            :count="5"
            :value="
              Number(getPartModelData(item, comColMap, cellItemData)) || 0
            "
          ></el-rate>
          <el-progress
            :show-text="false"
            :style="[buildColStyleJson(item.style_json || null)]"
            v-else-if="item.parts_type == 'progress'"
            :count="5"
            :define-back-color="
              buildColStyleJson(item.style_json || null)['background-color'] ||
              ''
            "
            :color="
              buildColStyleJson(item.style_json || null).color || '#2979ff'
            "
            :percentage="
              Number(getPartModelData(item, comColMap, cellItemData)) || 0
            "
          ></el-progress>
          <i
            v-else-if="
              item.parts_type == 'icon' &&
              partsShow(item, comColMap, cellItemData)
            "
            :class="item.parts_text"
            :style="[buildColStyleJson(item.style_json || null)]"
            @click.stop="onClickSubBlock(cellItemData, item, cellLayoutJson)"
          ></i>
          <!-- <u-parse v-else-if="item.parts_type == '富文本' && partsShow(item,comColMap,cellItemData)"
              :style="[buildColStyleJson(item.style_json || null)]"
              :html="getPartModelData(item,comColMap,cellItemData)"></u-parse> -->
          <div
            v-else-if="
              item.parts_type == '富文本' &&
              partsShow(item, comColMap, cellItemData)
            "
            :style="[buildColStyleJson(item.style_json || null)]"
            v-html="getPartModelData(item, comColMap, cellItemData)"
          ></div>
          <div
            :class="'bx-cell-' + item.parts_type"
            v-else-if="
              (item.parts_type == 'row' || item.parts_type == 'block') &&
              partsShow(item, comColMap, cellItemData) &&
              item.hasOwnProperty('sub_card_parts_json') &&
              item.sub_card_parts_json.length > 0
            "
            @click.stop="onClickSubBlock(cellItemData, item, cellLayoutJson)"
            :style="[buildColStyleJson(item.style_json || null)]"
          >
            <template v-for="(subCol, subindex) in item.sub_card_parts_json">
              <div
                v-if="
                  ['视频'].includes(subCol.parts_type) &&
                  partsShow(subCol, comColMap, cellItemData)
                "
              >
                <video
                  controls
                  :src="getPartModelData(subCol, comColMap, cellItemData)"
                ></video>
              </div>
              <div
                v-if="
                  ['string', '时间日期'].includes(subCol.parts_type) &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                class="bx-cell-string"
                @click.stop="
                  onClickSubBlock(cellItemData, subCol, cellLayoutJson, item)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
              >
                {{ getPartModelData(subCol, comColMap, cellItemData) }}
              </div>
              <div
                v-else-if="
                  subCol.parts_type == 'variable' &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                :class="'bx-cell-' + subCol.parts_type"
                @click.stop="
                  onClickSubBlock(cellItemData, subCol, cellLayoutJson, item)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
              >
                {{ getPartModelData(subCol, comColMap, cellItemData) }}
              </div>
              <el-image
                v-else-if="
                  subCol.parts_type == 'iconImg' &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                img-mode="aspectFill"
                @click.stop="
                  onClickSubBlock(cellItemData, subCol, cellLayoutJson, item)
                "
                :loading-img="getImagePath(subCol.parts_img)"
                :height="
                  buildColStyleJson(subCol.style_json || null).height || 'auto'
                "
                :width="
                  buildColStyleJson(subCol.style_json || null).width || '100%'
                "
                :src="
                  getImagePath(
                    getPartModelData(subCol, comColMap, cellItemData),
                    150
                  )
                "
                class="demo-layout bx-text-cell"
                :style="[buildColStyleJson(subCol.style_json || null)]"
              ></el-image>
              <el-rate
                :disabled="true"
                v-else-if="subCol.parts_type == 'rate'"
                :count="5"
                :value="
                  Number(getPartModelData(subCol, comColMap, cellItemData)) || 0
                "
              ></el-rate>
              <el-progress
                :show-text="false"
                :style="[buildColStyleJson(subCol.style_json || null)]"
                v-else-if="subCol.parts_type == 'progress'"
                :count="5"
                :define-back-color="
                  buildColStyleJson(subCol.style_json || null)[
                    'background-color'
                  ] || ''
                "
                :color="
                  buildColStyleJson(subCol.style_json || null).color ||
                  '#2979ff'
                "
                :percentage="
                  Number(getPartModelData(subCol, comColMap, cellItemData)) || 0
                "
              ></el-progress>
              <i
                v-else-if="
                  subCol.parts_type == 'icon' &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                :class="subCol.parts_text"
                @click.stop="
                  onClickSubBlock(cellItemData, subCol, cellLayoutJson, item)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
              >
              </i>

              <div
                v-else-if="
                  subCol.parts_type == '富文本' &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
                v-html="getPartModelData(subCol, comColMap, cellItemData)"
              ></div>
              <!-- <u-parse
                v-else-if="
                  subCol.parts_type == '富文本' &&
                  partsShow(subCol, comColMap, cellItemData)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
                :html="getPartModelData(subCol, comColMap, cellItemData)"
              ></u-parse> -->
              <div
                :class="'bx-cell-' + subCol.parts_type"
                v-else-if="
                  (subCol.parts_type == 'row' ||
                    subCol.parts_type == 'block') &&
                  partsShow(subCol, comColMap, cellItemData) &&
                  subCol.hasOwnProperty('sub_card_parts_json') &&
                  subCol.sub_card_parts_json.length > 0
                "
                @click.stop="
                  onClickSubBlock(cellItemData, subCol, cellLayoutJson, item)
                "
                :style="[buildColStyleJson(subCol.style_json || null)]"
              >
                <template
                  v-for="(ssubCol, ssubindex) in subCol.sub_card_parts_json"
                >
                  <div
                    v-if="
                      ['视频'].includes(ssubCol.parts_type) &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                  >
                    <video
                      controls
                      :src="getPartModelData(ssubCol, comColMap, cellItemData)"
                    ></video>
                  </div>
                  <div
                    :key="ssubindex"
                    v-if="
                      ['string', '时间日期'].includes(ssubCol.parts_type) &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    class="bx-cell-string"
                    @click.stop="
                      onClickSubBlock(
                        cellItemData,
                        ssubCol,
                        cellLayoutJson,
                        subCol
                      )
                    "
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                  >
                    {{ getPartModelData(ssubCol, comColMap, cellItemData) }}
                  </div>
                  <div
                    :key="ssubindex"
                    v-else-if="
                      ssubCol.parts_type == 'variable' &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    :class="'bx-cell-' + ssubCol.parts_type"
                    @click.stop="
                      onClickSubBlock(
                        cellItemData,
                        ssubCol,
                        cellLayoutJson,
                        subCol
                      )
                    "
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                  >
                    {{ getPartModelData(ssubCol, comColMap, cellItemData) }}
                  </div>
                  <el-image
                    :key="ssubindex"
                    v-else-if="
                      ssubCol.parts_type == 'iconImg' &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    img-mode="aspectFill"
                    @click.stop="
                      onClickSubBlock(
                        cellItemData,
                        ssubCol,
                        cellLayoutJson,
                        subCol
                      )
                    "
                    :loading-img="getImagePath(ssubCol.parts_img)"
                    :height="
                      buildColStyleJson(ssubCol.style_json || null).height ||
                      'auto'
                    "
                    :width="
                      buildColStyleJson(ssubCol.style_json || null).width ||
                      '100%'
                    "
                    :src="
                      getImagePath(
                        getPartModelData(ssubCol, comColMap, cellItemData),
                        150
                      )
                    "
                    class="demo-layout bx-text-cell"
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                  >
                  </el-image>
                  <el-rate
                    :key="ssubindex"
                    :disabled="true"
                    v-else-if="ssubCol.parts_type == 'rate'"
                    :count="5"
                    :value="
                      Number(
                        getPartModelData(ssubCol, comColMap, cellItemData)
                      ) || 0
                    "
                  ></el-rate>
                  <el-progress
                    :key="ssubindex"
                    :show-text="false"
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                    v-else-if="ssubCol.parts_type == 'progress'"
                    :count="5"
                    :define-back-color="
                      buildColStyleJson(ssubCol.style_json || null)[
                        'background-color'
                      ] || ''
                    "
                    :color="
                      buildColStyleJson(ssubCol.style_json || null).color ||
                      '#2979ff'
                    "
                    :percentage="
                      Number(
                        getPartModelData(ssubCol, comColMap, cellItemData)
                      ) || 0
                    "
                  ></el-progress>

                  <div
                    :key="ssubindex"
                    v-else-if="
                      ssubCol.parts_type == '富文本' &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                    v-html="getPartModelData(ssubCol, comColMap, cellItemData)"
                    @click="false"
                  ></div>
                  <!-- <u-parse
                    v-else-if="
                      ssubCol.parts_type == '富文本' &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                    :html="getPartModelData(ssubCol, comColMap, cellItemData)"
                    @click="false"
                  ></u-parse> -->
                  <i
                    :key="ssubindex"
                    v-else-if="
                      ssubCol.parts_type == 'icon' &&
                      partsShow(ssubCol, comColMap, cellItemData)
                    "
                    :class="ssubCol.parts_text"
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                    @click.stop="
                      onClickSubBlock(
                        cellItemData,
                        ssubCol,
                        cellLayoutJson,
                        subCol
                      )
                    "
                  ></i>
                  <div
                    :key="ssubindex"
                    :class="'bx-cell-' + ssubCol.parts_type"
                    v-else-if="
                      (ssubCol.parts_type == 'row' ||
                        ssubCol.parts_type == 'block') &&
                      partsShow(ssubCol, comColMap, cellItemData) &&
                      ssubCol.hasOwnProperty('sub_card_parts_json') &&
                      ssubCol.sub_card_parts_json.length > 0
                    "
                    :style="[buildColStyleJson(ssubCol.style_json || null)]"
                    @click.stop="
                      onClickSubBlock(
                        cellItemData,
                        ssubCol,
                        cellLayoutJson,
                        subCol
                      )
                    "
                  >
                    <template
                      v-for="(
                        sssubCol, sssubindex
                      ) in ssubCol.sub_card_parts_json"
                    >
                      <div
                        v-if="
                          ['视频'].includes(sssubCol.parts_type) &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                      >
                        <video
                          controls
                          :src="
                            getPartModelData(sssubCol, comColMap, cellItemData)
                          "
                        ></video>
                      </div>
                      <div
                        v-if="
                          ['string', '时间日期'].includes(
                            sssubCol.parts_type
                          ) && partsShow(sssubCol, comColMap, cellItemData)
                        "
                        class="bx-cell-string"
                        @click.stop="
                          onClickSubBlock(
                            cellItemData,
                            sssubCol,
                            cellLayoutJson,
                            ssubCol
                          )
                        "
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                      >
                        {{
                          getPartModelData(sssubCol, comColMap, cellItemData)
                        }}
                      </div>
                      <div
                        v-else-if="
                          sssubCol.parts_type == 'variable' &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                        :class="'bx-cell-' + sssubCol.parts_type"
                        @click.stop="
                          onClickSubBlock(
                            cellItemData,
                            sssubCol,
                            cellLayoutJson,
                            ssubCol
                          )
                        "
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                      >
                        {{
                          getPartModelData(sssubCol, comColMap, cellItemData)
                        }}
                      </div>
                      <el-image
                        v-else-if="
                          sssubCol.parts_type == 'iconImg' &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                        img-mode="aspectFill"
                        @click.stop="
                          onClickSubBlock(
                            cellItemData,
                            sssubCol,
                            cellLayoutJson,
                            ssubCol
                          )
                        "
                        :loading-img="getImagePath(sssubCol.parts_img)"
                        :height="
                          buildColStyleJson(sssubCol.style_json || null)
                            .height || 'auto'
                        "
                        :width="
                          buildColStyleJson(sssubCol.style_json || null)
                            .width || '100%'
                        "
                        :src="
                          getImagePath(
                            getPartModelData(sssubCol, comColMap, cellItemData),
                            150
                          )
                        "
                        class="demo-layout bx-text-cell"
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                      >
                      </el-image>
                      <el-rate
                        :disabled="true"
                        v-else-if="sssubCol.parts_type == 'rate'"
                        :count="5"
                        :value="
                          Number(
                            getPartModelData(sssubCol, comColMap, cellItemData)
                          ) || 0
                        "
                      ></el-rate>
                      <el-progress
                        :show-text="false"
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                        v-else-if="sssubCol.parts_type == 'progress'"
                        :count="5"
                        :define-back-color="
                          buildColStyleJson(sssubCol.style_json || null)[
                            'background-color'
                          ] || ''
                        "
                        :color="
                          buildColStyleJson(sssubCol.style_json || null)
                            .color || '#2979ff'
                        "
                        :percentage="
                          Number(
                            getPartModelData(sssubCol, comColMap, cellItemData)
                          ) || 0
                        "
                      ></el-progress>
                      <i
                        v-else-if="
                          sssubCol.parts_type == 'icon' &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                        :class="sssubCol.parts_text"
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                        @click.stop="
                          onClickSubBlock(
                            cellItemData,
                            sssubCol,
                            cellLayoutJson,
                            ssubCol
                          )
                        "
                      ></i>
                      <div
                        v-else-if="
                          sssubCol.parts_type == '富文本' &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                        v-show="partsShow(sssubCol, comColMap, cellItemData)"
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                        v-html="
                          getPartModelData(sssubCol, comColMap, cellItemData)
                        "
                        @click="false"
                      ></div>
                      <!-- <u-parse
                        v-else-if="
                          sssubCol.parts_type == '富文本' &&
                          partsShow(sssubCol, comColMap, cellItemData)
                        "
                        v-show="partsShow(sssubCol, comColMap, cellItemData)"
                        :style="[
                          buildColStyleJson(sssubCol.style_json || null),
                        ]"
                        :html="
                          getPartModelData(sssubCol, comColMap, cellItemData)
                        "
                        @click="false"
                      ></u-parse> -->
                      <div
                        :class="'bx-cell-' + sssubCol.parts_type"
                        v-else-if="
                          (sssubCol.parts_type == 'row' ||
                            sssubCol.parts_type == 'block') &&
                          partsShow(sssubCol, comColMap, cellItemData) &&
                          sssubCol.hasOwnProperty('sub_card_parts_json') &&
                          sssubCol.sub_card_parts_json.length > 0
                        "
                        :style="[buildColStyleJson(ssubCol.style_json || null)]"
                        @click.stop="
                          onClickSubBlock(
                            cellItemData,
                            sssubCol,
                            cellLayoutJson,
                            ssubCol
                          )
                        "
                      >
                        <template
                          v-for="(
                            sssubCol4, sssub4index
                          ) in sssubCol.sub_card_parts_json"
                        >
                          <div
                            v-if="
                              ['视频'].includes(sssubCol4.parts_type) &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                          >
                            <video
                              controls
                              :src="
                                getPartModelData(
                                  sssubCol4,
                                  comColMap,
                                  cellItemData
                                )
                              "
                            ></video>
                          </div>
                          <div
                            v-if="
                              ['string', '时间日期'].includes(
                                sssubCol4.parts_type
                              ) && partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            class="bx-cell-string"
                            @click.stop="
                              onClickSubBlock(
                                cellItemData,
                                sssubCol4,
                                cellLayoutJson,
                                sssubCol
                              )
                            "
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                          >
                            {{
                              getPartModelData(
                                sssubCol4,
                                comColMap,
                                cellItemData
                              )
                            }}
                          </div>
                          <div
                            v-else-if="
                              sssubCol4.parts_type == 'variable' &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            :class="'bx-cell-' + sssubCol4.parts_type"
                            @click.stop="
                              onClickSubBlock(
                                cellItemData,
                                sssubCol4,
                                cellLayoutJson,
                                sssubCol
                              )
                            "
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                          >
                            {{
                              getPartModelData(
                                sssubCol4,
                                comColMap,
                                cellItemData
                              )
                            }}
                          </div>
                          <el-image
                            v-else-if="
                              sssubCol4.parts_type == 'iconImg' &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            img-mode="aspectFill"
                            @click.stop="
                              onClickSubBlock(
                                cellItemData,
                                sssubCol4,
                                cellLayoutJson,
                                sssubCol
                              )
                            "
                            :loading-img="getImagePath(sssubCol4.parts_img)"
                            :height="
                              buildColStyleJson(sssubCol4.style_json || null)
                                .height || 'auto'
                            "
                            :width="
                              buildColStyleJson(sssubCol4.style_json || null)
                                .width || '100%'
                            "
                            :src="
                              getImagePath(
                                getPartModelData(
                                  sssubCol4,
                                  comColMap,
                                  cellItemData
                                ),
                                150
                              )
                            "
                            class="demo-layout bx-text-cell"
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                            lazy
                          >
                          </el-image>
                          <el-rate
                            :disabled="true"
                            v-else-if="sssubCol4.parts_type == 'rate'"
                            :count="5"
                            :value="
                              Number(
                                getPartModelData(
                                  sssubCol4,
                                  comColMap,
                                  cellItemData
                                )
                              ) || 0
                            "
                          ></el-rate>
                          <el-progress
                            :show-text="false"
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                            v-else-if="sssubCol4.parts_type == 'progress'"
                            :count="5"
                            :define-back-color="
                              buildColStyleJson(sssubCol4.style_json || null)[
                                'background-color'
                              ] || ''
                            "
                            :color="
                              buildColStyleJson(sssubCol4.style_json || null)
                                .color || '#2979ff'
                            "
                            :percentage="
                              Number(
                                getPartModelData(
                                  sssubCol4,
                                  comColMap,
                                  cellItemData
                                )
                              ) || 0
                            "
                          ></el-progress>
                          <i
                            v-else-if="
                              sssubCol4.parts_type == 'icon' &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            :class="sssubCol4.parts_text"
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                            @click.stop="
                              onClickSubBlock(
                                cellItemData,
                                sssubCol4,
                                cellLayoutJson,
                                sssubCol
                              )
                            "
                          ></i>
                          <div
                            v-else-if="
                              sssubCol4.parts_type == '富文本' &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            v-show="
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                            v-html="
                              getPartModelData(
                                sssubCol4,
                                comColMap,
                                cellItemData
                              )
                            "
                            @click="false"
                          ></div>
                          <!-- <u-parse
                            v-else-if="
                              sssubCol4.parts_type == '富文本' &&
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            v-show="
                              partsShow(sssubCol4, comColMap, cellItemData)
                            "
                            :style="[
                              buildColStyleJson(sssubCol4.style_json || null),
                            ]"
                            :html="
                              getPartModelData(
                                sssubCol4,
                                comColMap,
                                cellItemData
                              )
                            "
                            @click="false"
                          ></u-parse> -->
                        </template>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </template>
        <slot name="footer"></slot>
      </div>
      <!-- <div class="uni-footer text-right flex justify-end flex-wrap" v-if="showRowButtons && !readOnly">
          <div v-for="(button,ib) in rowButtons" class="padding-right-xs" :key="ib"
            v-show="getButtonVisible(cellItemData,button,ib)">
            <button class="mini-btn" type="primary" size="mini"
              @click.stop="onRowButton({row:cellItemData,button:button,index:index})">{{button.button_name}}</button>
          </div>
        </div> -->
    </template>
    <!-- <uni-popup ref="updateFormPopup" type="bottom" style="z-index: 9999999;">
        <div class="update-title" v-if="updateTitle">
          {{updateTitle}}
        </div>
        <div class="popup-form-warp">
          <bxform :backAfterSubmit="false" :serviceName="updateService" :pk="updateDataVal" :pkCol="updateDatakey"
            type="update" :appName="srvApp" @on-submit="onSubmitForm" @cols-v2-loaded="v2Loaded"
            v-if="updateService&&updateDataVal" />
        </div>
      </uni-popup> -->

    <!-- <teleport to="#app" v-if="dialogVisible">

  </teleport> -->
    <el-dialog
      title=""
      :visible.sync="dialogVisible"
      append-to-body
      fullscreen
      v-if="dialogUrl && dialogVisible"
    >
      <iframe
        :src="dialogUrl"
        frameborder="0"
        style="width: 100%; height: 80vh"
      ></iframe>
    </el-dialog>
  </div>
</template>
<script>
/**
 *
 * @description "card-group-cell" 支持灵活配置样式的布局单元
 * @tutorial
 * @property {Object} pageItem = {} 公共组件参数  #废弃
 * @property {Object} cellData = {} 单元 data {}
 * @property {Array} cellsLayout = {} 单元布局配置[{}]
 * @property {Object} cardLayout = {} 组件 card_layout_json
 * @property {Object} comColMap = {}  字段值映射关系
 * @property {Boolean} cellLayoutRepeat = false  单元布局是否重复,暂未启用
 * @property {Boolean} readOnly = false  是否只读，只读 = true 时，拦截所有点击事件。
 * @event {Function} on-click-cell 点击单元事件
 * @event {Function} on-click-sub-block 点击row 部件 事件
 * @event {Function} on-click-icon 点击icon类型 部件 事件
 * @example  import cardGroupCell from '@/components/card-group-cell/card-group-cell.vue'
 * <cardGroupCell ref="cardGroupCell" @on-click-cell="onClickCell" @on-click-block="onClickBlock"  @on-click-icon="onClickBlock"></cardGroupCell>
 */
// import {
//   debounce,
//   throttle
// } from '@/common/func/util.js'

// import cardGroupCellItem from '@/components/card-group-cell-item/card-group-cell-item.vue'
// import bxform from '@/views/custom/components/bx-form/bx-form.vue'
var self = null;
import Teleport from "vue2-teleport";

import cardGroupCellMxin from "./card-group-cell-mixin.js"; // 新的确实方法依赖 混入
import dayjs from "dayjs";
// import { mapGetters, } from "vuex";
export default {
  components: {
    Teleport,
    // cardGroupCellItem
    // bxform
    // bxForm: () => import('@/views/custom/components/bx-form/bx-form.vue') //剔除 原小程序form组件
  },
  name: "card-group-cell",
  mixins: [cardGroupCellMxin],

  data() {
    return {
      updateService: "",
      updateDatakey: "id",
      updateDataVal: "",
      updateTitle: "",
      activeMode: null,
      dialogPosition: null,
      dialogVisible: false,
      dialogUrl: "",
    };
  },
  props: {
    pageParamsModel: {
      type: Object,
    },
    readOnly: {
      type: Boolean,
      default() {
        return false;
      },
    },
    listOptions: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    rowButtons: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    pageItem: {
      type: Object,
      default: null,
    },
    cellData: {
      type: [Object, Array],
      default: null,
    },
    comColMap: {
      type: Object,
      default: null,
    },
    cellsLayout: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    cardLayout: {
      type: Object,
    },
    selectorMode: {
      type: String,
    },
    listUseType: {
      type: String,
    },
    currentRadio: {
      type: String,
    },
    queryOptions: {
      type: Object,
    },
    // cellLayoutRepeat:{
    // 	type:Boolean,
    // 	default:function(){
    // 		return false
    // 	}
    // }               // repeat：重复布局，配置一个单元布局，其余数据按照该单元循环  static:静态布局，按照配置单元渲染界面，不会重复
  },
  computed: {
    showRowButtons() {
      let show = false;
      if (this.pageItem && this.pageItem.com_type == "list") {
        if (
          this.pageItem.list_json.list_options &&
          this.pageItem.list_json.list_options.indexOf("单元按钮") !== -1 &&
          this.rowButtons.length > 0
        ) {
          show = true;
        }
      }
      return show;
    },
    comColMapRun: function () {
      let configJson = this.comColMap;
      let maps = this.paramsBuild(configJson);
      // console.log('comColMapRun',maps)
      //  url   sys user page com srv_col srv_cond
      // let target = configJson?.dest_owner  // 目标
      // let source = configJson?.src_owner  // 源
      // let map = configJson?.cols_map_json || {}
      return maps;
    },
    cells: function () {
      return this.cellsLayout || [];
    },
    cellStyle: function () {
      let style =
        this.cardLayout && this.cardLayout?.style_json
          ? this.cardLayout?.style_json
          : {};
      return style;
    },
    totalMaximum: function () {
      let config = this.cardLayout || {};
      config.rows_max = Number(config?.rows_max);
      let maxPageRowNumber = this.pageItem?.srv_req_json?.page?.rownumber || 9;
      let maximum =
        config && config.rows_max && config.cols_num
          ? config["rows_max"] * config["cols_num"]
          : maxPageRowNumber;
      if (config["rows_max"] == "0" || config["rows_max"] == "全部") {
        maximum = maxPageRowNumber;
      }
      return maximum;
    },
    gridStyle: function () {
      let style = {};
      let config = this.cardLayout || {
        rows_max: 1,
        cols_num: 1,
      };
      // console.log('config',config)
      let height =
        config.hasOwnProperty("style_json") &&
        config.style_json.hasOwnProperty("height")
          ? config.style_json.height
          : "auto";
      let configStyle = config["style_json"] || {};
      if (config.layout_type == "表格") {
        style["display"] = "grid";
        if (config["rows_max"]) {
          style[
            "grid-template-rows"
          ] = `repeat(${config["rows_max"]},${height})`;
        }

        style["grid-template-columns"] = `repeat(${config["cols_num"]}, 1fr)`;
      }
      for (let arr in configStyle) {
        if (configStyle[arr]) {
          style[arr.replace(/_/g, "-")] = configStyle[arr];
        }
      }
      if (Object.keys(style).indexOf("gap") == -1) {
        style["gap"] = "5px";
      }
      let style_json_diy = config.style_json_diy || {};
      if (Object.keys(style_json_diy).indexOf("gap") !== -1) {
        style["gap"] = style_json_diy["gap"];
      }
      if (Object.keys(style_json_diy).indexOf("column-gap") !== -1) {
        style["column-gap"] = style_json_diy["column-gap"];
      }
      if (Object.keys(style_json_diy).indexOf("row-gap") !== -1) {
        style["row-gap"] = style_json_diy["row-gap"];
      }
      style["margin"] = 0;
      return style;
    },
    cellDataRun: function () {
      let data = this.cellData;
      if (data && !Array.isArray(data)) {
        return [data];
      } else if (data.length > 0) {
        return data;
      } else if (this.pageItem.com_type !== "list") {
        return [""];
      } else {
        return data;
      }
    },
    srvApp() {
      return (
        this.pageItem?.srv_req_json?.mapp || uni.getStorageSync("activeApp")
      );
    },
  },
  created() {
    // self = this
  },
  methods: {
    recoverFileAddress(val = "") {
      if (typeof val !== "string") {
        return val;
      }
      if (
        val &&
        typeof val === "string" &&
        val.indexOf("$bxFileAddress$") === -1
      ) {
        return val;
      }
      // 替换文件前缀
      const prefix = this.serviceApi().downloadFilePrefix;
      val = val?.replaceAll?.("$bxFileAddress$", prefix) || "";
      // 使用正则表达式来匹配 bx_auth_ticket 的值，并使用sessionStorage.bx_auth_ticket替换它
      const ticketStr = `bx_auth_ticket=${sessionStorage.bx_auth_ticket}`;
      val = val.replace(/(bx_auth_ticket=)[^&]+/gi, ticketStr);
      // console.log('getPartModelData:recoverFileAddress:', val);

      return val;
    },
    paramsBuild(json) {
      if (!json) {
        return;
      }
      let configJson = json;
      //  url   sys user page com srv_col srv_cond
      let target = configJson?.dest_owner; // 目标
      let source = configJson?.src_owner; // 源
      let map = configJson?.cols_map_json || {};
      let maps = {
        target: {},
        source: {},
      };
      maps["target"][target] = map;
      return maps;
    },
    v2Loaded(e) {
      this.updateTitle = e?.service_view_name;
      console.log(e);
    },
    onSubmitForm(e) {
      // 表单提交
      this.$emit("data-updated", e); //通知父组件数据更新完成
      console.log("表单提交成功：：：", e);
      this.closeUpdateFormPopup();
    },
    openUpdateFormPopup(id, service) {
      // id = '13'
      // service = 'srvwuliu_car_update'
      if (id && service) {
        this.updateService = service;
        this.updateDataVal = id;
        this.$refs?.updateFormPopup?.open();
      }
    },
    closeUpdateFormPopup() {
      this.updateService = null;
      this.updateDataVal = null;
      this.updateTitle = null;
      this.$refs?.updateFormPopup?.close();
    },
    getButtonVisible(cellItemData, button, ib) {
      // listCard、cardGroupCell组件统一不显示详情按钮 230824
      if (button?.button_type === "detail") {
        return false;
      }
      if (
        Array.isArray(cellItemData?._buttons) &&
        cellItemData._buttons.length >= ib + 1
      ) {
        return cellItemData["_buttons"][ib] === 1;
      } else {
        return false;
        console.log(
          cellItemData,
          "getButtonVisible---->cellItemDatacellItemDatacellItemData"
        );
        return (
          button.permission &&
          (!button.hasOwnProperty("visible") || button?.visible === "是")
        );
      }
    },
    onRowButton(e) {
      if (this.readOnly) {
        return;
      }
      this.$emit("on-row-button-click", e);
    },
    onClickCell(item, cellLayoutJson) {
      console.log("bx-card-cell");
      // 设置选中数据
      this.$set(this, "activeMode", item);
      this.$emit("on-click-cell", {
        data: item,
        cellsLayout: cellLayoutJson,
      });
    },
    // onClickCell: throttle(function(item, cellLayoutJson) {
    //   if (this.readOnly) {
    //     return
    //   }
    //   if (this.pageItem?.selectedType === 'fkSelector') {
    //     this.$emit('on-click-cell', {
    //       detail: {
    //         data: item,
    //         value: item[this.pageItem._refedCol]
    //       }
    //     })
    //     return
    //   }
    //   this.$emit('on-click-cell', {
    //     data: item,
    //     cellsLayout: cellLayoutJson
    //   })

    // }, 200, true),
    onClickSubBlock(itemData, subCol, cellLayoutJson, parentCol, originCol) {
      console.log("onClickSubBlock");
      if (
        (!subCol?.sys_fun || subCol?.sys_fun === "无") &&
        !subCol?.jump_json
      ) {
        // 如果沒有配置系統功能 也没配置跳转 将事件传递到父部件
        if (parentCol) {
          return this.onClickSubBlock(
            itemData,
            parentCol,
            cellLayoutJson,
            null,
            subCol
          );
        }
        // 没有父部件配置 点击事件传到卡片单元
        return this.onClickCell(itemData, cellLayoutJson);
      } else if (subCol?.jump_json) {
        // 执行自定义跳转
        // this.jumpAction(subCol?.jump_json, itemData)
        console.log("自定义跳转");
        // this.$emit('on-click-cell',{
        //   data: itemData,
        //   cellsLayout: cellLayoutJson,
        //   jump_json: subCol?.jump_json
        // })
        if (
          subCol?.jump_json?.click_type === "弹框" ||
          subCol?.jump_json?.click_type === "跳转"
        ) {
          const element = this.$el;
          const rect = element.getBoundingClientRect();
          const x = rect.left;
          const y = rect.top;
          const w = rect.width;
          const h = rect.height;
          console.log("弹框:", x, y, w, h);
          const jumpJson = subCol.jump_json;
          const data = itemData;
          if (jumpJson.tmpl_page_json?.file_path) {
            let pagePath = jumpJson.tmpl_page_json.file_path;
            if (jumpJson.dest_page_no) {
              pagePath = pagePath.replace(":pageNo", jumpJson.dest_page_no);
            }
            if (jumpJson.cols_map_json?.cols_map_detail_json?.length) {
              const mapJson = jumpJson.cols_map_json?.cols_map_detail_json;
              mapJson.forEach((item) => {
                if (
                  item.to_type === "URL" &&
                  ["当前数据", "业务", "模型"].includes(item.from_type) &&
                  data?.[item.col_from]
                ) {
                  pagePath?.includes("?")
                    ? (pagePath += `&${item.col_to}=${data[item.col_from]}`)
                    : (pagePath += `?${item.col_to}=${data[item.col_from]}`);
                  // pagePath += `&${item.col_to}=${data[item.col_from]}`;
                }
              });
            }
            if (pagePath) {
              if (subCol?.jump_json?.click_type === "弹框") {
                this.dialogUrl = pagePath;
                this.dialogPosition = {
                  x,
                  y,
                  w,
                  h,
                };
                this.dialogVisible = true;
              } else {
                if (jumpJson?.click_jump_option?.includes("先登录")) {
                  if (this.$store.state?.loginInfo?.logined !== true) {
                    // 您还未登录,需要登录才能进入,点击确认前往登录
                    this.$message
                      .confirm(
                        "您还未登录,需要登录才能进入,点击确认前往登录",
                        "提示",
                        {
                          confirmButtonText: "确定",
                          cancelButtonText: "取消",
                          type: "warning",
                        }
                      )
                      .then(() => {
                        const currentUrl =
                          window.location.pathname + window.location.hash;
                        sessionStorage.setItem(
                          "login_redirect_url",
                          currentUrl
                        );
                        const loginUrl =
                          window.location.origin + "/main/login.html";
                        window.location.href = loginUrl;
                      });
                    return;
                  }
                }
                open(pagePath);
              }
            }
          }
        }
      }
    },
    // onClickSubBlock: throttle(function(itemData, subCol, cellLayoutJson, parentCol, originCol) {
    //   if (this.readOnly) {
    //     return
    //   }
    //   if ((!subCol?.sys_fun || subCol?.sys_fun === '无') && !subCol?.jump_json) {
    //     // 如果沒有配置系統功能 也没配置跳转 将事件传递到父部件
    //     if (parentCol) {
    //       return this.onClickSubBlock(itemData, parentCol, cellLayoutJson, null, subCol)
    //     }
    //     // 没有父部件配置 点击事件传到卡片单元
    //     return this.onClickCell(itemData, cellLayoutJson)
    //   } else if (subCol?.jump_json) {
    //     // 执行自定义跳转
    //     this.jumpAction(subCol?.jump_json, itemData)
    //   }
    //   let type = '';
    //   let optionsType = '';
    //   let text = '';
    //   let item = itemData;
    //   if (subCol) {
    //     type = subCol.parts_type
    //     text = subCol.card_parts_name
    //     if (subCol.hasOwnProperty('sys_fun') && subCol.sys_fun) {
    //       optionsType = subCol.sys_fun
    //     }
    //   }
    //   let map = this.comColMap
    //   let val = null
    //   switch (optionsType) {
    //     case '拨打电话':
    //       // val = this.getPartModelData(subCol, map, item)
    //       val = itemData[subCol.para_phone_col]
    //       console.log('拨打电话', val)
    //       if (val) {
    //         uni.makePhoneCall({
    //           phoneNumber: val, //仅为示例
    //           success: () => {},
    //           fail: (err) => {
    //             uni.showToast({
    //               title: '设备拨打电话功能不可用',
    //               duration: 1000
    //             });
    //             console.log('设备拨打电话功能不可用')
    //           }
    //         })
    //       } else {
    //         uni.showToast({
    //           title: '未配置电话号码',
    //           duration: 1000
    //         });
    //       }

    //       break;
    //     case '地图导航':
    //       val = this.getPartModelData(subCol, map, item)
    //       console.log('地图导航', val)
    //       if (val && val.hasOwnProperty('lat') && val.hasOwnProperty('lgt')) {
    //         uni.openLocation({
    //           latitude: parseFloat(val.lat),
    //           longitude: parseFloat(val.lgt),
    //           success: function() {
    //             console.log('success');
    //           }
    //         });
    //       }
    //       break;
    //     case '表单操作':
    //       if (subCol?.form_srv) {
    //         this.openUpdateFormPopup(itemData.id, subCol?.form_srv)
    //       }
    //       break;
    //     default:
    //       console.log('没有点击事件')
    //       break;
    //   }
    //   console.log('onClickSubBlock', text, type, optionsType, item)
    // }, 500, true),
    onClickIcon(cellLayoutJson) {
      if (this.readOnly) {
        return;
      }
      this.$emit("on-click-icon", cellLayoutJson);
    },

    buildColStyleJson(styleJson, cssArr, cellLayoutJson, column) {
      let style = {};
      if (styleJson) {
        // 将rpx转换为px
        function convertRpxToPx(css) {
          return css.replace(/\d+rpx/g, (match) => {
            const value = parseFloat(match);
            return `${value / 2}px`;
          });
        }
        for (let key in styleJson) {
          if (
            typeof styleJson[key] === "string" &&
            styleJson[key] &&
            styleJson[key].indexOf("rpx") > -1
          ) {
            styleJson[key] = convertRpxToPx(styleJson[key] || "");
          }
          if (cssArr && cssArr.length > 0) {
            let cssArrs = cssArr.split(",");
            for (let getKey of cssArrs) {
              if (getKey == key) {
                style[key.replace(/_/g, "-")] = styleJson[key];
              }
            }
          } else {
            style[key.replace(/_/g, "-")] = styleJson[key];
            // console.log('styleJson',key)
          }
        }
      }
      let bgImg = cellLayoutJson?.background_image || "";
      if (styleJson && styleJson.background_image) {
        bgImg = styleJson.background_image;
      }
      if (bgImg) {
        // 单元背景图 补偿样式。
        style["background-image"] = `url(${this.getImagePath(bgImg)})`;
        style["background-size"] = "100% 100%";
        style["background-repeat"] = "no";
      }
      if (cellLayoutJson && !style.hasOwnProperty("min-height") && bgImg) {
        style["min-height"] = "60px";
      }
      if (!style["background-color"]) {
        style["background-color"] = "transparent";
      }
      if (!style["overflow"]) {
        // style["overflow"] = "hidden";
      }
      // console.log("styleJson", style);
      if (column) {
        return style[column] || "";
      }
      return style;
    },
    getPartModelData(item, map, itemData) {
      // item.variable,comColMap,cellItemData) : item.parts_text
      let type = item.parts_type;
      let key = item.variable || null;
      let val = item.parts_text;
      switch (type) {
        case "iconImg":
          val = item.parts_img;
          break;
        default:
          break;
      }
      if (item && itemData && !!map) {
        let data = itemData;
        let optionsType = "";
        if (item.hasOwnProperty("sys_fun") && item?.sys_fun) {
          optionsType = item?.sys_fun;
        }
        switch (optionsType) {
          case "拨打电话":
            key = item?.para_phone_col || item.variable;
            if (
              key &&
              map.hasOwnProperty(key) &&
              itemData.hasOwnProperty(map[key]) &&
              itemData[map[key]]
            ) {
              // val = itemData[map[key]]
            }
            break;
          case "地图导航":
            let lgtKey = item?.para_map_lon;
            let latKey = item?.para_map_lat;
            // key = item?.para_phone_col || item.variable
            val = null;
            val = {};
            if (
              lgtKey &&
              map.hasOwnProperty(lgtKey) &&
              itemData.hasOwnProperty(map[lgtKey]) &&
              itemData[map[lgtKey]]
            ) {
              val["lgt"] = itemData[map[lgtKey]];
            } else {
              val = null;
            }
            if (
              latKey &&
              map.hasOwnProperty(latKey) &&
              itemData.hasOwnProperty(map[latKey]) &&
              itemData[map[latKey]]
            ) {
              val["lat"] = itemData[map[latKey]];
            } else {
              val = null;
            }
            break;
          default:
            if (
              item.hasOwnProperty("variable") &&
              key &&
              map.hasOwnProperty(key) &&
              itemData.hasOwnProperty(map[key]) &&
              itemData[map[key]]
            ) {
              val = itemData[map[key]] || "";
            } else if (
              item.hasOwnProperty("variable") &&
              key &&
              itemData.hasOwnProperty(key) &&
              itemData[key]
            ) {
              val = itemData[key] || "";
            } else if (
              ["string", "时间日期"].includes(item.parts_type) &&
              item.parts_text
            ) {
              val = this.renderStr(item.parts_text, {
                data: itemData,
                ...this.queryOptions,
              });
            }
            break;
        }
      } else if (item && itemData && !map) {
        if (
          item.hasOwnProperty("variable") &&
          key &&
          itemData.hasOwnProperty(key) &&
          itemData[key]
        ) {
          val = itemData[key];
        } else if (
          ["string", "时间日期"].includes(item.parts_type) &&
          item.parts_text
        ) {
          val = this.renderStr(item.parts_text, {
            data: itemData,
            ...this.queryOptions,
          });
        }
      }
      // console.log('getPartModelData:', itemData,key,val);
      if (type === "时间日期" && item.date_format_rule) {
        val = dayjs(val).format(item.date_format_rule);
      }
      if (type === "视频") {
        if (val?.indexOf("http") !== 0) {
          val = this.serviceApi()?.downloadFileNo + val;
        }
      }
      return this.recoverFileAddress(val);
    },
  },
};
</script>

<style lang="scss" scoped>
.bx-text-cell {
  // overflow: hidden;

  .u-wrap {
    background-color: transparent !important;
  }
}

.bx-card {
  position: relative;
  height: 100%;
  // display: grid;
  // grid-template-rows: repeat(2, 200rpx);
  // gap:5px ;
  // grid-template-columns: repeat(2, 50%);
}

.bx-card-cell {
  // 隐藏滚动条
  height: 100%;
  &.is-link {
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    &:hover {
      scale: 1.01;
    }
  }
  // scrollbar-width: thin; /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    width: 4px; /* 设置滚动条的宽度 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2); /* 设置滚动条滑块的颜色 */
    border-radius: 4px; /* 设置滚动条滑块的圆角 */
  }
  &.checked {
    border: 2px solid transparent;
    border-color: #007aff;
  }

  position: relative;

  .radio-box {
    position: absolute;
    right: 0;
    top: 0;
    transform: scale(0.7);
  }

  // background-color: #eee;
  // > .bx-cell-row {
  //   &:first-child {
  //     border-left: 0 !important;
  //   }
  //   &:last-child {
  //    border-right: 0 !important;
  //   }

  //   > .bx-cell-row {
  //     &:first-child {
  //       border-left: 0 !important;
  //     }

  //     &:last-child {
  //      border-right: 0 !important;
  //     }
  //   }
  // }

  .bx-cell-string {
    text-align: justify;
    overflow: hidden;
    /* 溢出隐藏 */
    overflow: hidden;
    /* 溢出显示省略号 */
    text-overflow: ellipsis;
    word-break: break-all;
    &:hover {
      color: var(--primary-color);
    }
  }
}

.update-title {
  background-color: #fff;
  text-align: center;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
}

.popup-form-warp {
  max-height: 80vh;
  overflow-y: scroll;
  background-color: #fff;
}
</style>
