// 全局状态管理
let selectedOperators = new Map(); // 存储已选干员及其立绘
let currentSelectingOperator = null; // 当前正在选择立绘的干员

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    renderOperators();
    loadStatistics();
    setupEventListeners();
});

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
    
    card.innerHTML = `
        <div class="select-indicator">✓</div>
        <div class="operator-header">
            <span class="operator-name">${operator.name}</span>
            <span class="rarity-badge ${rarityClass}">${'★'.repeat(operator.rarity)}</span>
        </div>
        <div class="operator-image-placeholder">
            📷 ${operator.name}立绘
        </div>
        <p style="color: #666; font-size: 0.9rem;">点击选择干员</p>
    `;
    
    card.addEventListener('click', () => handleOperatorClick(operator));
    
    return card;
}

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
    
    const artworkOptions = operator.artworks.map((artwork, index) => `
        <div class="artwork-option" data-index="${index}">
            <div class="artwork-label">${artwork.label}</div>
            <div class="artwork-filename">${artwork.filename}</div>
        </div>
    `).join('');
    
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

// 提交投票
function submitVote() {
    if (selectedOperators.size === 0) {
        alert('请至少选择一个干员！');
        return;
    }
    
    // 获取当前投票数据
    const votes = JSON.parse(localStorage.getItem('arknights_votes') || '{}');
    
    // 更新投票计数
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
    
    // 保存到本地存储
    localStorage.setItem('arknights_votes', JSON.stringify(votes));
    
    // 显示成功提示
    document.getElementById('successModal').classList.remove('hidden');
    
    // 清空选择
    selectedOperators.clear();
    document.querySelectorAll('.operator-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateSelectedPreview();
    updateSubmitButton();
    
    // 刷新统计
    loadStatistics();
}

// 加载统计数据
function loadStatistics() {
    const container = document.getElementById('statsContainer');
    const votes = JSON.parse(localStorage.getItem('arknights_votes') || '{}');
    
    if (Object.keys(votes).length === 0) {
        container.innerHTML = '<p class="loading-text">暂无投票数据</p>';
        return;
    }
    
    // 按干员分组统计
    const statsMap = new Map();
    
    Object.values(votes).forEach(vote => {
        if (!statsMap.has(vote.operatorName)) {
            statsMap.set(vote.operatorName, {
                name: vote.operatorName,
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
    
    // 转换为数组并排序
    const statsArray = Array.from(statsMap.values())
        .sort((a, b) => b.totalVotes - a.totalVotes);
    
    // 找出最大值用于计算百分比
    const maxVotes = Math.max(...statsArray.map(s => s.totalVotes));
    
    // 渲染统计
    container.innerHTML = statsArray.map(stat => {
        const percentage = maxVotes > 0 ? (stat.totalVotes / maxVotes * 100) : 0;
        
        const artworksHtml = stat.artworks.map(artwork => `
            <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                ${artwork.label}: ${artwork.count}票
            </div>
        `).join('');
        
        return `
            <div class="stat-item">
                <div class="stat-name">${stat.name}</div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stat-count">${stat.totalVotes} 票</div>
                ${artworksHtml}
            </div>
        `;
    }).join('');
}
