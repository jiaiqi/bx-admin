import {Graph,Shape} from "@antv/x6";
import { Stencil } from '@antv/x6-plugin-stencil'
import { Transform } from '@antv/x6-plugin-transform'
import { Selection } from '@antv/x6-plugin-selection'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { History } from '@antv/x6-plugin-history'
import insertCss from 'insert-css'
// #region 初始化图形
const ports = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
    items: [
        {
            group: 'top',
        },
        {
            group: 'right',
        },
        {
            group: 'bottom',
        },
        {
            group: 'left',
        },
    ],
}
export default class RegularX6{
    constructor(options) {
       this.options = options;
       this.graph = null;
       this.stencil = null;
       this.commonAttrs = {
        body: {
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1,
        },
        text: {
            fontSize: 12,
            fill: '#333',
        },
    };
       this.mousewheel=
           {
               enabled: true,
               zoomAtMousePosition: true,
               modifiers: 'ctrl',
               minScale: 0.5,
               maxScale: 3,
          } ||options.mousewheel;
       this.connecting = {
           router: 'manhattan',
           connector: {
               name: 'rounded',
               args: {
                   radius: 8,
               },
           },
           anchor: 'center',
           connectionPoint: 'anchor',
           allowBlank: false,
           snap: {
               radius: 20,
           },
           createEdge() {
               return new Shape.Edge({
                   attrs: {
                       line: {
                           stroke: '#A2B1C3',
                           strokeWidth: 2,
                           targetMarker: {
                               name: 'block',
                               width: 12,
                               height: 8,
                           },
                       },
                   },
                   zIndex: 10, // 确保连接线在最上层
               })
           },
            validateConnection({ targetMagnet }) {
                return !!targetMagnet
            },

        },
        this.highlighting={
            magnetAdsorbed: {
                name: 'stroke',
                args: {
                    attrs: {
                        fill: '#5F95FF',
                        stroke: '#5F95FF',
                    },
                },
            },
        }
        this.selectedNode = null; // 存储当前选中的节点
    }
    initCss(){
        insertCss(`
    #container {
      display: flex;
      border: 1px solid #dfe3e8;
    }
    #stencil {
      width: 180px;
      height: 100%;
      position: relative;
      border-right: 1px solid #dfe3e8;
    }
    #graph-container {
      width: calc(100% - 180px);
      height: 100%;
    }
    .x6-widget-stencil  {
      background-color: #fff;
    }
    .x6-widget-stencil-title {
      background-color: #fff;
    }
    .x6-widget-stencil-group-title {
      background-color: #fff !important;
    }
    .x6-widget-transform {
      margin: -1px 0 0 -1px;
      padding: 0px;
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
      background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
      background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
      border-radius: 0;
    }
    .x6-widget-selection-inner {
      border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
      opacity: 0;
    }
  `)
    }
    initGraph(){
        this.graph = new Graph({
            container: this.options.container,
            grid: true,
            width:'100%',
            height:'100%',
            mousewheel:this.mousewheel,
            connecting:this.connecting,
            highlighting:this.highlighting,
          });
        this.graph
            .use(
                new Transform({
                    resizing: true,
                    rotating: true,
                }),
            )
            .use(
                new Selection({
                    rubberband: true,
                    showNodeSelectionBox: true,
                }),
            )
            .use(new Snapline())
            .use(new Keyboard())
            .use(new Clipboard())
            .use(new History())
        Graph.registerNode(
            'custom-rect',
            {
                inherit: 'rect',
                width: 66,
                height: 36,
                zIndex: 1,
                attrs: {
                    body: {
                        strokeWidth: 1,
                        stroke: '#5F95FF',
                        fill: '#EFF4FF',
                    },
                    text: {
                        fontSize: 12,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
            },
            true,
        )
        Graph.registerNode(
            'custom-circle',
            {
                inherit: 'circle',
                width: 45,
                height: 45,
                zIndex: 1,
                attrs: {
                    body: {
                        strokeWidth: 1,
                        stroke: '#5F95FF',
                        fill: '#EFF4FF',
                    },
                    text: {
                        fontSize: 12,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
            },
            true,
        )
        Graph.registerNode(
            'custom-polygon',
            {
                inherit: 'polygon',
                width: 66,
                height: 36,
                zIndex: 1,
                attrs: {
                    body: {
                        strokeWidth: 1,
                        stroke: '#5F95FF',
                        fill: '#EFF4FF',
                    },
                    text: {
                        fontSize: 12,
                        fill: '#262626',
                    },
                },
                ports: {
                    ...ports,
                    items: [
                        {
                            group: 'top',
                        },
                        {
                            group: 'bottom',
                        },
                    ],
                },
            },
            true,
        )
        this.initCss()
        this.graph.bindKey(['meta+c', 'ctrl+c'], () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.copy(cells)
            }
            return false
        })
        this.graph.bindKey(['meta+x', 'ctrl+x'], () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.cut(cells)
            }
            return false
        })
        this.graph.bindKey(['meta+v', 'ctrl+v'], () => {
            if (!this.graph.isClipboardEmpty()) {
                const cells = this.graph.paste({ offset: 32 })
                this.graph.cleanSelection()
                this.graph.select(cells)
            }
            return false
        })

        // undo redo
        this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
            if (this.graph.canUndo()) {
                this.graph.undo()
            }
            return false
        })
        this.graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
            if (this.graph.canRedo()) {
                this.graph.redo()
            }
            return false
        })

         // select all
        this.graph.bindKey(['meta+a', 'ctrl+a'], () => {
            const nodes = this.graph.getNodes()
            if (nodes) {
                this.graph.select(nodes)
            }
        })

       // delete
        this.graph.bindKey('backspace', () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.removeCells(cells)
            }
        })

       // zoom
        this.graph.bindKey(['ctrl+1', 'meta+1'], () => {
            const zoom = this.graph.zoom()
            if (zoom < 1.5) {
                this.graph.zoom(0.1)
            }
        })
        this.graph.bindKey(['ctrl+2', 'meta+2'], () => {
            const zoom = this.graph.zoom()
            if (zoom > 0.5) {
                this.graph.zoom(-0.1)
            }
        })

       // 控制连接桩显示/隐藏
        const showPorts = (ports,show) => {
            for (let i = 0, len = ports.length; i < len; i += 1) {
                ports[i].style.visibility = show ? 'visible' : 'hidden'
            }
        }
        this.graph.on('node:mouseenter', () => {
            const container = this.options.container
            const ports = container.querySelectorAll(
                '.x6-port-body',
            )
            showPorts(ports, true)
        })
        this.graph.on('node:mouseleave', () => {
            const container = this.options.container
            const ports = container.querySelectorAll(
                '.x6-port-body',
            )
            showPorts(ports, false)
        })

        // 添加节点点击事件监听
        this.graph.on('node:click', ({ node }) => {
            this.selectedNode = node;
            const customId = this.getNodeCustomId(node);
            console.log('选中节点:', node.id, `(customId: ${customId})`, node.getLabel());
        });

        // 添加空白区域点击事件，取消选择
        this.graph.on('blank:click', () => {
            this.selectedNode = null;
            console.log('取消选择');
        });

        // 绑定拖拽事件
        this.bindDragEvents();
    }
    //初始化看板
    initStencil(){
        this.stencil= new Stencil({
            title: '规则物料板',
            target: this.graph,
            stencilGraphWidth: 300,
            stencilGraphHeight: 300,
            collapsable: true,
            groups: [
                {
                    title: '条件流程面板',
                    name: 'group1',
                }
            ],
            layoutOptions: {
                columns: 2,
                columnWidth: 80,
                rowHeight: 55,
            },
        })
        document.getElementById('group_node').appendChild(this.stencil.container)
        this.stencil.load(this.nodeStep1(), 'group1')
    }
    nodeStep1(){
        const n1 = this.graph.createNode({
            shape: 'custom-rect',
            attrs: {
                body: {
                    rx: 6,
                    ry: 6,
                },
            },
            label: '变量值',
            data: {
                customId: 'val_val',
                nodeType: 'val_val'
            },
            tools: [
                {
                    name: 'node-editor',
                    args: {
                        attrs: {
                            backgroundColor: '#fff',
                        },
                    },
                },
            ],
        })

        const n2 = this.graph.createNode({
            shape: 'custom-rect',
            label: '指标',
            data: {
                customId: 'sp_1',
                nodeType: 'indicator'
            },
            tools: [
                {
                    name: 'node-editor',
                    args: {
                        attrs: {
                            backgroundColor: '#fff',
                        },
                    },
                },
            ],
        })

        const n3 = this.graph.createNode({
            shape: 'custom-polygon',
            attrs: {
                body: {
                    refPoints: '0,10 10,0 20,10 10,20',
                },
            },
            label: '操作符',
            data: {
                customId: 'op_1',
                nodeType: 'operator'
            },
            tools: [
                {
                    name: 'node-editor',
                    args: {
                        attrs: {
                            backgroundColor: '#fff',
                        },
                    },
                },
            ],
        })

        const n4 = this.graph.createNode({
            shape: 'custom-rect',
            attrs: {
                body: {
                    rx: 6,
                    ry: 6,
                },
            },
            label: '常量值',
            data: {
                customId: 'val_1',
                nodeType: 'value'
            },
            tools: [
                {
                    name: 'node-editor',
                    args: {
                        attrs: {
                            backgroundColor: '#fff',
                        },
                    },
                },
            ],
        })

        const n6 = this.graph.createNode({
            shape: 'custom-polygon',
            attrs: {
                body: {
                    refPoints: '0,10 10,0 20,10 10,20',
                },
            },
            label: '逻辑符',
            data: {
                customId: 'lc_1',
                nodeType: 'logic'
            },
            tools: [
                {
                    name: 'node-editor',
                    args: {
                        attrs: {
                            backgroundColor: '#fff',
                        },
                    },
                },
            ],
        })

        const group1 = this.graph.createNode({
            shape: 'custom-rect',
            label: 'AND关系',
            id: 'group_base_1', // 修改ID避免重复
            zIndex: -1,
            attrs: {
                body: {
                    fill: '#fffbe6',
                    stroke: '#ffe7ba',
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
                },
                label: {
                    fontSize: 12,
                },
            },
            data: {
                lcType:'AND',
                customId: 'group_base_1',
                nodeType: 'group',
                parent: true,
                children: []
            },
        })
        const group2 = this.graph.createNode({
            shape: 'custom-rect',
            label: 'OR关系',
            id: 'group_base_3', // 修改ID避免重复
            zIndex: -1,
            attrs: {
                body: {
                    fill: '#fffbe6',
                    stroke: '#ffe7ba',
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
                },
                label: {
                    fontSize: 12,
                },
            },
            data: {
                lcType:'OR',
                customId: 'group_base_1',
                nodeType: 'group',
                parent: true,
                children: []
            },
        })
        const group3 = this.graph.createNode({
            shape: 'custom-rect',
            label: '',
            id: 'group_base_2', // 修改ID避免重复
            zIndex: -1,
            attrs: {
                body: {
                    fill: '#fffbe6',
                    stroke: '#5ae376',
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
                },
                label: {
                    fontSize: 12,
                },
            },
            data: {
                customId: 'group_base_2',
                nodeType: 'group',
                parent: true,
                children: []
            },
        })
        return [n1, n2, n3, n4, n6, group1,group2,group3]
    }

    // 更新当前选中节点的内容
    updateSelectedNodeContent(type,newContent) {
        if (!this.selectedNode) {
            console.warn('没有选中的节点');
            return false;
        }
        let customId = this.getNodeCustomId(this.selectedNode);
        switch (type){
           case 'val_val':
            if(customId=='val_val'){
                this.selectedNode.setLabel(newContent.label);
                this.selectedNode.setData({value:newContent.value});
            }
            break;
            case 'ind':
            if(customId=='sp_1'){
                this.selectedNode.setLabel(newContent.label);
                this.selectedNode.setData({value:newContent.value});
            }
            break;
            case 'op':
            if(customId=='op_1'){
                this.selectedNode.setLabel(newContent.label);
                this.selectedNode.setData({value:newContent.value});
            }
            break;
            case 'lo':
            if(customId=='lc_1'){
                this.selectedNode.setLabel(newContent.label);
                this.selectedNode.setData({value:newContent.value});
            }
            break;
        }
        console.log(`已更新节点 ${this.selectedNode.id} 的内容为: ${newContent}`);
        return true;
    }


    // 获取当前选中节点信息
    getSelectedNodeInfo() {
        if (!this.selectedNode) {
            return null;
        }

        return {
            id: this.selectedNode.id,
            customId: this.getNodeCustomId(this.selectedNode),
            label: this.selectedNode.getLabel(),
            shape: this.selectedNode.shape,
            data: this.selectedNode.getData()
        };
    }


    handleSelectedNodeUpdate(type,obj) {
        // 1. 更新选中节点的文本
        this.updateSelectedNodeContent(type,obj);
        // 3. 获取选中节点信息
        const selectedInfo = this.getSelectedNodeInfo();
        console.log('当前选中节点信息:', selectedInfo);
    }

    // 绑定拖拽事件
    bindDragEvents() {
        // 监听节点拖拽结束事件
        this.graph.on('node:moved', ({ node, e }) => {
            console.log('节点移动结束:', node.id, node.getLabel());
            this.handleNodeDropped(node);
        });
    }

    // 处理节点拖拽结束
    handleNodeDropped(droppedNode) {
        const droppedCustomId = this.getNodeCustomId(droppedNode);
        console.log('节点拖拽结束:', `customId: ${droppedCustomId}`, droppedNode.getLabel());

        // 调整层级
        this.adjustNodeLayers();

        // 获取画布上所有节点
        const allNodes = this.graph.getNodes();

        // 过滤出所有群组节点
        const groupNodes = allNodes.filter(node => this.isGroupNode(node));

        // 获取拖拽节点的位置和大小
        const droppedBBox = droppedNode.getBBox();

        // 找到包含该节点的所有群组（可能有嵌套）
        const containingGroups = [];

        groupNodes.forEach(group => {
            if (group.id === droppedNode.id) return; // 排除自己

            const groupBBox = group.getBBox();
            const groupCustomId = this.getNodeCustomId(group);

            // 判断拖拽节点是否在群组范围内
            if (droppedBBox.x >= groupBBox.x &&
                droppedBBox.y >= groupBBox.y &&
                droppedBBox.x + droppedBBox.width <= groupBBox.x + groupBBox.width &&
                droppedBBox.y + droppedBBox.height <= groupBBox.y + groupBBox.height) {

                containingGroups.push({
                    customId: groupCustomId,
                    label: group.getLabel(),
                    bbox: groupBBox
                });
            }
        });

        if (containingGroups.length > 0) {
            // 按群组大小排序，小的在前（内层群组）
            containingGroups.sort((a, b) => (a.bbox.width * a.bbox.height) - (b.bbox.width * b.bbox.height));

            console.log(`节点 ${droppedCustomId} 被拖入群组:`, containingGroups.map(g => g.customId));

            // 打印所有相关群组的嵌套关系
            this.printNestedGroupStructure();
        }
    }



    // 判断是否是群组节点
    isGroupNode(node) {
        const data = node.getData();
        return data && data.nodeType === 'group';
    }

    // 获取所有群组节点
    getAllGroupNodes() {
        const allNodes = this.graph.getNodes();
        const groups = allNodes.filter(node => this.isGroupNode(node));
        console.log('筛选出的群组节点:', groups.length);
        return groups;
    }



    // 获取群组的直接子节点
    getGroupDirectChildren(group) {
        return group.getChildren() || [];
    }


    // 高亮群组
    highlightGroup(group, highlight) {
        const attrs = highlight ? {
            body: {
                stroke: '#ff6b6b',
                strokeWidth: 3,
                fill: '#ffe4e1'
            }
        } : {
            body: {
                stroke: '#ffe7ba',
                strokeWidth: 2,
                fill: '#fffbe6'
            }
        };

        group.setAttrs(attrs);
    }

    // 清除所有群组高亮
    clearGroupHighlights() {
        const groups = this.getAllGroupNodes();
        groups.forEach(group => {
            this.highlightGroup(group, false);
        });
    }

    // 获取群组内所有节点信息
    getGroupInfo(customId) {
        const group = this.getNodeByCustomId(customId);
        if (!group || !this.isGroupNode(group)) {
            return null;
        }

        const children = this.getGroupDirectChildren(group);
        return {
            id: group.id,
            customId: this.getNodeCustomId(group),
            label: group.getLabel(),
            childrenCount: children.length,
            children: children.map(child => ({
                id: child.id,
                customId: this.getNodeCustomId(child),
                label: child.getLabel(),
                isGroup: this.isGroupNode(child)
            }))
        };
    }


    // 添加获取节点自定义ID的方法
    getNodeCustomId(node) {
        const data = node.getData();
        return data?.customId || node.id;
    }

    // 添加根据customId查找节点的方法
    getNodeByCustomId(customId) {
        const nodes = this.graph.getNodes();
        return nodes.find(node => {
            const data = node.getData();
            return data?.customId === customId;
        });
    }

    // 打印嵌套群组结构
    printNestedGroupStructure() {
        const allNodes = this.graph.getNodes();
        const groupNodes = allNodes.filter(node => this.isGroupNode(node));

        console.log('=== 群组嵌套结构 ===');

        groupNodes.forEach(group => {
            const groupCustomId = this.getNodeCustomId(group);
            const nodesInGroup = this.getNodesInGroup(groupCustomId);

            console.log(`群组 ${groupCustomId} (${group.getLabel()}):`);

            // 分类显示群组内的节点
            const regularNodes = nodesInGroup.filter(node => !node.isGroup);
            const subGroups = nodesInGroup.filter(node => node.isGroup);

            if (regularNodes.length > 0) {
                console.log(`  普通节点:`, regularNodes.map(n => `${n.customId}(${n.label})`));
            }

            if (subGroups.length > 0) {
                console.log(`  子群组:`, subGroups.map(n => `${n.customId}(${n.label})`));

                // 递归显示子群组内的节点
                subGroups.forEach(subGroup => {
                    const subGroupNodes = this.getNodesInGroup(subGroup.customId);
                    if (subGroupNodes.length > 0) {
                        console.log(`    ${subGroup.customId} 内的节点:`,
                            subGroupNodes.map(n => `${n.customId}(${n.label})`));
                    }
                });
            }

            console.log('---');
        });
    }

    // 获取指定群组内的所有节点
    getNodesInGroup(groupCustomId) {
        const allNodes = this.graph.getNodes();
        const group = this.getNodeByCustomId(groupCustomId);

        if (!group) {
            return [];
        }

        const groupBBox = group.getBBox();
        const nodesInGroup = [];

        // 检查所有节点是否在群组范围内
        allNodes.forEach(node => {
            if (node.id === group.id) return; // 排除群组自己

            const nodeBBox = node.getBBox();
            const nodeCustomId = this.getNodeCustomId(node);

            // 判断节点是否在群组范围内
            if (nodeBBox.x >= groupBBox.x &&
                nodeBBox.y >= groupBBox.y &&
                nodeBBox.x + nodeBBox.width <= groupBBox.x + groupBBox.width &&
                nodeBBox.y + nodeBBox.height <= groupBBox.y + groupBBox.height) {

                nodesInGroup.push({
                    customId: nodeCustomId,
                    label: node.getLabel(),
                    nodeType: node.getData()?.nodeType,
                    isGroup: this.isGroupNode(node)
                });
            }
        });

        return nodesInGroup;
    }

    // 添加方法来动态调整层级
    adjustNodeLayers() {
        const allNodes = this.graph.getNodes();
        const allEdges = this.graph.getEdges();

        // 群组节点设置为最底层
        const groupNodes = allNodes.filter(node => this.isGroupNode(node));
        groupNodes.forEach(group => {
            group.setZIndex(-1);
        });

        // 普通节点设置为中间层
        const regularNodes = allNodes.filter(node => !this.isGroupNode(node));
        regularNodes.forEach((node, index) => {
            node.setZIndex(index + 1);
        });

        // 连接线设置为最上层
        allEdges.forEach(edge => {
            edge.setZIndex(100);
        });
    }

    // 获取群组间的连接关系
    getGroupConnections() {
        const allEdges = this.graph.getEdges();
        const groupConnections = [];

        allEdges.forEach(edge => {
            const sourceNode = edge.getSourceNode();
            const targetNode = edge.getTargetNode();

            if (sourceNode && targetNode) {
                const sourceGroup = this.findNodeGroup(sourceNode);
                const targetGroup = this.findNodeGroup(targetNode);

                // 如果源节点和目标节点在不同的群组中
                if (sourceGroup && targetGroup && sourceGroup !== targetGroup) {
                    groupConnections.push({
                        sourceGroup: sourceGroup,
                        targetGroup: targetGroup,
                        sourceNode: {
                            customId: this.getNodeCustomId(sourceNode),
                            label: sourceNode.getLabel()
                        },
                        targetNode: {
                            customId: this.getNodeCustomId(targetNode),
                            label: targetNode.getLabel()
                        }
                    });
                }
            }
        });

        return groupConnections;
    }

    // 找到节点所属的群组
    findNodeGroup(node) {
        if (this.isGroupNode(node)) {
            return this.getNodeCustomId(node);
        }

        const allNodes = this.graph.getNodes();
        const groupNodes = allNodes.filter(n => this.isGroupNode(n));
        const nodeBBox = node.getBBox();

        // 找到包含该节点的最小群组（最内层）
        let containingGroups = [];

        groupNodes.forEach(group => {
            const groupBBox = group.getBBox();

            if (nodeBBox.x >= groupBBox.x &&
                nodeBBox.y >= groupBBox.y &&
                nodeBBox.x + nodeBBox.width <= groupBBox.x + groupBBox.width &&
                nodeBBox.y + nodeBBox.height <= groupBBox.y + groupBBox.height) {

                containingGroups.push({
                    customId: this.getNodeCustomId(group),
                    size: groupBBox.width * groupBBox.height
                });
            }
        });

        // 返回最小的群组（最内层）
        if (containingGroups.length > 0) {
            containingGroups.sort((a, b) => a.size - b.size);
            return containingGroups[0].customId;
        }

        return null;
    }

    // 获取完整的群组结构分析
    analyzeGroupStructure() {
        console.log('=== 群组结构分析 ===');

        // 1. 获取所有群组及其内容
        const groupStructure = this.getCompleteGroupStructure();
        console.log('群组结构:', groupStructure);

        // 2. 获取群组间连接关系
        const groupConnections = this.getGroupConnections();
        console.log('群组间连接关系:', groupConnections);

        // 3. 分析嵌套层级
        const nestingAnalysis = this.analyzeNesting();
        console.log('嵌套层级分析:', nestingAnalysis);

        return {
            groupStructure,
            groupConnections,
            nestingAnalysis
        };
    }

    // 获取完整的群组结构
    getCompleteGroupStructure() {
        const allNodes = this.graph.getNodes();
        const groupNodes = allNodes.filter(node => this.isGroupNode(node));
        const structure = {};

        groupNodes.forEach(group => {
            const groupCustomId = this.getNodeCustomId(group);
            const directContent = this.getGroupDirectContent(groupCustomId);

            structure[groupCustomId] = {
                label: group.getLabel(),
                position: group.getPosition(),
                size: group.getSize(),
                nodes: directContent.nodes,
                subGroups: directContent.subGroups,
                totalNodes: directContent.nodes.length + directContent.subGroups.length
            };
        });

        return structure;
    }

    // 分析嵌套层级
    analyzeNesting() {
        const allNodes = this.graph.getNodes();
        const groupNodes = allNodes.filter(node => this.isGroupNode(node));
        const nestingMap = {};

        groupNodes.forEach(group => {
            const groupCustomId = this.getNodeCustomId(group);
            const groupBBox = group.getBBox();

            // 找到包含当前群组的所有父群组
            const parentGroups = [];

            groupNodes.forEach(otherGroup => {
                if (otherGroup.id === group.id) return;

                const otherBBox = otherGroup.getBBox();
                const otherCustomId = this.getNodeCustomId(otherGroup);

                // 判断当前群组是否在另一个群组内
                if (groupBBox.x >= otherBBox.x &&
                    groupBBox.y >= otherBBox.y &&
                    groupBBox.x + groupBBox.width <= otherBBox.x + otherBBox.width &&
                    groupBBox.y + groupBBox.height <= otherBBox.y + otherBBox.height) {

                    parentGroups.push({
                        customId: otherCustomId,
                        size: otherBBox.width * otherBBox.height
                    });
                }
            });

            // 按大小排序，找到直接父群组（最小的包含群组）
            parentGroups.sort((a, b) => a.size - b.size);

            nestingMap[groupCustomId] = {
                label: group.getLabel(),
                level: parentGroups.length,
                directParent: parentGroups.length > 0 ? parentGroups[0].customId : null,
                allParents: parentGroups.map(p => p.customId)
            };
        });

        return nestingMap;
    }

    // 递归打印群组树形结构
    printGroupTree(groupId, analysis, level) {
        const indent = '  '.repeat(level);
        const groupInfo = analysis.groupStructure[groupId];

        if (!groupInfo) return;

        console.log(`${indent}📁 群组 ${groupId} (${groupInfo.label})`);
        console.log(`${indent}   位置: (${groupInfo.position.x}, ${groupInfo.position.y})`);
        console.log(`${indent}   大小: ${groupInfo.size.width} x ${groupInfo.size.height}`);

        // 打印直接包含的普通节点
        if (groupInfo.nodes.length > 0) {
            console.log(`${indent}   📄 直接普通节点: ${groupInfo.nodes.map(n => `${n.customId}(${n.label})`).join(', ')}`);
        }

        // 打印直接包含的子群组
        if (groupInfo.subGroups.length > 0) {
            console.log(`${indent}   📁 直接子群组 (${groupInfo.subGroups.length}个):`);

            groupInfo.subGroups.forEach((subGroup, index) => {
                console.log(`${indent}     ${index + 1}. ${subGroup.customId} (${subGroup.label})`);
                // 递归打印子群组
                this.printGroupTree(subGroup.customId, analysis, level + 1);
            });
        }
    }


    // 检查是否是直接子群组
    isDirectChildGroup(childGroupId, parentGroupId) {
        const analysis = this.analyzeGroupStructure();
        const childNesting = analysis.nestingAnalysis[childGroupId];
        return childNesting && childNesting.directParent === parentGroupId;
    }

    // 检查节点是否在某个子群组内
    isNodeInAnySubGroup(node, parentGroupId) {
        const allNodes = this.graph.getNodes();
        const groupNodes = allNodes.filter(n => this.isGroupNode(n) && this.getNodeCustomId(n) !== parentGroupId);
        const nodeBBox = node.getBBox();

        for (let subGroup of groupNodes) {
            const subGroupBBox = subGroup.getBBox();
            const subGroupId = this.getNodeCustomId(subGroup);

            // 检查这个子群组是否在父群组内
            const parentGroup = this.getNodeByCustomId(parentGroupId);
            const parentBBox = parentGroup.getBBox();

            if (subGroupBBox.x >= parentBBox.x &&
                subGroupBBox.y >= parentBBox.y &&
                subGroupBBox.x + subGroupBBox.width <= parentBBox.x + parentBBox.width &&
                subGroupBBox.y + subGroupBBox.height <= parentBBox.y + parentBBox.height) {

                // 检查节点是否在这个子群组内
                if (nodeBBox.x >= subGroupBBox.x &&
                    nodeBBox.y >= subGroupBBox.y &&
                    nodeBBox.x + nodeBBox.width <= subGroupBBox.x + subGroupBBox.width &&
                    nodeBBox.y + nodeBBox.height <= subGroupBBox.y + subGroupBBox.height) {
                    return true;
                }
            }
        }

        return false;
    }

    // 获取群组的直接内容（不包括嵌套群组内的内容）
    getGroupDirectContent(groupCustomId) {
        const group = this.getNodeByCustomId(groupCustomId);
        if (!group || !this.isGroupNode(group)) {
            return { nodes: [], subGroups: [] };
        }

        const allNodes = this.graph.getNodes();
        const groupBBox = group.getBBox();
        const directContent = { nodes: [], subGroups: [] };

        allNodes.forEach(node => {
            if (node.id === group.id) return;

            const nodeBBox = node.getBBox();
            const nodeCustomId = this.getNodeCustomId(node);

            // 判断节点是否在群组范围内
            if (nodeBBox.x >= groupBBox.x &&
                nodeBBox.y >= groupBBox.y &&
                nodeBBox.x + nodeBBox.width <= groupBBox.x + groupBBox.width &&
                nodeBBox.y + nodeBBox.height <= groupBBox.y + groupBBox.height) {

                const nodeInfo = {
                    customId: nodeCustomId,
                    label: node.getLabel(),
                    nodeType: node.getData()?.nodeType,
                    isGroup: this.isGroupNode(node)
                };

                if (this.isGroupNode(node)) {
                    directContent.subGroups.push(nodeInfo);
                } else {
                    directContent.nodes.push(nodeInfo);
                }
            }
        });

        return directContent;
    }



    // 获取简化的逻辑结构（类似你要求的JSON格式）
    getLogicalStructure() {
        console.log('=== 开始分析逻辑结构 ===');

        // 1. 找到所有群组1和群组2（容器分组）
        const containerGroups = this.getContainerGroups();

        if (containerGroups.length === 0) {
            console.log('没有找到容器分组');
            return null;
        }

        // 2. 处理每个容器分组
        const results = containerGroups.map(containerGroup => {
            return this.processContainerGroup(containerGroup);
        });

        // 如果只有一个容器分组，直接返回该分组的结构
        if (results.length === 1) {
            return results[0];
        }

        // 如果有多个容器分组，返回数组
        return results;
    }

    // 获取容器分组（群组1和群组2）- 修复版本
    getContainerGroups() {
        const allNodes = this.graph.getNodes();
        const containerGroups = allNodes.filter(node => {
            if (!this.isGroupNode(node)) return false;

            const data = node.getData();
            const label = node.getLabel();

            // 检查data中的lcType或者标签中包含AND/OR
            return (data && data.lcType && (data.lcType === 'AND' || data.lcType === 'OR')) ||
                   (label && (label.includes('AND') || label.includes('OR') ||
                             label.includes('关系') || label.includes('且') || label.includes('或')));
        });

        console.log('找到的容器分组:', containerGroups.map(g => ({
            id: this.getNodeCustomId(g),
            label: g.getLabel(),
            data: g.getData()
        })));

        return containerGroups;
    }

    // 处理单个容器分组 - 支持逻辑连接分组
    processContainerGroup(containerGroup) {
        const containerData = containerGroup.getData();
        const containerLabel = containerGroup.getLabel();
        const containerCustomId = this.getNodeCustomId(containerGroup);

        // 确定容器的关系类型
        let lcType = 'AND'; // 默认
        if (containerData && containerData.lcType) {
            lcType = containerData.lcType;
        } else if (containerLabel) {
            if (containerLabel.includes('OR') || containerLabel.includes('或')) {
                lcType = 'OR';
            } else if (containerLabel.includes('AND') || containerLabel.includes('且')) {
                lcType = 'AND';
            }
        }

        console.log(`处理容器分组: ${containerCustomId}, 标签: ${containerLabel}, lcType: ${lcType}`);

        // 1. 找到该容器内的所有群组3
        const group3Nodes = this.getGroup3InContainer(containerGroup);

        if (group3Nodes.length === 0) {
            console.log('容器内没有找到群组3');
            return {
                relation: lcType.toLowerCase(),
                data: []
            };
        }

        // 2. 分析群组3之间的逻辑连接关系
        const logicalConnections = this.analyzeGroup3LogicalConnections(group3Nodes);

        // 3. 构建分组结构（将有连接的群组3组合在一起）
        const dataArray = this.buildGroupedStructure(group3Nodes, logicalConnections);

        console.log(`容器 ${containerCustomId} 的最终结构:`, {
            relation: lcType.toLowerCase(),
            data: dataArray
        });

        return {
            relation: lcType.toLowerCase(),
            data: dataArray
        };
    }

    // 分析群组3之间的逻辑连接关系
    analyzeGroup3LogicalConnections(group3Nodes) {
        const connections = [];
        const allEdges = this.graph.getEdges();

        console.log('开始分析群组3之间的逻辑连接...');

        // 找到所有逻辑符节点
        const allNodes = this.graph.getNodes();
        const logicNodes = allNodes.filter(node => {
            const data = node.getData();
            return data && data.nodeType === 'logic';
        });

        console.log('找到的逻辑符节点:', logicNodes.map(n => ({
            id: this.getNodeCustomId(n),
            label: n.getLabel()
        })));

        // 分析每个逻辑符连接的群组3
        logicNodes.forEach(logicNode => {
            const connectedGroups = [];

            allEdges.forEach(edge => {
                const sourceNode = edge.getSourceNode();
                const targetNode = edge.getTargetNode();

                if (sourceNode && targetNode) {
                    // 检查逻辑符是否连接到群组3
                    if (sourceNode.id === logicNode.id) {
                        const targetGroup = group3Nodes.find(g => g.id === targetNode.id);
                        if (targetGroup) {
                            connectedGroups.push(targetGroup);
                        }
                    } else if (targetNode.id === logicNode.id) {
                        const sourceGroup = group3Nodes.find(g => g.id === sourceNode.id);
                        if (sourceGroup) {
                            connectedGroups.push(sourceGroup);
                        }
                    }
                }
            });

            if (connectedGroups.length >= 2) {
                connections.push({
                    logicNode: logicNode,
                    operator: logicNode.getLabel(),
                    connectedGroups: connectedGroups
                });

                console.log(`逻辑符 ${logicNode.getLabel()} 连接的群组:`,
                    connectedGroups.map(g => this.getNodeCustomId(g)));
            }
        });

        return connections;
    }

    // 构建分组结构（将有连接的群组3组合在一起）
    buildGroupedStructure(group3Nodes, logicalConnections) {
        const result = [];
        const processedGroups = new Set();

        // 1. 处理有逻辑连接的群组3
        logicalConnections.forEach(connection => {
            const { operator, connectedGroups } = connection;

            // 提取连接的群组内容
            const groupData = connectedGroups.map(group => {
                processedGroups.add(group.id);
                return this.extractGroup3Content(group);
            });

            // 标准化操作符
            const normalizedOperator = this.normalizeOperator(operator);

            result.push({
                relation: normalizedOperator,
                data: groupData
            });

            console.log(`创建逻辑连接组: ${operator} -> ${normalizedOperator}`, groupData);
        });

        // 2. 处理独立的群组3（没有逻辑连接的）
        group3Nodes.forEach(group => {
            if (!processedGroups.has(group.id)) {
                const groupContent = this.extractGroup3Content(group);
                result.push(groupContent);
                console.log('添加独立群组:', groupContent);
            }
        });

        return result;
    }

    // 标准化操作符
    normalizeOperator(label) {
        if (!label) return 'and';

        const lowerLabel = label.toLowerCase();
        if (lowerLabel === 'or' || lowerLabel === '或' || lowerLabel.includes('or')) {
            return 'or';
        } else if (lowerLabel === 'and' || lowerLabel === '且' || lowerLabel.includes('and')) {
            return 'and';
        }
        return 'and'; // 默认
    }

    // 获取容器内的群组3 - 修复版本
    getGroup3InContainer(containerGroup) {
        const allNodes = this.graph.getNodes();
        const containerBBox = containerGroup.getBBox();

        console.log(`分析容器 ${this.getNodeCustomId(containerGroup)} 的范围:`, containerBBox);

        const group3Nodes = allNodes.filter(node => {
            // 排除容器自己
            if (node.id === containerGroup.id) return false;

            // 只要群组节点
            if (!this.isGroupNode(node)) return false;

            const data = node.getData();
            const label = node.getLabel();

            // 排除其他容器分组
            if ((data && data.lcType && (data.lcType === 'AND' || data.lcType === 'OR')) ||
                (label && (label.includes('AND') || label.includes('OR') ||
                          label.includes('关系') || label.includes('且') || label.includes('或')))) {
                return false;
            }

            // 检查是否在容器范围内
            const nodeBBox = node.getBBox();
            const isInside = this.isNodeInGroup(nodeBBox, containerBBox);

            console.log(`检查群组 ${this.getNodeCustomId(node)}:`, {
                bbox: nodeBBox,
                isInside: isInside,
                label: node.getLabel()
            });

            return isInside;
        });

        console.log(`容器内找到的群组3:`, group3Nodes.map(g => ({
            id: this.getNodeCustomId(g),
            label: g.getLabel()
        })));

        return group3Nodes;
    }

    // 提取群组3的内容 - 支持变量值
    extractGroup3Content(group3) {
        const allNodes = this.graph.getNodes();
        const group3BBox = group3.getBBox();
        const group3Id = this.getNodeCustomId(group3);

        console.log(`提取群组3 ${group3Id} 的内容, 范围:`, group3BBox);

        const content = {
            indicator: null,    // 指标
            operator: null,     // 操作符
            value: null,        // 常量值
            variable: null      // 变量值
        };

        // 找到群组3内的所有非群组节点
        allNodes.forEach(node => {
            // 排除群组节点和自己
            if (this.isGroupNode(node) || node.id === group3.id) {
                return;
            }

            const nodeBBox = node.getBBox();
            if (this.isNodeInGroup(nodeBBox, group3BBox)) {
                const nodeData = node.getData();
                const nodeInfo = {
                    customId: this.getNodeCustomId(node),
                    label: node.getLabel(),
                    nodeType: nodeData?.nodeType || 'unknown',
                    data: nodeData
                };

                switch (nodeData?.nodeType) {
                    case 'indicator':
                        content.indicator = nodeInfo;
                        break;
                    case 'operator':
                        content.operator = nodeInfo;
                        break;
                    case 'value':
                    case 'constant':
                        content.value = nodeInfo;
                        break;
                    case 'val_val':
                    case 'variable':
                        content.variable = nodeInfo;
                        break;
                }

                console.log(`群组3 ${group3Id} 内找到节点:`, nodeInfo);
            }
        });

        // 验证变量值和常量值只能存在一个
        if (content.value && content.variable) {
            console.warn(`群组3 ${group3Id} 同时包含常量值和变量值，这可能不符合预期`);
        }

        // 构建最终的节点数组，过滤掉null值
        const nodes = [];
        if (content.indicator) nodes.push(content.indicator);
        if (content.operator) nodes.push(content.operator);
        if (content.value) nodes.push(content.value);
        if (content.variable) nodes.push(content.variable);

        return {
            groupId: group3Id,
            groupLabel: group3.getLabel(),
            nodes: nodes,
            // 保留详细的分类信息，便于后续处理
            details: {
                indicator: content.indicator,
                operator: content.operator,
                value: content.value,
                variable: content.variable,
                hasValue: !!(content.value || content.variable),
                valueType: content.value ? 'constant' : (content.variable ? 'variable' : null)
            }
        };
    }

    // 检查节点是否在群组范围内
    isNodeInGroup(nodeBBox, groupBBox) {
        return nodeBBox.x >= groupBBox.x &&
               nodeBBox.y >= groupBBox.y &&
               nodeBBox.x + nodeBBox.width <= groupBBox.x + groupBBox.width &&
               nodeBBox.y + nodeBBox.height <= groupBBox.y + groupBBox.height;
    }


    // 找到包含节点的群组3
    findContainingGroup3(node) {
        const allNodes = this.graph.getNodes();
        const nodeBBox = node.getBBox();

        // 找到所有群组3
        const group3Nodes = allNodes.filter(n => {
            if (!this.isGroupNode(n) || n.id === node.id) return false;
            const data = n.getData();
            return !data || !data.lcType || (data.lcType !== 'AND' && data.lcType !== 'OR');
        });

        // 找到包含该节点的最小群组3
        let containingGroup = null;
        let minArea = Infinity;

        group3Nodes.forEach(group => {
            const groupBBox = group.getBBox();
            if (this.isNodeInGroup(nodeBBox, groupBBox)) {
                const area = groupBBox.width * groupBBox.height;
                if (area < minArea) {
                    minArea = area;
                    containingGroup = group;
                }
            }
        });

        return containingGroup;
    }

    // 更新群组3的children字段
    updateGroup3Children(group3, droppedNode) {
        const currentData = group3.getData() || {};
        if (!currentData.children) {
            currentData.children = [];
        }

        const nodeData = droppedNode.getData();
        const nodeType = nodeData?.nodeType;

        // 检查变量值和常量值的互斥性
        if (nodeType === 'val_val' || nodeType === 'variable') {
            // 移除已存在的常量值
            currentData.children = currentData.children.filter(
                child => child.nodeType !== 'value' && child.nodeType !== 'constant'
            );
        } else if (nodeType === 'value' || nodeType === 'constant') {
            // 移除已存在的变量值
            currentData.children = currentData.children.filter(
                child => child.nodeType !== 'val_val' && child.nodeType !== 'variable'
            );
        }

        const nodeInfo = {
            customId: this.getNodeCustomId(droppedNode),
            label: droppedNode.getLabel(),
            nodeType: nodeType,
            data: nodeData
        };

        // 检查是否已存在相同类型的节点，如果存在则替换
        const existingIndex = currentData.children.findIndex(
            child => child.nodeType === nodeType
        );

        if (existingIndex >= 0) {
            // 替换现有节点
            currentData.children[existingIndex] = nodeInfo;
        } else {
            // 添加新节点
            currentData.children.push(nodeInfo);
        }

        // 更新群组数据
        group3.setData(currentData);

        console.log(`群组3 ${this.getNodeCustomId(group3)} 的children已更新:`, currentData.children);

        // 验证群组3的完整性
        this.validateGroup3Content(group3);
    }

    // 验证群组3内容的完整性
    validateGroup3Content(group3) {
        const data = group3.getData();
        const children = data?.children || [];

        const hasIndicator = children.some(child => child.nodeType === 'indicator');
        const hasOperator = children.some(child => child.nodeType === 'operator');
        const hasValue = children.some(child =>
            ['value', 'constant', 'val_val', 'variable'].includes(child.nodeType)
        );
        const hasConstant = children.some(child =>
            ['value', 'constant'].includes(child.nodeType)
        );
        const hasVariable = children.some(child =>
            ['val_val', 'variable'].includes(child.nodeType)
        );

        const group3Id = this.getNodeCustomId(group3);

        console.log(`群组3 ${group3Id} 内容验证:`, {
            hasIndicator,
            hasOperator,
            hasValue,
            hasConstant,
            hasVariable,
            isComplete: hasIndicator && hasOperator && hasValue,
            valueConflict: hasConstant && hasVariable
        });

        if (hasConstant && hasVariable) {
            console.warn(`群组3 ${group3Id} 同时包含常量值和变量值，存在冲突`);
        }

        return {
            isComplete: hasIndicator && hasOperator && hasValue,
            hasConflict: hasConstant && hasVariable
        };
    }


    // 获取节点值类型
    getNodeValueType(nodeType) {
        switch(nodeType) {
            case 'constant': return 'constant';
            case 'variable': return 'var';
            default: return 'constant';
        }
    }

    // 获取节点规则
    getNodeRule(nodeType) {
        // 根据节点类型返回对应规则，可以根据实际需求扩展
        return '等于';
    }

    // 查找群组内的逻辑连接
    findLogicalConnections(groupId) {
        const allEdges = this.graph.getEdges();
        const logicalConnections = [];

        allEdges.forEach(edge => {
            const sourceNode = edge.getSourceNode();
            const targetNode = edge.getTargetNode();

            if (sourceNode && targetNode) {
                const sourceGroup = this.findNodeGroup(sourceNode);
                const targetGroup = this.findNodeGroup(targetNode);

                // 检查是否是逻辑符节点
                const isLogicalNode = (node) => {
                    const nodeType = node.getData()?.nodeType;
                    return nodeType === 'logic' || nodeType === 'operator';
                };

                // 如果连接涉及逻辑符，记录连接关系
                if (isLogicalNode(sourceNode) || isLogicalNode(targetNode)) {
                    const logicalNode = isLogicalNode(sourceNode) ? sourceNode : targetNode;
                    const otherNode = isLogicalNode(sourceNode) ? targetNode : sourceNode;
                    const otherGroup = isLogicalNode(sourceNode) ? targetGroup : sourceGroup;

                    // 确保逻辑符在当前分析的群组内
                    const logicalNodeGroup = this.findNodeGroup(logicalNode);
                    if (logicalNodeGroup === groupId) {
                        logicalConnections.push({
                            logicalOperator: logicalNode.getLabel().toLowerCase(),
                            connectedGroup: otherGroup,
                            logicalNode: this.getNodeCustomId(logicalNode),
                            connectedNode: this.getNodeCustomId(otherNode)
                        });
                    }
                }
            }
        });

        return logicalConnections;
    }

    // 构建逻辑连接图
    buildLogicalConnectionGraph(logicalConnections) {
        const graph = {};

        logicalConnections.forEach(connection => {
            const { logicalOperator, connectedGroup, logicalNode } = connection;

            if (!graph[logicalNode]) {
                graph[logicalNode] = {
                    operator: logicalOperator,
                    connectedGroups: []
                };
            }

            graph[logicalNode].connectedGroups.push(connectedGroup);
        });

        return graph;
    }

    // 找到连接的条件集合
    findConnectedSets(connectionGraph, conditions) {
        const sets = [];
        const processedGroups = new Set();

        Object.entries(connectionGraph).forEach(([logicalNode, info]) => {
            const connectedConditions = [];
            let relation = info.operator;

            // 标准化逻辑操作符
            if (relation.includes('or') || relation.includes('或')) {
                relation = 'or';
            } else if (relation.includes('and') || relation.includes('且')) {
                relation = 'and';
            }

            info.connectedGroups.forEach(groupId => {
                const condition = conditions.find(c => c.groupId === groupId);
                if (condition && !processedGroups.has(groupId)) {
                    const { groupId: _, ...cleanCondition } = condition;
                    connectedConditions.push(cleanCondition);
                    processedGroups.add(groupId);
                }
            });

            if (connectedConditions.length > 0) {
                sets.push({
                    conditions: connectedConditions,
                    relation: relation
                });
            }
        });

        return sets;
    }
}



