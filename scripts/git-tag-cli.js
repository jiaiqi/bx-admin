#!/usr/bin/env node

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 创建交互式输入接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 格式化输出
const log = (message, color = 'white') => {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    white: '\x1b[37m'
  };
  console.log(`${colors[color]}${message}\x1b[0m`);
};

// 错误处理
const handleError = (error) => {
  log(`❌ 错误: ${error.message}`, 'red');
  process.exit(1);
};

// 验证语义化版本格式
const validateSemanticVersion = (version) => {
  const semanticRegex = /^v?(\d+)(\.(\d+))?(\.(\d+))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semanticRegex.test(version);
};

// 自动生成下一个版本号
const getNextVersion = () => {
  try {
    // 获取最近的tag
    const latestTag = execSync('git describe --tags --abbrev=0', { stdio: 'pipe' }).toString().trim();
    
    // 解析版本号
    const match = latestTag.match(/v?(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const [, major, minor, patch] = match;
      return `v${major}.${minor}.${parseInt(patch) + 1}`;
    }
    return 'v1.0.0';
  } catch (error) {
    // 如果没有tag，默认使用v1.0.0
    return 'v1.0.0';
  }
};

// 获取当前分支
const getCurrentBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    handleError(error);
  }
};

// 检查是否有未提交的更改
const checkUncommittedChanges = () => {
  try {
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    return status !== '';
  } catch (error) {
    handleError(error);
  }
};

// 询问用户输入
const askQuestion = (question, defaultValue = '') => {
  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (默认: ${defaultValue}) ` : ' '}`, (answer) => {
      resolve(answer || defaultValue);
    });
  });
};

// 主程序
const main = async () => {
  log('🚀 Git Tag 提交工具', 'magenta');
  log('==================', 'magenta');
  
  // 检查当前分支
  const currentBranch = getCurrentBranch();
  log(`当前分支: ${currentBranch}`, 'blue');
  
  // 检查是否有未提交的更改
  const hasUncommittedChanges = checkUncommittedChanges();
  if (hasUncommittedChanges) {
    log('⚠️  警告: 存在未提交的更改，请先提交或暂存更改', 'yellow');
    const continueAnswer = await askQuestion('是否继续? (y/N)', 'N');
    if (!continueAnswer.toLowerCase().startsWith('y')) {
      log('操作已取消', 'yellow');
      process.exit(0);
    }
  }
  
  // 获取自动生成的下一个版本号
  const suggestedVersion = getNextVersion();
  log(`建议版本号: ${suggestedVersion}`, 'green');
  
  // 询问用户输入版本号
  let tagName = await askQuestion('请输入版本号', suggestedVersion);
  
  // 确保版本号以v开头
  if (!tagName.startsWith('v')) {
    tagName = `v${tagName}`;
  }
  
  // 验证版本号格式
  if (!validateSemanticVersion(tagName)) {
    log('❌ 错误: 版本号格式不符合语义化版本规范', 'red');
    process.exit(1);
  }
  
  // 询问标签描述
  const tagMessage = await askQuestion('请输入标签描述 (可选)');
  
  // 确认操作
  log('\n📋 操作确认', 'blue');
  log(`版本号: ${tagName}`, 'white');
  if (tagMessage) {
    log(`标签描述: ${tagMessage}`, 'white');
  }
  log(`当前分支: ${currentBranch}`, 'white');
  
  const confirmAnswer = await askQuestion('是否确认创建并推送标签? (y/N)', 'y');
  if (!confirmAnswer.toLowerCase().startsWith('y')) {
    log('操作已取消', 'yellow');
    process.exit(0);
  }
  
  try {
    // 创建本地标签
    log('\n📦 创建本地标签...', 'blue');
    if (tagMessage) {
      execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { stdio: 'inherit' });
    } else {
      execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    }
    log(`✅ 本地标签 ${tagName} 创建成功`, 'green');
    
    // 推送标签到远程
    log('\n📤 推送标签到远程...', 'blue');
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
    log(`✅ 标签 ${tagName} 推送成功`, 'green');
    
    // 询问是否生成版本文件
    const generateVersionAnswer = await askQuestion('是否生成版本文件? (y/N)', 'y');
    if (generateVersionAnswer.toLowerCase().startsWith('y')) {
      log('\n📄 生成版本文件...', 'blue');
      execSync('npm run generate-version', { stdio: 'inherit' });
    }
    
    // 询问是否构建项目
    const buildAnswer = await askQuestion('是否构建项目? (y/N)', 'n');
    if (buildAnswer.toLowerCase().startsWith('y')) {
      log('\n🏗️  构建项目...', 'blue');
      execSync('npm run build:version', { stdio: 'inherit' });
    }
    
    log('\n🎉 标签提交完成!', 'green');
    log(`版本号: ${tagName}`, 'white');
    log(`远程地址: https://gitee.com/njy_3/l-pc-front/releases/tag/${tagName}`, 'white');
    
  } catch (error) {
    handleError(error);
  } finally {
    rl.close();
  }
};

// 启动程序
main();
