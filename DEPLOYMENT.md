# 明日方舟羊年窗花投票页面 - 部署指南

## 📁 项目结构

```
arknights-vote/
├── index.html      # 主页面
├── style.css       # 样式文件
├── data.js         # 干员数据配置
├── script.js       # 主要逻辑
└── images/         # 立绘图片文件夹（需要自行添加）
    ├── 立绘_哈蒂娅_1.png
    ├── 立绘_哈蒂娅_2.png
    └── ...
```

## 🎨 添加立绘图片

### 图片命名规则
根据你的需求，图片命名格式如下：
- **精一立绘**：`立绘_角色名_1.png`
- **精二立绘**：`立绘_角色名_2.png`
- **皮肤**：`立绘_角色名_skinX.png`（X为皮肤编号）

### 示例
```
images/
├── 立绘_哈蒂娅_1.png          # 哈蒂娅精一
├── 立绘_哈蒂娅_2.png          # 哈蒂娅精二
├── 立绘_卡涅利安_1.png        # 卡涅利安精一
├── 立绘_卡涅利安_2.png        # 卡涅利安精二
├── 立绘_卡涅利安_skin1.png    # 卡涅利安皮肤1
└── 立绘_卡涅利安_skin2.png    # 卡涅利安皮肤2
```

### 在代码中使用图片
修改 `script.js` 中的 `createOperatorCard` 函数，将占位符替换为真实图片：

```javascript
// 找到这一行
<div class="operator-image-placeholder">
    📷 ${operator.name}立绘
</div>

// 替换为
<img src="images/${operator.artworks[0].filename}" 
     alt="${operator.name}" 
     class="operator-image"
     onerror="this.style.display='none'; this.previousElementSibling.style.display='flex';">
<div class="operator-image-placeholder" style="display:none;">
    📷 ${operator.name}立绘
</div>
```

## 💾 数据存储方案

### 当前方案：LocalStorage（本地存储）

**优点：**
- ✅ 无需数据库
- ✅ 无需后端服务器
- ✅ 完全免费
- ✅ 部署简单

**缺点：**
- ❌ 数据存储在用户浏览器中
- ❌ 不同用户看不到彼此的投票
- ❌ 清除浏览器数据会丢失投票

**适用场景：**
- 个人使用
- 演示原型
- 小规模测试

---

## 🚀 免费部署方案（支持多人投票统计）

### 方案一：GitHub Pages + Firebase（推荐）⭐

#### 步骤1：准备Firebase数据库

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目
3. 选择 "Realtime Database" 或 "Firestore"
4. 设置数据库规则为公开读写（仅用于测试）：
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. 获取Firebase配置信息

#### 步骤2：修改代码使用Firebase

在 `script.js` 顶部添加Firebase SDK：

```html
<!-- 在 index.html 的 </body> 前添加 -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js"></script>
```

初始化Firebase并修改投票保存逻辑：

```javascript
// Firebase配置（替换为你的配置）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 修改 submitVote 函数
async function submitVote() {
    if (selectedOperators.size === 0) {
        alert('请至少选择一个干员！');
        return;
    }
    
    // 保存到Firebase
    const updates = {};
    selectedOperators.forEach((value, key) => {
        const voteKey = `${key}_${value.artwork.filename}`;
        updates[`votes/${voteKey}`] = firebase.database.ServerValue.increment(1);
        updates[`voteDetails/${voteKey}/operatorName`] = value.operator.name;
        updates[`voteDetails/${voteKey}/artworkLabel`] = value.artwork.label;
        updates[`voteDetails/${voteKey}/artworkFilename`] = value.artwork.filename;
    });
    
    await database.ref().update(updates);
    
    // 显示成功提示
    document.getElementById('successModal').classList.remove('hidden');
    
    // 清空选择...
    loadStatistics();
}

// 修改 loadStatistics 函数
function loadStatistics() {
    database.ref('voteDetails').on('value', (snapshot) => {
        const votes = snapshot.val() || {};
        // 原有的统计逻辑...
    });
}
```

#### 步骤3：部署到GitHub Pages

1. 创建GitHub仓库
2. 上传所有文件
3. 进入 Settings → Pages
4. 选择分支和文件夹（通常是 main 分支的 root）
5. 点击 Save，等待部署完成
6. 访问 `https://你的用户名.github.io/仓库名/`

**成本：** 完全免费

---

### 方案二：Vercel + Supabase

#### Supabase设置（类似Firebase的开源替代品）

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 创建表：
```sql
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    operator_id VARCHAR(50),
    operator_name VARCHAR(100),
    artwork_label VARCHAR(100),
    artwork_filename VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

4. 获取API密钥

#### Vercel部署

1. 访问 [Vercel](https://vercel.com/)
2. 导入GitHub仓库
3. 添加环境变量（Supabase URL和密钥）
4. 一键部署

**成本：** 完全免费（有额度限制，但足够小项目使用）

---

### 方案三：Netlify + FaunaDB

类似于方案一和二的组合，同样提供免费套餐。

---

## 🔧 本地测试

### 方法1：直接打开HTML文件
```bash
# 在浏览器中直接打开
file:///D:/projects/The-Boredom-Codex-Copy/arknights-vote/index.html
```

### 方法2：使用本地服务器（推荐）

```bash
# 使用Python
cd arknights-vote
python -m http.server 8080

# 或使用Node.js的http-server
npm install -g http-server
http-server -p 8080
```

然后访问：`http://localhost:8080`

---

## 📊 数据统计查看

### LocalStorage方案
在浏览器控制台输入：
```javascript
JSON.parse(localStorage.getItem('arknights_votes'))
```

### Firebase/Supabase方案
直接在对应的数据库控制台查看，或创建一个管理员页面。

---

## ⚠️ 注意事项

1. **图片版权**：确保你有权使用这些立绘图片
2. **隐私政策**：如果收集用户数据，需要添加隐私声明
3. **防刷票**：生产环境需要添加验证机制（如IP限制、验证码等）
4. **备份数据**：定期备份投票数据

---

## 🎯 推荐方案总结

| 方案 | 难度 | 成本 | 适用场景 |
|------|------|------|----------|
| LocalStorage | ⭐ | 免费 | 个人测试、演示 |
| GitHub Pages + Firebase | ⭐⭐ | 免费 | 小型社区投票 |
| Vercel + Supabase | ⭐⭐⭐ | 免费 | 需要更多自定义功能 |
| 自建服务器 + MySQL | ⭐⭐⭐⭐ | 付费 | 大型活动、商业用途 |

**对于你的需求，我推荐使用方案一（GitHub Pages + Firebase）**，因为：
- ✅ 完全免费
- ✅ 部署简单
- ✅ 支持实时统计
- ✅ 多用户可以共享数据
- ✅ 有足够的免费额度

---

## 📞 需要帮助？

如果在部署过程中遇到问题，可以：
1. 查看各平台的官方文档
2. 在GitHub Issues中提问
3. 参考相关的教程视频

祝你部署顺利！🎉
