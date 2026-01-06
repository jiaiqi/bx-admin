// scripts/generate-version.js
const fs = require('fs');
const { execSync } = require('child_process');
const dayjs = require('dayjs');
// 获取 Git Commit Hash (短版本)
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
// 获取 Git 提交时间
const commitTime = execSync('git log -1 --format=%cd --date=iso').toString().trim();
// 获取最近的 Tag
let gitTag = '';
let tagDescription = '';
try {
  gitTag = execSync('git describe --tags --abbrev=0').toString().trim();
  // 获取最近一次 tag 的提交描述
  tagDescription = execSync(`git log -1 --format=%B ${gitTag}`).toString().trim();
} catch (e) {
  // 如果没有 tag，可以忽略或设置为 'latest'
  gitTag = 'latest';
  tagDescription = '未设置标签描述';
}

const versionInfo = {
  version: gitTag, // 主版本，可以用 tag
  build: commitHash, // 构建号，用 commit hash
  commitTime: commitTime,
  buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 构建时间
  tagDescription: tagDescription, // 最近一次 tag 的提交描述
};

const outputDir = './public'; // 假设你的前端 public 目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(`${outputDir}/version.json`, JSON.stringify(versionInfo, null, 2));

console.log('✅ Version file generated:');
console.log(JSON.stringify(versionInfo, null, 2));
