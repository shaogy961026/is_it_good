// shared-subtitle.js — 集中管理所有工具的標題、副標題與分類
// 使用方式：各頁面在載入此腳本前設定 window.TOOL_ID = 數字

const TOOL_INFO = {
    10: {
        title: "星力強化計算機",
        bullets: [
            "比較各種衝裝策略的平均花費與成本風險",
            "找出最省錢的防爆門檻與卷軸搭配",
            "支援活動期間的效益試算（5/10/15 必過、費用減免等）"
        ]
    },
    11: {
        title: "機率型卷軸分析",
        bullets: [
            "設定保留門檻（如 +17 以上才留、+18 以上才留），預估能拿到的期望攻擊力",
            "算出對應策略的總花費",
            "比較各門檻 CP 值，找出最划算的衝裝方式"
        ]
    },
    12: {
        title: "超越等級箱子：隨機性觀察實驗室",
        bullets: [
            "親身感受「隨機性」難以預測的本質",
            "透過互動實驗，判斷機器設定是否符合統計期望"
        ]
    },
    13: {
        title: "閃炫+紅閃分析",
        bullets: [
            "預估打出雙排傳說、次頂等目標詞條的平均花費",
            "支援閃炫（6選3）與紅閃（鎖定機制）兩種模式"
        ]
    },
    14: {
        title: "HEXA屬性策略分析",
        bullets: [
            "預估升到目標「上面那排」（官方稱「主要屬性」，如 Lv.8、Lv.9）所需的碎片數量",
            "比較一般策略與最省碎片策略的成本差異",
            "了解從幸運到倒楣的整體成本分佈範圍"
        ]
    },
    15: {
        title: "寶玉加工分析",
        bullets: [
            "預估達成目標加工等級（如 Lv.6）的平均花費",
            "了解從最幸運到最倒楣的成本分佈範圍"
        ]
    },
    16: {
        title: "寶玉研磨分析",
        bullets: [
            "計算你的寶玉屬性相對於理論機率分佈的百分位數（PR）",
            "支援惡魔復仇者、傑諾等特殊職業的數值換算",
            "判斷目前屬性值不值得重新研磨"
        ]
    },
    17: {
        title: "內潛最佳策略分析",
        bullets: [
            "根據現有內潛狀態，找出最省名聲的鎖定方式",
            "預估達成目標所需的平均名聲消耗"
        ]
    },
    18: {
        title: "機率型卷軸複合動態策略",
        bullets: [
            "設定目標攻擊力，找出整體平均成本最低的衝卷路線",
            "動態引導你在每個節點做出最佳決策",
            "適合想確保達標、又希望盡量省錢的玩家"
        ]
    },
    19: {
        title: "珍貴的附加方塊分析",
        bullets: [
            "設定目標詞條與分數門檻，預估打出的機率與平均方塊消耗",
            "支援各裝備部位與詞條價值自訂"
        ]
    },
    20: {
        title: "結合方塊/結合附加方塊分析",
        bullets: [
            "設定目標潛能組合，預估完成的機率與平均方塊消耗",
            "支援結合方塊與結合附加方塊兩種模式"
        ]
    },
    21: {
        title: "裝備附加屬性(星火)計算機",
        bullets: [
            "設定目標數值與屬性權重，預估洗出的機率與平均消耗顆數",
            "量測現有裝備星火的理論百分位數"
        ]
    },
    22: {
        title: "殺人鯨拼圖期望值分析",
        bullets: [
            "預估湊齊目標拼圖所需的平均開箱數量",
            "支援碎片回收兌換的成本分析"
        ]
    },
    23: {
        title: "噴出岩輪迴星火(石板星火)計算機",
        bullets: [
            "專為噴出岩輪迴星火（石板星火）設計",
            "設定屬性權重與目標分數，預估達標機率與平均消耗顆數",
            "輸入裝備綠字數值，查詢理論百分位數落點",
            "機率可自訂（各階層機率為社群推測值，非官方數據）"
        ]
    },
    24: {
        title: "咒文的痕跡動態策略",
        bullets: [
            "設定裝備格數與目標強化上限，找出整體成本最低的衝卷策略",
            "動態引導你在每個節點做出最佳決策"
        ]
    }
};

// 首頁工具列表分類順序
const TOOL_CATEGORIES = [
    { name: "星力",                    ids: [10] },
    { name: "卷軸",                    ids: [11, 18, 24] },
    { name: "追加屬性",                ids: [21, 23] },
    { name: "潛在能力及附加潛在能力",  ids: [13, 19, 20] },
    { name: "其他",                    ids: [17, 14, 15, 16, 22] }
];

// ── 副標題渲染（工具頁使用）──────────────────────────────────────────
(function () {
    if (!document.getElementById('shared-subtitle-style')) {
        var style = document.createElement('style');
        style.id = 'shared-subtitle-style';
        style.textContent = [
            '#tool-subtitle {',
            '    margin: -8px 0 22px 0;',
            '}',
            '#tool-subtitle ul {',
            '    list-style: none;',
            '    padding: 0;',
            '    margin: 0;',
            '}',
            '#tool-subtitle li {',
            '    font-size: 0.92rem;',
            '    color: #555;',
            '    padding: 3px 0 3px 16px;',
            '    position: relative;',
            '    line-height: 1.5;',
            '}',
            '#tool-subtitle li::before {',
            '    content: "•";',
            '    position: absolute;',
            '    left: 0;',
            '    color: #2980b9;',
            '    font-weight: bold;',
            '}',
            /* 置中模式：bullet 改用 inline 方式呈現 */
            '#tool-subtitle.centered li {',
            '    padding-left: 0;',
            '}',
            '#tool-subtitle.centered li::before {',
            '    position: static;',
            '    margin-right: 4px;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function renderSubtitle() {
        var toolId = window.TOOL_ID;
        var container = document.getElementById('tool-subtitle');
        if (!container || !toolId || !TOOL_INFO[toolId]) return;

        var ul = document.createElement('ul');
        TOOL_INFO[toolId].bullets.forEach(function (text) {
            var li = document.createElement('li');
            li.innerHTML = text;
            ul.appendChild(li);
        });
        container.appendChild(ul);

        // 自動偵測頁面標題的對齊方式，副標題跟著對齊
        var heading = document.querySelector('h1, h2');
        if (heading) {
            var align = window.getComputedStyle(heading).textAlign;
            if (align === 'center' || align === 'middle') {
                container.style.textAlign = 'center';
                container.classList.add('centered');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSubtitle);
    } else {
        renderSubtitle();
    }
})();
