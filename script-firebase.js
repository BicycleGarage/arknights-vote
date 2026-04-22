// ==========================================
// 明日方舟投票页面 - Firebase版本
// ==========================================

// 全局状态管理
let selectedOperators = new Map(); // 存储已选干员及其立绘
let currentSelectingOperator = null; // 当前正在选择立绘的干员
let useFirebase = false; // 是否使用Firebase

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否使用Firebase
    useFirebase = (typeof database !== 'undefined' && database !== null);
    
    console.log('🚀 页面初始化, 使用', useFirebase ? 'Firebase' : 'LocalStorage', '模式');
    
    renderOperators();
    loadStatistics();
    setupEventListeners();
});

// ==========================================
// 工具函数
// ==========================================

// 转义Firebase键名中的特殊字符
// Firebase不允许: . # $ / [ ]
function escapeFirebaseKey(key) {
    return key
        .replace(/\./g, '_dot_')
        .replace(/#/g, '_hash_')
        .replace(/\$/g, '_dollar_')
        .replace(/\//g, '_slash_')
        .replace(/\[/g, '_open_')
        .replace(/\]/g, '_close_');
}

// 反转义Firebase键名
function unescapeFirebaseKey(key) {
    return key
        .replace(/_dot_/g, '.')
        .replace(/_hash_/g, '#')
        .replace(/_dollar_/g, '$')
        .replace(/_slash_/g, '/')
        .replace(/_open_/g, '[')
        .replace(/_close_/g, ']');
}

// 生成投票键名（已转义）
function generateVoteKey(operatorId, filename) {
    const rawKey = `${operatorId}_${filename}`;
    return escapeFirebaseKey(rawKey);
}

// ==========================================
// 图片查看器功能
// ==========================================

let imageViewerState = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    startX: 0,
    startY: 0
};

// 打开图片查看器
function openImageViewer(imageUrl, title) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    viewer.id = 'imageViewer';
    
    viewer.innerHTML = `
        <div class="image-viewer-overlay"></div>
        <div class="image-viewer-container">
            <div class="image-viewer-header">
                <h3>${title}</h3>
                <button class="close-viewer-btn" onclick="closeImageViewer()">✕</button>
            </div>
            <div class="image-viewer-content">
                <img src="${imageUrl}" 
                     id="viewerImage" 
                     alt="${title}"
                     style="transform: scale(1) translate(0px, 0px);">
            </div>
            <div class="image-viewer-controls">
                <button class="control-btn" onclick="zoomOut()" title="缩小">➖</button>
                <button class="control-btn" onclick="resetZoom()" title="重置">🔄</button>
                <button class="control-btn" onclick="zoomIn()" title="放大">➕</button>
            </div>
            <p class="viewer-hint">💡 提示：鼠标滚轮缩放，拖动移动，双击重置</p>
        </div>
    `;
    
    document.body.appendChild(viewer);
    
    // 重置状态
    imageViewerState = {
        scale: 1,
        translateX: 0,
        translateY: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    };
    
    // 绑定事件
    setupImageViewerEvents();
}

// 关闭图片查看器
function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.remove();
    }
}

// 设置查看器事件
function setupImageViewerEvents() {
    const viewer = document.getElementById('imageViewer');
    const overlay = viewer.querySelector('.image-viewer-overlay');
    const img = document.getElementById('viewerImage');
    const content = viewer.querySelector('.image-viewer-content');
    
    // 点击背景关闭
    overlay.addEventListener('click', closeImageViewer);
    
    // 鼠标滚轮缩放
    content.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoom(delta);
    });
    
    // 双击重置
    content.addEventListener('dblclick', resetZoom);
    
    // 鼠标拖动
    content.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
            imageViewerState.isDragging = true;
            imageViewerState.startX = e.clientX - imageViewerState.translateX;
            imageViewerState.startY = e.clientY - imageViewerState.translateY;
            content.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (imageViewerState.isDragging) {
            imageViewerState.translateX = e.clientX - imageViewerState.startX;
            imageViewerState.translateY = e.clientY - imageViewerState.startY;
            updateImageTransform();
        }
    });
    
    document.addEventListener('mouseup', () => {
        imageViewerState.isDragging = false;
        content.style.cursor = 'grab';
    });
    
    // 触摸事件（移动端）
    let lastTouchDistance = 0;
    
    content.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            imageViewerState.isDragging = true;
            imageViewerState.startX = e.touches[0].clientX - imageViewerState.translateX;
            imageViewerState.startY = e.touches[0].clientY - imageViewerState.translateY;
        } else if (e.touches.length === 2) {
            lastTouchDistance = getTouchDistance(e.touches);
        }
    });
    
    content.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && imageViewerState.isDragging) {
            imageViewerState.translateX = e.touches[0].clientX - imageViewerState.startX;
            imageViewerState.translateY = e.touches[0].clientY - imageViewerState.startY;
            updateImageTransform();
        } else if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches);
            const delta = (distance - lastTouchDistance) * 0.01;
            zoom(delta);
            lastTouchDistance = distance;
        }
    });
    
    content.addEventListener('touchend', () => {
        imageViewerState.isDragging = false;
    });
    
    // ESC 键关闭
    document.addEventListener('keydown', handleViewerKeydown);
}

// 处理键盘事件
function handleViewerKeydown(e) {
    if (e.key === 'Escape') {
        closeImageViewer();
    } else if (e.key === '+' || e.key === '=') {
        zoomIn();
    } else if (e.key === '-') {
        zoomOut();
    } else if (e.key === '0') {
        resetZoom();
    }
}

// 获取触摸距离
function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// 缩放
function zoom(delta) {
    const newScale = Math.max(0.5, Math.min(5, imageViewerState.scale + delta));
    imageViewerState.scale = newScale;
    updateImageTransform();
}

// 放大
function zoomIn() {
    zoom(0.2);
}

// 缩小
function zoomOut() {
    zoom(-0.2);
}

// 重置缩放
function resetZoom() {
    imageViewerState.scale = 1;
    imageViewerState.translateX = 0;
    imageViewerState.translateY = 0;
    updateImageTransform();
}

// 更新图片变换
function updateImageTransform() {
    const img = document.getElementById('viewerImage');
    if (img) {
        img.style.transform = `scale(${imageViewerState.scale}) translate(${imageViewerState.translateX / imageViewerState.scale}px, ${imageViewerState.translateY / imageViewerState.scale}px)`;
    }
}

// ==========================================
// 渲染功能
// ==========================================

// 渲染干员列表
function renderOperators() {
    const container = document.getElementById('operatorsList');
    
    operatorsData.forEach(operator => {
        const card = createOperatorCard(operator);
        container.appendChild(card);
    });
}

// 创建干员卡片
function createOperatorCard(operator) {
    const card = document.createElement('div');
    card.className = 'operator-card';
    card.dataset.operatorId = operator.id;
    
    const rarityClass = `rarity-${operator.rarity}`;
    const firstArtwork = operator.artworks[0];
    const imageUrl = getImageUrl(firstArtwork.filename);
    
    card.innerHTML = `
        <div class="select-indicator">✓</div>
        <div class="operator-header">
            <span class="operator-name">${operator.name}</span>
            <span class="rarity-badge ${rarityClass}">${'★'.repeat(operator.rarity)}</span>
        </div>
        <div class="image-container">
            <img src="${imageUrl}" 
                 alt="${operator.name}" 
                 class="operator-image"
                 loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="operator-image-placeholder" style="display:none;">
                📷 ${operator.name}立绘
            </div>
            <button class="zoom-btn" onclick="event.stopPropagation(); openImageViewer('${imageUrl}', '${operator.name}')" title="查看大图">
                🔍
            </button>
        </div>
        <p style="color: #666; font-size: 0.9rem;">点击选择干员</p>
    `;
    
    card.addEventListener('click', () => handleOperatorClick(operator));
    
    return card;
}

// ==========================================
// 交互功能
// ==========================================

// 处理干员点击事件
function handleOperatorClick(operator) {
    currentSelectingOperator = operator;
    showArtworkModal(operator);
}

// 显示立绘选择弹窗
function showArtworkModal(operator) {
    // 移除旧的弹窗
    const oldModal = document.querySelector('.artwork-modal');
    if (oldModal) {
        oldModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'artwork-modal';
    
    const artworkOptions = operator.artworks.map((artwork, index) => {
        const imageUrl = getImageUrl(artwork.filename);
        return `
            <div class="artwork-option" data-index="${index}">
                <div class="artwork-label">${artwork.label}</div>
                <div class="artwork-filename">${artwork.filename}</div>
                <div class="image-container">
                    <img src="${imageUrl}" 
                         style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 5px; margin-top: 8px;"
                         onerror="this.style.display='none'">
                    <button class="zoom-btn" onclick="event.stopPropagation(); openImageViewer('${imageUrl}', '${artwork.label}')" title="查看大图">
                        🔍
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="artwork-modal-content">
            <h3>选择 ${operator.name} 的立绘</h3>
            <div class="artwork-options">
                ${artworkOptions}
            </div>
            <div class="modal-buttons">
                <button class="confirm-btn">确认选择</button>
                <button class="cancel-btn">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定选项点击事件
    const options = modal.querySelectorAll('.artwork-option');
    let selectedIndex = 0;
    
    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedIndex = index;
        });
    });
    
    // 默认选中第一个
    options[0].classList.add('selected');
    
    // 确认按钮
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        const selectedArtwork = operator.artworks[selectedIndex];
        addSelectedOperator(operator, selectedArtwork);
        modal.remove();
    });
    
    // 取消按钮
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 添加已选干员
function addSelectedOperator(operator, artwork) {
    selectedOperators.set(operator.id, {
        operator: operator,
        artwork: artwork
    });
    
    updateOperatorCardSelection(operator.id, true);
    updateSelectedPreview();
    updateSubmitButton();
}

// 更新干员卡片选中状态
function updateOperatorCardSelection(operatorId, isSelected) {
    const card = document.querySelector(`[data-operator-id="${operatorId}"]`);
    if (card) {
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }
}

// 更新已选预览
function updateSelectedPreview() {
    const container = document.getElementById('selectedOperators');
    
    if (selectedOperators.size === 0) {
        container.innerHTML = '<p class="empty-hint">尚未选择任何干员</p>';
        return;
    }
    
    container.innerHTML = '';
    
    selectedOperators.forEach((value, key) => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        
        item.innerHTML = `
            <div class="selected-info">
                <div class="selected-operator-name">${value.operator.name}</div>
                <div class="selected-artwork">${value.artwork.label}</div>
            </div>
            <button class="remove-btn" data-operator-id="${key}">×</button>
        `;
        
        container.appendChild(item);
    });
    
    // 绑定删除按钮事件
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const operatorId = e.target.dataset.operatorId;
            removeSelectedOperator(operatorId);
        });
    });
}

// 移除已选干员
function removeSelectedOperator(operatorId) {
    selectedOperators.delete(operatorId);
    updateOperatorCardSelection(operatorId, false);
    updateSelectedPreview();
    updateSubmitButton();
}

// 更新提交按钮状态
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitVote');
    submitBtn.disabled = selectedOperators.size === 0;
}

// 设置事件监听器
function setupEventListeners() {
    // 提交投票
    document.getElementById('submitVote').addEventListener('click', submitVote);
    
    // 关闭成功弹窗
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('successModal').classList.add('hidden');
    });
}

// ==========================================
// 改动日志功能
// ==========================================

// 切换改动日志显示/隐藏
function toggleChangelog() {
    const panel = document.getElementById('changelogPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// ==========================================
// 投票功能
// ==========================================

// 提交投票
async function submitVote() {
    if (selectedOperators.size === 0) {
        alert('请至少选择一个干员！');
        return;
    }
    
    // 检查是否已经投过票
    if (hasVoted()) {
        const remaining = getVoteCooldownRemaining();
        if (remaining > 0) {
            alert(`你已经投过票了！请${Math.ceil(remaining)}小时后再试。`);
            return;
        }
    }
    
    // 添加按钮点击反馈
    const submitBtn = document.getElementById('submitVote');
    submitBtn.classList.add('clicked');
    submitBtn.textContent = '提交中...';
    submitBtn.disabled = true;
    
    try {
        if (useFirebase) {
            await submitVoteToFirebase();
        } else {
            submitVoteToLocal();
        }
        
        // 标记已投票
        markAsVoted();
        
        // 显示成功提示
        document.getElementById('successModal').classList.remove('hidden');
        
        // 清空选择
        selectedOperators.clear();
        document.querySelectorAll('.operator-card').forEach(card => {
            card.classList.remove('selected');
        });
        updateSelectedPreview();
        updateSubmitButton();
        
        console.log('✅ 投票成功！');
        
    } catch (error) {
        console.error('❌ 投票失败:', error);
        alert('投票失败，请重试：' + error.message);
        
        // 恢复按钮状态
        submitBtn.textContent = '提交投票';
        submitBtn.disabled = false;
    } finally {
        // 移除点击效果
        setTimeout(() => {
            submitBtn.classList.remove('clicked');
            if (!submitBtn.disabled) {
                submitBtn.textContent = '提交投票';
            }
        }, 600);
    }
}

// 提交到Firebase
async function submitVoteToFirebase() {
    const updates = {};
    const timestamp = Date.now();
    
    selectedOperators.forEach((value, key) => {
        // 使用转义后的键名
        const voteKey = generateVoteKey(key, value.artwork.filename);
        
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
}

// 提交到LocalStorage（降级方案）
function submitVoteToLocal() {
    const votes = JSON.parse(localStorage.getItem('arknights_votes') || '{}');
    
    selectedOperators.forEach((value, key) => {
        const voteKey = `${key}_${value.artwork.filename}`;
        if (!votes[voteKey]) {
            votes[voteKey] = {
                operatorName: value.operator.name,
                artworkLabel: value.artwork.label,
                artworkFilename: value.artwork.filename,
                count: 0
            };
        }
        votes[voteKey].count++;
    });
    
    localStorage.setItem('arknights_votes', JSON.stringify(votes));
}

// ==========================================
// 统计功能
// ==========================================

// 加载统计数据
function loadStatistics() {
    const container = document.getElementById('statsContainer');
    container.innerHTML = '<p class="loading-text">加载中...</p>';
    
    if (useFirebase) {
        loadStatisticsFromFirebase();
    } else {
        loadStatisticsFromLocal();
    }
}

// 从Firebase加载统计
function loadStatisticsFromFirebase() {
    const container = document.getElementById('statsContainer');
    
    // 监听Firebase数据变化（实时更新）
    database.ref('voteDetails').on('value', (snapshot) => {
        const voteDetails = snapshot.val() || {};
        
        if (Object.keys(voteDetails).length === 0) {
            container.innerHTML = '<p class="loading-text">暂无投票数据，成为第一个投票的人吧！</p>';
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
            
            // 使用转义后的键名获取该立绘的票数
            const escapedKey = generateVoteKey(vote.operatorId, vote.artworkFilename);
            database.ref(`votes/${escapedKey}/count`).once('value', (countSnapshot) => {
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
                
                // 渲染统计
                renderStatistics(statsMap);
            });
        });
    }, (error) => {
        console.error('加载统计失败:', error);
        container.innerHTML = '<p class="loading-text">加载失败，请刷新页面</p>';
    });
}

// 从LocalStorage加载统计
function loadStatisticsFromLocal() {
    const container = document.getElementById('statsContainer');
    const votes = JSON.parse(localStorage.getItem('arknights_votes') || '{}');
    
    if (Object.keys(votes).length === 0) {
        container.innerHTML = '<p class="loading-text">暂无投票数据，成为第一个投票的人吧！</p>';
        return;
    }
    
    // 按干员分组统计
    const statsMap = new Map();
    
    Object.values(votes).forEach(vote => {
        if (!statsMap.has(vote.operatorName)) {
            // 查找干员信息
            const operator = operatorsData.find(op => op.name === vote.operatorName);
            statsMap.set(vote.operatorName, {
                id: operator ? operator.id : 'unknown',
                name: vote.operatorName,
                rarity: operator ? operator.rarity : 4,
                totalVotes: 0,
                artworks: []
            });
        }
        
        const operatorStat = statsMap.get(vote.operatorName);
        operatorStat.totalVotes += vote.count;
        operatorStat.artworks.push({
            label: vote.artworkLabel,
            filename: vote.artworkFilename,
            count: vote.count
        });
    });
    
    renderStatistics(statsMap);
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
                    <span class="rarity-badge ${rarityClass}" style="margin-right: 8px; font-size: 0.75rem;">${'★'.repeat(stat.rarity)}</span>
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

// ==========================================
// 调试工具（开发时使用）
// ==========================================

// 重置所有投票数据（仅用于测试）
function resetAllVotes() {
    if (confirm('确定要清除所有投票数据吗？此操作不可恢复！')) {
        if (useFirebase) {
            database.ref().remove()
                .then(() => {
                    alert('所有投票数据已清除');
                    loadStatistics();
                })
                .catch(error => {
                    alert('清除失败: ' + error.message);
                });
        } else {
            localStorage.removeItem('arknights_votes');
            resetVoteStatus();
            alert('所有投票数据已清除');
            loadStatistics();
        }
    }
}

// 在控制台暴露调试函数
if (typeof window !== 'undefined') {
    window.resetAllVotes = resetAllVotes;
    window.resetVoteStatus = resetVoteStatus;
    window.useFirebase = useFirebase;
}
