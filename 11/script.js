const range = (start, end) => Array.from({length: end - start}, (_, i) => i + start);

const SCROLL_NAMES = {
    star_wep: ["星彩單手武器攻擊力卷軸", "星彩雙手武器攻擊力卷軸", "星彩單手武器魔力卷軸", "星彩雙手武器魔力卷軸"],
    star_def: ["星彩防具攻擊力卷軸", "星彩防具魔力卷軸"],
    star_acc: ["星彩飾品攻擊力卷軸", "星彩飾品魔力卷軸"],
    star_pet: ["星彩寵物裝備攻擊力卷軸", "星彩寵物裝備魔力卷軸"],
    save_wep: ["救世單手武器攻擊力卷軸", "救世雙手武器攻擊力卷軸", "救世單手武器魔力卷軸", "救世雙手武器魔力卷軸"],
    save_def: ["救世防具攻擊力卷軸", "救世防具魔力卷軸"],
    save_acc: ["救世飾品攻擊力卷軸", "救世飾品魔力卷軸"],
    save_pet: ["救世寵物裝備攻擊力卷軸", "救世寵物裝備魔力卷軸"],
    fate_wep: ["命運單手武器攻擊力卷軸", "命運雙手武器攻擊力卷軸", "命運單手武器魔力卷軸", "命運雙手武器魔力卷軸"],
    fate_def: ["命運防具攻擊力卷軸", "命運防具魔力卷軸"],
    fate_acc: ["命運飾品攻擊力卷軸", "命運飾品魔力卷軸"],
    fate_pet: ["命運寵物裝備攻擊力卷軸", "命運寵物裝備魔力卷軸"],
    dark_wep: ["究極的黑暗單手武器攻擊力卷軸", "究極的黑暗雙手武器攻擊力卷軸", "究極的黑暗單手武器魔力卷軸", "究極的黑暗雙手武器魔力卷軸"],
    dark_def: ["究極的黑暗防具攻擊力卷軸", "究極的黑暗防具魔力卷軸"],
    dark_acc: ["究極的黑暗飾品攻擊力卷軸", "究極的黑暗飾品魔力卷軸"],
    dark_pet: ["究極的黑暗寵物裝備攻擊力卷軸", "究極的黑暗寵物裝備魔力卷軸"]
};

const SHORT_NAMES = {
    star_wep: "星彩", star_def: "星彩", star_acc: "星彩", star_pet: "星彩",
    save_wep: "救世", save_def: "救世", save_acc: "救世", save_pet: "救世",
    fate_wep: "命運", fate_def: "命運", fate_acc: "命運", fate_pet: "命運",
    dark_wep: "究極", dark_def: "究極", dark_acc: "究極", dark_pet: "究極"
};

const RAW_DATA = [
    { id: 'star_wep', name: '星彩 (武器)', values: range(16, 22), probs: [0.1, 0.22, 0.28, 0.18, 0.12, 0.1], type: 'wep' },
    { id: 'save_wep', name: '救世 (武器)', values: range(15, 21), probs: [0.35, 0.3, 0.15, 0.08, 0.07, 0.05], type: 'wep' },
    { id: 'fate_wep', name: '命運 (武器)', values: range(12, 21), probs: [0.04, 0.06, 0.31, 0.3, 0.14, 0.07, 0.05, 0.02, 0.01], type: 'wep' },
    { id: 'dark_wep', name: '究極的黑暗 (武器)', values: [14], probs: [1], fixedStats: 14, type: 'wep' },
    
    { id: 'star_def', name: '星彩 (防具)', values: range(11, 17), probs: [0.1, 0.22, 0.28, 0.18, 0.12, 0.1], type: 'def' },
    { id: 'save_def', name: '救世 (防具)', values: range(10, 16), probs: [0.35, 0.3, 0.15, 0.08, 0.07, 0.05], type: 'def' },
    { id: 'fate_def', name: '命運 (防具) 限200以下', values: range(7, 16), probs: [0.04, 0.06, 0.31, 0.3, 0.14, 0.07, 0.05, 0.02, 0.01], type: 'def' },
    { id: 'dark_def', name: '究極的黑暗 (防具) 含2全屬', values: [9], probs: [1], fixedStats: 2, type: 'def' },
    
    { id: 'star_acc', name: '星彩 (飾品)', values: range(11, 17), probs: [0.1, 0.22, 0.28, 0.18, 0.12, 0.1], type: 'acc' },
    { id: 'save_acc', name: '救世 (飾品)', values: range(10, 16), probs: [0.35, 0.3, 0.15, 0.08, 0.07, 0.05], type: 'acc' },
    { id: 'fate_acc', name: '命運 (飾品) 限200以下', values: range(7, 16), probs: [0.04, 0.06, 0.31, 0.3, 0.14, 0.07, 0.05, 0.02, 0.01], type: 'acc' },
    { id: 'dark_acc', name: '究極的黑暗 (飾品)', values: [9], probs: [1], fixedStats: 0, type: 'acc' },

    { id: 'star_pet', name: '星彩 (寵物)', values: range(11, 17), probs: [0.1, 0.22, 0.28, 0.18, 0.12, 0.1], type: 'pet' },
    { id: 'save_pet', name: '救世 (寵物)', values: range(10, 16), probs: [0.35, 0.3, 0.15, 0.08, 0.07, 0.05], type: 'pet' },
    { id: 'fate_pet', name: '命運 (寵物) 限200以下', values: range(7, 16), probs: [0.04, 0.06, 0.31, 0.3, 0.14, 0.07, 0.05, 0.02, 0.01], type: 'pet' },
    { id: 'dark_pet', name: '究極的黑暗 (寵物)', values: [9], probs: [1], fixedStats: 0, type: 'pet' }
];

const DEFAULT_VALUES = {
    global_price_card: "900000000", 
    global_ratio_main: "", 
    global_ratio_vice: "",
    global_interval_mode: "integer",
    price_scroll_star_wep: "41888888888", price_scroll_save_wep: "13700000000", price_scroll_fate_wep: "1700000000", price_scroll_dark_wep: "544444444",
    price_scroll_star_def: "73999999999", price_scroll_save_def: "16150000000", price_scroll_fate_def: "2988888888", price_scroll_dark_def: "6325000000",
    price_scroll_star_acc: "111111111111", price_scroll_save_acc: "27000000000", price_scroll_fate_acc: "3750000000", price_scroll_dark_acc: "1800000000",
    price_scroll_star_pet: "46888888888", price_scroll_save_pet: "11299999999", price_scroll_fate_pet: "3299999999", price_scroll_dark_pet: "1095999998"
};

const STORAGE_PREFIX = "scroll_calc_v15_"; 

function saveInput(key, value) { localStorage.setItem(STORAGE_PREFIX + key, value); }
function loadInput(key) { return localStorage.getItem(STORAGE_PREFIX + key); }

let isMergeMode = true; 
let sortKey = 'cpa'; 
let sortAsc = true; 
let globalBaselineKey = null;

function formatMoney(rawVal, isPreview = false) {
    if (!rawVal || rawVal < 0) return isPreview ? "" : "-";
    let val = Math.floor(parseFloat(rawVal));
    const YI = 100000000; const WAN = 10000;
    let yi = Math.floor(val / YI); let remainderYi = val % YI;
    let wan = Math.floor(remainderYi / WAN); let unit = remainderYi % WAN;
    let output = "";
    if (yi > 0) output += `<span class="yi-highlight">${yi}</span>億 `;
    if (wan > 0) output += `<span class="yi-highlight">${wan}</span>萬 `;
    else if (yi > 0 && unit > 0) output += `<span class="yi-highlight">0</span>萬 `;
    if (unit > 0) output += `<span class="yi-highlight">${unit}</span>`;
    else if (val === 0) return "0";
    return output;
}

function getCombinedDistribution(item, ratioMain, ratioVice) {
    let values = item.values; let probs = item.probs; let dist = {};
    if (ratioMain <= 0 && ratioVice <= 0) {
        for (let i = 0; i < values.length; i++) {
            let key = values[i].toFixed(2); let prob = probs[i];
            if (dist[key]) dist[key] += prob; else dist[key] = prob;
        }
        return dist;
    }
    if (item.type === 'wep') {
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values.length; j++) {
                for (let k = 0; k < values.length; k++) {
                    let vAtk = values[i], vStatMain = values[j], vStatVice = values[k];
                    let equivMain = ratioMain > 0 ? vStatMain / ratioMain : 0;
                    let equivVice = ratioVice > 0 ? vStatVice / ratioVice : 0;
                    let totalScore = vAtk + equivMain + equivVice;
                    let key = totalScore.toFixed(2);
                    let combinedProb = probs[i] * probs[j] * probs[k];
                    if (dist[key]) dist[key] += combinedProb; else dist[key] = combinedProb;
                }
            }
        }
    } else {
        let fixedStatVal = (item.fixedStats !== undefined) ? item.fixedStats : 0;
        for (let i = 0; i < values.length; i++) {
            let vAtk = values[i];
            let equivMain = ratioMain > 0 ? fixedStatVal / ratioMain : 0;
            let equivVice = ratioVice > 0 ? fixedStatVal / ratioVice : 0;
            let totalScore = vAtk + equivMain + equivVice;
            let key = totalScore.toFixed(2); let prob = probs[i];
            if (dist[key]) dist[key] += prob; else dist[key] = prob;
        }
    }
    return dist;
}

function calculateTotalDistribution(baseProbs, slots) {
    let currentDist = { ...baseProbs };
    for (let i = 1; i < slots; i++) {
        let nextDist = {};
        for (let [sumVal, sumProb] of Object.entries(currentDist)) {
            let sVal = parseFloat(sumVal);
            for (let [scrollVal, scrollProb] of Object.entries(baseProbs)) {
                let scVal = parseFloat(scrollVal);
                let newSum = sVal + scVal;
                let newProb = sumProb * scrollProb;
                let newKey = newSum.toFixed(1);
                if (nextDist[newKey]) nextDist[newKey] += newProb; else nextDist[newKey] = newProb;
            }
        }
        currentDist = nextDist;
    }
    return currentDist;
}

function getGlobalRatios() {
    return { main: parseFloat(document.getElementById('global-ratio-main').value) || 0, vice: parseFloat(document.getElementById('global-ratio-vice').value) || 0 };
}

function handleGlobalInterval() {
    const val = document.getElementById('global-interval-mode').value;
    saveInput('global_interval_mode', val);
    RAW_DATA.forEach(item => updateTable(item.id));
}

function getCalculatedData(id, forceSingleSlot = false) {
    const dataItem = RAW_DATA.find(x => x.id === id);
    if (!dataItem) return null;
    const scrollInput = document.getElementById(`price-scroll-${id}`).value;
    const cardInput = document.getElementById('global-price-card').value;
    let slotsInput = document.getElementById(`slots-${id}`).value;
    let slots = forceSingleSlot ? 1 : (parseInt(slotsInput) || 1);
    if (isNaN(slots) || slots < 1) slots = 1;

    const globals = getGlobalRatios();
    const intervalMode = document.getElementById('global-interval-mode').value;

    let effectiveRatioMain = 0, effectiveRatioVice = 0;
    let hasStats = (dataItem.fixedStats !== undefined && dataItem.fixedStats > 0) || dataItem.type === 'wep';
    let showMainBadge = false, showViceBadge = false;
    
    if (hasStats) {
        effectiveRatioMain = globals.main; effectiveRatioVice = globals.vice;
        if (effectiveRatioMain > 0) showMainBadge = true; 
        if (effectiveRatioVice > 0) showViceBadge = true;
    }

    const hasInput = scrollInput !== "" || cardInput !== "";
    const priceScroll = parseFloat(scrollInput) || 0;
    const priceCard = parseFloat(cardInput) || 0;
    
    const combinedDist = getCombinedDistribution(dataItem, effectiveRatioMain, effectiveRatioVice);
    let distArr = Object.entries(combinedDist).map(([v, p]) => ({ val: parseFloat(v), prob: p })).sort((a, b) => a.val - b.val);
    const rows = [];
    
    let displayThresholds = [];
    if (dataItem.type === 'pet') {
        displayThresholds.push(distArr[0].val);
    } else if (effectiveRatioMain > 0 || effectiveRatioVice > 0) {
        if (intervalMode === 'precise') {
            displayThresholds = [...new Set(distArr.map(d => d.val))].sort((a, b) => a - b);
        } else {
            let step = (intervalMode === 'step05') ? 0.5 : 1;
            let minScore = Math.floor(distArr[0].val / step) * step;
            let maxScore = Math.floor(distArr[distArr.length - 1].val / step) * step;
            let multiplier = (intervalMode === 'step05') ? 2 : 1;
            for (let s = Math.round(minScore * multiplier); s <= Math.round(maxScore * multiplier); s++) {
                displayThresholds.push(s / multiplier);
            }
        }
    } else {
        displayThresholds = [...new Set(distArr.map(d => d.val))].sort((a, b) => a - b);
    }

    displayThresholds.forEach((threshold) => {
        let pSuccess = 0, eSum = 0;
        for (const d of distArr) { 
            if (d.val >= threshold - 0.00001) { 
                pSuccess += d.prob; 
                eSum += d.val * d.prob; 
            } 
        }
        
        if (pSuccess < 0.0001) return;
        
        const eTotalSingle = pSuccess > 0 ? (eSum / pSuccess) : 0;
        const nScrollSingle = pSuccess > 0 ? 1 / pSuccess : Infinity;
        const nProtectSingle = (pSuccess < 1 && nScrollSingle !== Infinity) ? nScrollSingle : 0;
        const eTotalFinal = eTotalSingle * slots; 
        const nScrollTotal = nScrollSingle === Infinity ? Infinity : nScrollSingle * slots;
        const nProtectTotal = nProtectSingle * slots;
        let totalCost = nScrollTotal === Infinity ? Infinity : (nScrollTotal * priceScroll) + (nProtectTotal * priceCard);
        let costPerAtk = (totalCost !== Infinity && eTotalFinal > 0) ? totalCost / eTotalFinal : Infinity; 
        
        rows.push({
            id: id, name: SHORT_NAMES[id], threshold: threshold, pSuccess: pSuccess, eTotalFinal: eTotalFinal, eTotalSingle: eTotalSingle,
            nScrollTotal: nScrollTotal, nProtectTotal: nProtectTotal, totalCost: totalCost, costPerAtk: costPerAtk,
            hasInput: hasInput, showMainBadge: showMainBadge, showViceBadge: showViceBadge, rawPriceScroll: scrollInput, rawPriceCard: cardInput
        });
    });
    
    return rows;
}

function updateTable(id) {
    const dataRows = getCalculatedData(id);
    if (!dataRows) return;
    if (dataRows.length > 0) {
        const first = dataRows[0];
        document.getElementById(`preview-scroll-${id}`).innerHTML = first.rawPriceScroll ? formatMoney(parseFloat(first.rawPriceScroll), true) : "";
    }
    const tbody = document.querySelector(`#table-${id} tbody`);
    let htmlRows = '';
    const isDark = id.startsWith('dark'); 
    dataRows.forEach(row => {
        const showCost = row.hasInput && row.totalCost !== Infinity;
        const costDisplay = showCost ? formatMoney(row.totalCost) : "-";
        const cpaDisplay = showCost ? formatMoney(row.costPerAtk) + " / 攻" : "-";
        const btnDisabled = row.nScrollTotal === Infinity ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
        let statBadges = "";
        if (row.showMainBadge) statBadges += `<span class="stat-badge">含主屬</span>`;
        if (row.showViceBadge) statBadges += `<span class="stat-badge">含副屬</span>`;
        const avgSingleText = `<span style="color:#bdc3c7; font-size:0.85em; margin-left:5px;">(${row.eTotalSingle.toFixed(2)})</span>`;
        const btnHtml = isDark ? "" : `<button class="btn-analyze" ${btnDisabled} onclick="openAnalysis('${row.id}', ${row.threshold})">分析</button>`;
        htmlRows += `<tr><td>>= ${row.threshold.toFixed(row.threshold % 1 === 0 ? 0 : 1)} ${statBadges}</td><td>${(row.pSuccess * 100).toFixed(1)}%</td><td>${row.eTotalFinal.toFixed(2)} ${avgSingleText} ${statBadges}</td><td>${row.nScrollTotal === Infinity ? '∞' : row.nScrollTotal.toFixed(2)}</td><td>${row.nProtectTotal.toFixed(2)}</td><td>${costDisplay}</td><td>${cpaDisplay}</td><td>${btnHtml}</td></tr>`;
    });
    tbody.innerHTML = htmlRows;
    renderMergedTables();
}

function setSort(key) {
    if (sortKey === key) sortAsc = !sortAsc; 
    else { sortKey = key; sortAsc = (key === 'cpa' || key === 'cost'); if (key === 'atk') sortAsc = false; }
    renderMergedTables();
}

function toggleBaseline(key) { if (globalBaselineKey === key) globalBaselineKey = null; else globalBaselineKey = key; renderMergedTables(); }
function handleGlobalStats() { saveInput('global_ratio_main', document.getElementById('global-ratio-main').value); saveInput('global_ratio_vice', document.getElementById('global-ratio-vice').value); RAW_DATA.forEach(item => updateTable(item.id)); }
function handleGlobalCardPrice() { const val = document.getElementById('global-price-card').value; saveInput('global_price_card', val); document.getElementById('global-preview-card').innerHTML = val ? formatMoney(val, true) : ""; RAW_DATA.forEach(item => updateTable(item.id)); }

function handleMergeInput(id, fieldType, val) { 
    if (fieldType === 'price-scroll') { 
        const p = document.getElementById(`preview-merge-scroll-${id}`); 
        if(p) p.innerHTML = formatMoney(val, true); 
    } 
    const originalInput = document.getElementById(`${fieldType}-${id}`); 
    if (originalInput) originalInput.value = val; 
    handleInput(id); 
}

function handleInput(id) { 
    const val = document.getElementById(`price-scroll-${id}`).value;
    saveInput(`price_scroll_${id}`, val); 
    saveInput(`slots_${id}`, document.getElementById(`slots-${id}`).value); 
    const mergeInput = document.getElementById(`merge-price-scroll-${id}`);
    if (mergeInput && mergeInput.value !== val) {
        mergeInput.value = val;
        const p = document.getElementById(`preview-merge-scroll-${id}`); 
        if(p) p.innerHTML = formatMoney(val, true); 
    }
    updateTable(id); 
}

function markOptimalStrategies(rows) {
    let sortedByCost = [...rows].sort((a, b) => { if (a.totalCost === b.totalCost) return b.eTotalFinal - a.eTotalFinal; return a.totalCost - b.totalCost; });
    let maxAtkSoFar = -Infinity;
    sortedByCost.forEach(row => { row.isOptimal = false; row.isDominated = false; if (row.totalCost === Infinity || !row.hasInput) return; if (row.eTotalFinal > maxAtkSoFar) { row.isOptimal = true; maxAtkSoFar = row.eTotalFinal; } else { row.isDominated = true; } });
    return rows;
}

function renderMergedTables() {
    const selectedItems = RAW_DATA.filter(item => { const chk = document.getElementById(`chk-${item.id}`); return chk && chk.checked; });
    const warningEl = document.getElementById('merge-warning-msg');
    const legendBox = document.getElementById('legend-box');
    const sections = { wep: document.getElementById('merged-section-wep'), def: document.getElementById('merged-section-def'), acc: document.getElementById('merged-section-acc'), pet: document.getElementById('merged-section-pet') };

    if (selectedItems.length === 0) {
        if(warningEl) warningEl.style.display = 'block';
        Object.values(sections).forEach(s => s.classList.add('hidden'));
        if(legendBox) legendBox.style.display = 'none';
        return;
    } else {
        if(legendBox) legendBox.style.display = 'inline-block';
        if(warningEl) warningEl.style.display = (selectedItems.length < 2) ? 'block' : 'none';
    }

    const groups = { wep: selectedItems.filter(i => i.type === 'wep'), def: selectedItems.filter(i => i.type === 'def'), acc: selectedItems.filter(i => i.type === 'acc'), pet: selectedItems.filter(i => i.type === 'pet') };
    
    for (const [type, items] of Object.entries(groups)) {
        renderSpecificMergeSettings(type, items);
        let allRows = [];
        items.forEach(item => { const rows = getCalculatedData(item.id, true); if (rows) allRows = allRows.concat(rows); });
        markOptimalStrategies(allRows);
        renderSingleMergedTable(type, allRows);
    }
}

function renderSpecificMergeSettings(type, items) {
    const container = document.getElementById(`merge-settings-${type}`);
    if (!container) return;
    if (items.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    const currentIds = items.map(i => i.id).join(',');
    const renderedIds = container.getAttribute('data-rendered-ids');
    if (currentIds === renderedIds) {
        items.forEach(item => {
            const scrollVal = document.getElementById(`price-scroll-${item.id}`).value;
            const input = document.getElementById(`merge-price-scroll-${item.id}`);
            if(input && input.value !== scrollVal) {
                input.value = scrollVal;
                document.getElementById(`preview-merge-scroll-${item.id}`).innerHTML = formatMoney(scrollVal, true);
            }
        });
        return;
    }
    container.innerHTML = '';
    items.forEach(item => {
        const scrollVal = document.getElementById(`price-scroll-${item.id}`).value;
        const miniCard = document.createElement('div');
        miniCard.className = `mini-setting-card mini-card-${item.id}`;
        miniCard.innerHTML = `<div class="mini-card-title"><span>${item.name}</span></div><div class="mini-input-wrapper"><div class="mini-input-row"><label>卷軸單價</label><input type="number" id="merge-price-scroll-${item.id}" value="${scrollVal}" placeholder="價格" oninput="handleMergeInput('${item.id}', 'price-scroll', this.value)"></div><div class="currency-preview" id="preview-merge-scroll-${item.id}">${formatMoney(scrollVal, true)}</div></div>`;
        container.appendChild(miniCard);
    });
    container.setAttribute('data-rendered-ids', currentIds);
}

function renderSingleMergedTable(type, rows) {
    const container = document.getElementById(`merged-section-${type}`);
    const tableEl = document.getElementById(`merged-table-${type}`);
    const thead = tableEl.querySelector('thead');
    const tbody = tableEl.querySelector('tbody');
    if (rows.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    
    const sweetSpots = new Map();
    let analysisRows = rows.filter(r => r.isOptimal && r.hasInput && r.totalCost !== Infinity).sort((a, b) => a.eTotalFinal - b.eTotalFinal);

    let marginalCosts = [];
    for (let i = 0; i < analysisRows.length - 1; i++) {
        const curr = analysisRows[i], next = analysisRows[i+1];
        const deltaCost = next.totalCost - curr.totalCost;
        const deltaAtk = next.eTotalFinal - curr.eTotalFinal;
        marginalCosts.push(deltaAtk > 0.001 ? deltaCost / deltaAtk : Infinity);
    }

    const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');

    for (let i = 0; i < analysisRows.length - 1; i++) {
        const curr = analysisRows[i];
        const mcNext = marginalCosts[i];
        if (mcNext === Infinity) continue;
        
        let isSweetSpot = false;
        let reasonText = "";

        if (i === 0) {
            if (mcNext > curr.costPerAtk * 2.5) {
                isSweetSpot = true;
                reasonText = `若繼續往上衝，每多1攻的代價(${stripHtml(formatMoney(mcNext))})將超過目前平均造價的2.5倍`;
            }
        } else {
            const mcPrev = marginalCosts[i-1];
            if (mcNext > mcPrev * 2 && mcNext > curr.costPerAtk * 2) {
                isSweetSpot = true;
                reasonText = `若繼續往上衝，每多1攻的代價將暴增至 ${stripHtml(formatMoney(mcNext))} (上一次升級僅需 ${stripHtml(formatMoney(mcPrev))})`;
            }
        }
        // 這裡就是修正的地方！把原本打錯的 row 改成 curr
        if (isSweetSpot) sweetSpots.set(`${curr.id}_${curr.threshold}`, reasonText); 
    }

    rows.sort((a, b) => { let valA, valB, handleInfinity = (v) => (v === Infinity ? (sortAsc ? 999999999999 : -1) : v); if (sortKey === 'cpa') { valA = handleInfinity(a.costPerAtk); valB = handleInfinity(b.costPerAtk); } else if (sortKey === 'atk') { valA = a.eTotalFinal; valB = b.eTotalFinal; } else { valA = handleInfinity(a.costPerAtk); valB = handleInfinity(b.costPerAtk); } return sortAsc ? valA - valB : valB - valA; });
    const getSortIcon = (key) => (sortKey !== key) ? '<span class="sort-icon">⇅</span>' : (sortAsc ? '<span class="active-sort">▲</span>' : '<span class="active-sort">▼</span>');
    let baselineData = globalBaselineKey ? rows.find(r => `${r.id}_${r.threshold}` === globalBaselineKey) : null;
    let headerLastCol = baselineData ? `升級代價 / 1攻<br><span style="font-size:0.75em; font-weight:normal;">(新成本-基準成本)/(新攻-基準攻)</span>` : `升級代價 / 1攻<br><span style="color:#e74c3c; font-size:0.85em;">⚠️ 請點擊左側來源欄<br>將指定方案設為基準</span>`;
    thead.innerHTML = `<tr><th style="width:14%">來源 (點擊設基準)</th><th style="width:12%">門檻 (>=)</th><th style="width:10%">單次成功率</th><th onclick="setSort('atk')" title="點擊排序">期望攻擊力 ${getSortIcon('atk')}</th><th style="width:15%">預期總花費</th><th onclick="setSort('cpa')" title="點擊排序">每 1 攻擊造價 ${getSortIcon('cpa')}</th><th style="width:15%; color:#d35400; border-left:2px solid #eee;">${headerLastCol}</th></tr>`;
    let html = '';
    rows.forEach(row => {
        const uniqueKey = `${row.id}_${row.threshold}`, isBaseline = (uniqueKey === globalBaselineKey);
        const showCost = row.hasInput && row.totalCost !== Infinity;
        let rowClass = isBaseline ? "is-baseline" : (row.isOptimal ? "row-optimal" : (row.isDominated ? "row-dominated" : ""));
        let optimalIcon = row.isOptimal ? "🔥 " : (row.isDominated ? "📉 " : "");
        let statBadges = (row.showMainBadge ? `<span class="stat-badge">含主屬</span>` : "") + (row.showViceBadge ? `<span class="stat-badge">含副屬</span>` : "");
        let marginalCostDisplay = baselineData ? (isBaseline ? '<span style="font-weight:bold; color:#333;">比較基準</span>' : (showCost ? (row.eTotalFinal - baselineData.eTotalFinal <= 0 ? '<span style="font-size:0.85em; color:#95a5a6;">攻擊未提升</span>' : (row.totalCost - baselineData.totalCost <= 0 ? '<span style="color:#27ae60; font-weight:bold;">更強且更省</span>' : `<span style="color:#d35400; font-weight:bold;">${formatMoney((row.totalCost - baselineData.totalCost) / (row.eTotalFinal - baselineData.eTotalFinal))}</span>`)) : "-")) : '<span style="color:#bdc3c7; font-size:0.85em;">(需設基準)</span>';
        
        let recommendBadge = sweetSpots.has(uniqueKey) ? `<span class="recommend-badge" style="cursor: help;" title="${sweetSpots.get(uniqueKey)}">高CP推薦</span>` : "";
        
        html += `<tr class="${rowClass}"><td onclick="toggleBaseline('${uniqueKey}')" style="text-align:left; padding-left:15px;"><div style="margin-bottom:4px;">${isBaseline ? `<span class="baseline-badge">基準</span>` : ""}<span class="source-tag tag-${row.id} clickable-source">${row.name}</span></div>${recommendBadge}</td><td>${row.threshold.toFixed(row.threshold % 1 === 0 ? 0 : 1)} ${statBadges}</td><td>${(row.pSuccess * 100).toFixed(1)}%</td><td style="font-weight:bold;">${optimalIcon}${row.eTotalFinal.toFixed(2)}</td><td>${showCost ? formatMoney(row.totalCost) : "-"}</td><td style="font-weight:bold;">${showCost ? formatMoney(row.costPerAtk) + " / 攻" : "-"}</td><td style="border-left:2px solid #eee; background:#fffaf0;">${marginalCostDisplay}</td></tr>`;
    });
    tbody.innerHTML = html;
}

function getExactPR(targetVal, distData) {
    let probLose = 0, probTie = 0;  
    for (let [v, p] of Object.entries(distData)) {
        let val = parseFloat(v);
        if (val < targetVal) probLose += p; else if (Math.abs(val - targetVal) < 0.001) probTie += p;
    }
    let prRaw = (probLose + (0.5 * probTie)) * 100, prDisplay = Math.floor(prRaw);
    if (prDisplay > 99) prDisplay = 99; if (prDisplay < 1 && prRaw > 0) prDisplay = 1; if (prRaw <= 0) prDisplay = 0;
    return prDisplay;
}

function openAnalysis(id, threshold) {
    const item = RAW_DATA.find(x => x.id === id);
    const slots = parseInt(document.getElementById(`slots-${id}`).value) || 1;
    const globals = getGlobalRatios();
    const hasGlobalStats = (globals.main > 0 || globals.vice > 0);
    const isCalculatingStats = hasGlobalStats && (item.type === 'wep' || item.fixedStats !== undefined);
    
    document.getElementById('analysis-input-label').innerText = `輸入你實際衝完的總攻擊力${isCalculatingStats ? "(含屬)" : ""}：`;
    
    const fullSingleDist = getCombinedDistribution(item, globals.main, globals.vice);
    let filteredDist = {}, totalP = 0;
    for(let [v, p] of Object.entries(fullSingleDist)) { if (parseFloat(v) >= threshold - 0.0001) totalP += p; }
    if (totalP === 0) { alert("此門檻機率為 0"); return; }
    for(let [v, p] of Object.entries(fullSingleDist)) { if (parseFloat(v) >= threshold - 0.0001) filteredDist[v] = p / totalP; }
    const totalDist = calculateTotalDistribution(filteredDist, slots);
    currentAnalysisDist = totalDist;
    document.getElementById('modal-title').innerText = `${SHORT_NAMES[id]} - PR值分析 (門檻 >= ${threshold})`;
    document.getElementById('user-total-atk').value = '';
    document.getElementById('user-rank-result').innerHTML = '<div style="color:#7f8c8d; font-weight:bold;">請輸入數值以查看PR值</div>';
    
    let html = ''; const sortedKeys = Object.keys(totalDist).map(parseFloat).sort((a,b) => b-a);
    const benchmarks = [99, 90, 75, 50, 25, 10, 1];
    benchmarks.forEach(prTarget => {
        let foundVal = "-";
        for (let i = sortedKeys.length - 1; i >= 0; i--) { 
            if (getExactPR(sortedKeys[i], totalDist) >= prTarget) { 
                foundVal = sortedKeys[i].toFixed(1); 
                break; 
            } 
        }
        let prClass = prTarget >= 90 ? "pr-high" : (prTarget >= 50 ? "pr-mid" : "pr-low");
        html += `<tr><td class="${prClass}">PR ${prTarget}</td><td>${foundVal === '-' ? '<span class="impossible-val">-</span>' : foundVal}</td></tr>`;
    });
    document.getElementById('modal-dist-tbody').innerHTML = html;
    document.getElementById('pr-warning-msg').style.display = sortedKeys.length === 1 ? 'block' : 'none';
    document.getElementById('analysis-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('analysis-modal').style.display = 'none'; }
let currentAnalysisDist = null;

document.getElementById('user-total-atk').addEventListener('input', (e) => {
    if (!currentAnalysisDist) return;
    const val = parseFloat(e.target.value), resBox = document.getElementById('user-rank-result');
    if (isNaN(val)) { resBox.innerHTML = '<div style="color:#7f8c8d; font-weight:bold;">請輸入數值以查看PR值</div>'; return; }
    const pr = getExactPR(val, currentAnalysisDist), minPossible = Math.min(...Object.keys(currentAnalysisDist).map(parseFloat)), maxPossible = Math.max(...Object.keys(currentAnalysisDist).map(parseFloat));
    if (val < minPossible - 0.001) { resBox.innerHTML = `<div style="color:#c0392b;">數值低於理論最小值 (${minPossible})</div>`; return; }
    resBox.innerHTML = `<div class="pr-result-main">${pr} <span style="font-size:1rem; color:#555;">(PR值)</span></div><div class="pr-result-detail"><span>理論最高: ${maxPossible}</span><span>理論最低: ${minPossible}</span></div>`;
});

function init() {
    let isOldUser = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith(STORAGE_PREFIX)) isOldUser = true;
    }
    
    if (isOldUser && !localStorage.getItem(STORAGE_PREFIX + "migrated_split_v2")) {
        alert("對不起! 先前的資料由於欄位拆分已清除，已為您載入最新的預設參數。");
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).startsWith(STORAGE_PREFIX)) keysToRemove.push(localStorage.key(i));
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(STORAGE_PREFIX + "migrated_split_v2", "true");
    } else if (!isOldUser) {
        localStorage.setItem(STORAGE_PREFIX + "migrated_split_v2", "true");
    }

    for (const [key, val] of Object.entries(DEFAULT_VALUES)) {
        if (loadInput(key) === null) saveInput(key, val);
    }

    const toggleWep = document.getElementById('toggle-container-wep');
    const toggleDef = document.getElementById('toggle-container-def');
    const toggleAcc = document.getElementById('toggle-container-acc');
    const togglePet = document.getElementById('toggle-container-pet');
    const container = document.getElementById('cards-container');
    
    RAW_DATA.forEach(item => {
        let toggleContainer;
        if(item.type === 'wep') toggleContainer = toggleWep;
        else if(item.type === 'def') toggleContainer = toggleDef;
        else if(item.type === 'acc') toggleContainer = toggleAcc;
        else if(item.type === 'pet') toggleContainer = togglePet;

        toggleContainer.insertAdjacentHTML('beforeend', `<label class="toggle-label"><input type="checkbox" id="chk-${item.id}" onchange="handleToggle('${item.id}')"><span>${item.name}</span></label>`);
        
        const isDark = item.id.startsWith('dark');
        let displayName = item.name;
        if (item.id === 'dark_def') {
            displayName = item.name.replace(' 含', '<br><span style="font-size:0.8em; opacity:0.9;">含');
            displayName += '</span>';
        }

        let noteHtml = "";
        if (item.type === 'pet') {
             noteHtml = `<div style="text-align:center; font-size: 0.8em; color: #bdc3c7; margin: -5px 0 10px 0;">(寵物裝備不適用恢復卡與門檻設定。)</div>`;
        }

        container.insertAdjacentHTML('beforeend', `<div id="card-${item.id}" class="scroll-card hidden"><div class="card-header"><span>${displayName}</span></div><div class="scroll-info-box"><ul class="scroll-name-list">${(SCROLL_NAMES[item.id] || []).map(n => `<li>${n}</li>`).join('')}</ul><div class="info-header-center">單張機率分佈</div><div class="prob-grid">${item.values.map((v, i) => `<div class="prob-item"><span class="prob-val">+${v}</span><span class="prob-rate">${(item.probs[i]*100).toFixed(0)}%</span></div>`).join('')}</div></div><div class="input-row"><div class="input-group"><label>卷軸單價</label><div class="input-wrapper"><input type="number" id="price-scroll-${item.id}" placeholder="0" oninput="handleInput('${item.id}')"></div><div class="currency-preview" id="preview-scroll-${item.id}"></div></div><div class="input-group"><label>衝卷次數 (Slots)</label><div class="input-wrapper"><input type="number" id="slots-${item.id}" value="1" min="1" oninput="handleInput('${item.id}')"></div></div></div>${noteHtml}<div class="table-responsive"><table id="table-${item.id}"><thead><tr><th style="width:15%">目標門檻</th><th style="width:10%">成功率</th><th style="width:15%">期望攻擊力</th><th style="width:10%">平均卷數</th><th style="width:10%">平均恢復卡</th><th style="width:15%">預期總花費</th><th style="width:15%">每 1 攻擊造價</th>${isDark ? "" : '<th style="width:10%">分析</th>'}</tr></thead><tbody></tbody></table></div></div>`);
    });

    const savedMain = loadInput('global_ratio_main'), savedVice = loadInput('global_ratio_vice'), savedCard = loadInput('global_price_card'), savedInterval = loadInput('global_interval_mode');
    if(savedMain) document.getElementById('global-ratio-main').value = savedMain; 
    if(savedVice) document.getElementById('global-ratio-vice').value = savedVice; 
    if(savedCard) { 
        document.getElementById('global-price-card').value = savedCard; 
        document.getElementById('global-preview-card').innerHTML = formatMoney(parseFloat(savedCard), true); 
    }
    if(savedInterval) document.getElementById('global-interval-mode').value = savedInterval;
    
    RAW_DATA.forEach(item => { 
        if (loadInput(`chk_${item.id}`) === 'true') { 
            document.getElementById(`chk-${item.id}`).checked = true; 
            handleToggle(item.id); 
        } 
        if (loadInput(`price_scroll_${item.id}`)) {
            document.getElementById(`price-scroll-${item.id}`).value = loadInput(`price_scroll_${item.id}`); 
        }
        if (loadInput(`slots_${item.id}`)) {
            document.getElementById(`slots-${item.id}`).value = loadInput(`slots_${item.id}`); 
        }
        updateTable(item.id); 
    });
}

function handleToggle(id) { 
    saveInput(`chk_${id}`, document.getElementById(`chk-${id}`).checked); 
    const card = document.getElementById(`card-${id}`); 
    if (document.getElementById(`chk-${id}`).checked) { 
        card.classList.remove('hidden'); 
        updateTable(id); 
    } else {
        card.classList.add('hidden'); 
    }
    renderMergedTables(); 
}

init();
