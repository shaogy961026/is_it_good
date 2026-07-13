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

// 痕跡完全修復費用表
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

function getTraceMesos(traceStar, equipLevel) {
    const entry = TRACE_RECOVERY_COSTS[traceStar];
    if (!entry) return Infinity;
    const levelKey = String(equipLevel);
    if (entry.mesos[levelKey] !== undefined) return entry.mesos[levelKey];
    const keys = Object.keys(entry.mesos).map(Number).sort((a, b) => a - b);
    const lvl = parseInt(levelKey, 10);
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

const SETTINGS_KEY = 'starforceSimulatorSettings_v6';

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

// ============================================================================
// 終極絕對精準動態規劃引擎 (Exact MDP Solver) - 防記憶體洩漏與卡死優化版
// ============================================================================
function solveMDPExact(targetStar, equipLevel, compensationPrice, couponPrices, specialCouponPrices, costDiscount, vipDiscount, activeProbabilities, K, forcedPath = null) {
    const MAX_STATES = 31;
    let V = new Array(MAX_STATES).fill(0);
    let Var = new Array(MAX_STATES).fill(0);
    let D = new Array(MAX_STATES).fill(0);
    let CPN = new Array(MAX_STATES).fill(0);
    let EQ = new Array(MAX_STATES).fill(0);
    let Policy = new Array(MAX_STATES).fill(null);
    const YI = 100000000;
    const equipLevelNum = parseInt(equipLevel);
    const originalCosts = enhancementCosts[equipLevel];

    // T=28 需要 ~21000 次才收斂；T≥29 已由呼叫端用外推法處理，不應直接傳入此函式
    const MAX_ITER = targetStar === 28 ? 25000 : targetStar >= 26 ? 5000 : 500;
    // target < 26 維持舊版行為（跑滿 500 次），target >= 26 才啟用正確的收斂判定
    const useConvergenceCheck = targetStar >= 26;
    for (let iter = 0; iter < MAX_ITER; iter++) {
        let maxDiff = 0;
        for (let n = targetStar - 1; n >= 0; n--) {
            if (n >= originalCosts.length) continue;
            
            let oldScore = (V[n] + K * Math.sqrt(Math.max(0, Var[n]))) / YI;
            let bestScore = Infinity;
            let bestV = Infinity, bestVar = 0, bestD = 0, bestCPN = 0, bestEQ = 0;
            let bestType = null, bestName = null, bestLimitStar = null, bestRecChoice = null, bestActionCost = 0;

            // 🐛 【修復點】：這裡的變數屬性名稱已修正為 forcedStarMethods 與 forcedRecoveryMethods
            let forcedMethod = (forcedPath && forcedPath.forcedStarMethods) ? forcedPath.forcedStarMethods[n] : null;
            let forcedRec = (forcedPath && forcedPath.forcedRecoveryMethods) ? forcedPath.forcedRecoveryMethods[n] : 'auto';

            if (!forcedPath) {
                for (const [cpnStar, price] of Object.entries(couponPrices)) {
                    let s = parseInt(cpnStar);
                    if (s > n && s <= targetStar) {
                        let cost = price;
                        let v_new = cost + V[s];
                        let var_new = Var[s]; 
                        let score_new = (v_new + K * Math.sqrt(var_new)) / YI;
                        if (score_new < bestScore) {
                            bestScore = score_new; bestV = v_new; bestVar = var_new; 
                            bestD = D[s]; bestCPN = cost + CPN[s]; bestEQ = EQ[s]; 
                            bestType = 'coupon'; bestLimitStar = s; bestActionCost = cost; bestName = `使用${s}星券`;
                        }
                    }
                }
            }

            let traceStar = n >= 23 ? 22 : n;
            let traceCost = Infinity;
            let traceEquipCount = 0;
            if (traceStar >= 15 && TRACE_RECOVERY_COSTS[traceStar] && getTraceMesos(traceStar, equipLevel) !== Infinity) {
                const recData = TRACE_RECOVERY_COSTS[traceStar];
                traceCost = (recData.equips * compensationPrice) + getTraceMesos(traceStar, equipLevel);
                traceEquipCount = recData.equips;
            }

            let jumpTarget = 12;
            let jumpCost = compensationPrice;
            if (forcedPath && forcedPath.recoveryJump) {
                jumpTarget = forcedPath.recoveryJump;
                jumpCost = compensationPrice + (couponPrices[jumpTarget] || 0);
            }

            let costDest12 = jumpCost + V[jumpTarget];
            let varDest12 = Var[jumpTarget];
            let scoreDest12 = (costDest12 + K * Math.sqrt(Math.max(0, varDest12))) / YI;

            let costDestFull = traceCost + V[traceStar];
            let varDestFull = Var[traceStar];
            let scoreDestFull = (costDestFull + K * Math.sqrt(Math.max(0, varDestFull))) / YI;

            let recChoice = '12';
            let d_v = costDest12, d_var = varDest12, d_equip = compensationPrice + EQ[jumpTarget];
            let d_cpn = (forcedPath && forcedPath.recoveryJump ? (couponPrices[jumpTarget] || 0) : 0) + CPN[jumpTarget];
            let d_d = 1 + D[jumpTarget];
            
            let useFull = false;
            if (forcedRec === 'full' && traceCost !== Infinity) useFull = true;
            else if (forcedRec === '12') useFull = false;
            else if (forcedRec === 'auto') { useFull = (traceCost !== Infinity) && (scoreDestFull < scoreDest12); }
            else if (!forcedPath) { useFull = (traceCost !== Infinity) && (scoreDestFull < scoreDest12); }

            if (useFull) {
                recChoice = 'full';
                d_v = costDestFull; d_var = varDestFull; d_equip = traceEquipCount * compensationPrice + EQ[traceStar]; 
                d_cpn = CPN[traceStar]; d_d = 1 + D[traceStar];
            }

            const evalTransition = (type, actionCost, p, k, r, actionName, limitStar=null) => {
                if (1 - k <= 0) return;
                let expV = (actionCost + p * V[n+1] + r * d_v) / (1 - k);
                let term1 = p * Math.pow(V[n+1] - expV, 2);
                let term2 = r * Math.pow(d_v - expV, 2);
                let expVar = (term1 + term2 + p * Var[n+1] + r * d_var) / (1 - k);
                let score = (expV + K * Math.sqrt(Math.max(0, expVar))) / YI;
                
                if (score < bestScore) {
                    bestScore = score; bestV = expV; bestVar = expVar;
                    let cpnImm = (type.startsWith('limit') || type === 'append') ? actionCost : 0;
                    bestCPN = (cpnImm + p * CPN[n+1] + r * d_cpn) / (1 - k);
                    bestEQ = (p * EQ[n+1] + r * d_equip) / (1 - k);
                    bestD = (p * D[n+1] + r * d_d) / (1 - k);
                    
                    bestType = type; bestName = actionName; bestLimitStar = limitStar; 
                    bestRecChoice = recChoice; bestActionCost = actionCost;
                }
            };

            const originalBaseCost = enhancementCosts[equipLevel][n];
            let totalDiscountRate = 0;
            if (costDiscount) totalDiscountRate += 0.30;
            if (n <= 16) totalDiscountRate += vipDiscount;

            if (originalBaseCost !== undefined && (!forcedMethod || forcedMethod === 'no_prev')) {
                let costNoPrev = totalDiscountRate > 0 ? originalBaseCost * (1 - totalDiscountRate) : originalBaseCost;
                let probs = activeProbabilities[n];
                evalTransition('sf', costNoPrev, probs.success, probs.keep, probs.destroy, '直接強化(不防爆)');
            }

            if (n >= 15 && n <= 17 && originalBaseCost !== undefined && (!forcedMethod || forcedMethod === 'prev')) {
                let costPrev = originalBaseCost * 3;
                if (totalDiscountRate > 0) costPrev -= originalBaseCost * totalDiscountRate;
                let probs = activeProbabilities[n];
                evalTransition('sf_prev', costPrev, probs.success, probs.keep + probs.destroy, 0, '直接強化(防爆)');
            }

            let nextStar = n + 1;
            for (const [ls, price] of Object.entries(specialCouponPrices.limit)) {
                if (nextStar <= parseInt(ls) && (!forcedMethod || forcedMethod === `limit_${ls}`)) {
                    evalTransition('limit', price, 1.0, 0, 0, `突破券100%(${ls}星)`, ls);
                }
            }
            for (const [ls, price] of Object.entries(specialCouponPrices.limit50)) {
                if (nextStar <= parseInt(ls) && (!forcedMethod || forcedMethod === `limit50_${ls}`)) {
                    evalTransition('limit50', price, 0.5, 0.5, 0, `突破券50%(${ls}星)`, ls);
                }
            }
            for (const [ls, price] of Object.entries(specialCouponPrices.limit30)) {
                if (nextStar <= parseInt(ls) && (!forcedMethod || forcedMethod === `limit30_${ls}`)) {
                    evalTransition('limit30', price, 0.3, 0.7, 0, `突破券30%(${ls}星)`, ls);
                }
            }
            if (specialCouponPrices.append23 !== null && nextStar <= 23 && equipLevelNum <= 200 && (!forcedMethod || forcedMethod === 'append')) {
                evalTransition('append', specialCouponPrices.append23, 0.3, 0.7, 0, '追加券30%(23星)', 23);
            }

            V[n] = bestV; Var[n] = bestVar; D[n] = bestD; CPN[n] = bestCPN; EQ[n] = bestEQ;
            
            if (bestType) {
                Policy[n] = { type: bestType, name: bestName, limitStar: bestLimitStar, recChoice: bestRecChoice, cost: bestActionCost };
                if (bestType === 'coupon') Policy[n].target = bestLimitStar;
            } else {
                Policy[n] = null;
            }
            
            if (isFinite(bestScore) && isFinite(oldScore)) {
                maxDiff = Math.max(maxDiff, Math.abs(bestScore - oldScore));
            }
        }
        if (useConvergenceCheck && maxDiff < 1e-6) break;
    }

    if (forcedPath && forcedPath.initialJump) {
        let jumpTarget = forcedPath.initialJump;
        let jumpCost = couponPrices[jumpTarget] || 0;
        let startStar = forcedPath.startStar;
        
        V[startStar] = jumpCost + V[jumpTarget];
        Var[startStar] = Var[jumpTarget];
        D[startStar] = D[jumpTarget];
        CPN[startStar] = jumpCost + CPN[jumpTarget];
        EQ[startStar] = EQ[jumpTarget];
        Policy[startStar] = { type: 'coupon', target: jumpTarget, cost: jumpCost, name: `使用${jumpTarget}星券` };
    }

    const recoveryJump = (forcedPath && forcedPath.recoveryJump)
        ? { target: forcedPath.recoveryJump, cost: couponPrices[forcedPath.recoveryJump] || 0 }
        : null;
    return { V, Var, D, CPN, EQ, Policy, recoveryJump };
}

// 從 baseMDP（已精確解至 T-1 = n）外推一步至 T = n+1
// 用閉合公式：V_extra[n]×p = c + r×(恢復即時費 + V_base[恢復星])
// 適用於 T=29(n=28)、T=30(n=29)，呼叫前需確保 baseMDP 已收斂
function extrapolateMDPStep(baseMDP, n, equipLevel, compensationPrice, activeProbabilities, K, costDiscount = false) {
    const YI = 100000000;
    const V   = [...baseMDP.V];
    const Var = [...baseMDP.Var];
    const D   = [...baseMDP.D];
    const CPN = [...baseMDP.CPN];
    const EQ  = [...baseMDP.EQ];
    const Policy = [...baseMDP.Policy];

    const probs = activeProbabilities[n];
    const p = probs.success, r = probs.destroy;
    const rawC = enhancementCosts[equipLevel][n];
    const c = costDiscount ? rawC * 0.7 : rawC;

    // n >= 23，恢復目標固定為 22★
    const ts = 22;
    const recData22 = TRACE_RECOVERY_COSTS[ts];
    const traceMesos22 = getTraceMesos(ts, equipLevel);
    const traceCost22 = (recData22 && traceMesos22 !== Infinity)
        ? recData22.equips * compensationPrice + traceMesos22
        : Infinity;

    // 與原 solveMDPExact 相同的恢復方式評分邏輯
    const scoreFullRec = traceCost22 !== Infinity
        ? (traceCost22 + V[ts] + K * Math.sqrt(Math.max(0, Var[ts]))) / YI
        : Infinity;
    const score12Rec = (compensationPrice + V[12] + K * Math.sqrt(Math.max(0, Var[12]))) / YI;
    const useFull = traceCost22 !== Infinity && scoreFullRec < score12Rec;

    const R_immediate = useFull ? traceCost22 : compensationPrice;
    const R_v   = useFull ? V[ts]   : V[12];
    const R_var = useFull ? Var[ts] : Var[12];
    const R_d   = useFull ? (1 + D[ts])   : (1 + D[12]);
    const R_cpn = useFull ? CPN[ts]        : CPN[12];
    const R_eq  = useFull
        ? (recData22 ? recData22.equips * compensationPrice : 0) + EQ[ts]
        : compensationPrice + EQ[12];

    // 閉合公式（消去 keep 自迴圈後）：V_extra × p = c + r × (R_immediate + R_v)
    const R_total = R_immediate + R_v;
    const V_extra   = (c + r * R_total) / p;
    const D_extra   = r * R_d / p;
    const CPN_extra = r * R_cpn / p;
    const EQ_extra  = r * R_eq / p;
    // 方差近似（T≥29 本身即為近似解，此精度已足夠）
    const Var_extra = (p * V_extra * V_extra + r * R_total * R_total + r * R_var) / p;

    // 狀態 0..n-1：期望費用均加上此額外步驟的成本
    for (let i = 0; i < n; i++) {
        V[i]   += V_extra;
        D[i]   += D_extra;
        CPN[i] += CPN_extra;
        EQ[i]  += EQ_extra;
        Var[i] += Var_extra;
    }
    // 狀態 n 本身的費用（從 n★ 到 n+1★）
    V[n]   = V_extra;
    Var[n] = Var_extra;
    D[n]   = D_extra;
    CPN[n] = CPN_extra;
    EQ[n]  = EQ_extra;

    // Policy：直接強化（不防爆），記錄恢復方式
    Policy[n] = { type: 'sf', name: '直接強化(不防爆)', recChoice: useFull ? 'full' : '12', cost: c };

    return { V, Var, D, CPN, EQ, Policy, recoveryJump: baseMDP.recoveryJump };
}

// 根據 MDP Policy 產生文字說明
function generatePathDescriptionMDP(start, target, policyArray) {
    let segments = [];
    let curr = start;
    let visited = new Set();
    
    let currentGroupStart = -1;
    let currentGroupAction = null;

    const flushGroup = (endStar) => {
        if (currentGroupStart !== -1 && currentGroupAction) {
            let recText = "";
            if (currentGroupAction.type.startsWith('sf') && currentGroupAction.recChoice) {
                 recText = currentGroupAction.recChoice === 'full' 
                    ? ' <span style="color:#d35400; font-weight:bold;">[若炸：選完全復原]</span>' 
                    : ' <span style="color:#2980b9; font-weight:bold;">[若炸：選降回12星]</span>';
            }
            segments.push(`${segments.length+1}. ${currentGroupStart} → ${endStar}: ${currentGroupAction.name}${recText}`);
        }
    };

    while (curr < target) {
        if (visited.has(curr)) break; 
        visited.add(curr);
        
        let act = policyArray[curr];
        if (!act) break;

        if (act.type === 'coupon') {
            flushGroup(curr);
            currentGroupStart = -1;
            currentGroupAction = null;
            segments.push(`${segments.length+1}. ${act.name} (跳至${act.target}星)`);
            curr = act.target;
        } else {
            let actKey = act.name + "_" + act.recChoice;
            let prevKey = currentGroupAction ? (currentGroupAction.name + "_" + currentGroupAction.recChoice) : null;
            
            if (currentGroupStart === -1) {
                currentGroupStart = curr;
                currentGroupAction = act;
            } else if (actKey !== prevKey) {
                flushGroup(curr);
                currentGroupStart = curr;
                currentGroupAction = act;
            }
            curr++;
        }
    }
    flushGroup(curr);
    
    if (segments.length === 0) return "無 (已達成)";
    return segments.join('<br>');
}

// 根據 MDP Policy 進行單次模擬
function simulateTrialMDP(equipLevel, targetStar, compensationPrice, policyArray, costDiscount, vipDiscount, activeProbabilities, startStar, keepLog = false, recoveryJump = null) {
    let currentStars = startStar;
    let totalCost = 0, totalDestroys = 0, totalEnhancementCost = 0, totalDestructionCost = 0, totalCouponCost = 0;
    const log = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 2000000; 

    if (keepLog) log.push(`<span class="log-strategy">=> 模擬開始 (初始: ${currentStars}星)</span>`);

    while (currentStars < targetStar) {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            if (keepLog) log.push(`<span class="log-fail">系統：模擬次數過多 (${attempts}次)，已強制中斷。</span>`);
            return { aborted: true, log: log, totalCost: Infinity }; 
        }

        let act = policyArray[currentStars];
        if (!act) break;

        if (act.type === 'coupon') {
            totalCost += act.cost; totalCouponCost += act.cost;
            if (keepLog) log.push(`<span class="log-strategy">=> 決策：${act.name} <span class="log-cost">(花費: ${act.cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span></span>`);
            currentStars = act.target;
            continue;
        }

        if (act.type.startsWith('limit') || act.type === 'append') {
            totalCost += act.cost; totalCouponCost += act.cost;
            let r = Math.random();
            let success = false;
            if (act.type === 'limit') success = true;
            else if (act.type === 'limit50') success = r < 0.5;
            else if (act.type === 'limit30' || act.type === 'append') success = r < 0.3;

            let name = act.name;
            if (success) {
                currentStars++;
                if (keepLog) log.push(`[${currentStars-1} → ${currentStars}星]...<span class="log-strategy">使用 ${name}</span> <span class="log-success">成功！</span> <span class="log-cost">(券費: ${act.cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
            } else {
                if (keepLog) log.push(`[${currentStars} → ${currentStars+1}星]...<span class="log-strategy">使用 ${name}</span> <span class="log-keep">失敗(券消失)</span> <span class="log-cost">(券費: ${act.cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
            }
            continue;
        }

        let cost = act.cost;
        totalCost += cost; totalEnhancementCost += cost;
        let probs = { ...activeProbabilities[currentStars] };
        let preventInfo = '';
        if (act.type === 'sf_prev') {
            probs.keep += probs.destroy; probs.destroy = 0;
            preventInfo = ' (防爆)';
        }

        let r = Math.random();
        let outcomeClass, outcomeText;
        let starBeforeAttempt = currentStars;

        if (r < probs.success) {
            currentStars++; outcomeClass = 'log-success'; outcomeText = '成功！';
        } else if (r < probs.success + probs.destroy) {
            totalDestroys++;
            if (act.recChoice === 'full') {
                let traceStar = currentStars >= 23 ? 22 : currentStars;
                const recData = TRACE_RECOVERY_COSTS[traceStar];
                let traceCost = getTraceMesos(traceStar, equipLevel);
                let equipC = recData.equips * compensationPrice;
                let restoreCost = traceCost + equipC;
                totalCost += restoreCost;
                totalDestructionCost += equipC;
                currentStars = traceStar;
                outcomeClass = 'log-fail';
                outcomeText = `破壞！(選用完全復原花費 +${restoreCost.toLocaleString()}，維持 ${traceStar}星)`;
            } else {
                totalCost += compensationPrice;
                totalDestructionCost += compensationPrice;
                currentStars = 12;
                outcomeClass = 'log-fail';
                let recText = `補償一件裝備 +${compensationPrice.toLocaleString()}，降至 12星`;
                if (recoveryJump) {
                    totalCost += recoveryJump.cost;
                    totalCouponCost += recoveryJump.cost;
                    currentStars = recoveryJump.target;
                    recText += `；使用${recoveryJump.target}★券跳至 ${recoveryJump.target}星 +${recoveryJump.cost.toLocaleString()}`;
                }
                outcomeText = `裝備已破壞！(${recText})`;
            }
        } else {
            outcomeClass = 'log-keep'; outcomeText = '維持星級。';
        }
        if (keepLog) log.push(`[${starBeforeAttempt} → ${currentStars}星]...<span class="${outcomeClass}">${outcomeText}</span>${preventInfo} <span class="log-cost">(花費: ${cost.toLocaleString()})</span> <span class="log-cumulative">(累積: ${totalCost.toLocaleString()})</span>`);
    }
    return { totalCost, totalDestroys, totalEnhancementCost, totalDestructionCost, totalCouponCost, log, aborted: false };
}


document.addEventListener('DOMContentLoaded', () => {
    
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
            if (options.length > 1 || n >= 15) rows.push({ n, options });
        }

        if (rows.length === 0) {
            container.innerHTML = '<p class="note" style="text-align:center; padding:15px 0;">目前設定下此段沒有可自訂項目。</p>';
            return;
        }

        const traceSupported = getTraceMesos(15, equipLevel) !== Infinity;

        const buildRecSelect = (n, savedRec) => {
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

        const startStar = parseInt(document.getElementById('start-star').value, 10);

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

        return { startStar, initialJump, recoveryJump, forcedStarMethods, forcedRecoveryMethods };
    }

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

        const displayTargetStar = parseInt(dom.targetStarSelect.value, 10);
        const highStarApproxNote = displayTargetStar >= 29
            ? `<span style="color:#e67e22; font-weight:bold; margin-left:8px;">⚠️ ${displayTargetStar}★ 目標：理論值為近似值，因演算法在高星數下難以完全收斂，僅供參考。</span>`
            : '';

        if (g_simulationAborted) {
            dom.legendNote.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">(注意：本次計算因運算時間過長，已自動切換為僅顯示理論值)</span>${highStarApproxNote}`;
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
                const destructionPart = finalResult.totalEquipCost;
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
            dom.legendNote.innerHTML = `上方為模擬值 <span class="theoretical-value">(綠字) 為理論期望值</span>${highStarApproxNote}`;
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
                const theoryDestructionPart = theoretical.totalEquipCost;
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
        const YI = 100000000;

        for (let i = 0; i < strategies.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 10));
            const strategy = strategies[i];
            dom.startButton.textContent = `處理中 (${i+1}/${strategies.length}): 運算中...`;

            let bestGlobalMDP = null;
            let minGlobalZScore = Infinity;

            // T=29/30：外推步驟（28→29、29→30）無券可選，K 值不影響外推策略，固定 K=0 以避免瀏覽器卡頓
            // T=28：標準券最高到 21★，K 值影響 21★ 券的避險使用時機，保留全 K 搜尋
            const effectiveSolveStar = Math.min(targetStar, 28);
            const effectiveKValues = targetStar > 28 ? [0] : K_VALUES;

            for (let K of effectiveKValues) {
                const mdp = solveMDPExact(effectiveSolveStar, equipLevel, compensationPrice, couponPrices, specialCouponPrices, costDiscount, vipDiscount, activeProbabilities, K);

                // 外推至實際目標星數（T=29 加一步，T=30 加兩步）
                let finalMDP = mdp;
                if (targetStar >= 29) {
                    finalMDP = extrapolateMDPStep(mdp, 28, equipLevel, compensationPrice, activeProbabilities, K, costDiscount);
                    if (targetStar >= 30) {
                        finalMDP = extrapolateMDPStep(finalMDP, 29, equipLevel, compensationPrice, activeProbabilities, K, costDiscount);
                    }
                }

                let safeVar = Math.max(0, finalMDP.Var[startStar]);
                let currentZScore = (finalMDP.V[startStar] + strategy.Z * Math.sqrt(safeVar)) / YI;

                if (currentZScore < minGlobalZScore) {
                    minGlobalZScore = currentZScore;
                    bestGlobalMDP = finalMDP;
                }
            }
            
            if (!bestGlobalMDP) {
                console.error("MDP 求解失敗");
                continue;
            }

            const theoreticalResult = {
                totalCost: bestGlobalMDP.V[startStar],
                totalDestructions: bestGlobalMDP.D[startStar],
                totalCouponCost: bestGlobalMDP.CPN[startStar],
                totalEquipCost: bestGlobalMDP.EQ[startStar]
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
                    const result = simulateTrialMDP(equipLevel, targetStar, compensationPrice, bestGlobalMDP.Policy, costDiscount, vipDiscount, activeProbabilities, startStar, keepLog);
                    
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
            
            const initPathDesc = generatePathDescriptionMDP(startStar, targetStar, bestGlobalMDP.Policy);
            const traceAvailable = getTraceMesos(15, equipLevel) !== Infinity;
            const recoverNote = traceAvailable
                ? "(系統已為各星等自動評估並選用最優復原策略：完全復原 或 降回12星)"
                : "(此裝備等級不支援痕跡完全復原，若破壞固定降回 12 星)";
            const recoverPathDesc = targetStar > 12 
                ? generatePathDescriptionMDP(12, targetStar, bestGlobalMDP.Policy) + `<br><span style='color:#e67e22; font-size:0.85em; font-weight:bold; margin-top:5px; display:block;'>${recoverNote}</span>`
                : "無破壞風險";

            g_allScenarioResults.push({ 
                name: strategy.name,
                desc: strategy.desc, 
                theoreticalResult: theoreticalResult,
                stats: simulationStats,
                allCosts: simulationCosts,
                allDestroys: simulationDestroys,
                strategyGuide: bestGlobalMDP.Policy, 
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
                const { startStar, forcedStarMethods, forcedRecoveryMethods } = customData;

                // T >= 29：與主策略相同，先精確解 T=28 再外推，避免數值嚴重偏低
                let customMDP;
                if (targetStar >= 29) {
                    const customData28 = { ...customData, initialJump: null };
                    const base28 = solveMDPExact(
                        28, equipLevel, compensationPrice, couponPrices, specialCouponPrices,
                        costDiscount, vipDiscount, activeProbabilities, 0, customData28
                    );
                    customMDP = extrapolateMDPStep(base28, 28, equipLevel, compensationPrice, activeProbabilities, 0, costDiscount);
                    if (targetStar >= 30) {
                        customMDP = extrapolateMDPStep(customMDP, 29, equipLevel, compensationPrice, activeProbabilities, 0, costDiscount);
                    }
                    if (customData.initialJump) {
                        const jt = customData.initialJump;
                        const jc = couponPrices[jt] || 0;
                        const ss = customData.startStar;
                        customMDP.V[ss]   = jc + customMDP.V[jt];
                        customMDP.Var[ss] = customMDP.Var[jt];
                        customMDP.D[ss]   = customMDP.D[jt];
                        customMDP.CPN[ss] = jc + customMDP.CPN[jt];
                        customMDP.EQ[ss]  = customMDP.EQ[jt];
                        customMDP.Policy[ss] = { type: 'coupon', target: jt, cost: jc, name: `使用${jt}星券` };
                    }
                    customMDP.recoveryJump = customData.recoveryJump
                        ? { target: customData.recoveryJump, cost: couponPrices[customData.recoveryJump] || 0 }
                        : null;
                } else {
                    customMDP = solveMDPExact(
                        targetStar, equipLevel, compensationPrice, couponPrices, specialCouponPrices,
                        costDiscount, vipDiscount, activeProbabilities, 0, customData
                    );
                }

                const theoreticalResult = {
                    totalCost: customMDP.V[startStar],
                    totalDestructions: customMDP.D[startStar],
                    totalCouponCost: customMDP.CPN[startStar],
                    totalEquipCost: customMDP.EQ[startStar]
                };

                let customStats = null, customFirstRunLog = null, customAllCosts = null, customAllDestroys = null;

                if (!g_simulationAborted) {
                    const customRuns = { costs: [], destroys: [], enhanceCosts: [], destroyCosts: [], couponCosts: [] };
                    const customSimStart = Date.now();
                    for (let j = 0; j < numSimulations; j++) {
                        if (g_simulationAborted || (Date.now() - customSimStart) > SIMULATION_TIMEOUT) break;
                        if (j > 0 && j % 200 === 0) await new Promise(resolve => setTimeout(resolve, 0));
                        const keepLog = (j === 0);
                        const result = simulateTrialMDP(equipLevel, targetStar, compensationPrice, customMDP.Policy, costDiscount, vipDiscount, activeProbabilities, startStar, keepLog, customMDP.recoveryJump);
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

                const customInitPathDesc = generatePathDescriptionMDP(startStar, targetStar, customMDP.Policy);
                let recoveryPolicyForDesc = customMDP.Policy;
                if (customMDP.recoveryJump) {
                    recoveryPolicyForDesc = [...customMDP.Policy];
                    const rj = customMDP.recoveryJump;
                    recoveryPolicyForDesc[12] = { type: 'coupon', target: rj.target, cost: rj.cost, name: `使用${rj.target}星券` };
                }
                const customRecoverPathDesc = targetStar > 12
                    ? generatePathDescriptionMDP(12, targetStar, recoveryPolicyForDesc)
                    : '無破壞風險';

                g_allScenarioResults.push({
                    name: '自訂路徑',
                    desc: '您手動指定的強化策略（自選跳躍方式與各星等強化方式）。',
                    theoreticalResult: theoreticalResult,
                    stats: customStats,
                    allCosts: customAllCosts,
                    allDestroys: customAllDestroys,
                    strategyGuide: customMDP.Policy,
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
