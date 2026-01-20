// 文档配置
let docConfig = {
    document: {
        permissions: {}
    },
    height: '100%',
    width: '100%',
    editorConfig: {
        customization: {
            anonymous: {
                showLabel: false,
                request: false,      // 不请求匿名用户信息
                label: ""     // 设置默认匿名标签
            },
            toolbar: {
                hideUserAvatar: true,
                hideRightMenu: true  // 隐藏整个右侧菜单（包含用户图标）
            },
            features: {
                userInfo: false,     // 隐藏用户信息区域
                userAvatar: false,    // 隐藏用户头像
                askUserName: false,    // 不询问用户名
                help: false  // 隐藏帮助菜单（包含关于）
            },
            toolbar: {
                hideRightMenu: true  // 隐藏右侧菜单（包含关于）
            },
            collaboration: {
                showAvatars: false,    // 不显示头像
                hideUsers: true        // 隐藏用户
            },
            about: false  // 直接隐藏关于选项
        }
    }
}

// 从网络链接打开
async function openFromUrl(url, mode) {
    if (!url) {
        alert('请输入有效的网络链接')
        return
    }

    try {
        const fileName = url.split('/').pop()

        // 获取文件类型
        const fileType = getFileType(fileName)

        // 生成文件名
        const uniqueFileName = fileName.substring(0, fileName.lastIndexOf('.'))

        // 通过fetch下载文件并转换为Blob URL
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('无法下载文件')
        }

        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer])
        const blobUrl = URL.createObjectURL(blob)

        // 获取文档类型映射
        const documentTypes = {
            word: 'word',
            excel: 'cell',
            ppt: 'slide',
            pdf: 'pdf'
        }

        const fileTypes = {
            word: 'docx',
            excel: 'xlsx',
            ppt: 'pptx',
            pdf: 'pdf'
        }

        // 配置OnlyOffice
        docConfig.document.url = blobUrl
        docConfig.document.title = uniqueFileName
        docConfig.document.fileType = fileTypes[fileType]
        docConfig.documentType = documentTypes[fileType]
        docConfig.document.key = String(Date.now())
        docConfig.editorConfig.mode = mode
        if(mode === 'view') {
            docConfig.document.permissions.download = false
            docConfig.document.permissions.print = false
            docConfig.editorConfig.customization.toolbar.hideFileMenu = false
            docConfig.editorConfig.customization.chat = false
        }

        openNewWindow(docConfig)
    } catch (error) {
        alert('无法下载文件，请检查链接是否有效或网络连接')
    }
}

// 获取文件类型
function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase()
    if (['doc', 'docx'].includes(ext)) return 'word'
    if (['xls', 'xlsx'].includes(ext)) return 'excel'
    if (['ppt', 'pptx'].includes(ext)) return 'ppt'
    if (['pdf'].includes(ext)) return 'pdf'
    alert('不支持的文件类型')
}

function openNewWindow(docConfig) {
    window.open('./OnlyofficePersonal/onlyoffice.html?docConfig=' + encodeURI(JSON.stringify(docConfig)), '_blank');
};

export { openFromUrl, getFileType, openNewWindow }
