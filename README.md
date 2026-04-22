# 🐑 明日方舟羊年窗花投票页面

一个为明日方舟玩家设计的多人投票页面，让大家投票选择明年（羊年）阳台门上要贴的干员窗花。

**✨ 已升级为多人实时投票系统！**

## ✨ 功能特性

- 🎯 **多选投票**：可以选择多个喜欢的干员
- 🖼️ **立绘选择**：为每个干员指定精一、精二或皮肤立绘
- 📊 **实时统计**：查看每个干员的投票数量和进度条
- 💾 **数据持久化**：投票数据自动保存
- 📱 **响应式设计**：支持手机和电脑访问
- 🎨 **精美UI**：渐变色彩和流畅动画

## 🎮 使用说明

### 1. 选择干员
- 点击任意干员卡片
- 在弹出的窗口中选择想要的立绘（精一/精二/皮肤）
- 可以重复操作选择多个干员

### 2. 查看已选
- 在"已选择的干员"区域可以看到所有已选干员
- 点击 × 按钮可以移除某个干员

### 3. 提交投票
- 选择完成后点击"提交投票"按钮
- 投票成功后会显示提示

### 4. 查看统计
- 页面顶部的统计面板显示所有干员的得票数
- 按票数从高到低排序
- 显示每个立绘的具体票数

## 📁 项目结构

```
arknights-vote/
├── index.html          # 主页面
├── style.css           # 样式文件
├── data.js             # 干员数据配置
├── script.js           # 主要逻辑
├── DEPLOYMENT.md       # 部署指南
└── README.md           # 说明文档
```

## 🎨 包含的干员

### 六星干员 ⭐⭐⭐⭐⭐⭐
- 锏
- 止颂
- 纯烬艾雅法拉
- 黑键
- 卡涅利安
- 艾雅法拉

### 五星干员 ⭐⭐⭐⭐⭐
- 哈蒂娅
- 复奏
- 折光
- 贝娜
- 蜜蜡

### 四星干员 ⭐⭐⭐⭐
- 协律
- 地灵

## 🔧 自定义配置

### 添加新干员

编辑 `data.js` 文件，添加新的干员对象：

```javascript
{
    id: 'unique_id',           // 唯一标识
    name: '干员名称',          // 显示名称
    rarity: 6,                 // 星级 (4-6)
    artworks: [                // 可用立绘列表
        { label: '精一立绘', filename: '立绘_XXX_1.png' },
        { label: '精二立绘', filename: '立绘_XXX_2.png' },
        { label: '皮肤1', filename: '立绘_XXX_skin1.png' }
    ]
}
```

### 修改图片路径

如果需要显示真实图片，需要：

1. 创建 `images/` 文件夹
2. 按照命名规则放入图片
3. 修改 `script.js` 中的图片显示逻辑（见 DEPLOYMENT.md）

## 🚀 快速开始

### 本地运行（单人测试）

```bash
# 方法1：直接打开
双击 index.html 文件

# 方法2：使用本地服务器
cd arknights-vote
python -m http.server 8080
# 访问 http://localhost:8080
```

### 在线部署（多人投票）

**📖 详细部署指南请查看：**

1. **[DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)** - 🌟 从这里开始！方案选择和对比
2. **[COMPLETE_DEPLOYMENT.md](COMPLETE_DEPLOYMENT.md)** - 完整部署步骤（GitHub Pages + Firebase）
3. **[ALIYUN_DEPLOYMENT.md](ALIYUN_DEPLOYMENT.md)** - 阿里云优化方案（推荐）
4. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 部署检查清单

**推荐方案：**
- **新手**: GitHub Pages + Firebase + jsDelivr（完全免费）
- **推荐**: GitHub Pages + Firebase + 阿里云OSS（¥5-15/月，速度最快）
- **高级**: 阿里云全套（自定义程度高）

## 💡 技术栈

- HTML5
- CSS3 (Grid, Flexbox, 渐变)
- JavaScript (ES6+)
- LocalStorage / Firebase（可选）

## 📝 数据存储说明

### 当前版本（支持两种模式）

#### 模式1：LocalStorage（本地测试）
- 数据存储在浏览器本地
- 适合个人测试和演示
- 清除浏览器数据会丢失
- 无需配置，开箱即用

#### 模式2：Firebase（多人投票）⭐
- 云端数据库存储
- 多用户共享数据
- 实时同步统计
- 免费额度充足
- 需要简单配置

**配置方法：**
1. 在 `config.js` 中填入Firebase配置
2. 系统会自动检测并使用Firebase
3. 如果未配置，自动降级为LocalStorage

详见 [COMPLETE_DEPLOYMENT.md](COMPLETE_DEPLOYMENT.md)

## 🎯 未来改进方向

- [ ] 添加干员搜索功能
- [ ] 按星级筛选
- [ ] 导出投票结果
- [ ] 添加防刷票机制
- [ ] 分享功能
- [ ] 更多动画效果

## 📄 许可证

本项目仅供学习和娱乐使用。

明日方舟相关素材版权归鹰角网络所有。

## 🙏 致谢

- 数据来源：[PRTS Wiki](https://prts.wiki/)
- 灵感来源：马年窗花活动

---

**祝各位博士投票愉快！🎉**
