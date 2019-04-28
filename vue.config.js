let config = {

    outputDir: 'demo',
    baseUrl: './',

    // 链式配置
    chainWebpack:(config) =>{

        config.devtool("source-map")

        // 代码分割
        const commonOptions = {
            chunks: 'all',
            reuseExistingChunk: true
        }
    },

    // 普通配置
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            return {
                plugins:[]
            }

        } else {
            // 为开发环境修改配置...
            return {
                plugins:[]
            }
        }
    },
}


// 多页应用配置
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const packageJson = require('./package.json')
const PAGES_PATH = path.resolve(__dirname, './src/examples/pages')
const pages = {}
const projectName = packageJson.name

const getHtmlFile = function (pageName) {
    let fileName = `${pageName}.html`
    switch (pageName){
        case 'demo':
            fileName = 'index.html'
            break
    }

    return fileName
}

const getTemplateFile = function (filepath) {
    let templatePath = path.dirname(filepath) + '/index.html'
    if (!fs.existsSync(templatePath)) {
        // 入口如果不配置直接使用
        templatePath = 'public/index.html'
    }
    return templatePath
}

glob.sync(PAGES_PATH + '/*/index.js').forEach(filepath => {
    let pageName = path.basename(path.dirname(filepath))
    pages[pageName] = {
        entry:filepath,
        title: pageName === 'main' ? projectName : pageName,
        filename: getHtmlFile(pageName),
        template: getTemplateFile(filepath),
    }
})

config.pages = pages

module.exports = config