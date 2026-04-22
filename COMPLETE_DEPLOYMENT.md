+# 🚀 完整部署指南 - GitHub Pages + Firebase + 免费图片CDN

## 📋 部署架构总览

```
用户访问流程：
浏览器 → GitHub Pages（网页文件）→ Firebase（投票数据）→ jsDelivr CDN（立绘图片）
```

### 各组件作用
- **GitHub Pages**: 托管HTML/CSS/JS文件（免费）
- **Firebase**: 存储投票数据，实时同步（免费额度充足）
- **jsDelivr CDN**: 加速图片加载，全球CDN（完全免费）
- **阿里云服务器**（可选）: 自定义域名、HTTPS、国内加速

---

## 🎯 第一部分：Firebase数据库设置（15分钟）

### 步骤1：创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称：`arknights-vote`
4. 关闭Google Analytics（不需要）
5. 点击"创建项目"

### 步骤2：创建Realtime Database

1. 在左侧菜单选择"Realtime Database"
2. 点击"创建数据库"
3. 选择位置：**asia-east1**（台湾，离中国大陆较近）
4. 安全规则选择：**测试模式**（稍后会修改）
5. 点击"启用"

### 步骤3：获取Firebase配置

1. 点击左侧齿轮图标 ⚙️ → "项目设置"
2. 向下滚动到"您的应用"部分
3. 点击 Web 图标 `</>`
4. 注册应用名称：`arknights-vote-web`
5. 复制配置信息（保存好，后面要用）：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-east1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 步骤4：设置数据库规则

1. 回到"Realtime Database"页面
2. 点击"规则"标签
3. 替换为以下规则：

```json
{
  "rules": {
    "votes": {
      ".read": true,
      ".write": true
    },
    "voteDetails": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **注意**: 这是测试规则，生产环境应该添加验证。但对于投票项目，公开读写可以接受。

---

## 🖼️ 第二部分：图片存储方案 - 免费CDN加速

### 方案对比

| 方案 | 速度 | 稳定性 | 难度 | 推荐度 |
|------|------|--------|------|--------|
| jsDelivr + GitHub | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Cloudflare R2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| 阿里云OSS | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Firebase Storage | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### 🏆 推荐方案：jsDelivr + GitHub（最简单最快）

#### 优势
- ✅ **完全免费**
- ✅ **全球CDN加速**（包括中国大陆）
- ✅ **自动HTTPS**
- ✅ **无需配置**
- ✅ **速度快**（国内有节点）

#### 实施步骤

**步骤1：准备图片**

1. 在项目中创建 `images/` 文件夹
2. 按照命名规则放入所有立绘图片：
   ```
   images/
   ├── 立绘_锏_1.png
   ├── 立绘_锏_2.png
   ├── 立绘_哈蒂娅_1.png
   └── ...（所有干员立绘）
   ```

**步骤2：上传到GitHub**

当你把整个项目推送到GitHub后，图片会自动包含在内。

**步骤3：使用jsDelivr CDN链接**

jsDelivr会自动镜像GitHub仓库的文件，访问格式：

```
https://cdn.jsdelivr.net/gh/你的用户名/仓库名@版本号/图片路径
```

例如：
```
https://cdn.jsdelivr.net/gh/username/arknights-vote@v1.0/images/立绘_锏_1.png
```

**步骤4：在代码中使用**

修改 `script.js` 中的图片显示逻辑（后面会提供完整代码）。

---

### 💰 方案二：阿里云OSS（你有服务器，可能更合适）

既然你有阿里云服务器，可以使用阿里云OSS对象存储：

#### 优势
- ✅ **国内速度极快**
- ✅ **价格便宜**（每月几块钱）
- ✅ **你已经熟悉阿里云**
- ✅ **可以绑定自己的域名**

#### 费用估算
- 存储：100GB以内约 ¥2-5/月
- 流量：100GB以内约 ¥8-15/月
- **总计：约 ¥10-20/月**

#### 实施步骤

**步骤1：创建OSS Bucket**

1. 登录 [阿里云控制台](https://oss.console.aliyun.com/)
2. 创建Bucket
   - 名称：`arknights-vote-images`
   - 区域：选择离你近的（如华东1）
   - 存储类型：标准存储
   - 读写权限：**公共读**

**步骤2：上传图片**

1. 进入Bucket
2. 创建文件夹 `images/`
3. 上传所有立绘图片

**步骤3：获取访问地址**

外网访问地址格式：
```
https://你的bucket名.oss-区域.aliyuncs.com/images/立绘_锏_1.png
```

例如：
```
https://arknights-vote-images.oss-cn-hangzhou.aliyuncs.com/images/立绘_锏_1.png
```

**步骤4：（可选）绑定自定义域名**

1. 在OSS控制台绑定你的域名
2. 配置CNAME记录
3. 申请SSL证书（免费）
4. 开启CDN加速（可选，更快）

---

### ☁️ 方案三：Cloudflare R2（新兴方案）

#### 优势
- ✅ **前10GB免费**
- ✅ **零出口流量费**
- ✅ **全球CDN**
- ✅ **兼容S3 API**

#### 实施步骤
1. 注册 [Cloudflare](https://www.cloudflare.com/)
2. 创建R2 Bucket
3. 上传图片
4. 获取公开访问链接

---

## 🔧 第三部分：修改代码支持Firebase

### 步骤1：修改 index.html

在 `</body>` 标签前添加Firebase SDK：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<script src="data.js"></script>
<script src="config.js"></script>  <!-- 新增配置文件 -->
<script src="script.js"></script>
```

### 步骤2：创建 config.js

新建文件 `config.js`：

```javascript
// Firebase配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-east1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 图片CDN配置
const IMAGE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/你的用户名/arknights-vote@main/images';
// 如果使用阿里云OSS，改为：
// const IMAGE_CDN_BASE = 'https://你的bucket.oss-区域.aliyuncs.com/images';

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
```

⚠️ **重要**: 将 `YOUR_API_KEY` 等替换为你从Firebase获取的真实配置。

### 步骤3：修改 script.js

替换以下函数：

#### 1. 修改 submitVote 函数

```javascript
// 提交投票
async function submitVote() {
    if (selectedOperators.size === 0) {
        alert('请至少选择一个干员！');
        return;
    }
    
    try {
        // 保存到Firebase
        const updates = {};
        const timestamp = Date.now();
        
        selectedOperators.forEach((value, key) => {
            const voteKey = `${key}_${value.artwork.filename}`;
            
            // 增加投票计数
            updates[`votes/${voteKey}/count`] = firebase.database.ServerValue.increment(1);
            updates[`votes/${voteKey}/lastVoteTime`] = timestamp;
            
            // 保存详细信息
            updates[`voteDetails/${voteKey}/operatorId`] = key;
            updates[`voteDetails/${voteKey}/operatorName`] = value.operator.name;
            updates[`voteDetails/${voteKey}/artworkLabel`] = value.artwork.label;
            updates[`voteDetails/${voteKey}/artworkFilename`] = value.artwork.filename;
            updates[`voteDetails/${voteKey}/rarity`] = value.operator.rarity;
        });
        
        await database.ref().update(updates);
        
        // 显示成功提示
        document.getElementById('successModal').classList.remove('hidden');
        
        // 清空选择
        selectedOperators.clear();
        document.querySelectorAll('.operator-card').forEach(card => {
            card.classList.remove('selected');
        });
        updateSelectedPreview();
        updateSubmitButton();
        
        console.log('投票成功！');
        
    } catch (error) {
        console.error('投票失败:', error);
        alert('投票失败，请重试：' + error.message);
    }
}
```

#### 2. 修改 loadStatistics 函数

```javascript
// 加载统计数据
function loadStatistics() {
    const container = document.getElementById('statsContainer');
    container.innerHTML = '<p class="loading-text">加载中...</p>';
    
    // 监听Firebase数据变化（实时更新）
    database.ref('voteDetails').on('value', (snapshot) => {
        const voteDetails = snapshot.val() || {};
        
        if (Object.keys(voteDetails).length === 0) {
            container.innerHTML = '<p class="loading-text">暂无投票数据</p>';
            return;
        }
        
        // 按干员分组统计
        const statsMap = new Map();
        
        Object.values(voteDetails).forEach(vote => {
            if (!statsMap.has(vote.operatorId)) {
                statsMap.set(vote.operatorId, {
                    id: vote.operatorId,
                    name: vote.operatorName,
                    rarity: vote.rarity,
                    totalVotes: 0,
                    artworks: []
                });
            }
            
            const operatorStat = statsMap.get(vote.operatorId);
            
            // 获取该立绘的票数
            database.ref(`votes/${vote.operatorId}_${vote.artworkFilename}/count`).once('value', (countSnapshot) => {
                const count = countSnapshot.val() || 0;
                
                // 更新立绘票数
                const existingArtwork = operatorStat.artworks.find(a => a.filename === vote.artworkFilename);
                if (existingArtwork) {
                    existingArtwork.count = count;
                } else {
                    operatorStat.artworks.push({
                        label: vote.artworkLabel,
                        filename: vote.artworkFilename,
                        count: count
                    });
                }
                
                // 重新计算总票数
                operatorStat.totalVotes = operatorStat.artworks.reduce((sum, a) => sum + a.count, 0);
                
                // 渲染统计（每次更新后重新渲染）
                renderStatistics(statsMap);
            });
        });
    }, (error) => {
        console.error('加载统计失败:', error);
        container.innerHTML = '<p class="loading-text">加载失败，请刷新页面</p>';
    });
}

// 渲染统计数据
function renderStatistics(statsMap) {
    const container = document.getElementById('statsContainer');
    
    // 转换为数组并排序
    const statsArray = Array.from(statsMap.values())
        .sort((a, b) => b.totalVotes - a.totalVotes);
    
    if (statsArray.length === 0) {
        container.innerHTML = '<p class="loading-text">暂无投票数据</p>';
        return;
    }
    
    // 找出最大值用于计算百分比
    const maxVotes = Math.max(...statsArray.map(s => s.totalVotes));
    
    // 渲染统计
    container.innerHTML = statsArray.map(stat => {
        const percentage = maxVotes > 0 ? (stat.totalVotes / maxVotes * 100) : 0;
        const rarityClass = `rarity-${stat.rarity}`;
        
        const artworksHtml = stat.artworks.map(artwork => `
            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                ${artwork.label}: ${artwork.count}票
            </div>
        `).join('');
        
        return `
            <div class="stat-item">
                <div class="stat-name">
                    <span class="rarity-badge ${rarityClass}" style="margin-right: 8px;">${'★'.repeat(stat.rarity)}</span>
                    ${stat.name}
                </div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stat-count">${stat.totalVotes} 票</div>
                ${artworksHtml}
            </div>
        `;
    }).join('');
}
```

#### 3. 修改 createOperatorCard 函数以显示图片

```javascript
// 创建干员卡片
function createOperatorCard(operator) {
    const card = document.createElement('div');
    card.className = 'operator-card';
    card.dataset.operatorId = operator.id;
    
    const rarityClass = `rarity-${operator.rarity}`;
    const firstArtwork = operator.artworks[0];
    const imageUrl = `${IMAGE_CDN_BASE}/${firstArtwork.filename}`;
    
    card.innerHTML = `
        <div class="select-indicator">✓</div>
        <div class="operator-header">
            <span class="operator-name">${operator.name}</span>
            <span class="rarity-badge ${rarityClass}">${'★'.repeat(operator.rarity)}</span>
        </div>
        <img src="${imageUrl}" 
             alt="${operator.name}" 
             class="operator-image"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="operator-image-placeholder" style="display:none;">
            📷 ${operator.name}立绘
        </div>
        <p style="color: #666; font-size: 0.9rem;">点击选择干员</p>
    `;
    
    card.addEventListener('click', () => handleOperatorClick(operator));
    
    return card;
}
```

---

## 🌐 第四部分：部署到GitHub Pages（10分钟）

### 步骤1：创建GitHub仓库

1. 访问 [GitHub](https://github.com/)
2. 点击 "New repository"
3. 仓库名：`arknights-vote`
4. 描述：明日方舟羊年窗花投票
5. 设为 **Public**（公开）
6. 点击 "Create repository"

### 步骤2：上传项目文件

#### 方法A：使用Git命令（推荐）

```bash
cd D:\projects\The-Boredom-Codex-Copy\arknights-vote

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Arknights vote page"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/arknights-vote.git

# 推送
git branch -M main
git push -u origin main
```

#### 方法B：直接上传

1. 在GitHub仓库页面点击 "uploading an existing file"
2. 拖拽所有文件
3. 点击 "Commit changes"

### 步骤3：启用GitHub Pages

1. 进入仓库的 **Settings** 标签
2. 左侧菜单找到 **Pages**
3. 在 "Source" 下选择：
   - Branch: **main**
   - Folder: **/ (root)**
4. 点击 **Save**
5. 等待1-2分钟，页面会显示访问地址：
   ```
   https://你的用户名.github.io/arknights-vote/
   ```

### 步骤4：创建版本标签（用于jsDelivr）

```bash
# 创建版本标签
git tag v1.0
git push origin v1.0
```

这样jsDelivr就可以通过 `@v1.0` 访问固定版本。

---

## 🎨 第五部分：图片上传和优化

### 步骤1：准备图片

确保所有图片都在 `images/` 文件夹中，命名正确。

### 步骤2：压缩图片（重要！）

使用在线工具压缩图片，减小文件大小：
- [TinyPNG](https://tinypng.com/) - 支持PNG/JPG
- [Squoosh](https://squoosh.app/) - Google出品

目标：单张图片控制在 200-500KB

### 步骤3：提交图片到GitHub

```bash
git add images/
git commit -m "Add operator artwork images"
git push
```

### 步骤4：测试图片CDN链接

访问以下链接测试（替换为你的用户名）：
```
https://cdn.jsdelivr.net/gh/你的用户名/arknights-vote@v1.0/images/立绘_锏_1.png
```

如果能正常显示，说明CDN配置成功！

---

## 🔗 第六部分：（可选）使用阿里云域名和服务器

既然你有阿里云服务器和域名，可以做以下优化：

### 方案A：仅使用自定义域名（推荐）

让GitHub Pages使用你的域名：

**步骤1：配置DNS**

在阿里云域名控制台添加CNAME记录：
```
类型: CNAME
主机记录: vote（或你想要的子域名）
记录值: 你的用户名.github.io
```

**步骤2：配置GitHub Pages**

1. 在仓库 Settings → Pages
2. Custom domain 输入：`vote.你的域名.com`
3. 点击 Save
4. 勾选 "Enforce HTTPS"

**步骤3：等待生效**

DNS propagation需要几分钟到几小时。

### 方案B：使用阿里云服务器作为反向代理（高级）

如果你希望更好的国内访问速度：

**步骤1：在服务器上安装Nginx**

```bash
# 连接服务器
ssh root@你的服务器IP

# 安装Nginx
sudo apt update
sudo apt install nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**步骤2：配置Nginx反向代理**

创建配置文件 `/etc/nginx/sites-available/arknights-vote`：

```nginx
server {
    listen 80;
    server_name vote.你的域名.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vote.你的域名.com;
    
    # SSL证书（使用Let's Encrypt免费证书）
    ssl_certificate /etc/letsencrypt/live/你的域名.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/你的域名.com/privkey.pem;
    
    # 反向代理到GitHub Pages
    location / {
        proxy_pass https://你的用户名.github.io;
        proxy_set_header Host 你的用户名.github.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # 缓存静态资源
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # 图片直接从阿里云OSS加载（如果使用）
    location /images/ {
        proxy_pass https://你的bucket.oss-区域.aliyuncs.com/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**步骤3：申请SSL证书**

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d vote.你的域名.com
```

**步骤4：启用配置**

```bash
sudo ln -s /etc/nginx/sites-available/arknights-vote /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

### 方案C：完全自建（不推荐）

你也可以把整个网站放在阿里云服务器上，但这样：
- ❌ 需要自己维护服务器
- ❌ 需要配置数据库
- ❌ 成本更高
- ✅ 完全控制权
- ✅ 最佳国内速度

对于投票项目，**方案A或B就足够了**。

---

## 📊 第七部分：测试和监控

### 测试清单

- [ ] 访问GitHub Pages链接能打开页面
- [ ] 图片能正常加载
- [ ] 选择干员和立绘功能正常
- [ ] 提交投票成功
- [ ] 统计数据实时更新
- [ ] 多设备同时投票能看到彼此的数据
- [ ] 手机端显示正常

### 监控Firebase使用情况

1. 进入 Firebase Console
2. 查看 "Usage" 标签
3. 监控：
   - 数据库读取/写入次数
   - 存储空间使用
   - 网络带宽

免费额度：
- Realtime Database: 1GB存储，10GB/月下载
- 对于投票项目，足够数万人使用

---

## 🔒 第八部分：安全加固（生产环境）

### 改进数据库规则

```json
{
  "rules": {
    "votes": {
      "$voteId": {
        ".read": true,
        ".write": "!data.exists() || newData.child('count').val() === data.child('count').val() + 1"
      }
    },
    "voteDetails": {
      "$voteId": {
        ".read": true,
        ".write": "!data.exists()"
      }
    }
  }
}
```

这个规则：
- ✅ 允许任何人读取
- ✅ 只能增加票数，不能减少
- ✅ 每个投票记录只能创建一次

### 添加防刷票机制

在 `script.js` 中添加：

```javascript
// 检查是否已经投过票（基于localStorage）
function hasVoted() {
    return localStorage.getItem('has_voted_arknights') === 'true';
}

function markAsVoted() {
    localStorage.setItem('has_voted_arknights', 'true');
    localStorage.setItem('vote_timestamp', Date.now().toString());
}

// 修改 submitVote 函数开头
async function submitVote() {
    if (hasVoted()) {
        // 检查是否超过24小时
        const lastVote = parseInt(localStorage.getItem('vote_timestamp') || '0');
        const hoursPassed = (Date.now() - lastVote) / (1000 * 60 * 60);
        
        if (hoursPassed < 24) {
            alert(`你已经投过票了！请${Math.ceil(24 - hoursPassed)}小时后再试。`);
            return;
        }
    }
    
    // ... 原有投票逻辑
    
    // 标记已投票
    markAsVoted();
}
```

---

## 📱 第九部分：分享和推广

### 生成分享卡片

创建一个简单的分享文案：

```
🐑 明日方舟羊年窗花投票开始啦！

快来为你喜欢的羊角干员投票吧～
可以选择精一、精二或皮肤立绘哦！

投票链接：https://vote.你的域名.com

#明日方舟 #羊年窗花
```

### 分享到

- 明日方舟贴吧
- B站动态
- QQ群/微信群
- 微博
- NGA论坛

---

## 🎯 完整部署时间线

| 步骤 | 预计时间 | 难度 |
|------|---------|------|
| Firebase设置 | 15分钟 | ⭐⭐ |
| 图片准备和压缩 | 30分钟 | ⭐ |
| 代码修改 | 20分钟 | ⭐⭐⭐ |
| GitHub Pages部署 | 10分钟 | ⭐ |
| 域名配置（可选） | 15分钟 | ⭐⭐ |
| 测试和优化 | 20分钟 | ⭐⭐ |
| **总计** | **约2小时** | - |

---

## 💰 成本总结

| 项目 | 费用 |
|------|------|
| GitHub Pages | ¥0 |
| Firebase | ¥0（免费额度内） |
| jsDelivr CDN | ¥0 |
| 阿里云域名 | 已购买 |
| 阿里云服务器 | 已购买（可选使用） |
| **总计** | **¥0** |

如果使用阿里云OSS存储图片：
- OSS存储+流量：约 ¥10-20/月

---

## 🆘 常见问题

### Q1: 图片加载慢怎么办？
A: 
1. 确保图片已压缩（<500KB）
2. 使用jsDelivr CDN（已有国内节点）
3. 或使用阿里云OSS+CDN

### Q2: Firebase连接超时？
A:
1. 检查databaseURL是否正确
2. 确认防火墙没有阻止
3. 尝试切换浏览器

### Q3: 统计数据不更新？
A:
1. 检查Firebase规则是否正确
2. 查看浏览器控制台错误
3. 确认Firebase配置正确

### Q4: 如何备份投票数据？
A:
在Firebase Console中：
1. Realtime Database → 数据标签
2. 点击右上角三个点
3. 选择"导出JSON"

### Q5: 国内访问GitHub Pages慢？
A:
使用方案：
1. 阿里云服务器做反向代理（方案B）
2. 或使用Cloudflare Workers代理

---

## ✨ 完成！

按照以上步骤，你将拥有：
- ✅ 多人实时投票系统
- ✅ 快速加载的图片CDN
- ✅ 自定义域名（可选）
- ✅ 完全免费的部署方案
- ✅ 良好的国内访问速度

**祝你部署顺利！** 🎉🐑

有任何问题随时问我！
