// 明日方舟羊年干员数据配置
const operatorsData = [
    {
        id: 'hatia',
        name: '哈蒂娅',
        rarity: 5,
        artworks: [
            { label: '精一立绘', filename: '立绘_哈蒂娅_1.webp' },
            { label: '精二立绘', filename: '立绘_哈蒂娅_2.webp' }
        ]
    },
    {
        id: 'fuzou',
        name: '复奏',
        rarity: 5,
        artworks: [
            { label: '精一立绘', filename: '立绘_复奏_1.webp' },
            { label: '精二立绘', filename: '立绘_复奏_2.webp' }
        ]
    },
    {
        id: 'xielv',
        name: '协律',
        rarity: 4,
        artworks: [
            { label: '精一立绘', filename: '立绘_协律_1.webp' },
            { label: '精二立绘', filename: '立绘_协律_2.webp' }
        ]
    },
    {
        id: 'jian',
        name: '锏',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_锏_1.webp' },
            { label: '精二立绘', filename: '立绘_锏_2.webp' },
            { label: '皮肤 - [异巫盛宴/WITCH FEAST] 暗月的影子', filename: '立绘_锏_skin1.webp' }
        ]
    },
    {
        id: 'zhisong',
        name: '止颂',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_止颂_1.webp' },
            { label: '精二立绘', filename: '立绘_止颂_2.webp' },
            { label: '皮肤 - [0011-飙系列] 幻火', filename: '立绘_止颂_skin1.webp' }
        ]
    },
    {
        id: 'zheguang',
        name: '折光',
        rarity: 5,
        artworks: [
            { label: '精一立绘', filename: '立绘_折光_1.webp' },
            { label: '精二立绘', filename: '立绘_折光_2.webp' },
            { label: '皮肤 - [时代/EPOQUE] 斜照', filename: '立绘_折光_skin1.webp' }
        ]
    },
    {
        id: 'eyjafalla_alt',
        name: '纯烬艾雅法拉',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_纯烬艾雅法拉_1.webp' },
            { label: '精二立绘', filename: '立绘_纯烬艾雅法拉_2.webp' },
            { label: '皮肤 - [时代/EPOQUE] 远行前的野餐', filename: '立绘_纯烬艾雅法拉_skin1.webp' }
        ]
    },
    {
        id: 'blackkey',
        name: '黑键',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_黑键_1.webp' },
            { label: '精二立绘', filename: '立绘_黑键_2.webp' },
            { label: '皮肤 - [斗争血脉/BLOODLINE OF COMBAT] 变奏', filename: '立绘_黑键_skin1.webp' }
        ]
    },
    {
        id: 'carnelian',
        name: '卡涅利安',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_卡涅利安_1.webp' },
            { label: '精二立绘', filename: '立绘_卡涅利安_2.webp' },
            { label: '皮肤1 - [冰原信使/Icefield Messenger] 霍恩洛厄的寒沙', filename: '立绘_卡涅利安_skin1.webp' },
            { label: '皮肤2 - [珊瑚海岸/CoralCoast] 灿阳朝露 SD08', filename: '立绘_卡涅利安_skin2.webp' }
        ]
    },
    {
        id: 'beina',
        name: '贝娜',
        rarity: 5,
        artworks: [
            { label: '精一立绘', filename: '立绘_贝娜_1.webp' },
            { label: '精二立绘', filename: '立绘_贝娜_2.webp' },
            { label: '皮肤 - [0011制造] 草原小帮手', filename: '立绘_贝娜_skin1.webp' }
        ]
    },
    {
        id: 'melantha',
        name: '蜜蜡',
        rarity: 5,
        artworks: [
            { label: '精一立绘', filename: '立绘_蜜蜡_1.webp' },
            { label: '精二立绘', filename: '立绘_蜜蜡_2.webp' },
            { label: '皮肤1 - [时代/EPOQUE] 白沙', filename: '立绘_蜜蜡_skin1.webp' },
            { label: '皮肤2 - [珊瑚海岸/CoralCoast] 悠然假日 HD61', filename: '立绘_蜜蜡_skin2.webp' }
        ]
    },
    {
        id: 'eyjafalla',
        name: '艾雅法拉',
        rarity: 6,
        artworks: [
            { label: '精一立绘', filename: '立绘_艾雅法拉_1.webp' },
            { label: '精二立绘', filename: '立绘_艾雅法拉_2.webp' },
            { label: '皮肤1 - [珊瑚海岸/CoralCoast] 夏卉 FA018', filename: '立绘_艾雅法拉_skin1.webp' },
            { label: '皮肤2 - [合作款/CROSSOVER] 绵绒小魔女', filename: '立绘_艾雅法拉_skin2.webp' }
        ]
    },
    {
        id: 'earthspirit',
        name: '地灵',
        rarity: 4,
        artworks: [
            { label: '精一立绘', filename: '立绘_地灵_1.webp' },
            { label: '精二立绘', filename: '立绘_地灵_2.webp' },
            { label: '皮肤 - [时代/EPOQUE] 主修领域', filename: '立绘_地灵_skin1.webp' }
        ]
    }
];
