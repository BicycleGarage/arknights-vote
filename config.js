// ==========================================
// Firebase 和 CDN 配置文件
// ==========================================

// Firebase配置
// ⚠️ 重要：请将下面的配置替换为你从Firebase Console获取的真实配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-east1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ==========================================
// 图片CDN配置
// ==========================================

// 方案1：jsDelivr + GitHub（推荐，完全免费）
// 格式：https://cdn.jsdelivr.net/gh/用户名/仓库名@版本/路径
const IMAGE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/arknights-vote@main/images';

// 方案2：阿里云OSS（如果你使用阿里云，速度更快）
// 取消下面这行的注释，并替换为你的OSS地址
// const IMAGE_CDN_BASE = 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/images';

// 方案3：Cloudflare R2
// const IMAGE_CDN_BASE = 'https://pub-xxxx.r2.dev/images';

// ==========================================
// 防刷票配置
// ==========================================

// 投票间隔时间（小时）
const VOTE_COOLDOWN_HOURS = 24;

// localStorage键名
const STORAGE_KEYS = {
  HAS_VOTED: 'has_voted_arknights',
  VOTE_TIMESTAMP: 'vote_timestamp'
};

// ==========================================
// 初始化Firebase
// ==========================================

let database = null;

function initFirebase() {
  try {
    // 检查Firebase是否已加载
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK未加载，使用LocalStorage模式');
      return null;
    }
    
    // 检查配置是否已更新
    if (firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Firebase配置未设置，使用LocalStorage模式');
      console.info('请在config.js中填入你的Firebase配置');
      return null;
    }
    
    // 初始化Firebase
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    
    console.log('✅ Firebase初始化成功');
    return database;
    
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error);
    return null;
  }
}

// ==========================================
// 工具函数
// ==========================================

// 检查用户是否已投票
function hasVoted() {
  return localStorage.getItem(STORAGE_KEYS.HAS_VOTED) === 'true';
}

// 标记用户已投票
function markAsVoted() {
  localStorage.setItem(STORAGE_KEYS.HAS_VOTED, 'true');
  localStorage.setItem(STORAGE_KEYS.VOTE_TIMESTAMP, Date.now().toString());
}

// 获取距离下次投票的剩余时间（小时）
function getVoteCooldownRemaining() {
  const lastVote = parseInt(localStorage.getItem(STORAGE_KEYS.VOTE_TIMESTAMP) || '0');
  const hoursPassed = (Date.now() - lastVote) / (1000 * 60 * 60);
  const remaining = VOTE_COOLDOWN_HOURS - hoursPassed;
  return Math.max(0, remaining);
}

// 重置投票状态（用于测试）
function resetVoteStatus() {
  localStorage.removeItem(STORAGE_KEYS.HAS_VOTED);
  localStorage.removeItem(STORAGE_KEYS.VOTE_TIMESTAMP);
  console.log('投票状态已重置');
}

// 构建图片URL
function getImageUrl(filename) {
  return `${IMAGE_CDN_BASE}/${filename}`;
}

// ==========================================
// 导出配置
// ==========================================

// 初始化Firebase并导出
const db = initFirebase();

console.log('📝 配置信息:');
console.log('- 图片CDN:', IMAGE_CDN_BASE);
console.log('- Firebase:', db ? '已启用' : '未启用（使用LocalStorage）');
console.log('- 投票冷却:', VOTE_COOLDOWN_HOURS, '小时');
