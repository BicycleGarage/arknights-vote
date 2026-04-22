# 🚀 阿里云服务器优化部署方案

## 📋 方案概述

既然你已经有阿里云轻量应用服务器和域名，可以利用它们来优化访问体验：

### 可选优化方案

| 方案 | 优势 | 难度 | 推荐度 |
|------|------|------|--------|
| A. 仅自定义域名 | 品牌化、易记 | ⭐ | ⭐⭐⭐⭐⭐ |
| B. Nginx反向代理 | 国内加速、缓存 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| C. OSS存储图片 | 图片加载快 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| D. 完全自建 | 完全控制 | ⭐⭐⭐⭐ | ⭐⭐ |

**推荐组合：A + C（最简单有效）**

---

## 🎯 方案A：使用自定义域名（强烈推荐）

让你的投票页面拥有专业域名，如 `vote.yourdomain.com`

### 步骤1：配置DNS解析

1. 登录 [阿里云域名控制台](https://dc.console.aliyun.com/)
2. 找到你的域名，点击"解析"
3. 添加记录：
   ```
   记录类型: CNAME
   主机记录: vote（或你想要的子域名）
   记录值: 你的GitHub用户名.github.io
   TTL: 10分钟
   ```

例如：
- 完整域名：`vote.example.com`
- 指向：`yourusername.github.io`

### 步骤2：配置GitHub Pages

1. 进入GitHub仓库 → Settings → Pages
2. Custom domain 输入：`vote.example.com`
3. 点击 Save
4. 等待几分钟后，勾选 "Enforce HTTPS"

### 步骤3：验证

访问 `https://vote.example.com` 应该能看到你的投票页面。

**完成！** 就这么简单，你已经有了自定义域名。

---

## 🖼️ 方案C：使用阿里云OSS存储图片（强烈推荐）

将立绘图片存储在阿里云OSS，配合CDN加速，国内访问速度极快。

### 步骤1：创建OSS Bucket

1. 登录 [阿里云OSS控制台](https://oss.console.aliyun.com/)
2. 点击"创建Bucket"
3. 配置：
   - **Bucket名称**: `arknights-vote-images`（全局唯一）
   - **区域**: 选择离你近的（如华东1-杭州）
   - **存储类型**: 标准存储
   - **读写权限**: **公共读**（重要！）
   - 其他默认

### 步骤2：上传图片

#### 方法1：网页上传
1. 进入Bucket
2. 点击"文件管理"
3. 创建文件夹 `images/`
4. 上传所有立绘图片

#### 方法2：使用ossbrowser工具（推荐）
1. 下载 [ossbrowser](https://help.aliyun.com/document_detail/61872.html)
2. 使用AccessKey登录
3. 批量上传整个images文件夹

### 步骤3：获取访问地址

外网访问格式：
```
https://bucket名.oss-区域.aliyuncs.com/images/文件名
```

例如：
```
https://arknights-vote-images.oss-cn-hangzhou.aliyuncs.com/images/立绘_锏_1.png
```

### 步骤4：修改config.js

编辑 `config.js` 文件：

```javascript
// 注释掉jsDelivr配置
// const IMAGE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/arknights-vote@main/images';

// 启用阿里云OSS配置
const IMAGE_CDN_BASE = 'https://arknights-vote-images.oss-cn-hangzhou.aliyuncs.com/images';
```

### 步骤5：（可选）绑定自定义域名到OSS

1. 在OSS控制台 → Bucket → 域名管理
2. 绑定域名：`img.example.com`
3. 在DNS添加CNAME记录指向OSS
4. 申请SSL证书（免费）
5. 开启CDN加速

然后修改config.js：
```javascript
const IMAGE_CDN_BASE = 'https://img.example.com/images';
```

### 💰 OSS费用估算

假设100张图片，每张图片300KB：

- **存储空间**: 30MB ≈ ¥0.01/月
- **流量费用**: 
  - 1000次访问 × 30MB = 30GB
  - 约 ¥2.5/月
- **CDN加速**（可选）: 约 ¥5-10/月

**总计：约 ¥3-15/月**（非常便宜！）

---

## 🔧 方案B：Nginx反向代理（进阶）

如果你希望更好的国内访问速度和缓存控制。

### 步骤1：连接服务器

```bash
ssh root@你的服务器IP
```

### 步骤2：安装Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤3：配置反向代理

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/arknights-vote
```

粘贴以下内容：

```nginx
server {
    listen 80;
    server_name vote.example.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vote.example.com;
    
    # SSL证书路径
    ssl_certificate /etc/letsencrypt/live/vote.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vote.example.com/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 反向代理到GitHub Pages
    location / {
        proxy_pass https://你的用户名.github.io;
        proxy_set_header Host 你的用户名.github.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # 缓存静态资源
        expires 1d;
        add_header Cache-Control "public, no-transform";
        
        # 跨域支持
        add_header Access-Control-Allow-Origin *;
    }
    
    # 如果图片在本地服务器上
    location /images/ {
        alias /var/www/arknights-vote/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 步骤4：申请SSL证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请证书
sudo certbot --nginx -d vote.example.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 步骤5：启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/arknights-vote /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 步骤6：配置防火墙

```bash
# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 优势

- ✅ 国内访问更快
- ✅ 可以缓存静态资源
- ✅ 完全控制
- ✅ 可以添加自定义功能

### 劣势

- ❌ 需要维护服务器
- ❌ 配置复杂
- ❌ 服务器故障会影响服务

---

## 🎨 方案D：完全自建（不推荐）

把整个网站放在阿里云服务器上。

### 为什么不推荐？

- ❌ 需要自己维护数据库
- ❌ 需要配置Firebase替代方案
- ❌ 成本更高
- ❌ 维护工作量大
- ✅ 除非你有特殊需求，否则不建议

但如果你坚持要这样做，可以参考以下步骤：

### 简要步骤

1. **安装Node.js和PM2**
2. **使用Express搭建Web服务器**
3. **使用SQLite或MySQL存储数据**
4. **配置Nginx反向代理**
5. **设置SSL证书**

这需要较多的后端开发知识，对于投票项目来说过于复杂。

---

## 🚀 最佳实践推荐

### 推荐架构

```
用户访问流程：
浏览器 → 阿里云域名(vote.example.com) → GitHub Pages(网页) 
                                    ↓
                            Firebase(投票数据)
                                    ↓
                          阿里云OSS(立绘图片)
```

### 配置清单

1. **域名**: `vote.example.com` → GitHub Pages
2. **数据库**: Firebase Realtime Database
3. **图片**: 阿里云OSS + CDN
4. **HTTPS**: Let's Encrypt（自动）

### 优点

- ✅ 完全免费（除了OSS少量费用）
- ✅ 国内访问速度快
- ✅ 稳定可靠
- ✅ 易于维护
- ✅ 专业域名

---

## 📊 性能对比

| 配置 | 国内加载速度 | 稳定性 | 成本 |
|------|------------|--------|------|
| 仅GitHub Pages | ⭐⭐⭐ | ⭐⭐⭐⭐ | ¥0 |
| + 阿里云域名 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ¥0 |
| + OSS图片 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ¥5-15/月 |
| + Nginx代理 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ¥0（服务器已购买） |

---

## 🔍 监控和优化

### 检查OSS使用情况

1. 登录OSS控制台
2. 查看"监控图表"
3. 关注：
   - 存储空间使用
   - 流量消耗
   - 请求次数

### 优化图片

1. **压缩图片**: 使用TinyPNG压缩到200-500KB
2. **使用WebP格式**: 体积更小（但兼容性稍差）
3. **懒加载**: 代码中已实现 `loading="lazy"`

### CDN加速OSS

1. 在阿里云开通CDN服务
2. 创建CDN加速域名
3. 源站设置为OSS
4. 配置缓存规则

这样可以进一步降低OSS流量费用，提高访问速度。

---

## 🛠️ 常见问题

### Q1: OSS图片访问403错误？

A: 检查Bucket权限是否设置为"公共读"

### Q2: 域名解析不生效？

A: DNS propagation需要时间，通常几分钟到几小时

### Q3: HTTPS证书过期？

A: Certbot会自动续期，检查cron任务：
```bash
sudo crontab -l | grep certbot
```

### Q4: Nginx配置后无法访问？

A: 检查：
```bash
sudo nginx -t          # 测试配置
sudo systemctl status nginx  # 查看状态
sudo tail -f /var/log/nginx/error.log  # 查看错误日志
```

### Q5: 如何备份OSS图片？

A: 
1. 使用ossbrowser下载
2. 或使用ossutil命令行工具
3. 或设置跨区域复制

---

## 💡 总结建议

根据你的情况，我推荐：

### 最小配置（5分钟）
1. ✅ 配置阿里云域名CNAME到GitHub Pages
2. ✅ 使用jsDelivr CDN加载图片

### 推荐配置（30分钟）
1. ✅ 配置阿里云域名
2. ✅ 使用阿里云OSS存储图片
3. ✅ 使用Firebase存储投票数据

### 高级配置（2小时）
1. ✅ 以上全部
2. ✅ Nginx反向代理
3. ✅ OSS + CDN加速
4. ✅ 自定义优化

**对于你的需求，"推荐配置"最合适！**

---

## 📞 需要帮助？

如果在配置过程中遇到问题：
1. 查看阿里云官方文档
2. 检查Nginx错误日志
3. 使用浏览器开发者工具调试
4. 随时问我！

祝你部署顺利！🎉
