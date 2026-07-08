// --- 全域變數 ---
let g_allScenarioResults = null;
let g_simulationAborted = false; 
let g_isPreviewMode = false;
let g_savedCustomPath = null; 

// 屬性與攻擊力累積表
const STAR_STATS = {
    '250': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[57,14],[74,29],[91,45],[108,62],[125,80],[142,99],[159,120],[159,143],[159,168],[159,195],[159,223],[159,252],[159,282],[159,313],[159,345]],
    '200': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[55,12],[70,25],[85,39],[100,54],[130,70],[145,87],[145,106],[145,127],[145,150],[145,175],[145,201],[145,228],[145,256],[145,285],[145,315]],
    '160': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[53,10],[66,21],[79,33],[92,46],[105,60],[118,75],[131,92],[131,111],[131,132],[131,155],[131,179],[131,204],[131,230],[131,257],[131,285]],
    '150': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[51,9],[62,19],[73,30],[84,42],[95,55],[106,69],[117,85],[117,103],[117,123],[117,145],[117,168],[117,192],[117,217],[117,243],[117,270]],
    '140': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[49,8],[58,17],[67,27],[76,38],[85,50],[94,63],[103,78],[103,95],[103,114],[103,135],[103,157],[103,180],[103,204],[103,229],[103,255]],
    '130': [[0,0],[2,0],[4,0],[6,0],[8,0],[10,0],[13,0],[16,0],[19,0],[22,0],[25,0],[28,0],[31,0],[34,0],[37,0],[40,0],[47,7],[54,15],[61,24],[68,34],[75,45]]
};

// 原始機率表
const baseStarProbabilities = [
    { success: 0.95, destroy: 0.0, keep: 0.05 }, { success: 0.90, destroy: 0.0, keep: 0.10 },
    { success: 0.85, destroy: 0.0, keep: 0.15 }, { success: 0.85, destroy: 0.0, keep: 0.15 },
    { success: 0.80, destroy: 0.0, keep: 0.20 }, { success: 0.75, destroy: 0.0, keep: 0.25 },
    { success: 0.70, destroy: 0.0, keep: 0.30 }, { success: 0.65, destroy: 0.0, keep: 0.35 },
    { success: 0.60, destroy: 0.0, keep: 0.40 }, { success: 0.55, destroy: 0.0, keep: 0.45 },
    { success: 0.50, destroy: 0.0, keep: 0.50 }, { success: 0.45, destroy: 0.0, keep: 0.55 },
    { success: 0.40, destroy: 0.0, keep: 0.60 }, { success: 0.35, destroy: 0.0, keep: 0.65 },
    { success: 0.30, destroy: 0.0, keep: 0.70 }, { success: 0.30, destroy: 0.021, keep: 0.679 },
    { success: 0.30, destroy: 0.021, keep: 0.679 }, { success: 0.15, destroy: 0.068, keep: 0.782 },
    { success: 0.12, destroy: 0.082, keep: 0.798 }, { success: 0.10, destroy: 0.090, keep: 0.810 },
    { success: 0.30, destroy: 0.105, keep: 0.595 }, { success: 0.20, destroy: 0.115, keep: 0.685 },
    { success: 0.175, destroy: 0.1225, keep: 0.7025 }, { success: 0.085, destroy: 0.180, keep: 0.735 },
    { success: 0.085, destroy: 0.180, keep: 0.735 }, { success: 0.080, destroy: 0.180, keep: 0.740 },
    { success: 0.070, destroy: 0.186, keep: 0.744 }, { success: 0.050, destroy: 0.190, keep: 0.760 },
    { success: 0.030, destroy: 0.194, keep: 0.776 }, { success: 0.010, destroy: 0.198, keep: 0.792 },
];

// 已套用「刪除星力捕捉，成功率永久 1.05 倍」的新機率表
// Star catch 使成功率 ×1.05，其餘機率（失敗與破壞）等比例縮小
const starProbabilities = baseStarProbabilities.map(p => {
    const newSuccess = Math.min(1.0, p.success * 1.05);
    const scale = (1.0 - newSuccess) / (1.0 - p.success);
    const newDestroy = p.destroy * scale;
    return { 
        success: newSuccess, 
        destroy: newDestroy, 
        keep: Math.max(0, 1.0 - newSuccess - newDestroy) 
    };
});

// 痕跡完全修復費用表（官方公告數值，2026/07）
// mesos 依【被破壞的星數】×【裝備等級】二維查表；equips 不受裝備等級影響
// 130 等級裝備不支援痕跡完全復原，故不列入
const TRACE_RECOVERY_COSTS = {
    15: { equips: 1, mesos: { 140: 149000000,   150: 183000000,   160: 222000000,   200: 433000000,   250: 846000000   } },
    16: { equips: 1, mesos: { 140: 484000000,   150: 596000000,   160: 723000000,   200: 1420000000,  250: 2760000000  } },
    17: { equips: 1, mesos: { 140: 896000000,   150: 1110000000,  160: 1340000000,  200: 2620000000,  250: 5100000000  } },
    18: { equips: 1, mesos: { 140: 1950000000,  150: 2400000000,  160: 2910000000,  200: 5670000000,  250: 11100000000 } },
    19: { equips: 2, mesos: { 140: 3790000000,  150: 4660000000,  160: 5650000000,  200: 11100000000, 250: 21600000000 } },
    20: { equips: 2, mesos: { 140: 8030000000,  150: 9880000000,  160: 12000000000, 200: 23500000000, 250: 45800000000 } },
    21: { equips: 3, mesos: { 140: 10100000000, 150: 12400000000, 160: 15000000000, 200: 29200000000, 250: 57100000000 } },
    22: { equips: 4, mesos: { 140: 14100000000, 150: 17300000000, 160: 21000000000, 200: 41000000000, 250: 80100000000 } },
};

/**
 * 查詢痕跡完全修復所需楓幣。
 * @param {number} traceStar  - 被破壞當下的星數（15-22）
 * @param {string} equipLevel - 裝備等級字串，e.g. '150'
 * @returns {number} 需要的楓幣；若查無資料則回傳 Infinity
 */
function getTraceMesos(traceStar, equipLevel) {
    const entry = TRACE_RECOVERY_COSTS[traceStar];
    if (!entry) return Infinity;
    const levelKey = String(equipLevel);
    if (entry.mesos[levelKey] !== undefined) return entry.mesos[levelKey];
    const keys = Object.keys(entry.mesos).map(Number).sort((a, b) => a - b);
    const lvl = parseInt(levelKey, 10);
    // 低於最小支援等級（如 130）視為不支援，不做 fallback
    if (lvl < keys[0]) return Infinity;
    const fallback = keys.filter(k => k <= lvl).at(-1) ?? keys[0];
    return entry.mesos[fallback];
}

// 成本表
const enhancementCosts = {
    '130': [62000, 123100, 184100, 245100, 306100, 367200, 428200, 489200, 550300, 611300, 2495300, 5738100, 10449700, 17398100, 30754400, 19586000, 23069100, 26918600, 31149300, 35776100],
    '140': [77200, 153400, 229700, 305900, 382100, 458300, 534600, 610800, 687000, 763200, 3116400, 7166500, 13051200, 21729500, 38411200, 39138900, 48020200, 61127200, 172905500, 297882700, 50974700, 92474100, 65166700, 73102200, 81620200, 90737500, 100471000, 110837000, 121851900, 133531800],
    '150': [94800, 188500, 282300, 376000, 469800, 563500, 657300, 751000, 844800, 938500, 3832800, 8814200, 16052200, 26726100, 47243900, 48139000, 59062500, 75183500, 212666000, 366382500, 62696400, 113738800, 80152000, 89912300, 100389000, 111603000, 123574700, 136324400, 149872300, 164238100],
    '160': [114800, 228600, 342300, 456100, 569900, 683700, 797400, 911200, 1025000, 1138800, 4651300, 10697000, 19481200, 32435400, 57336400, 58422700, 71679800, 91244700, 258097500, 444652400, 76090000, 138036600, 97274600, 109120000, 121834900, 135444400, 149973700, 165447100, 181889200, 199324000],
    '200': [223200, 445400, 667700, 889900, 1112100, 1334300, 1556600, 1778800, 2001000, 2223200, 9083700, 20891500, 38048200, 63349500, 111984100, 114105800, 139998700, 178211400, 504095800, 868460800, 148612400, 269601800, 189988600, 213124000, 237957700, 264539000, 292916400, 323138000, 355251400, 389303700],
    '250': [435000, 869100, 1303100, 1737100, 2171100, 2605200, 3039200, 3473200, 3907300, 4341300, 17740600, 40802800, 74312000, 123728500, 218718100, 222861900, 273434000, 348068200, 984561100, 1696211500, 387009800, 438804400, 494760300, 555008800, 619680000, 688902000, 762801400, 841503600, 925132300, 1013810000],
};

const SETTINGS_KEY = 'starforceSimulatorSettings_v5';

const DEFAULT_SETTINGS = {
    equipLevel: "200",
    startStar: "0",
    targetStar: "23",
    compensationPrice: "2500000000",
    vipDiscount: "0",
    costDiscount: false,
    guaranteedSuccess: false,
    reduceDestruction: false,
    disableCoupons: false,
    disableHighCoupons: true,
    disableSpecialCoupons: true,
    exchangeRate: "25000000",
    ratioMain: "2",
    ratioVice: "10",
    coupons: {
        "10": "4429999", "11": "2699999", "12": "3999999", "13": "3944444", "14": "4444444",
        "15": "36399999", "16": "229999998", "17": "1319999998", "18": "2429988876",
        "19": "3829999999", "20": "19898888888", "21": "", "22": "", "23": ""
    },
    specialCoupons: {
        "limit-21": "", "limit-22": "", "limit-23": "", "limit-24": "", "limit-25": "",
        "limit-50-23": "", "limit-50-24": "", "limit-50-25": "", "limit-50-26": "",
        "limit-30-23": "", "limit-30-24": "", "limit-30-25": "", "limit-30-26": "",
        "append-23": ""
    },
    customPath: {
        enabled: true,
        initialJump: "coupon_19",
        recoveryJump: "coupon_19",
        starMethods: {
            "15": "no_prev", "16": "no_prev", "17": "no_prev", "18": "no_prev",
            "19": "no_prev", "20": "no_prev", "21": "no_prev", "22": "no_prev"
        },
        recMethods: {
            "15": "auto", "16": "auto", "17": "auto", "18": "auto", "19": "auto",
            "20": "full", "21": "full", "22": "full"
        }
    }
};

function getSettingsObject() {
    const settings = {
        equipLevel: document.getElementById('equip-level').value,
        startStar: document.getElementById('start-star').value, 
        targetStar: document.getElementById('target-star').value,
        compensationPrice: document.getElementById('compensation-price').value,
        vipDiscount: document.getElementById('vip-discount').value,
        costDiscount: document.getElementById('cost-discount-event').checked,
        guaranteedSuccess: document.getElementById('guaranteed-success-event').checked,
        reduceDestruction: document.getElementById('reduce-destruction-event').checked,
        disableCoupons: document.getElementById('disable-coupons-event').checked,
        disableHighCoupons: document.getElementById('disable-high-coupons-event').checked,
        disableSpecialCoupons: document.getElementById('disable-special-coupons-event').checked,
        exchangeRate: document.getElementById('exchange-rate').value,
        ratioMain: document.getElementById('ratio-main').value,
        ratioVice: document.getElementById('ratio-vice').value,
        coupons: {},
        specialCoupons: {}
    };
    for (let i = 10; i <= 23; i++) { 
        const input = document.getElementById(`coupon-${i}`);
        if(input) settings.coupons[i] = input.value;
    }
    const spIds = [
        'limit-21', 'limit-22', 'limit-23', 'limit-24', 'limit-25', 
        'limit-50-23', 'limit-50-24', 'limit-50-25', 'limit-50-26',              
        'limit-30-23', 'limit-30-24', 'limit-30-25', 'limit-30-26',              
        'append-23'
    ];
    spIds.forEach(id => {
        const input = document.getElementById(`sp-coupon-${id}`);
        if(input) settings.specialCoupons[id] = input.value;
    });

    const customPath = {
        enabled: document.getElementById('enable-custom-path')?.checked || false,
        initialJump: document.getElementById('custom-initial-jump')?.value || 'none',
        recoveryJump: document.getElementById('custom-recovery-jump')?.value || 'none',
        starMethods: {},
        recMethods: {}
    };
    document.querySelectorAll('[id^="custom-star-"]').forEach(sel => {
        const n = parseInt(sel.id.replace('custom-star-', ''));
        if (!isNaN(n)) customPath.starMethods[n] = sel.value;
    });
    document.querySelectorAll('[id^="custom-rec-"]').forEach(sel => {
        const n = parseInt(sel.id.replace('custom-rec-', ''));
        if (!isNaN(n)) customPath.recMethods[n] = sel.value;
    });
    settings.customPath = customPath;

    return settings;
}

function saveSettings() {
    if (g_isPreviewMode) return; 
    const settings = getSettingsObject();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettingsToUI(settings, dom) {
    const fields = ['equipLevel', 'startStar', 'compensationPrice', 'exchangeRate', 'vipDiscount']; 
    fields.forEach(field => {
        const key = `${field}Input` in dom ? `${field}Input` : `${field}Select`;
        if (settings[field] !== undefined && dom[key]) dom[key].value = settings[field];
    });

    if(settings.ratioMain !== undefined && dom.ratioMain) dom.ratioMain.value = settings.ratioMain;
    if(settings.ratioVice !== undefined && dom.ratioVice) dom.ratioVice.value = settings.ratioVice;

    const checkboxFields = ['costDiscount', 'guaranteedSuccess', 'reduceDestruction', 'disableCoupons', 'disableHighCoupons', 'disableSpecialCoupons'];
    checkboxFields.forEach(field => {
        if (typeof settings[field] === 'boolean') {
            const checkboxKey = `${field}Checkbox`;
            if(dom[checkboxKey]) dom[checkboxKey].checked = settings[field];
        }
    });

    if (settings.coupons) {
        for (let i = 10; i <= 23; i++) { 
            const input = document.getElementById(`coupon-${i}`);
            if (input && settings.coupons[i] !== undefined) input.value = settings.coupons[i];
        }
    }
    
    if (settings.specialCoupons) {
        const spIds = [
            'limit-21', 'limit-22', 'limit-23', 'limit-24', 'limit-25',
            'limit-50-23', 'limit-50-24', 'limit-50-25', 'limit-50-26',
            'limit-30-23', 'limit-30-24', 'limit-30-25', 'limit-30-26',
            'append-23'
        ];
        spIds.forEach(id => {
            const input = document.getElementById(`sp-coupon-${id}`);
            if (input && settings.specialCoupons[id] !== undefined) input.value = settings.specialCoupons[id];
        });
    }

    if (settings.customPath) {
        g_savedCustomPath = settings.customPath;
        const enableCb = document.getElementById('enable-custom-path');
        if (enableCb) enableCb.checked = settings.customPath.enabled;
    }
}

function loadSettings(dom) {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (!savedSettings) {
        applySettingsToUI(DEFAULT_SETTINGS, dom);
        return DEFAULT_SETTINGS;
    }
    const settings = JSON.parse(savedSettings);
    applySettingsToUI(settings, dom);
    return settings;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 動態注入 Tooltip 浮動框架 (完全不干擾 Table 的 z-index) ---
    const globalTooltip = document.createElement('div');
    globalTooltip.id = 'global-tooltip';
    globalTooltip.style.cssText = 'position: fixed; visibility: hidden; width: 320px; background-color: #2c3e50; color: #ecf0f1; border-radius: 8px; padding: 15px; z-index: 999999; font-size: 0.9rem; line-height: 1.6; box-shadow: 0 8px 20px rgba(0,0,0,0.5); pointer-events: none; transition: opacity 0.2s; opacity: 0; word-break: break-all; font-family: sans-serif;';
    document.body.appendChild(globalTooltip);

    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('tooltip-icon')) {
            const text = e.target.getAttribute('data-tooltip').replace(/\\n/g, '<br>');
            globalTooltip.innerHTML = text;
            globalTooltip.style.visibility = 'visible';
            globalTooltip.style.opacity = '1';
            e.target.style.backgroundColor = '#2980b9';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (globalTooltip.style.visibility === 'visible') {
            let x = e.clientX + 15;
            let y = e.clientY + 15;
            if (x + 320 > window.innerWidth) x = e.clientX - 335;
            if (y + globalTooltip.offsetHeight > window.innerHeight) y = e.clientY - globalTooltip.offsetHeight - 15;
            globalTooltip.style.left = x + 'px';
            globalTooltip.style.top = y + 'px';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('tooltip-icon')) {
            globalTooltip.style.visibility = 'hidden';
            globalTooltip.style.opacity = '0';
            e.target.style.backgroundColor = '#3498db';
        }
    });

    const dom = {
        equipLevelSelect: document.getElementById('equip-level'),
        startStarSelect: document.getElementById('start-star'), 
        targetStarSelect: document.getElementById('target-star'),
        startButton: document.getElementById('start-simulation'),
        resultsContainer: document.getElementById('results-container'),
        resultsTitle: document.getElementById('results-title'),
        legendNote: document.getElementById('legend-note'),
        resultsTable: document.getElementById('results-table'),
        modal: document.getElementById('detail-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalLogContent: document.getElementById('modal-log-content'),
        closeModalBtn: document.querySelector('.close-modal'),
        
        exchangeRateInput: document.getElementById('exchange-rate'),
        currencySwitch: document.getElementById('currency-switch'),
        labelForMeso: document.getElementById('label-for-meso'),
        labelForTwd: document.getElementById('label-for-twd'),
        compensationPriceInput: document.getElementById('compensation-price'),
        costDiscountCheckbox: document.getElementById('cost-discount-event'),
        guaranteedSuccessCheckbox: document.getElementById('guaranteed-success-event'),
        reduceDestructionCheckbox: document.getElementById('reduce-destruction-event'),
        disableCouponsCheckbox: document.getElementById('disable-coupons-event'),
        disableHighCouponsCheckbox: document.getElementById('disable-high-coupons-event'), 
        disableSpecialCouponsCheckbox: document.getElementById('disable-special-coupons-event'),
        couponGrid: document.getElementById('coupon-grid'),
        highCouponGrid: document.getElementById('high-coupon-grid'), 
        specialCouponGrid: document.getElementById('special-coupon-grid'),
        vipDiscountSelect: document.getElementById('vip-discount'),
        dataTablesContainer: document.getElementById('data-tables-container'),
        dataTablesTitle: document.getElementById('data-tables-title'),
        costsTableTitle: document.getElementById('costs-table-title'),
        probsTableTitle: document.getElementById('probs-table-title'),
        traceTableTitle: document.getElementById('trace-table-title'),
        costsTableContainer: document.getElementById('costs-table-container'),
        probsTableContainer: document.getElementById('probs-table-container'),
        traceTableContainer: document.getElementById('trace-table-container'),
        
        previewStatMain: document.getElementById('preview-stat-main'),
        previewStatAtk: document.getElementById('preview-stat-atk'),
        
        efficiencyContainer: document.getElementById('efficiency-container'),
        ratioMain: document.getElementById('ratio-main'),
        ratioVice: document.getElementById('ratio-vice'),
        efficiencyTotalAtk: document.getElementById('efficiency-total-atk'),
        efficiencyCostPerAtk: document.getElementById('efficiency-cost-per-atk'),
        efficiencyCurrencyLabel: document.getElementById('efficiency-currency-label'),
        shareBtn: document.getElementById('share-settings-btn'),
    };
    
    function getStatData() {
        const level = dom.equipLevelSelect.value;
        const start = parseInt(dom.startStarSelect.value, 10) || 0;
        const target = parseInt(dom.targetStarSelect.value, 10) || 0;
        const table = STAR_STATS[level];
        if (!table) return null;

        const getData = (star) => {
            if (star < 0) return table[0]; 
            if (star >= table.length) return table[table.length - 1];
            return table[star];
        };

        const startData = getData(start);
        const targetData = getData(target);
        
        return {
            statDiff: targetData[0] - startData[0],
            atkDiff: targetData[1] - startData[1],
            start: start,
            target: target
        };
    }

    function updateStatPreview() {
        const data = getStatData();
        
        if (!data) {
            if (dom.previewStatMain) dom.previewStatMain.textContent = `屬性: -`;
            if (dom.previewStatAtk) dom.previewStatAtk.textContent = `攻擊: -`;
            return;
        }

        const { statDiff, atkDiff, start, target } = data;

        const getGloveBonusCumulative = (s) => {
            if (s < 5) return 0;
            if (s < 7) return 1;
            if (s < 9) return 2;
            if (s < 11) return 3;
            if (s < 13) return 4;
            if (s < 14) return 5;
            if (s < 15) return 6;
            return 7; 
        };

        const startGloveBonus = getGloveBonusCumulative(start);
        const targetGloveBonus = getGloveBonusCumulative(target);
        const gloveBonusDiff = Math.max(0, targetGloveBonus - startGloveBonus);
        const totalGloveAtk = atkDiff + gloveBonusDiff;

        if (dom.previewStatMain) {
            dom.previewStatMain.textContent = `屬性: +${statDiff}`;
        }
        
        if (dom.previewStatAtk) {
            if (atkDiff <= 0) {
                 dom.previewStatAtk.textContent = `攻擊: +${atkDiff}`;
            } else {
                if (gloveBonusDiff > 0 || (start < 15 && target >= 5)) {
                     if (totalGloveAtk !== atkDiff) {
                        dom.previewStatAtk.textContent = `攻擊: +${atkDiff} (手套 +${totalGloveAtk})`;
                     } else {
                        dom.previewStatAtk.textContent = `攻擊: +${atkDiff}`;
                     }
                } else {
                    dom.previewStatAtk.textContent = `攻擊: +${atkDiff}`;
                }
            }
        }
    }

    function calculateEfficiency() {
        if (!g_allScenarioResults || g_allScenarioResults.length === 0) return;

        let minCost = Infinity;
        g_allScenarioResults.forEach(r => {
            const cost = (r.stats && r.stats.avgCost) ? r.stats.avgCost : r.theoreticalResult.totalCost;
            if (cost < minCost) minCost = cost;
        });
        
        if (minCost === Infinity) return;

        const data = getStatData();
        if (!data) return;
        
        const mainRatio = parseFloat(dom.ratioMain.value);
        const viceRatio = parseFloat(dom.ratioVice.value);

        let equivalentAtk = data.atkDiff;
        
        if (!isNaN(mainRatio) && mainRatio > 0) {
            equivalentAtk += data.statDiff / mainRatio;
        }
        if (!isNaN(viceRatio) && viceRatio > 0) {
            equivalentAtk += data.statDiff / viceRatio;
        }

        const { exchangeRate, currencyName } = getCurrencyInfo();
        
        dom.efficiencyTotalAtk.textContent = equivalentAtk.toFixed(1);
        
        if (equivalentAtk > 0) {
            const costPerAtk = minCost / equivalentAtk;
            dom.efficiencyCostPerAtk.textContent = formatCost(costPerAtk, exchangeRate);
        } else {
            dom.efficiencyCostPerAtk.textContent = "∞";
        }
        
        dom.efficiencyCurrencyLabel.textContent = currencyName;
        dom.efficiencyContainer.classList.remove('hidden');
    }

    function updateTargetStarOptions() {
        const selectedLevel = dom.equipLevelSelect.value;
        const maxStars = enhancementCosts[selectedLevel].length;
        const currentTarget = parseInt(dom.targetStarSelect.value, 10);
        
        dom.targetStarSelect.innerHTML = '';
        for (let i = 1; i <= maxStars; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            dom.targetStarSelect.appendChild(option);
        }
        if (currentTarget && currentTarget <= maxStars) {
            dom.targetStarSelect.value = currentTarget;
        } else {
            dom.targetStarSelect.value = Math.min(25, maxStars);
        }
        updateStartStarOptions();
        updateStatPreview(); 
    }
    
    function updateStartStarOptions() {
        const target = parseInt(dom.targetStarSelect.value, 10);
        const currentStart = parseInt(dom.startStarSelect.value, 10);
        
        dom.startStarSelect.innerHTML = '';
        for (let i = 0; i < target; i++) {
             const option = document.createElement('option');
             option.value = i;
             option.textContent = i;
             dom.startStarSelect.appendChild(option);
        }
        
        if (currentStart < target) {
            dom.startStarSelect.value = currentStart;
        } else {
            dom.startStarSelect.value = 0;
        }
        updateStatPreview(); 
    }
    
    function getCouponPrices() {
        const prices = {};
        if (!dom.disableCouponsCheckbox.checked) {
            for (let i = 10; i <= 21; i++) {
                const input = document.getElementById(`coupon-${i}`);
                const price = parseFloat(input.value);
                if (!isNaN(price) && price >= 0 && input.value !== '') prices[i] = price;
            }
        }
        if (!dom.disableHighCouponsCheckbox.checked) {
             for (let i = 22; i <= 23; i++) {
                const input = document.getElementById(`coupon-${i}`);
                const price = parseFloat(input.value);
                if (!isNaN(price) && price >= 0 && input.value !== '') prices[i] = price;
            }
        }
        return prices;
    }

    function getSpecialCouponPrices() {
        const prices = { limit: {}, limit50: {}, limit30: {}, append23: null };
        if (dom.disableSpecialCouponsCheckbox.checked) {
            return prices;
        }

        for (let i = 21; i <= 26; i++) {
            const input100 = document.getElementById(`sp-coupon-limit-${i}`);
            if (input100) {
                const val = parseFloat(input100.value);
                if (!isNaN(val) && val >= 0 && input100.value !== '') prices.limit[i] = val;
            }
            const input50 = document.getElementById(`sp-coupon-limit-50-${i}`);
            if (input50) {
                const val = parseFloat(input50.value);
                if (!isNaN(val) && val >= 0 && input50.value !== '') prices.limit50[i] = val;
            }
            const input30 = document.getElementById(`sp-coupon-limit-30-${i}`);
            if (input30) {
                const val = parseFloat(input30.value);
                if (!isNaN(val) && val >= 0 && input30.value !== '') prices.limit30[i] = val;
            }
        }

        const appendInput = document.getElementById('sp-coupon-append-23');
        const appendPrice = parseFloat(appendInput.value);
        if (!isNaN(appendPrice) && appendPrice >= 0 && appendInput.value !== '') {
            prices.append23 = appendPrice;
        }
        return prices;
    }

    // --- 核心進化：正確的 DP 內層變異數掃描 + 雙軌復原策略 ---
    function calculateTheoreticalIntervals(equipLevel, maxStar, compensationPrice, couponPrices, specialCouponPrices, costDiscount, vipDiscount, activeProbabilities, K = 0) {
        const originalCosts = enhancementCosts[equipLevel];
        const intervalResults = [];
        const memo = {}; 
        const equipLevelNum = parseInt(equipLevel, 10);
        const YI = 100000000;

        for (let n = 0; n < maxStar; n++) {
            if (n >= originalCosts.length) {
                intervalResults[n] = { cost: Infinity, varCost: Infinity, score: Infinity, destructions: Infinity, couponCost: Infinity, specialMethod: null, isPreventing: false, recoveryStrategy: '12' };
                continue;
            }
            
            const originalBaseCost = originalCosts[n];
            let probsNoPrev = { ...activeProbabilities[n] };
            
            let totalDiscountRate = 0;
            if (costDiscount) totalDiscountRate += 0.30;
            if (n <= 16) totalDiscountRate += vipDiscount;

            // 復原成本計算 (比較：回 12 星 vs 完全復原)
            let recoveryTotalCost = 0, climbDestructions = 0, climbCouponCost = 0, climbVar = 0;
            let recoveryStrategy = '12';
            let expEquipCostForInterval = 0;

            if (probsNoPrev.destroy > 0 && n >= 12) {
                // 路線 A：降回 12 星
                const path12 = findOptimalPath(12, n, intervalResults, couponPrices, memo, K);
                let costA = compensationPrice + path12.totalCost;
                let varA = path12.totalVar;
                let scoreA = (costA / YI) + K * varA;

                // 路線 B：完全復原 (若 n >= 23, 痕跡變為 22 星)
                let scoreB = Infinity, costB = Infinity, varB = 0, pathB = null;
                let traceStar = n >= 23 ? 22 : n;

                if (traceStar >= 15 && TRACE_RECOVERY_COSTS[traceStar] && getTraceMesos(traceStar, equipLevel) !== Infinity) {
                    const recData = TRACE_RECOVERY_COSTS[traceStar];
                    const restoreCost = (recData.equips * compensationPrice) + getTraceMesos(traceStar, equipLevel);
                    pathB = findOptimalPath(traceStar, n, intervalResults, couponPrices, memo, K);
                    costB = restoreCost + pathB.totalCost;
                    varB = pathB.totalVar;
                    scoreB = (costB / YI) + K * varB;
                }

                // 取期望值較優的路線
                if (scoreB < scoreA) {
                    recoveryTotalCost = costB;
                    climbVar = varB;
                    climbDestructions = pathB.totalDestructions;
                    climbCouponCost = pathB.totalCouponCost;
                    recoveryStrategy = 'full';
                    // 路線B：每次炸裝主要花 equips 件空裝，加上從 traceStar 爬回的裝備成本
                    const traceStar_eq = n >= 23 ? 22 : n;
                    const recData_eq = TRACE_RECOVERY_COSTS[traceStar_eq];
                    expEquipCostForInterval = (probsNoPrev.destroy * (recData_eq.equips * compensationPrice + (pathB.totalEquipCost ?? 0))) / probsNoPrev.success;
                } else {
                    recoveryTotalCost = costA;
                    climbVar = varA;
                    climbDestructions = path12.totalDestructions;
                    climbCouponCost = path12.totalCouponCost;
                    recoveryStrategy = '12';
                    // 路線A：每次炸裝花 1 件空裝，加上從 12 星爬回的裝備成本
                    expEquipCostForInterval = (probsNoPrev.destroy * (compensationPrice + (path12.totalEquipCost ?? 0))) / probsNoPrev.success;
                }
            }

            let baseCostNoPrev = originalBaseCost;
            if (totalDiscountRate > 0) baseCostNoPrev = originalBaseCost * (1 - totalDiscountRate);
            
            let b = baseCostNoPrev / YI;
            let mu_D = recoveryTotalCost / YI; // 使用最佳復原總成本
            let v_D = climbVar; 
            let p = probsNoPrev.success;
            let k = probsNoPrev.keep;
            let r = probsNoPrev.destroy;

            let mu_n = (b + r * mu_D) / p;
            let var_term = r * v_D + p * Math.pow(b - mu_n, 2) + k * Math.pow(b, 2) + r * Math.pow(b + mu_D, 2);
            let v_n = Math.max(0, var_term / p);
            
            let scoreNoPrev = mu_n + K * v_n;
            
            const expCostNoPrev = mu_n * YI;
            const expDestNoPrev = (probsNoPrev.destroy * (1 + climbDestructions)) / probsNoPrev.success;
            const expCpnNoPrev = (probsNoPrev.destroy * climbCouponCost) / probsNoPrev.success;
            
            let bestMethod = { type: 'sf', isPreventing: false, cost: expCostNoPrev, varCost: v_n, score: scoreNoPrev, destructions: expDestNoPrev, couponCost: expCpnNoPrev, equipCost: expEquipCostForInterval };

            if (n >= 15 && n <= 17 && originalBaseCost > 0) {
                let baseCostPrev = originalBaseCost * 3;
                if (totalDiscountRate > 0) baseCostPrev -= originalBaseCost * totalDiscountRate;
                let probsPrev = { success: probsNoPrev.success, destroy: 0, keep: probsNoPrev.keep + probsNoPrev.destroy };
                
                let b_prev = baseCostPrev / YI;
                let p_prev = probsPrev.success;
                
                let mu_prev = b_prev / p_prev;
                let v_prev = Math.max(0, (b_prev * b_prev * (1 - p_prev)) / (p_prev * p_prev));
                
                let scorePrev = mu_prev + K * v_prev;
                if (scorePrev < bestMethod.score) {
                    bestMethod = { type: 'sf', isPreventing: true, cost: mu_prev * YI, varCost: v_prev, score: scorePrev, destructions: 0, couponCost: 0, equipCost: 0 };
                }
            }

            const targetStar = n + 1;
            
            const evalScroll = (type, limitStar, costTrue, v_scroll) => {
                let mu_scroll = costTrue / YI;
                let score_scroll = mu_scroll + K * v_scroll;
                if (score_scroll < bestMethod.score) {
                    bestMethod = { type: type, limitStar: limitStar, cost: costTrue, varCost: v_scroll, score: score_scroll, destructions: 0, couponCost: costTrue, equipCost: 0 };
                }
            };

            for (const [limitStar, price] of Object.entries(specialCouponPrices.limit)) {
                if (targetStar <= parseInt(limitStar, 10)) evalScroll('limit', limitStar, price, 0); 
            }
            for (const [limitStar, price] of Object.entries(specialCouponPrices.limit50)) {
                if (targetStar <= parseInt(limitStar, 10)) {
                    let S = (price / 0.5) / YI;
                    let v_50 = S * S * 2 * 0.25; 
                    evalScroll('limit50', limitStar, price / 0.5, v_50);
                }
            }
            for (const [limitStar, price] of Object.entries(specialCouponPrices.limit30)) {
                if (targetStar <= parseInt(limitStar, 10)) {
                    let S_yi = price / YI;
                    let v_30 = S_yi * S_yi * (0.7 / 0.09); 
                    evalScroll('limit30', limitStar, price / 0.3, v_30);
                }
            }
            if (specialCouponPrices.append23 !== null && targetStar <= 23 && equipLevelNum <= 200) {
                let S_yi = specialCouponPrices.append23 / YI;
                let v_append = S_yi * S_yi * (0.7 / 0.09);
                evalScroll('append', 23, specialCouponPrices.append23 / 0.3, v_append);
            }

            intervalResults[n] = bestMethod;
            intervalResults[n].specialMethod = bestMethod.type !== 'sf' ? bestMethod : null;
            intervalResults[n].isPreventing = bestMethod.type === 'sf' ? bestMethod.isPreventing : false;
            intervalResults[n].recoveryStrategy = recoveryStrategy;
        }
        return intervalResults;
    }

    function findOptimalPath(startStar, endStar, theoreticalIntervals, couponPrices, memo = {}, K = 0) {
        const disableCoupons = Object.keys(couponPrices).length === 0;
        const memoKey = `${startStar}->${endStar}:${disableCoupons}:${K}`;
        if (memo[memoKey]) return memo[memoKey];
        const candidatePaths = [];
        const YI = 100000000;
        
        let enhancementCost = 0, enhancementDestructions = 0, enhancementCouponCost = 0, enhancementVar = 0, enhancementEquipCost = 0; 
        for (let i = startStar; i < endStar; i++) {
            enhancementCost += theoreticalIntervals[i].cost;
            enhancementDestructions += theoreticalIntervals[i].destructions;
            enhancementCouponCost += theoreticalIntervals[i].couponCost;
            enhancementVar += theoreticalIntervals[i].varCost;
            enhancementEquipCost += (theoreticalIntervals[i].equipCost ?? 0);
        }
        
        let sfScore = (enhancementCost / YI) + K * enhancementVar;
        candidatePaths.push({
            strategyText: `從${startStar}星強化`, startStar: startStar, couponCost: 0,
            totalCost: enhancementCost, totalDestructions: enhancementDestructions, totalCouponCost: enhancementCouponCost,
            totalVar: enhancementVar, totalEquipCost: enhancementEquipCost, score: sfScore
        });
        
        if (!disableCoupons) {
            const availableCoupons = Object.keys(couponPrices).map(Number);
            for (const couponStar of availableCoupons) {
                if (couponStar <= startStar || couponStar > endStar) continue;
                let pathCost = couponPrices[couponStar] || 0;
                let pathDestructions = 0;
                let pathCouponCost = pathCost;
                let pathVar = 0;
                let pathEquipCost = 0;
                
                if (couponStar < endStar) {
                    for (let i = couponStar; i < endStar; i++) {
                        pathCost += theoreticalIntervals[i].cost;
                        pathDestructions += theoreticalIntervals[i].destructions;
                        pathCouponCost += theoreticalIntervals[i].couponCost;
                        pathVar += theoreticalIntervals[i].varCost;
                        pathEquipCost += (theoreticalIntervals[i].equipCost ?? 0);
                    }
                }
                
                let cpnScore = (pathCost / YI) + K * pathVar;
                candidatePaths.push({
                    strategyText: `使用${couponStar}星券`, startStar: couponStar, couponCost: couponPrices[couponStar] || 0,
                    totalCost: pathCost, totalDestructions: pathDestructions, totalCouponCost: pathCouponCost,
                    totalVar: pathVar, totalEquipCost: pathEquipCost, score: cpnScore
                });
            }
        }
        
        const bestPath = candidatePaths.reduce((min, p) => p.score < min.score ? p : min);
        memo[memoKey] = bestPath;
        return bestPath;
    }

    function generatePathDescription(start, end, intervals, initialStrategyText, activeProbabilities) {
        let segments = [];
        let currentStar = start;
        const match = initialStrategyText.match(/使用(\d+)星券/);
        if (match) {
            currentStar = parseInt(match[1], 10);
            segments.push(`1. ${initialStrategyText} (跳至${currentStar}星)`);
        } 
        
        let sfStart = null;
        let currentKey = null; 

        for (let i = currentStar; i < end; i++) {
            const method = intervals[i].specialMethod;
            const isPrev = intervals[i].isPreventing;
            const target = i + 1;

            if (method) {
                if (sfStart !== null) {
                    let prevInterval = intervals[sfStart];
                    let prevIsPrev = prevInterval.isPreventing;
                    let prevRecStrat = prevInterval.recoveryStrategy || '12';
                    let prevHasDestroy = (activeProbabilities[sfStart] && activeProbabilities[sfStart].destroy > 0) && !prevIsPrev;
                    
                    let typeStr = prevIsPrev ? '直衝 (防爆)' : '直衝 (不防爆)';
                    if (prevHasDestroy) {
                        typeStr += prevRecStrat === 'full' 
                            ? ' <span style="color:#d35400; font-weight:bold;">[若炸：選完全復原]</span>' 
                            : ' <span style="color:#2980b9; font-weight:bold;">[若炸：選降回12星]</span>';
                    }
                    segments.push(`${segments.length+1}. ${sfStart} → ${i}: ${typeStr}`);
                    sfStart = null;
                }
                let name = '';
                if (method.type === 'limit') name = `突破券100%(${method.limitStar})`;
                else if (method.type === 'limit50') name = `突破券50%(${method.limitStar})`;
                else if (method.type === 'limit30') name = `突破券30%(${method.limitStar})`;
                else name = `追加券30%(23)`;
                segments.push(`${segments.length+1}. ${i} → ${target}: ${name}`);
            } else {
                let recStrat = intervals[i].recoveryStrategy || '12';
                let hasDestroyRisk = (activeProbabilities[i] && activeProbabilities[i].destroy > 0) && !isPrev;
                let thisKey = (isPrev ? 'prev' : 'noprev') + '_' + (hasDestroyRisk ? recStrat : 'none');

                if (sfStart === null) {
                    sfStart = i;
                    currentKey = thisKey;
                } else if (currentKey !== thisKey) {
                    let prevInterval = intervals[sfStart];
                    let prevIsPrev = prevInterval.isPreventing;
                    let prevRecStrat = prevInterval.recoveryStrategy || '12';
                    let prevHasDestroy = (activeProbabilities[sfStart] && activeProbabilities[sfStart].destroy > 0) && !prevIsPrev;
                    
                    let typeStr = prevIsPrev ? '直衝 (防爆)' : '直衝 (不防爆)';
                    if (prevHasDestroy) {
                        typeStr += prevRecStrat === 'full' 
                            ? ' <span style="color:#d35400; font-weight:bold;">[若炸：選完全復原]</span>' 
                            : ' <span style="color:#2980b9; font-weight:bold;">[若炸：選降回12星]</span>';
                    }
                    segments.push(`${segments.length+1}. ${sfStart} → ${i}: ${typeStr}`);
                    sfStart = i;
                    currentKey = thisKey;
                }
            }
        }
        if (sfStart !== null) {
            let prevInterval = intervals[sfStart];
            let prevIsPrev = prevInterval.isPreventing;
            let prevRecStrat = prevInterval.recoveryStrategy || '12';
            let prevHasDestroy = (activeProbabilities[sfStart] && activeProbabilities[sfStart].destroy > 0) && !prevIsPrev;
            
            let typeStr = prevIsPrev ? '直衝 (防爆)' : '直衝 (不防爆)';
            if (prevHasDestroy) {
                typeStr += prevRecStrat === 'full' 
                    ? ' <span style="color:#d35400; font-weight:bold;">[若炸：選完全復原]</span>' 
                    : ' <span style="color:#2980b9; font-weight:bold;">[若炸：選降回12星]</span>';
            }
            segments.push(`${segments.length+1}. ${sfStart} → ${end}: ${typeStr}`);
        }
        if (segments.length === 0) return "無 (已達成)";
        return segments.join('<br>');
    }

    function simulateTrial(equipLevel, targetStar, compensationPrice, strategyGuide, costDiscount, vipDiscount, activeProbabilities, theoreticalIntervals, keepLog = false) {
        let currentStars = strategyGuide.initialStart;
        let totalCost = 0, totalDestroys = 0, totalEnhancementCost = 0, totalDestructionCost = 0, totalCouponCost = 0;
        const log = [];
        let destructionStrategy = null;
        
        let attempts = 0;
        const MAX_ATTEMPTS = 2000000; 

        if (keepLog) log.push(`<span class="log-strategy">=> 模擬開始 (初始: ${currentStars}星)</span>`);
        
        while (currentStars < targetStar) {
            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                if (keepLog) log.push(`<span class="log-fail">系統：模擬次數過多 (${attempts}次)，已強制中斷。</span>`);
                return { aborted: true, log: log, totalCost: Infinity }; 
            }

            let currentStrategy;
            if (currentStars === strategyGuide.initialStart) currentStrategy = strategyGuide[0];
            else if (currentStars === 12) {
                if (!destructionStrategy) destructionStrategy = strategyGuide[12];
                currentStrategy = destructionStrategy;
            } else currentStrategy = { startStar: currentStars };

            if (currentStrategy.startStar > currentStars) {
                const couponCost = currentStrategy.couponCost;
                totalCost += couponCost; totalCouponCost += couponCost;
                if (keepLog) log.push(`<span class="log-strategy">=> 決策：${currentStrategy.strategyText} <span class="log-cost">(花費: ${couponCost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span></span>`);
                currentStars = currentStrategy.startStar;
                if (currentStars >= targetStar) break;
            }
            const starBeforeAttempt = currentStars;
            if (starBeforeAttempt >= enhancementCosts[equipLevel].length) break;

            const intervalData = theoreticalIntervals[starBeforeAttempt];
            if (intervalData.specialMethod) {
                const method = intervalData.specialMethod;
                let cost = 0; let name = ''; let success = false;
                
                if (method.type === 'limit') {
                    name = `突破1星 100% (${method.limitStar}星)`;
                    cost = method.cost; 
                    success = true; 
                } else if (method.type === 'limit50') {
                    name = `突破1星 50% (${method.limitStar}星)`;
                    cost = method.cost * 0.5; 
                    if (Math.random() < 0.5) success = true;
                } else if (method.type === 'limit30') {
                    name = `突破1星 30% (${method.limitStar}星)`;
                    cost = method.cost * 0.3; 
                    if (Math.random() < 0.3) success = true;
                } else if (method.type === 'append') {
                    name = `追加1星 30% (23星)`;
                    cost = method.cost * 0.3; 
                    if (Math.random() < 0.3) success = true;
                }
                
                totalCost += cost; totalCouponCost += cost; 
                if (success) {
                    currentStars++;
                    if (keepLog) log.push(`[${starBeforeAttempt} → ${currentStars}星]...<span class="log-strategy">使用 ${name}</span> <span class="log-success">成功！</span> <span class="log-cost">(券費: ${cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
                } else {
                    if (keepLog) log.push(`[${starBeforeAttempt} → ${currentStars}星]...<span class="log-strategy">使用 ${name}</span> <span class="log-keep">失敗(券消失)</span> <span class="log-cost">(券費: ${cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
                }
            } else {
                const originalBaseCost = enhancementCosts[equipLevel][starBeforeAttempt];
                let currentEnhanceCost = originalBaseCost;
                let probs = { ...activeProbabilities[starBeforeAttempt] };
                let totalDiscountRate = 0;
                if (costDiscount) totalDiscountRate += 0.30;
                if (starBeforeAttempt <= 16) totalDiscountRate += vipDiscount;
                
                const isPreventing = intervalData.isPreventing;
                let preventInfo = '';
                if (isPreventing) {
                    currentEnhanceCost = originalBaseCost * 3; 
                    if (totalDiscountRate > 0) currentEnhanceCost -= originalBaseCost * totalDiscountRate;
                    preventInfo = ' (防爆)';
                    probs.keep += probs.destroy; probs.destroy = 0;
                } else {
                    if (totalDiscountRate > 0) currentEnhanceCost = originalBaseCost * (1 - totalDiscountRate);
                }
                
                totalCost += currentEnhanceCost; totalEnhancementCost += currentEnhanceCost;
                const rand = Math.random();
                let outcomeClass, outcomeText;
                
                if (rand < probs.success) {
                    currentStars++; outcomeClass = 'log-success'; outcomeText = '成功！';
                } else if (rand < probs.success + probs.destroy) {
                    totalDestroys++;
                    const recStrategy = intervalData.recoveryStrategy || '12';
                    let traceStar = starBeforeAttempt >= 23 ? 22 : starBeforeAttempt;

                    if (recStrategy === 'full' && traceStar >= 15 && TRACE_RECOVERY_COSTS[traceStar] && getTraceMesos(traceStar, equipLevel) !== Infinity) {
                        const recData = TRACE_RECOVERY_COSTS[traceStar];
                        const equipCost = recData.equips * compensationPrice;
                        const traceMesos = getTraceMesos(traceStar, equipLevel);
                        const restoreCost = equipCost + traceMesos;
                        totalCost += restoreCost;
                        totalDestructionCost += equipCost; // 「裝備」欄只計入設備補償，痕跡楓幣費融入總成本
                        currentStars = traceStar;
                        outcomeClass = 'log-fail';
                        outcomeText = `破壞！(選用完全復原花費 +${restoreCost.toLocaleString()}，維持 ${traceStar}星)`;
                    } else {
                        totalCost += compensationPrice;
                        totalDestructionCost += compensationPrice;
                        currentStars = 12;
                        outcomeClass = 'log-fail';
                        outcomeText = `裝備已破壞！(補償一件裝備 +${compensationPrice.toLocaleString()}，降至 12星)`;
                    }
                } else {
                    outcomeClass = 'log-keep'; outcomeText = '維持星級。';
                }
                if (keepLog) log.push(`[${starBeforeAttempt} → ${currentStars}星]...<span class="${outcomeClass}">${outcomeText}</span>${preventInfo} <span class="log-cost">(花費: ${currentEnhanceCost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
            }
        }
        return { totalCost, totalDestroys, totalEnhancementCost, totalDestructionCost, totalCouponCost, log, aborted: false };
    }

    function calculateStatistics(runs) {
        const costs = runs.costs.sort((a, b) => a - b);
        const destroys = runs.destroys.sort((a, b) => a - b);
        const n = costs.length;
        if (n === 0) return {};
        const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
        const getPercentile = (arr, p) => arr[Math.floor(p / 100 * (n - 1))];
        const stats = {
            avgCost: sum(costs) / n, avgDestroys: sum(destroys) / n,
            avgCouponCost: sum(runs.couponCosts) / n, avgEnhanceCost: sum(runs.enhanceCosts) / n, avgDestroyCost: sum(runs.destroyCosts) / n,
            percentiles: {}
        };
        const percentilePoints = [1, 10, 25, 50, 75, 90, 99];
        percentilePoints.forEach(p => {
            stats.percentiles['P' + p] = { cost: getPercentile(costs, p), destroys: getPercentile(destroys, p) };
        });
        return stats;
    }
    
    function formatCost(cost, rate = 1) {
        const value = cost / rate;
        if (rate === 1) return Math.round(value).toLocaleString();
        return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function getCurrencyInfo() {
        const isTWD = dom.currencySwitch.checked;
        const currencyName = isTWD ? '台幣' : '楓幣';
        const exchangeRate = isTWD ? (parseFloat(dom.exchangeRateInput.value) || 1) : 1;
        return { exchangeRate, currencyName, isTWD };
    }

    function displayDataTables(equipLevel, costDiscount, vipDiscount, activeProbabilities, compensationPrice) {
        const maxStar = enhancementCosts[equipLevel].length;
        dom.dataTablesTitle.textContent = "基礎數據參考 (基於當前設定)";

        const costsMods = [];
        if (costDiscount) costsMods.push('活動30%折扣');
        if (vipDiscount > 0) costsMods.push(`VIP ${Math.round(vipDiscount * 100)}%折扣`);
        dom.costsTableTitle.textContent = costsMods.length > 0
            ? `單次強化成本表（套用：${costsMods.join('、')}）`
            : '單次強化成本表';

        const probsMods = [];
        if (dom.guaranteedSuccessCheckbox.checked) probsMods.push('5/10/15星必過');
        if (dom.reduceDestructionCheckbox.checked) probsMods.push('破壞機率-30%');
        dom.probsTableTitle.textContent = probsMods.length > 0
            ? `成功/維持/破壞機率表（套用：${probsMods.join('、')}）`
            : '成功/維持/破壞機率表';
        let costsHtml = '<table class="data-table"><thead><tr><th>星等</th><th>強化費用(楓幣)</th></tr></thead><tbody>';
        for(let n = 0; n < maxStar; n++) {
            const originalBaseCost = enhancementCosts[equipLevel][n];
            let finalCost = originalBaseCost;
            let totalDiscountRate = 0;
            if (costDiscount) totalDiscountRate += 0.30;
            if (n <= 16) totalDiscountRate += vipDiscount;
            if (totalDiscountRate > 0) {
                finalCost = originalBaseCost * (1 - totalDiscountRate);
            }
            costsHtml += `<tr><td>${n} → ${n+1}</td><td>${Math.round(finalCost).toLocaleString()}</td></tr>`;
        }
        costsHtml += '</tbody></table>';
        dom.costsTableContainer.innerHTML = costsHtml;

        const floorTo2 = v => (Math.floor(v * 10000) / 100).toFixed(2);
        let probsHtml = '<table class="data-table"><thead><tr><th>星等</th><th>成功</th><th>維持</th><th>破壞</th></tr></thead><tbody>';
        activeProbabilities.forEach((p, n) => {
            if (n >= maxStar) return;
            probsHtml += `<tr><td>${n} → ${n+1}</td><td>${floorTo2(p.success)}%</td><td>${floorTo2(p.keep)}%</td><td>${floorTo2(p.destroy)}%</td></tr>`;
        });
        probsHtml += '</tbody></table>';
        probsHtml += `<p style="margin:4px 0 0; font-size:0.8rem; color:#888;">※ 數值無條件捨去至小數點第二位（同官方習慣）</p>`;
        dom.probsTableContainer.innerHTML = probsHtml;

        // 痕跡完全復原費用表
        dom.traceTableTitle.textContent = `痕跡完全復原費用參考（裝備等級 ${equipLevel}）`;
        const isTraceSupported = getTraceMesos(15, equipLevel) !== Infinity;
        let traceHtml;
        if (!isTraceSupported) {
            traceHtml = `<p style="margin:0; font-size:0.85rem; color:#888;">此裝備等級（${equipLevel}）不支援痕跡完全復原功能，計算機不會將其納入策略比較。</p>`;
        } else {
            traceHtml = `
                <p style="margin:0 0 8px; font-size:0.82rem; color:#555; line-height:1.6;">
                    數值來源：官方公告（2026/07）。合計 = 需備用裝備數 × 裝備補償價格（${compensationPrice.toLocaleString()} 楓幣）＋ 痕跡楓幣費
                </p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>破壞時的星數</th>
                            <th>需備用裝備數</th>
                            <th>痕跡楓幣費</th>
                            <th>合計估算</th>
                        </tr>
                    </thead>
                    <tbody>`;
            for (let star = 15; star <= 22; star++) {
                const entry = TRACE_RECOVERY_COSTS[star];
                if (!entry) continue;
                const mesos = getTraceMesos(star, equipLevel);
                const total = entry.equips * compensationPrice + mesos;
                traceHtml += `<tr>
                    <td>${star}★</td>
                    <td>${entry.equips} 件</td>
                    <td>${mesos.toLocaleString()}</td>
                    <td>${total.toLocaleString()}</td>
                </tr>`;
            }
            traceHtml += '</tbody></table>';
            traceHtml += `<p style="margin:6px 0 0; font-size:0.8rem; color:#888; line-height:1.5;">※ 23★ 以上破壞時，痕跡完全復原費用以 22★ 計算（恢復至 22★）；亦可選擇降回 12★ 重爬——系統會依當下最優路線自動評估，您也可在自訂路徑中手動指定。</p>`;
        }
        dom.traceTableContainer.innerHTML = traceHtml;
    }
    
    // =====================================================================
    // 自訂路徑功能（包含雙軌復原）
    // =====================================================================
    function calculateIntervalsWithForced(equipLevel, maxStar, compensationPrice, couponPrices, specialCouponPrices, costDiscount, vipDiscount, activeProbabilities, forcedStarMethods, forcedRecoveryMethods, customRecoveryJumpStar, customRecoveryJumpCost) {
        const K = 0;
        const originalCosts = enhancementCosts[equipLevel];
        const intervalResults = [];
        const memo = {};
        const equipLevelNum = parseInt(equipLevel, 10);
        const YI = 100000000;

        for (let n = 0; n < maxStar; n++) {
            if (n >= originalCosts.length) {
                intervalResults[n] = { cost: Infinity, varCost: Infinity, score: Infinity, destructions: Infinity, couponCost: Infinity, specialMethod: null, isPreventing: false, recoveryStrategy: '12' };
                continue;
            }

            const originalBaseCost = originalCosts[n];
            const probsOrig = { ...activeProbabilities[n] };

            let totalDiscountRate = 0;
            if (costDiscount) totalDiscountRate += 0.30;
            if (n <= 16) totalDiscountRate += vipDiscount;

            let recoveryTotalCost = 0, climbDestructions = 0, climbCouponCost = 0, climbVar = 0;
            let recoveryStrategy = '12';
            let expEquipCostForInterval = 0;

            if (probsOrig.destroy > 0 && n >= 12) {
                // 路線 A：回 12 星
                let costA = 0, varA = 0, destA = 0, cpnA = 0, equipCostA = 0;
                if (customRecoveryJumpStar !== null && customRecoveryJumpStar !== undefined && n >= customRecoveryJumpStar) {
                    costA = compensationPrice + customRecoveryJumpCost;
                    cpnA = customRecoveryJumpCost;
                    let segEquipCost = 0;
                    for (let i = customRecoveryJumpStar; i < n; i++) {
                        costA += intervalResults[i].cost;
                        destA += intervalResults[i].destructions;
                        cpnA += intervalResults[i].couponCost;
                        varA += intervalResults[i].varCost;
                        segEquipCost += (intervalResults[i].equipCost ?? 0);
                    }
                    equipCostA = (probsOrig.destroy * (compensationPrice + segEquipCost)) / probsOrig.success;
                } else {
                    const path12 = findOptimalPath(12, n, intervalResults, couponPrices, memo, K);
                    costA = compensationPrice + path12.totalCost;
                    destA = path12.totalDestructions;
                    cpnA = path12.totalCouponCost;
                    varA = path12.totalVar;
                    equipCostA = (probsOrig.destroy * (compensationPrice + (path12.totalEquipCost ?? 0))) / probsOrig.success;
                }
                let scoreA = (costA / YI) + K * varA;

                // 路線 B：完全復原
                let scoreB = Infinity, costB = Infinity, varB = 0, destB = 0, cpnB = 0, equipCostB = 0;
                let traceStar = n >= 23 ? 22 : n;
                if (traceStar >= 15 && TRACE_RECOVERY_COSTS[traceStar] && getTraceMesos(traceStar, equipLevel) !== Infinity) {
                    const recData = TRACE_RECOVERY_COSTS[traceStar];
                    const restoreCost = (recData.equips * compensationPrice) + getTraceMesos(traceStar, equipLevel);
                    const pathB_result = findOptimalPath(traceStar, n, intervalResults, couponPrices, memo, K);
                    costB = restoreCost + pathB_result.totalCost;
                    destB = pathB_result.totalDestructions;
                    cpnB = pathB_result.totalCouponCost;
                    varB = pathB_result.totalVar;
                    scoreB = (costB / YI) + K * varB;
                    equipCostB = (probsOrig.destroy * (recData.equips * compensationPrice + (pathB_result.totalEquipCost ?? 0))) / probsOrig.success;
                }

                let forcedRec = (forcedRecoveryMethods && forcedRecoveryMethods[n]) ? forcedRecoveryMethods[n] : 'auto';
                if (forcedRec === 'full' && scoreB === Infinity) forcedRec = '12';

                if (forcedRec === 'full') {
                    recoveryTotalCost = costB; climbVar = varB; climbDestructions = destB; climbCouponCost = cpnB; recoveryStrategy = 'full';
                    expEquipCostForInterval = equipCostB;
                } else if (forcedRec === '12') {
                    recoveryTotalCost = costA; climbVar = varA; climbDestructions = destA; climbCouponCost = cpnA; recoveryStrategy = '12';
                    expEquipCostForInterval = equipCostA;
                } else { 
                    if (scoreB < scoreA) {
                        recoveryTotalCost = costB; climbVar = varB; climbDestructions = destB; climbCouponCost = cpnB; recoveryStrategy = 'full';
                        expEquipCostForInterval = equipCostB;
                    } else {
                        recoveryTotalCost = costA; climbVar = varA; climbDestructions = destA; climbCouponCost = cpnA; recoveryStrategy = '12';
                        expEquipCostForInterval = equipCostA;
                    }
                }
            }

            const forced = (forcedStarMethods && forcedStarMethods[n] !== undefined) ? forcedStarMethods[n] : null;
            let result = null;

            if (forced !== null) {
                if (forced === 'no_prev') {
                    let baseCost = totalDiscountRate > 0 ? originalBaseCost * (1 - totalDiscountRate) : originalBaseCost;
                    let b = baseCost / YI, mu_D = recoveryTotalCost / YI, v_D = climbVar;
                    let p = probsOrig.success, k = probsOrig.keep, r = probsOrig.destroy;
                    let mu_n = (b + r * mu_D) / p;
                    let var_term = r * v_D + p * Math.pow(b - mu_n, 2) + k * Math.pow(b, 2) + r * Math.pow(b + mu_D, 2);
                    result = {
                        type: 'sf', isPreventing: false, cost: mu_n * YI, varCost: Math.max(0, var_term / p), score: mu_n,
                        destructions: (r * (1 + climbDestructions)) / p, couponCost: (r * climbCouponCost) / p,
                        equipCost: expEquipCostForInterval, specialMethod: null
                    };
                } else if (forced === 'prev' && n >= 15 && n <= 17) {
                    let bcp = originalBaseCost * 3;
                    if (totalDiscountRate > 0) bcp -= originalBaseCost * totalDiscountRate;
                    let p = probsOrig.success;
                    let mu_p = bcp / (p * YI);
                    let v_p = Math.max(0, (bcp / YI) * (bcp / YI) * (1 - p) / (p * p));
                    result = {
                        type: 'sf', isPreventing: true, cost: mu_p * YI, varCost: v_p, score: mu_p,
                        destructions: 0, couponCost: 0, equipCost: 0, specialMethod: null
                    };
                } else if (forced && forced.startsWith('limit_')) {
                    const ls = parseInt(forced.split('_')[1]);
                    const price = specialCouponPrices.limit[ls];
                    if (price !== undefined && n + 1 <= ls) {
                        result = { type: 'limit', limitStar: ls, cost: price, varCost: 0, score: price / YI, destructions: 0, couponCost: price, equipCost: 0, specialMethod: { type: 'limit', limitStar: ls, cost: price } };
                    }
                } else if (forced && forced.startsWith('limit50_')) {
                    const ls = parseInt(forced.split('_')[1]);
                    const price = specialCouponPrices.limit50[ls];
                    if (price !== undefined && n + 1 <= ls) {
                        const expCost = price / 0.5; const S = price / (0.5 * YI);
                        result = { type: 'limit50', limitStar: ls, cost: expCost, varCost: S * S * 2 * 0.25, score: expCost / YI, destructions: 0, couponCost: expCost, equipCost: 0, specialMethod: { type: 'limit50', limitStar: ls, cost: expCost } };
                    }
                } else if (forced && forced.startsWith('limit30_')) {
                    const ls = parseInt(forced.split('_')[1]);
                    const price = specialCouponPrices.limit30[ls];
                    if (price !== undefined && n + 1 <= ls) {
                        const expCost = price / 0.3; const S_yi = price / YI;
                        result = { type: 'limit30', limitStar: ls, cost: expCost, varCost: S_yi * S_yi * (0.7 / 0.09), score: expCost / YI, destructions: 0, couponCost: expCost, equipCost: 0, specialMethod: { type: 'limit30', limitStar: ls, cost: expCost } };
                    }
                } else if (forced === 'append') {
                    const price = specialCouponPrices.append23;
                    if (price !== null && n + 1 <= 23 && equipLevelNum <= 200) {
                        const expCost = price / 0.3; const S_yi = price / YI;
                        result = { type: 'append', cost: expCost, varCost: S_yi * S_yi * (0.7 / 0.09), score: expCost / YI, destructions: 0, couponCost: expCost, equipCost: 0, specialMethod: { type: 'append', limitStar: 23, cost: expCost } };
                    }
                }
            }

            if (!result) {
                let baseCostNoPrev = totalDiscountRate > 0 ? originalBaseCost * (1 - totalDiscountRate) : originalBaseCost;
                let b = baseCostNoPrev / YI, mu_D = recoveryTotalCost / YI, v_D = climbVar;
                let p = probsOrig.success, k = probsOrig.keep, r = probsOrig.destroy;
                let mu_n = (b + r * mu_D) / p;
                let var_term = r * v_D + p * Math.pow(b - mu_n, 2) + k * Math.pow(b, 2) + r * Math.pow(b + mu_D, 2);
                let v_n = Math.max(0, var_term / p);

                let bestMethod = { type: 'sf', isPreventing: false, cost: mu_n * YI, varCost: v_n, score: mu_n + K * v_n, destructions: (r * (1 + climbDestructions)) / p, couponCost: (r * climbCouponCost) / p, equipCost: expEquipCostForInterval };

                if (n >= 15 && n <= 17 && originalBaseCost > 0) {
                    let bcp = originalBaseCost * 3;
                    if (totalDiscountRate > 0) bcp -= originalBaseCost * totalDiscountRate;
                    let mu_p = bcp / (p * YI);
                    let v_p = Math.max(0, (bcp / YI) * (bcp / YI) * (1 - p) / (p * p));
                    if (mu_p + K * v_p < bestMethod.score) {
                        bestMethod = { type: 'sf', isPreventing: true, cost: mu_p * YI, varCost: v_p, score: mu_p + K * v_p, destructions: 0, couponCost: 0, equipCost: 0 };
                    }
                }

                const tgt = n + 1;
                const evalS = (type, limitStar, costTrue, v_s) => {
                    if (costTrue / YI + K * v_s < bestMethod.score) { bestMethod = { type, limitStar, cost: costTrue, varCost: v_s, score: costTrue / YI + K * v_s, destructions: 0, couponCost: costTrue, equipCost: 0 }; }
                };
                for (const [ls, price] of Object.entries(specialCouponPrices.limit)) { if (tgt <= parseInt(ls)) evalS('limit', ls, price, 0); }
                for (const [ls, price] of Object.entries(specialCouponPrices.limit50)) { if (tgt <= parseInt(ls)) { const S = (price / 0.5) / YI; evalS('limit50', ls, price / 0.5, S * S * 2 * 0.25); } }
                for (const [ls, price] of Object.entries(specialCouponPrices.limit30)) { if (tgt <= parseInt(ls)) { const S_yi = price / YI; evalS('limit30', ls, price / 0.3, S_yi * S_yi * (0.7 / 0.09)); } }
                if (specialCouponPrices.append23 !== null && tgt <= 23 && equipLevelNum <= 200) { const S_yi = specialCouponPrices.append23 / YI; evalS('append', 23, specialCouponPrices.append23 / 0.3, S_yi * S_yi * (0.7 / 0.09)); }
                result = bestMethod;
            }

            intervalResults[n] = result;
            intervalResults[n].specialMethod = result.type !== 'sf' ? (result.specialMethod || result) : null;
            intervalResults[n].isPreventing = result.type === 'sf' ? !!result.isPreventing : false;
            intervalResults[n].recoveryStrategy = recoveryStrategy;
        }
        return intervalResults;
    }

    function buildCustomPathTable() {
        const equipLevel = dom.equipLevelSelect.value;
        const startStar = parseInt(dom.startStarSelect.value, 10) || 0;
        const targetStar = parseInt(dom.targetStarSelect.value, 10);
        const couponPrices = getCouponPrices();
        const specialCouponPrices = getSpecialCouponPrices();
        const equipLevelNum = parseInt(equipLevel, 10);

        const savedStarMethods = {};
        const savedRecoveryMethods = {}; 
        document.querySelectorAll('[id^="custom-star-"]').forEach(sel => {
            const n = parseInt(sel.id.replace('custom-star-', ''));
            if (!isNaN(n)) savedStarMethods[n] = sel.value;
        });
        document.querySelectorAll('[id^="custom-rec-"]').forEach(sel => {
            const n = parseInt(sel.id.replace('custom-rec-', ''));
            if (!isNaN(n)) savedRecoveryMethods[n] = sel.value;
        });
        // 若 DOM 中尚無動態選單（第一次建表），從載入的設定中取回
        if (g_savedCustomPath && Object.keys(savedStarMethods).length === 0) {
            Object.assign(savedStarMethods, g_savedCustomPath.starMethods || {});
        }
        if (g_savedCustomPath && Object.keys(savedRecoveryMethods).length === 0) {
            Object.assign(savedRecoveryMethods, g_savedCustomPath.recMethods || {});
        }

        const initialJumpSel = document.getElementById('custom-initial-jump');
        const recoveryJumpSel = document.getElementById('custom-recovery-jump');
        const savedInitial = (initialJumpSel?.value) || (g_savedCustomPath?.initialJump) || 'none';
        const savedRecovery = (recoveryJumpSel?.value) || (g_savedCustomPath?.recoveryJump) || 'none';

        if (initialJumpSel) {
            initialJumpSel.innerHTML = `<option value="none">不跳躍，從 ${startStar} 星開始直接強化</option>`;
            for (let s = 10; s <= 23; s++) {
                const price = couponPrices[s];
                if (!price || price <= 0) continue;
                if (s > startStar && s <= targetStar) {
                    const suffix = s === targetStar ? '（直接到達目標，不需再強化）' : '';
                    initialJumpSel.innerHTML += `<option value="coupon_${s}">使用 ${s} 星力強化券跳至 ${s} 星（${Math.round(price).toLocaleString()} 楓幣）${suffix}</option>`;
                }
            }
            if (Array.from(initialJumpSel.options).some(o => o.value === savedInitial)) initialJumpSel.value = savedInitial;
        }
        if (recoveryJumpSel) {
            recoveryJumpSel.innerHTML = `<option value="none">不跳躍，從 12 星開始直接強化</option>`;
            for (let s = 10; s <= 23; s++) {
                const price = couponPrices[s];
                if (!price || price <= 0) continue;
                if (s > 12 && s <= targetStar) {
                    const suffix = s === targetStar ? '（直接到達目標，不需再強化）' : '';
                    recoveryJumpSel.innerHTML += `<option value="coupon_${s}">使用 ${s} 星力強化券跳至 ${s} 星（${Math.round(price).toLocaleString()} 楓幣）${suffix}</option>`;
                }
            }
            if (Array.from(recoveryJumpSel.options).some(o => o.value === savedRecovery)) recoveryJumpSel.value = savedRecovery;
        }

        const rangeStart = Math.min(startStar, 12);
        const rangeEnd = targetStar - 1;
        const container = document.getElementById('custom-star-table-container');
        if (!container) return;

        const rows = [];
        for (let n = rangeStart; n <= rangeEnd; n++) {
            const options = [{ value: 'no_prev', label: '直接強化（不防爆）' }];
            if (n >= 15 && n <= 17) {
                options.push({ value: 'prev', label: '直接強化（防爆，費用×3，消除爆裝風險）' });
            }
            const tgt = n + 1;
            for (const [ls, price] of Object.entries(specialCouponPrices.limit)) {
                if (tgt <= parseInt(ls)) options.push({ value: `limit_${ls}`, label: `突破1星 100%（${ls}星）` });
            }
            for (const [ls, price] of Object.entries(specialCouponPrices.limit50)) {
                if (tgt <= parseInt(ls)) options.push({ value: `limit50_${ls}`, label: `突破1星 50%（${ls}星）` });
            }
            for (const [ls, price] of Object.entries(specialCouponPrices.limit30)) {
                if (tgt <= parseInt(ls)) options.push({ value: `limit30_${ls}`, label: `突破1星 30%（${ls}星）` });
            }
            if (specialCouponPrices.append23 !== null && tgt <= 23 && equipLevelNum <= 200) {
                options.push({ value: 'append', label: `追加1星 30%（23星）` });
            }
            // 15★以上有炸裝風險，即使強化方式只有一種，仍需顯示「破壞復原方式」欄
            if (options.length > 1 || n >= 15) rows.push({ n, options });
        }

        if (rows.length === 0) {
            container.innerHTML = '<p class="note" style="text-align:center; padding:15px 0;">目前設定下此段沒有可自訂項目。</p>';
            return;
        }

        const traceSupported = getTraceMesos(15, equipLevel) !== Infinity;

        const buildRecSelect = (n, savedRec) => {
            // 23★以上炸裝，痕跡完全恢復最高只能恢復至22★（非原星數）
            const fullLabel = n >= 23
                ? `完全恢復至 22★（補空裝＋痕跡費，恢復至 22★ 後繼續衝）`
                : `完全恢復至原星數（補空裝＋痕跡費，直接繼續衝）`;
            let opts = `
                <option value="auto"${savedRec==='auto'?' selected':''}>自動選最省路線</option>
                <option value="12"${savedRec==='12'?' selected':''}>恢復至 12★（補一件空裝，從 12★ 重新爬）</option>`;
            if (traceSupported) {
                opts += `<option value="full"${savedRec==='full'?' selected':''}>完全恢復：${fullLabel}</option>`;
            }
            return `<select id="custom-rec-${n}" style="width:100%;font-size:0.88em;padding:4px;">${opts}</select>`;
        };

        const traceHint = traceSupported
            ? ''
            : `<p style="margin:0 0 10px;padding:7px 10px;background:#fff8e1;border-left:3px solid #f39c12;border-radius:4px;font-size:0.83rem;color:#7d6009;line-height:1.6;">
                ⚠️ <strong>此裝備等級（${equipLevel}）不支援完全恢復</strong>，炸裝後固定恢復至 12★，無法選擇完全恢復至原星數。
               </p>`;

        let html = `
            ${traceHint}
            <table style="width:100%;border-collapse:collapse;font-size:0.88em;">
            <thead><tr>
                <th style="padding:6px 10px;background:#eef2fa;text-align:left;width:90px;font-weight:bold;">星等</th>
                <th style="padding:6px 10px;background:#eef2fa;text-align:left;font-weight:bold;">強化方式</th>
                <th style="padding:6px 10px;background:#eef2fa;text-align:left;font-weight:bold;">
                    破壞復原方式
                    <span style="display:block;font-size:0.8em;font-weight:normal;color:#7f8c8d;">裝備炸掉時要怎麼恢復</span>
                </th>
            </tr></thead><tbody>`;
            
        for (const { n, options } of rows) {
            const savedVal = savedStarMethods[n] !== undefined ? savedStarMethods[n] : 'no_prev';
            const isPrev = savedVal === 'prev';
            html += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:6px 10px;font-weight:bold;white-space:nowrap;">${n} → ${n+1}★</td>
                <td style="padding:4px 8px;"><select id="custom-star-${n}" style="width:100%;font-size:0.88em;padding:4px;">`;
            for (const opt of options) {
                const sel = opt.value === savedVal ? ' selected' : '';
                html += `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }
            html += `</select></td>`;

            html += `<td style="padding:4px 8px;" id="custom-rec-cell-${n}">`;
            if (n >= 15) {
                if (isPrev) {
                    html += `<span style="color:#aaa;font-size:0.85em;padding-left:4px;">選防爆則不會破壞，無需選擇</span>`;
                } else {
                    html += buildRecSelect(n, savedRecoveryMethods[n] || 'auto');
                }
            } else {
                html += `<span style="color:#aaa;font-size:0.85em;padding-left:4px;">15★以下若破壞，固定恢復至 12★</span>`;
            }
            html += `</td></tr>`;
        }
        html += '</tbody></table>';
        container.innerHTML = html;

        rows.forEach(({ n }) => {
            if (n < 15) return;
            const starSel = document.getElementById(`custom-star-${n}`);
            if (!starSel) return;
            starSel.addEventListener('change', () => {
                const cell = document.getElementById(`custom-rec-cell-${n}`);
                if (!cell) return;
                if (starSel.value === 'prev') {
                    cell.innerHTML = `<span style="color:#aaa;font-size:0.85em;padding-left:4px;">選防爆則不會破壞，無需選擇</span>`;
                } else {
                    cell.innerHTML = buildRecSelect(n, 'auto');
                    document.getElementById(`custom-rec-${n}`)?.addEventListener('change', updateRecoveryJumpState);
                }
                updateRecoveryJumpState();
            });
            document.getElementById(`custom-rec-${n}`)?.addEventListener('change', updateRecoveryJumpState);
        });

        updateRecoveryJumpState();
    }

    function updateRecoveryJumpState() {
        const recoveryJumpSel = document.getElementById('custom-recovery-jump');
        const recoveryJumpNote = document.getElementById('recovery-jump-note');
        if (!recoveryJumpSel) return;

        const allRecSelects = document.querySelectorAll('[id^="custom-rec-"]');
        let anyNeedsJump = false;
        allRecSelects.forEach(sel => {
            if (sel.value === '12' || sel.value === 'auto') anyNeedsJump = true;
        });

        if (allRecSelects.length === 0) anyNeedsJump = true;

        if (!anyNeedsJump) {
            recoveryJumpSel.disabled = true;
            recoveryJumpSel.style.opacity = '0.4';
            recoveryJumpSel.style.cursor = 'not-allowed';
            if (recoveryJumpNote) {
                recoveryJumpNote.innerHTML = '⚠️ 目前所有星等已指定「完全恢復至原星數」，炸裝後不會走至 12★，此跳躍選項無作用。';
                recoveryJumpNote.style.color = '#aaa';
            }
        } else {
            recoveryJumpSel.disabled = false;
            recoveryJumpSel.style.opacity = '1';
            recoveryJumpSel.style.cursor = '';
            if (recoveryJumpNote) {
                recoveryJumpNote.innerHTML = '炸裝後若恢復至 12★，可花一張星力強化券直接跳至指定星數，節省低星段的重爬費用。';
                recoveryJumpNote.style.color = '#777';
            }
        }
    }

    function getCustomPathData() {
        const enableCheckbox = document.getElementById('enable-custom-path');
        if (!enableCheckbox || !enableCheckbox.checked) return null;

        const initialJumpSel = document.getElementById('custom-initial-jump');
        const recoveryJumpSel = document.getElementById('custom-recovery-jump');
        const initialJumpVal = initialJumpSel ? initialJumpSel.value : 'none';
        const recoveryJumpVal = recoveryJumpSel ? recoveryJumpSel.value : 'none';

        const initialJump = initialJumpVal === 'none' ? null : parseInt(initialJumpVal.split('_')[1]);
        const recoveryJump = recoveryJumpVal === 'none' ? null : parseInt(recoveryJumpVal.split('_')[1]);

        const forcedStarMethods = {};
        const forcedRecoveryMethods = {}; 
        document.querySelectorAll('[id^="custom-star-"]').forEach(sel => {
            const n = parseInt(sel.id.replace('custom-star-', ''));
            if (!isNaN(n)) forcedStarMethods[n] = sel.value;
        });
        document.querySelectorAll('[id^="custom-rec-"]').forEach(sel => {
            const n = parseInt(sel.id.replace('custom-rec-', ''));
            if (!isNaN(n)) forcedRecoveryMethods[n] = sel.value;
        });

        return { initialJump, recoveryJump, forcedStarMethods, forcedRecoveryMethods };
    }
    // =====================================================================

    window.openModal = function(index, titleOverride) {
        if (!g_allScenarioResults || !g_allScenarioResults[index]) return;
        const resultData = g_allScenarioResults[index];
        const { exchangeRate, currencyName } = getCurrencyInfo();
        dom.modalTitle.textContent = `單次模擬過程範例 - ${titleOverride || resultData.name}`;
        
        dom.modalLogContent.style.backgroundColor = '#2c3e50';
        dom.modalLogContent.style.color = '#ecf0f1';
        dom.modalLogContent.innerHTML = ''; 

        if(resultData.firstRunRawLog) {
            dom.modalLogContent.classList.remove('hidden');
            dom.modalLogContent.innerHTML = resultData.firstRunRawLog.map(line => {
                return line.replace(/\(花費: (.+?)\)/g, (match, p1) => `(花費: ${formatCost(parseFloat(p1.replace(/,/g, '')), exchangeRate)} ${currencyName})`)
                           .replace(/\(累積: (.+?)\)/g, (match, p1) => `(累積: ${formatCost(parseFloat(p1.replace(/,/g, '')), exchangeRate)} ${currencyName})`)
                           .replace(/\(補償一件裝備 \+(.+?)，/g, (match, p1) => `(補償一件裝備 +${formatCost(parseFloat(p1.replace(/,/g, '')), exchangeRate)} ${currencyName}，`)
                           .replace(/\(選用完全復原花費 \+(.+?)，/g, (match, p1) => `(選用完全復原花費 +${formatCost(parseFloat(p1.replace(/,/g, '')), exchangeRate)} ${currencyName}，`)
                           .replace(/\(券費: (.+?)\)/g, (match, p1) => `(券費: ${formatCost(parseFloat(p1.replace(/,/g, '')), exchangeRate)} ${currencyName})`);
            }).join('\n');
        } else {
             dom.modalLogContent.innerHTML = '<p>模擬未執行或目標星數過高，無單次紀錄。</p>';
        }
        dom.modal.classList.remove('hidden');
    }

    window.openAllDataModal = function(index, titleOverride) {
        if (!g_allScenarioResults || !g_allScenarioResults[index]) return;
        const resultData = g_allScenarioResults[index];
        const stats = resultData.stats;
        
        if (!resultData.allCosts || resultData.allCosts.length === 0) {
            alert("無模擬數據");
            return;
        }

        const { exchangeRate, currencyName } = getCurrencyInfo();
        
        dom.modalTitle.textContent = `${titleOverride || resultData.name} - 模擬數據詳細統計`;

        dom.modalLogContent.style.backgroundColor = '#ffffff';
        dom.modalLogContent.style.color = '#000000';

        const tableStyle = 'width: 100%; border-collapse: collapse; background-color: #fff; color: #000; table-layout: fixed; margin-bottom: 10px;';
        const cellStyle = 'border: 1px solid #ccc; padding: 4px; text-align: center; position: static; background-color: #fff; color: #000; font-size: 0.9em;';
        const headerStyle = 'margin-top: 0; margin-bottom: 5px; color: #000; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 3px;';

        let costTableHtml = `
            <h3 style="${headerStyle}">費用分布 (分位數)</h3>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${cellStyle} font-weight:bold;">P1</th>
                        <th style="${cellStyle} font-weight:bold;">P10</th>
                        <th style="${cellStyle} font-weight:bold;">P25</th>
                        <th style="${cellStyle} font-weight:bold;">P50 (中位數)</th>
                        <th style="${cellStyle} font-weight:bold;">P75</th>
                        <th style="${cellStyle} font-weight:bold;">P90</th>
                        <th style="${cellStyle} font-weight:bold;">P99</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P1.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P10.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P25.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P50.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P75.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P90.cost, exchangeRate)}</td>
                        <td style="${cellStyle}">${formatCost(stats.percentiles.P99.cost, exchangeRate)}</td>
                    </tr>
                </tbody>
            </table>
        `;

        let destroyTableHtml = `
            <h3 style="${headerStyle}">破壞次數分布 (分位數)</h3>
            <p style="font-size: 0.8em; color: #555; margin-top: -3px; margin-bottom: 5px;">
                * 注意：此處僅為破壞次數的群體分布統計，與上方費用無直接對應關係 (獨立排序)。
            </p>
            <table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${cellStyle} font-weight:bold;">P1</th>
                        <th style="${cellStyle} font-weight:bold;">P10</th>
                        <th style="${cellStyle} font-weight:bold;">P25</th>
                        <th style="${cellStyle} font-weight:bold;">P50 (中位數)</th>
                        <th style="${cellStyle} font-weight:bold;">P75</th>
                        <th style="${cellStyle} font-weight:bold;">P90</th>
                        <th style="${cellStyle} font-weight:bold;">P99</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="${cellStyle}">${stats.percentiles.P1.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P10.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P25.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P50.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P75.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P90.destroys}</td>
                        <td style="${cellStyle}">${stats.percentiles.P99.destroys}</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        const listContent = resultData.allCosts.map((cost, i) => {
            const rank = i + 1;
            const rankPercent = ((rank / resultData.allCosts.length) * 100).toFixed(2);
            return `[前 ${rankPercent}%] 第 ${rank} 名: ${formatCost(cost, exchangeRate)}`;
        }).join('\n');

        const listHtml = `
            <h3 style="${headerStyle}">詳細費用列表 (由低至高)</h3>
            <div style="margin-bottom: 3px; color: #555; font-size: 0.85em;">單位: ${currencyName}</div>
            <textarea readonly style="width: 100%; height: 30vh; font-family: 'Courier New', monospace; font-size: 13px; padding: 8px; border: 1px solid #ccc; background: #fff; color: #000; resize: none;">${listContent}</textarea>
        `;

        const destroyListContent = resultData.allDestroys.map((count, i) => {
            const rank = i + 1;
            const rankPercent = ((rank / resultData.allDestroys.length) * 100).toFixed(2);
            return `[前 ${rankPercent}%] 第 ${rank} 名: ${count.toFixed(0)} 次`;
        }).join('\n');

        const destroyListHtml = `
            <h3 style="${headerStyle} margin-top: 20px;">詳細破壞次數列表 (由低至高)</h3>
            <div style="margin-bottom: 3px; color: #555; font-size: 0.85em;">單位: 次數</div>
            <textarea readonly style="width: 100%; height: 30vh; font-family: 'Courier New', monospace; font-size: 13px; padding: 8px; border: 1px solid #ccc; background: #fff; color: #000; resize: none;">${destroyListContent}</textarea>
        `;

        dom.modalLogContent.innerHTML = costTableHtml + listHtml + destroyTableHtml + destroyListHtml;
        
        dom.modal.classList.remove('hidden');
    }

    function displayFinalResult() {
        if (!g_allScenarioResults) return;
        const { exchangeRate, currencyName, isTWD } = getCurrencyInfo();
        
        dom.labelForMeso.style.color = isTWD ? '#aaa' : '#000';
        dom.labelForTwd.style.color = isTWD ? '#000' : '#aaa';

        const relevantResults = g_allScenarioResults; 

        const minTheoreticalCost = Math.min(...relevantResults.map(r => r.theoreticalResult.totalCost));
        const minCostCount = relevantResults.filter(r => r.theoreticalResult.totalCost === minTheoreticalCost).length;
        
        let resultsToRender = relevantResults.map((r, index) => {
            let identicalTo = null;
            
            for (let i = 0; i < index; i++) {
                const prev = relevantResults[i];
                if (Math.round(r.theoreticalResult.totalCost) === Math.round(prev.theoreticalResult.totalCost) &&
                    r.pathDescription.init === prev.pathDescription.init &&
                    r.pathDescription.recover === prev.pathDescription.recover) {
                    
                    identicalTo = prev.name.split(' (')[0].trim();
                    break; 
                }
            }

            return {
                data: r,
                identicalTo: identicalTo,
                originalIndex: index,
                showBadge: r.theoreticalResult.totalCost === minTheoreticalCost,
                badgeType: minCostCount > 1 ? 'tie' : 'best'
            };
        });

        let tableHeaders = '';
        let tableBodyContent = '';

        const getDetailBtn = (index, title) => `<button class="btn-details" onclick="openModal(${index}, '${title}')">查看模擬過程</button>`;
        const getAllDataBtn = (index, title) => `<button class="btn-details" onclick="openAllDataModal(${index}, '${title}')">查看分布與列表</button>`;

        if (g_simulationAborted) {
            dom.legendNote.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">(注意：本次計算因運算時間過長，已自動切換為僅顯示理論值)</span>`;
            dom.resultsTitle.textContent = "理論期望成本統計 (模擬已略過)";
            tableHeaders = `
                <thead>
                    <tr>
                        <th style="min-width: 250px;">策略與說明</th>
                        <th style="min-width: 250px;">建議配置</th>
                        <th class="cost-header">理論期望總成本 (${currencyName})</th>
                        <th class="destroy-header">理論期望破壞次數</th>
                    </tr>
                </thead>`;
            
            resultsToRender.forEach((item) => {
                const result = item.data;
                const finalResult = result.theoreticalResult;
                const rowClass = item.showBadge ? 'highlight-row' : '';

                let badge = '';
                if (item.showBadge) {
                    badge = item.badgeType === 'tie'
                        ? `<span class="best-choice-badge" style="background-color:#f39c12;">★ 並列最低</span>` 
                        : `<span class="best-choice-badge">★ 理論平均最省</span>`;
                }

                const couponPart = finalResult.totalCouponCost;
                const destructionPart = finalResult.totalEquipCost ?? (finalResult.totalDestructions * result.compensationPrice);
                const enhancementPart = finalResult.totalCost - couponPart - destructionPart;
                const costBreakdown = `<div class="cost-breakdown">(券: ${formatCost(couponPart, exchangeRate)}<br>強化: ${formatCost(enhancementPart, exchangeRate)}<br><span title="空裝補償估算（不含痕跡修復楓幣費）" style="cursor:help;text-decoration:underline dotted #aaa;">裝備</span>: ${formatCost(destructionPart, exchangeRate)})</div>`;
                
                let stratNameHtml = `
                    <span style="display: flex; align-items: center; justify-content: flex-start;">
                        <strong>${result.name}</strong> 
                        <span class="tooltip-icon" data-tooltip="${result.desc.replace(/"/g, '&quot;')}" style="display:inline-block; width:16px; height:16px; background:#3498db; color:#fff; border-radius:50%; text-align:center; line-height:16px; font-size:12px; cursor:help; margin-left:6px; user-select:none;">?</span>
                    </span>
                `;
                if (item.identicalTo) {
                    stratNameHtml += `<br><span style="font-size:0.85em; color:#7f8c8d; font-weight:normal; display:block; margin-top:4px;">(此設定下與【${item.identicalTo}】路線相同)</span>`;
                }
                
                tableBodyContent += `
                    <tr class="${rowClass}">
                        <td style="text-align:left; line-height: 1.4;">${stratNameHtml}${badge ? '<div style="margin-top:4px;">' + badge + '</div>' : ''}</td>
                        <td style="text-align:left;">
                            <strong>建議配置（初始衝裝）：</strong><br>${result.pathDescription.init}<br>
                            <div style="margin-top:5px;"><strong>炸裝後恢復路徑（如選擇降至 12★）：</strong><br>${result.pathDescription.recover}</div>
                        </td>
                        <td class="cost">${formatCost(finalResult.totalCost, exchangeRate)} ${costBreakdown}</td>
                        <td class="destroy">${finalResult.totalDestructions.toFixed(4)}</td>
                    </tr>`;
            });

        } else {
            dom.legendNote.innerHTML = `上方為模擬值 <span class="theoretical-value">(綠字) 為理論期望值</span>`;
            dom.resultsTitle.textContent = "模擬與理論成本統計";
            tableHeaders = `
                <thead>
                    <tr>
                        <th style="min-width: 250px;">策略與說明</th>
                        <th style="min-width: 250px;">建議配置</th>
                        <th class="cost-header">平均總成本 (${currencyName})</th>
                        <th class="destroy-header">平均破壞</th>
                        <th>單次模擬</th>
                        <th>所有數據 (排序)</th>
                    </tr>
                </thead>`;

            resultsToRender.forEach((item) => {
                const result = item.data;
                const stats = result.stats;
                const theoretical = result.theoreticalResult;
                const rowClass = item.showBadge ? 'highlight-row' : '';

                let badge = '';
                if (item.showBadge) {
                    badge = item.badgeType === 'tie'
                        ? `<span class="best-choice-badge" style="background-color:#f39c12;">★ 並列最低</span>` 
                        : `<span class="best-choice-badge">★ 理論平均最省</span>`;
                }
                
                const simCouponPart = stats.avgCouponCost;
                const simDestructionPart = stats.avgDestroyCost;
                const simEnhancementPart = stats.avgCost - simCouponPart - simDestructionPart;
                const simCostBreakdown = `<span class="cost-breakdown sim-cost-breakdown">(券: ${formatCost(simCouponPart, exchangeRate)} 強化: ${formatCost(simEnhancementPart, exchangeRate)} <span title="爆裝次數 × 空裝補償價格（不含痕跡修復楓幣費）" style="cursor:help;text-decoration:underline dotted #aaa;">裝備</span>: ${formatCost(simDestructionPart, exchangeRate)})</span>`;

                const theoryCouponPart = theoretical.totalCouponCost;
                const theoryDestructionPart = theoretical.totalEquipCost ?? (theoretical.totalDestructions * result.compensationPrice);
                const theoryEnhancementPart = theoretical.totalCost - theoryCouponPart - theoryDestructionPart;
                const theoryCostBreakdown = `<span class="cost-breakdown">(券: ${formatCost(theoryCouponPart, exchangeRate)} 強化: ${formatCost(theoryEnhancementPart, exchangeRate)} <span title="空裝補償估算（不含痕跡修復楓幣費）" style="cursor:help;text-decoration:underline dotted #aaa;">裝備</span>: ${formatCost(theoryDestructionPart, exchangeRate)})</span>`;

                const avgCostDisplay = `<div>${formatCost(stats.avgCost, exchangeRate)} ${simCostBreakdown}</div> <div class="theoretical-value">(${formatCost(theoretical.totalCost, exchangeRate)}) ${theoryCostBreakdown}</div>`;
                const avgDestroysDisplay = `<div>${stats.avgDestroys.toFixed(2)}</div> <div class="theoretical-value">(${theoretical.totalDestructions.toFixed(2)})</div>`;

                const cleanNameForModal = result.name.split(' (')[0].replace(/<[^>]*>?/gm, '');

                let stratNameHtml = `
                    <span style="display: flex; align-items: center; justify-content: flex-start;">
                        <strong>${result.name}</strong> 
                        <span class="tooltip-icon" data-tooltip="${result.desc.replace(/"/g, '&quot;')}" style="display:inline-block; width:16px; height:16px; background:#3498db; color:#fff; border-radius:50%; text-align:center; line-height:16px; font-size:12px; cursor:help; margin-left:6px; user-select:none;">?</span>
                    </span>
                `;
                if (item.identicalTo) {
                    stratNameHtml += `<br><span style="font-size:0.85em; color:#7f8c8d; font-weight:normal; display:block; margin-top:4px;">(此設定下與【${item.identicalTo}】路線相同)</span>`;
                }

                tableBodyContent += `
                    <tr class="${rowClass}">
                        <td style="text-align:left; line-height:1.4;">${stratNameHtml}${badge ? '<div style="margin-top:4px;">' + badge + '</div>' : ''}</td>
                        <td style="text-align:left; font-size: 0.9em; line-height:1.4;">
                             <strong>建議配置（初始衝裝）：</strong><br>${result.pathDescription.init}<br>
                             <div style="margin-top:5px;"><strong>炸裝後恢復路徑（如選擇降至 12★）：</strong><br>${result.pathDescription.recover}</div>
                        </td>
                        <td class="cost">${avgCostDisplay}</td>
                        <td class="destroy">${avgDestroysDisplay}</td>
                        <td>${getDetailBtn(item.originalIndex, cleanNameForModal)}</td>
                        <td>${getAllDataBtn(item.originalIndex, cleanNameForModal)}</td>
                    </tr>`;
            });
        }
        
        dom.resultsTable.innerHTML = tableHeaders + `<tbody>${tableBodyContent}</tbody>`;
        dom.resultsContainer.classList.remove('hidden');
        dom.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        calculateEfficiency();
    }
    
    async function runSimulation() {
        if (typeof gtag === 'function') {
            gtag('event', 'click_simulation', {
                'event_category': 'Engagement',
                'event_label': 'Start Button'
            });
        }

        dom.startButton.disabled = true;
        dom.currencySwitch.disabled = true;
        dom.startButton.textContent = '計算中...';
        dom.resultsContainer.classList.add('hidden');
        dom.dataTablesContainer.classList.add('hidden');
        dom.efficiencyContainer.classList.add('hidden'); 

        await new Promise(resolve => setTimeout(resolve, 50));

        const equipLevel = dom.equipLevelSelect.value;
        const startStar = parseInt(dom.startStarSelect.value, 10); 
        const targetStar = parseInt(dom.targetStarSelect.value, 10);
        const couponPrices = getCouponPrices();
        const specialCouponPrices = getSpecialCouponPrices(); 
        const compensationPrice = parseFloat(dom.compensationPriceInput.value) || 0;
        const costDiscount = dom.costDiscountCheckbox.checked;
        const guaranteedSuccess = dom.guaranteedSuccessCheckbox.checked;
        const reduceDestruction = dom.reduceDestructionCheckbox.checked;
        const vipDiscount = parseFloat(dom.vipDiscountSelect.value);
        const numSimulations = 10000;
        
        g_simulationAborted = false;

        let activeProbabilities = JSON.parse(JSON.stringify(starProbabilities));
        if (guaranteedSuccess) {
            [5, 10, 15].forEach(star => {
                if (activeProbabilities[star]) {
                    activeProbabilities[star] = { success: 1.0, destroy: 0, keep: 0 };
                }
            });
        }
        if (reduceDestruction) {
            activeProbabilities = activeProbabilities.map((probs, n) => {
                if (n <= 21 && probs.destroy > 0) { 
                    const newProbs = { ...probs };
                    const reducedDestroyProb = newProbs.destroy * 0.3;
                    newProbs.destroy *= 0.7;
                    newProbs.keep += reducedDestroyProb;
                    return newProbs;
                }
                return probs;
            });
        }
        
        displayDataTables(equipLevel, costDiscount, vipDiscount, activeProbabilities, compensationPrice);
        dom.dataTablesContainer.classList.remove('hidden');

        const strategies = [
            { 
                name: '極致省錢', 
                Z: 0,
                desc: '<strong style="color:#f1c40f;">【設定 Z = 0】</strong>\\n<strong>公式：</strong>決策分數 = 總期望成本\\n\\n系統完全不考慮波動風險與爆裝懲罰，純粹以「大樣本下平均最便宜」為唯一標準。適合預算極深、準備大量衝裝來攤平機率的玩家。'
            },
            { 
                name: '微幅避險', 
                Z: 0.67,
                desc: '<strong style="color:#f1c40f;">【設定 Z = 0.67】</strong>\\n<strong>公式：</strong>決策分數 = 總期望成本 + 0.67 × 總標準差\\n\\n涵蓋約前 75% 玩家的運氣。當全局路徑的波動(標準差)開始變大時，系統會稍微傾向使用防爆或卷軸，幫你擋掉普通程度的衰運。'
            },
            { 
                name: '重度避險', 
                Z: 1.28,
                desc: '<strong style="color:#f1c40f;">【設定 Z = 1.28】</strong>\\n<strong>公式：</strong>決策分數 = 總期望成本 + 1.28 × 總標準差\\n\\n涵蓋約前 90% 玩家的運氣。強烈排斥會導致成本大幅波動的風險。若卷軸價格合理，會優先建議使用卷軸鎖死花費上限。'
            },
            { 
                name: '極致保底', 
                Z: 2.33,
                desc: '<strong style="color:#f1c40f;">【設定 Z = 2.33】</strong>\\n<strong>公式：</strong>決策分數 = 總期望成本 + 2.33 × 總標準差\\n\\n涵蓋約前 99% 玩家的運氣 (防禦極端衰鬼)。對不確定性極度厭惡，強烈依賴必過卷軸。\\n\\n<span style="color:#e74c3c; font-weight:bold;">※ 全局防盤子機制：</span>\\n如果 100% 卷軸賣得超級貴，而 50% 卷軸非常便宜，導致 50% 卷軸即使「衰到連續失敗的極端情況」總花費依然低於直接買 100% 卷軸，系統就會為了防範你當盤子，自動降級推薦 50% 卷軸！這正是全局數學預測的強大之處。'
            }
        ];

        const K_VALUES = [
            0, 1e-9, 1e-8, 5e-8, 1e-7, 5e-7, 1e-6, 5e-6, 1e-5, 5e-5, 1e-4, 5e-4,
            1e-3, 2e-3, 5e-3, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 50, 100
        ];

        g_allScenarioResults = [];
        const SIMULATION_TIMEOUT = 10000;

        for (let i = 0; i < strategies.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 10));
            const strategy = strategies[i];
            dom.startButton.textContent = `處理中 (${i+1}/${strategies.length}): 運算中...`;

            let bestGlobalPath = null;
            let bestGlobalIntervals = null;
            let minGlobalZScore = Infinity;
            let bestK = 0;

            for (let K of K_VALUES) {
                const intervals = calculateTheoreticalIntervals(equipLevel, enhancementCosts[equipLevel].length, compensationPrice, couponPrices, specialCouponPrices, costDiscount, vipDiscount, activeProbabilities, K);
                const memo = {};
                const path = findOptimalPath(startStar, targetStar, intervals, couponPrices, memo, K);
                
                const YI = 100000000;
                let trueMu = path.totalCost / YI;
                let trueVar = path.totalVar;
                let currentZScore = trueMu + strategy.Z * Math.sqrt(trueVar);

                if (currentZScore < minGlobalZScore) {
                    minGlobalZScore = currentZScore;
                    bestGlobalPath = path;
                    bestGlobalIntervals = intervals;
                    bestK = K;
                }
            }

            const theoreticalIntervals = bestGlobalIntervals;
            const theoreticalResult = bestGlobalPath;
            
            const memo2 = {};
            const recoverResult = findOptimalPath(12, targetStar, theoreticalIntervals, couponPrices, memo2, bestK);
            
            const strategyGuide = {
                0: theoreticalResult, 
                initialStart: startStar, 
                12: recoverResult
            };
            
            let simulationStats = null;
            let firstRunRawLog = null;
            let simulationCosts = null; 
            let simulationDestroys = null; 

            if (!g_simulationAborted) {
                const runs = { costs: [], destroys: [], enhanceCosts: [], destroyCosts: [], couponCosts: [] };
                let globalStartTime = performance.now();
                let batchStartTime = performance.now();
                
                for (let j = 0; j < numSimulations; j++) {
                    if (j % 100 === 0) {
                        if (performance.now() - globalStartTime > SIMULATION_TIMEOUT) {
                            g_simulationAborted = true;
                            console.warn(`策略 ${i+1} 運算超時，已略過後續模擬。`);
                            break;
                        }
                        if (performance.now() - batchStartTime > 50) {
                            dom.startButton.textContent = `處理中 (${i+1}/${strategies.length}): 模擬中 ${(j / numSimulations * 100).toFixed(0)}%`;
                            await new Promise(resolve => setTimeout(resolve, 0));
                            batchStartTime = performance.now(); 
                        }
                    }

                    const keepLog = (j === 0);
                    const result = simulateTrial(equipLevel, targetStar, compensationPrice, strategyGuide, costDiscount, vipDiscount, activeProbabilities, theoreticalIntervals, keepLog);
                    
                    if (result.aborted) {
                        g_simulationAborted = true; 
                        break; 
                    }

                    runs.costs.push(result.totalCost);
                    runs.destroys.push(result.totalDestroys);
                    runs.enhanceCosts.push(result.totalEnhancementCost);
                    runs.destroyCosts.push(result.totalDestructionCost);
                    runs.couponCosts.push(result.totalCouponCost);
                    
                    if (keepLog) {
                        firstRunRawLog = result.log;
                    }
                }
                
                if (!g_simulationAborted) {
                    simulationStats = calculateStatistics(runs);
                    simulationCosts = runs.costs; 
                    simulationDestroys = runs.destroys; 
                } else {
                    simulationStats = null; 
                    simulationCosts = null;
                    simulationDestroys = null;
                }
            }
            
            const initPathDesc = generatePathDescription(startStar, targetStar, theoreticalIntervals, theoreticalResult.strategyText, activeProbabilities);
            const traceAvailable = getTraceMesos(15, equipLevel) !== Infinity;
            const recoverNote = traceAvailable
                ? "(系統已為各星等自動評估並選用最優復原策略：完全復原 或 降回12星)"
                : "(此裝備等級不支援痕跡完全復原，若破壞固定降回 12 星)";
            const recoverPathDesc = targetStar > 12 
                ? generatePathDescription(12, targetStar, theoreticalIntervals, recoverResult.strategyText, activeProbabilities) + `<br><span style='color:#e67e22; font-size:0.85em; font-weight:bold; margin-top:5px; display:block;'>${recoverNote}</span>`
                : "無破壞風險";

            g_allScenarioResults.push({ 
                name: strategy.name,
                desc: strategy.desc, 
                theoreticalResult: theoreticalResult,
                stats: simulationStats,
                allCosts: simulationCosts,
                allDestroys: simulationDestroys,
                strategyGuide: strategyGuide,
                firstRunRawLog: firstRunRawLog,
                compensationPrice: compensationPrice,
                startStar: startStar,
                pathDescription: {
                    init: initPathDesc,
                    recover: recoverPathDesc
                }
            });
        }
        
        const enableCustomPathCheckbox = document.getElementById('enable-custom-path');
        if (enableCustomPathCheckbox && enableCustomPathCheckbox.checked) {
            const customData = getCustomPathData();

            if (customData) {
                const { initialJump, recoveryJump, forcedStarMethods, forcedRecoveryMethods } = customData;

                const recoveryJumpStarForCalc = recoveryJump || null;
                const recoveryJumpCostForCalc = recoveryJump ? (couponPrices[recoveryJump] || 0) : 0;
                
                const customIntervals = calculateIntervalsWithForced(
                    equipLevel, enhancementCosts[equipLevel].length,
                    compensationPrice, couponPrices, specialCouponPrices,
                    costDiscount, vipDiscount, activeProbabilities,
                    forcedStarMethods, forcedRecoveryMethods,
                    recoveryJumpStarForCalc, recoveryJumpCostForCalc
                );

                const buildPathStrategy = (effectiveStart, jumpCouponStar) => {
                    const stratText = jumpCouponStar ? `使用${jumpCouponStar}星券` : `從${effectiveStart}星強化`;
                    const jumpCost = jumpCouponStar ? (couponPrices[jumpCouponStar] || 0) : 0;
                    let totalCost = jumpCost, totalDestructions = 0, totalCouponCost = jumpCost, totalVar = 0, totalEquipCost = 0;
                    for (let i = effectiveStart; i < targetStar; i++) {
                        totalCost += customIntervals[i].cost;
                        totalDestructions += customIntervals[i].destructions;
                        totalCouponCost += customIntervals[i].couponCost;
                        totalVar += customIntervals[i].varCost;
                        totalEquipCost += (customIntervals[i].equipCost ?? 0);
                    }
                    return { strategyText: stratText, startStar: effectiveStart, couponCost: jumpCost, totalCost, totalDestructions, totalCouponCost, totalVar, totalEquipCost };
                };

                const customInitialStrategy = buildPathStrategy(
                    initialJump || startStar,
                    initialJump || null
                );
                const customRecoveryStrategy = buildPathStrategy(
                    recoveryJump || 12,
                    recoveryJump || null
                );

                const customStrategyGuide = {
                    0: customInitialStrategy,
                    initialStart: startStar,
                    12: customRecoveryStrategy
                };

                let customStats = null, customFirstRunLog = null, customAllCosts = null, customAllDestroys = null;

                if (!g_simulationAborted) {
                    const customRuns = { costs: [], destroys: [], enhanceCosts: [], destroyCosts: [], couponCosts: [] };
                    const customSimStart = Date.now();
                    for (let j = 0; j < numSimulations; j++) {
                        if (g_simulationAborted || (Date.now() - customSimStart) > SIMULATION_TIMEOUT) break;
                        if (j > 0 && j % 200 === 0) await new Promise(resolve => setTimeout(resolve, 0));
                        const keepLog = (j === 0);
                        const result = simulateTrial(equipLevel, targetStar, compensationPrice, customStrategyGuide, costDiscount, vipDiscount, activeProbabilities, customIntervals, keepLog);
                        if (result.aborted) break;
                        customRuns.costs.push(result.totalCost);
                        customRuns.destroys.push(result.totalDestroys);
                        customRuns.enhanceCosts.push(result.totalEnhancementCost);
                        customRuns.destroyCosts.push(result.totalDestructionCost);
                        customRuns.couponCosts.push(result.totalCouponCost);
                        if (keepLog) customFirstRunLog = result.log;
                    }
                    if (customRuns.costs.length >= 100) {
                        customStats = calculateStatistics(customRuns);
                        customAllCosts = customRuns.costs; 
                        customAllDestroys = customRuns.destroys;
                    }
                }

                const customInitPathDesc = generatePathDescription(startStar, targetStar, customIntervals, customInitialStrategy.strategyText, activeProbabilities);
                const customRecoverPathDesc = targetStar > 12
                    ? generatePathDescription(12, targetStar, customIntervals, customRecoveryStrategy.strategyText, activeProbabilities)
                    : '無破壞風險';

                g_allScenarioResults.push({
                    name: '自訂路徑',
                    desc: '您手動指定的強化策略（自選跳躍方式與各星等強化方式）。',
                    theoreticalResult: customInitialStrategy,
                    stats: customStats,
                    allCosts: customAllCosts,
                    allDestroys: customAllDestroys,
                    strategyGuide: customStrategyGuide,
                    firstRunRawLog: customFirstRunLog,
                    compensationPrice: compensationPrice,
                    startStar: startStar,
                    pathDescription: {
                        init: customInitPathDesc,
                        recover: customRecoverPathDesc
                    }
                });
            }
        }

        displayFinalResult();

        dom.startButton.disabled = false;
        dom.currencySwitch.disabled = false;
        dom.startButton.textContent = '開始計算/模擬';
    }

    function toggleCouponInputs() {
        const disableNormal = dom.disableCouponsCheckbox.checked;
        dom.couponGrid.querySelectorAll('input').forEach(input => {
            input.disabled = disableNormal;
        });

        const disableHigh = dom.disableHighCouponsCheckbox.checked;
        dom.highCouponGrid.querySelectorAll('input').forEach(input => {
            input.disabled = disableHigh;
        });
        
        const disableSpecial = dom.disableSpecialCouponsCheckbox.checked;
        dom.specialCouponGrid.querySelectorAll('input').forEach(input => {
            input.disabled = disableSpecial;
        });
    }

    function setupNumberFormatting() {
        const inputsToFormat = document.querySelectorAll('[data-format-target]');
        inputsToFormat.forEach(input => {
            const targetId = input.getAttribute('data-format-target');
            const displaySpan = document.getElementById(targetId);
            const formatToYiWan = (num) => {
                if (isNaN(num) || num < 10000) return '';
                if (num >= 10000000000000000) return '數字過大';
                const yi = Math.floor(num / 100000000);
                const wan = Math.floor((num % 100000000) / 10000);
                let result = '';
                if (yi > 0) result += `${yi.toLocaleString()}億`;
                if (wan > 0) result += ` ${wan.toLocaleString()}萬`;
                return result.trim();
            };
            const updateDisplay = () => {
                const value = parseFloat(input.value);
                if(displaySpan) displaySpan.textContent = formatToYiWan(value);
            };
            input.addEventListener('input', updateDisplay);
            updateDisplay(); 
        });
    }

    const allInputsToSave = [
        dom.equipLevelSelect, dom.startStarSelect, dom.targetStarSelect, dom.compensationPriceInput,
        dom.exchangeRateInput, dom.vipDiscountSelect, dom.costDiscountCheckbox, 
        dom.guaranteedSuccessCheckbox, dom.reduceDestructionCheckbox, 
        dom.disableCouponsCheckbox, dom.disableHighCouponsCheckbox,
        dom.disableSpecialCouponsCheckbox,
        dom.ratioMain, dom.ratioVice 
    ];
    allInputsToSave.forEach(input => {
        if (!input) return;
        const eventType = (input.type === 'number' || input.type === 'text' || input.tagName.toLowerCase() === 'select') ? 'input' : 'change';
        input.addEventListener('change', saveSettings);
        if (eventType === 'input') input.addEventListener('input', saveSettings);
    });
    
    [dom.ratioMain, dom.ratioVice].forEach(input => {
        input.addEventListener('input', calculateEfficiency);
    });
    
    document.querySelectorAll('.coupon-controls-grid input[type="number"]').forEach(input => {
        input.addEventListener('input', saveSettings);
    });
    dom.currencySwitch.addEventListener('change', () => {
         saveSettings();
         if (g_allScenarioResults) {
             displayFinalResult();
         }
    });
    dom.exchangeRateInput.addEventListener('input', () => {
         if (g_allScenarioResults) {
             displayFinalResult();
         }
    });
    dom.equipLevelSelect.addEventListener('change', updateTargetStarOptions);
    dom.targetStarSelect.addEventListener('change', updateStartStarOptions); 
    dom.startStarSelect.addEventListener('change', updateStatPreview);
    dom.startButton.addEventListener('click', runSimulation);
    
    dom.closeModalBtn.addEventListener('click', () => {
        dom.modal.classList.add('hidden');
    });
    window.addEventListener('click', (event) => {
        if (event.target === dom.modal) {
            dom.modal.classList.add('hidden');
        }
    });
    dom.disableCouponsCheckbox.addEventListener('change', toggleCouponInputs);
    dom.disableHighCouponsCheckbox.addEventListener('change', toggleCouponInputs); 
    dom.disableSpecialCouponsCheckbox.addEventListener('change', toggleCouponInputs);

    const enableCustomPathCheckbox = document.getElementById('enable-custom-path');
    const customPathSettings = document.getElementById('custom-path-settings');

    function rebuildCustomPathIfEnabled() {
        if (enableCustomPathCheckbox && enableCustomPathCheckbox.checked) {
            buildCustomPathTable();
        }
    }

    if (enableCustomPathCheckbox && customPathSettings) {
        enableCustomPathCheckbox.addEventListener('change', () => {
            if (enableCustomPathCheckbox.checked) {
                customPathSettings.style.display = 'block';
                buildCustomPathTable();
            } else {
                customPathSettings.style.display = 'none';
            }
        });
    }

    dom.equipLevelSelect.addEventListener('change', rebuildCustomPathIfEnabled);
    dom.targetStarSelect.addEventListener('change', rebuildCustomPathIfEnabled);
    dom.startStarSelect.addEventListener('change', rebuildCustomPathIfEnabled);
    dom.disableCouponsCheckbox.addEventListener('change', rebuildCustomPathIfEnabled);
    dom.disableSpecialCouponsCheckbox.addEventListener('change', rebuildCustomPathIfEnabled);
    dom.disableHighCouponsCheckbox.addEventListener('change', rebuildCustomPathIfEnabled);

    let _customRebuildTimer = null;
    function debouncedRebuild() {
        clearTimeout(_customRebuildTimer);
        _customRebuildTimer = setTimeout(rebuildCustomPathIfEnabled, 600);
    }
    document.querySelectorAll('.coupon-controls-grid input[type="number"], #special-coupon-grid input[type="number"], #high-coupon-grid input[type="number"]').forEach(input => {
        input.addEventListener('input', debouncedRebuild);
    });
    
        if (dom.shareBtn) {
        dom.shareBtn.addEventListener('click', () => {
            const settings = getSettingsObject();
            const base64Str = btoa(encodeURIComponent(JSON.stringify(settings)));
            const url = new URL(window.location.href);
            url.searchParams.set('share', base64Str);
            const urlStr = url.toString();

            if (urlStr.length > 4000) {
                const proceed = confirm(
                    `⚠️ 分享連結長度為 ${urlStr.length} 字元，超過建議上限（4000 字元）。\n\n部分瀏覽器或平台（如 LINE）可能無法正確解析過長的連結。\n\n建議：可先取消勾選「自訂路徑」再分享，連結會短很多。\n\n是否仍要複製此連結？`
                );
                if (!proceed) return;
            }

            navigator.clipboard.writeText(urlStr).then(() => {
                alert('已經複製分享連結！您可以將此連結直接貼給其他人。');
            }).catch(err => {
                prompt('複製失敗，請手動複製以下連結：', url.toString());
            });
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');
    let initialSettings = null;

    if (sharedData) {
        try {
            const decodedJson = decodeURIComponent(atob(sharedData));
            initialSettings = JSON.parse(decodedJson);
            
            const isOverwrite = confirm(
                "偵測到分享的參數設定！\n\n" +
                "按下「確定」：套用這些設定，並【覆蓋】你原本儲存的個人設定。\n" +
                "按下「取消」：僅供本次【預覽】（關閉或重新整理網頁後會恢復為你的原本設定）。"
            );
            
            applySettingsToUI(initialSettings, dom);
            
            if (isOverwrite) {
                g_isPreviewMode = false;
                saveSettings(); 
            } else {
                g_isPreviewMode = true; 
            }
        } catch (e) {
            console.error("分享連結解析失敗", e);
            alert("分享連結格式錯誤或已損毀，將載入您個人的設定。");
            initialSettings = loadSettings(dom);
        }
    } else {
        initialSettings = loadSettings(dom); 
    }

    updateTargetStarOptions();
    if (initialSettings?.targetStar !== undefined) {
        // 直接代入；若超出可選範圍，瀏覽器會忽略並保留 updateTargetStarOptions 設定的預設值
        dom.targetStarSelect.value = initialSettings.targetStar;
        updateStartStarOptions();
        if (initialSettings.startStar !== undefined) dom.startStarSelect.value = initialSettings.startStar;
    }
    if (g_savedCustomPath?.enabled && enableCustomPathCheckbox && customPathSettings) {
        enableCustomPathCheckbox.checked = true;
        customPathSettings.style.display = 'block';
        buildCustomPathTable();
    }

    toggleCouponInputs();
    setupNumberFormatting();
    
    document.querySelectorAll('[data-format-target]').forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    function setupPasteOCR() {
        const numberInputs = document.querySelectorAll('input[type="number"]');

        numberInputs.forEach(input => {
            input.addEventListener('paste', async (e) => {
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                let imageItem = null;

                for (let item of items) {
                    if (item.type.indexOf('image') === 0) {
                        imageItem = item;
                        break;
                    }
                }

                if (!imageItem) return; 

                e.preventDefault(); 
                const blob = imageItem.getAsFile();
                if (!blob) return;

                const targetId = input.getAttribute('data-format-target');
                const displaySpan = targetId ? document.getElementById(targetId) : null;
                const originalText = displaySpan ? displaySpan.textContent : '';

                if (displaySpan) {
                    displaySpan.textContent = '(圖片辨識中...)';
                    displaySpan.style.color = '#e74c3c';
                }

                try {
                    const result = await Tesseract.recognize(blob, 'eng');
                    const text = result.data.text;

                    const lines = text.split('\n').filter(line => line.trim() !== '');
                    let numberStr = '';
                    
                    for (let line of lines) {
                        const digits = line.replace(/[^\d]/g, '');
                        if (digits.length > 0) {
                            numberStr = digits;
                            break; 
                        }
                    }

                    if (numberStr) {
                        input.value = numberStr;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        alert('無法從圖片中辨識出數字，請確認截圖是否清晰或手動輸入。');
                        if (displaySpan) displaySpan.textContent = originalText;
                    }
                } catch (err) {
                    console.error('OCR 辨識錯誤:', err);
                    alert('圖片辨識失敗，請稍後重試或手動輸入。');
                    if (displaySpan) displaySpan.textContent = originalText;
                } finally {
                    if (displaySpan) displaySpan.style.color = '';
                }
            });
        });
    }

    setupPasteOCR(); 

    window.addEventListener('beforeunload', saveSettings);
});