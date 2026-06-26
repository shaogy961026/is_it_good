// ==========================================
// 0. 全域設定 (Global Config) - 核心機率與等級動態參數
// ==========================================
const PROB_CONFIG = {
    violet: {
        rates: [1.0, 0.2, 0.15, 1.0, 0.2, 0.15],
        labels: ["第1排(必傳)", "第2排", "第3排", "第4排(必傳)", "第5排", "第6排"]
    },
    mystic: {
        rates: [1.0, 0.2, 0.05], 
        labels: ["第 1 排", "第 2 排", "第 3 排"]
    }
};

function getStatConfig() {
    const el = document.getElementById('equipLevel');
    const lvl = el ? el.value : '160';
    const base = (lvl === '150') ? 12 : 13;
    return { base: base, u1: base - 3, u2: base - 6 };
}

// ==========================================
// 1. 資料庫 (Database)
// ==========================================
const DB = {
    "Hat": { den: { Leg: 43, Uni: 53 }, pool: [ { name: "STR", val: 0, type: 1, wLeg: 4, wUni: 5, label: "STR %" }, { name: "HP", val: 0, type: 1, wLeg: 4, wUni: 6, label: "HP %" }, { name: "All", val: 0, type: 1, wLeg: 3, wUni: 4, label: "全屬性 %" }, { name: "CD_2", val: 2, type: 1, wLeg: 2, wUni: 0, label: "技能冷卻 -2秒" }, { name: "CD_1", val: 1, type: 1, wLeg: 3, wUni: 0, label: "技能冷卻 -1秒" }, { name: "Decent", val:0, type: 20, wLeg: 3, wUni: 4, label: "實用的技能 (上限1)" }, { name: "IgnoreDmg", val:0, type: 40, wLeg: 8, wUni: 8, label: "被擊中無視傷害 (上限2)" }, { name: "OtherStats", val:0, type:1, wLeg:16, wUni: 31, label: "雜項 (其他屬性)" } ] },
    "Glove": { den: { Leg: 42, Uni: 57 }, pool: [ { name: "STR", val:0, type: 1, wLeg: 4, wUni: 5, label: "STR %" }, { name: "HP", val:0, type: 1, wLeg: 4, wUni: 6, label: "HP %" }, { name: "All", val:0, type: 1, wLeg: 3, wUni: 4, label: "全屬性 %" }, { name: "CritD", val:1, type: 1, wLeg: 4, wUni: 0, label: "爆擊傷害 %" }, { name: "Decent", val:0, type: 20, wLeg: 3, wUni: 4, label: "實用的技能 (上限1)" }, { name: "IgnoreDmg", val:0, type: 40, wLeg: 8, wUni: 8, label: "被擊中無視傷害 (上限2)" }, { name: "OtherStats", val:0, type:1, wLeg:16, wUni: 35, label: "雜項 (定值/其他)" } ] },
    "Weapon": { den: { Leg: 45, Uni: 46 }, pool: [ { name: "Att_Pct_13", val: 13, type: 1, wLeg: 2, wUni: 0, label: "物理攻擊力(魔法攻擊力)+13%" }, { name: "Att_Pct_10", val: 10, type: 1, wLeg: 0, wUni: 3, label: "物理攻擊力(魔法攻擊力)+10%" }, { name: "Boss_40", val: 40, type: 1, wLeg: 2, wUni: 0, label: "BOSS傷害+40%" }, { name: "Boss_35", val: 35, type: 1, wLeg: 4, wUni: 0, label: "BOSS傷害+35%" }, { name: "Boss_30", val: 30, type: 1, wLeg: 0, wUni: 3, label: "BOSS傷害+30%" }, { name: "Ignore_40", val: 40, type: 1, wLeg: 3, wUni: 0, label: "無視防禦+40%" }, { name: "Ignore_35", val: 35, type: 1, wLeg: 3, wUni: 0, label: "無視防禦+35%" }, { name: "Ignore_30", val: 30, type: 1, wLeg: 0, wUni: 4, label: "無視防禦+30%" }, { name: "OtherStats", val:0, type:1, wLeg:31, wUni: 36, label: "雜項 (STR/全屬/其他)" } ] },
    "Emblem": { den: { Leg: 39, Uni: 43 }, pool: [ { name: "Att_Pct_13", val: 13, type: 1, wLeg: 2, wUni: 0, label: "物理攻擊力(魔法攻擊力)+13%" }, { name: "Att_Pct_10", val: 10, type: 1, wLeg: 0, wUni: 3, label: "物理攻擊力(魔法攻擊力)+10%" }, { name: "Ignore_40", val: 40, type: 1, wLeg: 3, wUni: 0, label: "無視防禦+40%" }, { name: "Ignore_35", val: 35, type: 1, wLeg: 3, wUni: 0, label: "無視防禦+35%" }, { name: "Ignore_30", val: 30, type: 1, wLeg: 0, wUni: 4, label: "無視防禦+30%" }, { name: "OtherStats", val:0, type:1, wLeg:31, wUni: 36, label: "雜項 (STR/全屬/其他)" } ] },
    "Accessory": { den: {Leg:41, Uni:41}, pool: [ {name:"STR",type:1,wLeg:4,wUni:5,label:"STR %"}, {name:"HP",type:1,wLeg:4,wUni:6,label:"HP %"}, {name:"All",type:1,wLeg:3,wUni:4,label:"全屬性 %"}, {name:"Drop",type:1,wLeg:3,wUni:0, label: "道具掉落率%" }, {name:"Meso",type:1,wLeg:3,wUni:0, label: "楓幣獲得量%" }, {name:"OtherStats",type:1,wLeg:24,wUni: 34, label: "雜項 (MP/其他)"} ] },
    "Top": { den: {Leg:41, Uni:63}, pool: [ {name:"STR",type:1,wLeg:4,wUni:5,label:"STR %"}, {name:"HP",type:1,wLeg:4,wUni:6,label:"HP %"}, {name:"All",type:1,wLeg:3,wUni:4,label:"全屬性 %"}, {name:"InvincDur",type:21,wLeg:3,wUni:4,label:"被擊無敵時間+ (上限1)"}, {name:"InvincCh",type:41,wLeg:3,wUni:4,label:"被擊無敵機率 (上限2)"}, {name:"IgnoreDmg",type:40,wLeg:8,wUni:8,label:"被擊中無視傷害 (上限2)"}, {name:"OtherStats",type:1,wLeg:16,wUni: 43, label: "雜項 (反射/回復/其他)"} ] },
    "Bottom": { den: {Leg:35, Uni:55}, pool: [ {name:"STR",type:1,wLeg:4,wUni:5,label:"STR %"}, {name:"HP",type:1,wLeg:4,wUni:6,label:"HP %"}, {name:"All",type:1,wLeg:3,wUni:4,label:"全屬性 %"}, {name:"Decent",type:20,wLeg:0,wUni:4,label:"實用技能 (上限1)"}, {name:"IgnoreDmg",type:40,wLeg:8,wUni:10,label:"被擊中無視傷害 (上限2)"}, {name:"OtherStats",type:1,wLeg:16,wUni: 31, label: "雜項 (回復/其他)"} ] },
    "Shoes": { den: {Leg:38, Uni:53}, pool: [ {name:"STR",type:1,wLeg:4,wUni:5,label:"STR %"}, {name:"HP",type:1,wLeg:4,wUni:6,label:"HP %"}, {name:"All",type:1,wLeg:3,wUni:4,label:"全屬性 %"}, {name:"Decent",type:20,wLeg:3,wUni:4,label:"實用技能 (上限1)"}, {name:"IgnoreDmg",type:40,wLeg:8,wUni:8,label:"被擊中無視傷害 (上限2)"}, {name:"OtherStats",type:1,wLeg:16,wUni: 31, label: "雜項 (回復/其他)"} ] },
    "Cape": { den: {Leg:35, Uni:49}, pool: [ {name:"STR",type:1,wLeg:4,wUni:5,label:"STR %"}, {name:"HP",type:1,wLeg:4,wUni:6,label:"HP %"}, {name:"All",type:1,wLeg:3,wUni:4,label:"全屬性 %"}, {name:"IgnoreDmg",type:40,wLeg:8,wUni:8,label:"被擊中無視傷害 (上限2)"}, {name:"OtherStats",type:1,wLeg:16,wUni: 31, label: "雜項 (回復/其他)"} ] }
};

const RULE_DEF = {
    20: { title: "實用的技能", limit: 1, icon: "🔴" },
    21: { title: "被擊後無敵時間", limit: 1, icon: "🔴" },
    40: { title: "被擊中無視傷害", limit: 2, icon: "🟣" },
    41: { title: "被擊中無敵機率", limit: 2, icon: "🟣" }
};

// ==========================================
// 2. 邏輯控制 (UI Logic)
// ==========================================

function updateUI() {
    updateMode();
    updateRuleDisplay();
    renderWeightTable();
    renderRankRates(); 
}

function updateMode() {
    const part = document.getElementById('partSelect').value;
    const modeSel = document.getElementById('modeSelect');
    
    const currentMode = modeSel.value;
    modeSel.innerHTML = "";
    
    if (part === "Hat") {
        addOpt(modeSel, "hat_cd", "CD 優先 (-4~-6秒)");
        addOpt(modeSel, "default", "指定主屬優先 (STR/DEX/INT/LUK)"); 
        addOpt(modeSel, "hp_stat", "HP% 優先");
        addOpt(modeSel, "all_stat", "全屬性% 優先");
    } else if (part === "Glove") {
        addOpt(modeSel, "glove_crit", "爆擊傷害 優先");
        addOpt(modeSel, "default", "指定主屬優先 (STR/DEX/INT/LUK)");
        addOpt(modeSel, "hp_stat", "HP% 優先");
        addOpt(modeSel, "all_stat", "全屬性% 優先");
    } else if (part === "Weapon") {
        addOpt(modeSel, "weapon_boss", "BOSS傷害 + 物理攻擊力(魔法攻擊力)% 優先");
    } else if (part === "Emblem") {
        addOpt(modeSel, "emblem_att", "物理攻擊力(魔法攻擊力)% 優先");
    } else if (part === "Accessory") {
        addOpt(modeSel, "accessory_drop_meso", "道具掉落率% 或 楓幣獲得量% 優先");
        addOpt(modeSel, "default", "指定主屬優先 (STR/DEX/INT/LUK)");
        addOpt(modeSel, "hp_stat", "HP% 優先");
        addOpt(modeSel, "all_stat", "全屬性% 優先");
    } else if (part !== "Weapon" && part !== "Emblem") {
        addOpt(modeSel, "default", "指定主屬優先 (STR/DEX/INT/LUK)");
        addOpt(modeSel, "hp_stat", "HP% 優先");
        addOpt(modeSel, "all_stat", "全屬性% 優先");
    }

    let optionExists = Array.from(modeSel.options).some(opt => opt.value === currentMode);
    if (optionExists && currentMode) { modeSel.value = currentMode; }

    updateLockOptions();
}

function updateLockOptions() {
    const calcType = document.getElementById('calcType').value;
    const lockGroup = document.getElementById('lockGroup');
    const lockSelect = document.getElementById('lockSelect');
    const part = document.getElementById('partSelect').value;
    const mode = document.getElementById('modeSelect').value;

    if (calcType !== 'mystic') { lockGroup.style.visibility = 'hidden'; return; }
    lockGroup.style.visibility = 'visible'; lockSelect.innerHTML = '';

    const options = [];
    options.push({ val: `none`, text: `不鎖定 (全隨機洗 3 排)` }); // 新增不鎖定

    if (part === 'Weapon') {
        const ranks = [{id:0, t:"第1排 (100% 傳說)"}, {id:1, t:"第2排 (20% 傳說)"}, {id:2, t:"第3排 (5% 傳說)"}];
        ranks.forEach(r => { options.push({ val: `B_${r.id}`, text: `鎖定 ${r.t} - BOSS傷害+40%` }); });
        ranks.forEach(r => { options.push({ val: `A_${r.id}`, text: `鎖定 ${r.t} - 物理攻擊力(魔法攻擊力)+13%` }); });
    } else if (part === 'Accessory' && mode === 'accessory_drop_meso') {
        const ranks = [{id:0, t:"第1排 (100% 傳說)"}, {id:1, t:"第2排 (20% 傳說)"}, {id:2, t:"第3排 (5% 傳說)"}];
        ranks.forEach(r => { options.push({ val: `Drop_${r.id}`, text: `鎖定 ${r.t} - 道具掉落率%` }); });
        ranks.forEach(r => { options.push({ val: `Meso_${r.id}`, text: `鎖定 ${r.t} - 楓幣獲得量%` }); });
    } else {
        const st = getStatConfig(); let label = "";
        if (mode === 'hat_cd') label = "CD -2秒";
        else if (mode === 'glove_crit') label = "爆擊傷害 8%";
        else if (mode === 'emblem_att') label = "物理攻擊力(魔法攻擊力)+13%";
        else if (mode === 'all_stat') label = `全屬性 ${st.u1}%`;
        else if (mode === 'hp_stat') label = `HP ${st.base}%`;
        else if (mode === 'default') label = `指定主屬 ${st.base}% (含全屬)`; 
        options.push({ val: 0, text: `鎖定 第1排 (${label}) [100% 傳說]` });
        options.push({ val: 1, text: `鎖定 第2排 (${label}) [20% 傳說]` });
        options.push({ val: 2, text: `鎖定 第3排 (${label}) [5% 傳說]` });
    }
    options.forEach(opt => { let el = document.createElement('option'); el.value = opt.val; el.text = opt.text; lockSelect.add(el); });
    renderRankRates();
}

function addOpt(sel, val, text) { let opt = document.createElement('option'); opt.value = val; opt.text = text; sel.add(opt); }

function updateRuleDisplay() {
    const part = document.getElementById('partSelect').value;
    const infoDiv = document.getElementById('ruleContent');
    
    const pool = DB[part].pool; let groups = {};
    pool.forEach(p => {
        if (p.type > 1 && p.label) {
            if (!groups[p.type]) groups[p.type] = new Set();
            let cleanLabel = p.label.replace(/\s*\(上限\d+\)/, "");
            groups[p.type].add(cleanLabel);
        }
    });

    let html = ""; let hasRules = false;
    for (let typeId in groups) {
        let def = RULE_DEF[typeId];
        if (!def) continue;
        hasRules = true;
        let tagsHtml = Array.from(groups[typeId]).map(s => `<span class='rule-tag'>${s}</span>`).join('');
        html += `<div style="margin-bottom: 12px; border-bottom: 1px dashed #e0e0e0; padding-bottom: 8px;"><div style="font-weight:bold; color:#34495e; margin-bottom:4px;">${def.icon} 【${def.title}】 共用上限 ${def.limit} 排</div><div style="line-height: 1.6;">${tagsHtml}</div></div>`;
    }
    if(!hasRules) html = "<div style='padding:10px; color:#666;'>此部位無特殊排他屬性限制。</div>";
    infoDiv.innerHTML = html;
}

function renderWeightTable() {
    const part = document.getElementById('partSelect').value;
    const div = document.getElementById('weightContent');
    const cfg = DB[part];
    let html = `<table class="w-table"><thead><tr><th>詞條名稱</th><th>傳說機率</th><th>罕見機率</th></tr></thead><tbody>`;
    const fmtProb = (w, d) => { if(w===0) return '<span style="color:#ccc">-</span>'; return `<span class="pct-val">${(w/d*100).toFixed(2)}%</span> <span class="frac-tag">${w}/${d}</span>`; };
    cfg.pool.forEach(p => {
        let wL = p.wLeg || 0; let wU = p.wUni || 0;
        if (wL === 0 && wU === 0) return;
        let name = p.label || p.name;
        if (p.name === 'OtherStats' || p.name.startsWith('Other')) name = `<span style="color:#888">${name}</span>`;
        html += `<tr><td>${name}</td><td>${fmtProb(wL, cfg.den.Leg)}</td><td>${fmtProb(wU, cfg.den.Uni)}</td></tr>`;
    });
    html += `</tbody></table>`;
    div.innerHTML = html;
}

function renderRankRates() {
    const calcType = document.getElementById('calcType').value;
    const config = PROB_CONFIG[calcType]; 
    const div = document.getElementById('rankContent');
    let lockedSlotIndex = -1;
    if (calcType === 'mystic') {
        const lockVal = document.getElementById('lockSelect').value;
        // 如果不是 none 則解析鎖定排數
        if (lockVal && lockVal !== 'none') { const parts = lockVal.toString().split('_'); lockedSlotIndex = parseInt(parts[parts.length - 1]); }
    }
    let html = `<table class="rank-table"><thead><tr><th style="width:30%">位置</th><th style="width:35%">傳說機率</th><th style="width:35%">罕見機率</th></tr></thead><tbody>`;
    config.rates.forEach((rate, index) => {
        let label = config.labels[index]; let legText = ""; let uniText = ""; let rowClass = "";
        if (calcType === 'mystic' && index === lockedSlotIndex) {
            label = `🔒 第 ${index + 1} 排`; legText = '<span style="color:#666;">鎖定不變</span>'; uniText = '<span style="color:#666;">-</span>'; rowClass = 'class="row-locked"';
        } else {
            const isGuaranteed = (rate === 1.0); rowClass = isGuaranteed ? 'class="row-guaranteed"' : '';
            legText = `<span class="${isGuaranteed ? 'rate-100' : 'rate-leg'}">${Math.round(rate * 100)}%</span>`;
            uniText = `<span class="${isGuaranteed ? 'rate-dim' : 'rate-uni'}">${Math.round((1 - rate) * 100)}%</span>`;
        }
        html += `<tr ${rowClass}><td>${label}</td><td>${legText}</td><td>${uniText}</td></tr>`;
    });
    html += `</tbody></table>`;
    if(calcType === 'mystic') html += `<div style="margin-top:10px; font-size:12px; color:#c0392b;">※ 未鎖定的排數將依照上述機率重骰。</div>`;
    div.innerHTML = html;
}

function prepareSimulationData(part) {
    const cfg = DB[part]; const st = getStatConfig();
    const expand = (den, poolCfg, rank) => {
        let arr = [];
        poolCfg.forEach(p => {
            let w = p[`w${rank}`] || 0;
            if (w > 0) {
                let item = { 
                    id: p.name, type: p.type, val: p.val || 0,
                    str: (p.name==='STR'?(rank==='Leg'?st.base:st.u1):(p.name==='All'?(rank==='Leg'?st.u1:st.u2):0)),
                    hp: (p.name==='HP'?(rank==='Leg'?st.base:st.u1):0),
                    all: (p.name==='All'?(rank==='Leg'?st.u1:st.u2):0)
                };
                for(let i=0; i<w; i++) arr.push(item);
            }
        });
        while(arr.length < den) arr.push({ id: 'Junk', type: 1, val: 0, str:0, hp:0, all:0 });
        return arr;
    };
    return { Leg: expand(cfg.den.Leg, cfg.pool, 'Leg'), Uni: expand(cfg.den.Uni, cfg.pool, 'Uni') };
}

function getLockedItem(part, mode, specialLock) {
    const pool = DB[part].pool; const st = getStatConfig(); let targetName = "";
    if (part === 'Weapon') {
        let type = specialLock.split('_')[0]; 
        if (type === 'B') targetName = 'Boss_40'; else targetName = 'Att_Pct_13';
    } 
    else if (part === 'Accessory' && mode === 'accessory_drop_meso' && specialLock) {
        let type = specialLock.split('_')[0];
        if (type === 'Drop') targetName = 'Drop'; else targetName = 'Meso';
    }
    else if (mode === 'hat_cd') targetName = 'CD_2';
    else if (mode === 'glove_crit') targetName = 'CritD';
    else if (mode === 'emblem_att') targetName = 'Att_Pct_13';
    else if (mode === 'all_stat') targetName = 'All'; 
    else if (mode === 'hp_stat') targetName = 'HP'; 
    else if (mode === 'default') targetName = 'STR'; 

    let p = pool.find(x => x.name === targetName);
    if (!p) return null;
    return { 
        id: p.name, type: p.type, val: p.val || 0,
        str: (p.name==='STR' ? st.base : (p.name==='All' ? st.u1 : 0)),
        hp: (p.name==='HP' ? st.base : 0),
        all: (p.name==='All' ? st.u1 : 0)
    };
}
// ==========================================
// 3. 模擬引擎
// ==========================================
let simState = {
    running: false, results: {}, totalIterations: 1000000, currentIter: 0, chunkSize: 500000, 
    pools: null, mode: '', calcType: 'violet', lockedInfo: null, useRules: false, mathData: null
};

function startProcess() {
    const part = document.getElementById('partSelect').value;
    const mode = document.getElementById('modeSelect').value;
    const calcType = document.getElementById('calcType').value;
    const useRules = true;
    const iter = parseInt(document.getElementById('iterSelect').value);
    
    if (typeof gtag === 'function') gtag('event', 'run_simulation', {'part': part, 'count': iter, 'type': calcType});

    simState.running = true; simState.mode = mode; simState.calcType = calcType;
    simState.useRules = useRules; simState.totalIterations = iter; simState.pools = prepareSimulationData(part);
    simState.currentIter = 0; simState.results = {}; simState.lockedInfo = null;

    if (calcType === 'mystic') {
        const lockVal = document.getElementById('lockSelect').value;
        if (lockVal !== 'none') {
            let slot = 0; let specialLock = null;
            if (part === 'Weapon' || (part === 'Accessory' && mode === 'accessory_drop_meso')) { 
                let parts = lockVal.split('_'); 
                specialLock = lockVal; 
                slot = parseInt(parts[parts.length - 1]); 
            } else { 
                slot = parseInt(lockVal); 
            }
            let lockedItem = getLockedItem(part, mode, specialLock);
            simState.lockedInfo = { slot: slot, item: lockedItem };
        } else {
            simState.lockedInfo = null; // 不鎖定情境
        }
    }

    document.getElementById('btnRun').disabled = true;
    document.getElementById('calcType').disabled = true;
    document.getElementById('equipLevel').disabled = true; 
    
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').innerText = '0%';
    
    let iterText = iter >= 100000000 ? (iter/100000000)+"億" : (iter/10000)+"萬";
    document.getElementById('statusText').innerText = `運算中 (${iterText}次)...`;

    runChunk();
}

function runChunk() {
    if (!simState.running) return;
    const { pools, mode, calcType, lockedInfo, useRules, chunkSize, results } = simState;
    const currentProbs = PROB_CONFIG[calcType].rates;
    const end = Math.min(simState.currentIter + chunkSize, simState.totalIterations);
    
    let lockSlot = -1; let lockItem = null;
    if (calcType === 'mystic' && lockedInfo) { lockSlot = lockedInfo.slot; lockItem = lockedInfo.item; }

    for (let i = simState.currentIter; i < end; i++) {
        let lineVals = []; let maxLines = (calcType === 'violet') ? 6 : 3;

        for (let r = 0; r < maxLines; r++) {
            if (calcType === 'mystic' && r === lockSlot) { lineVals.push(lockItem); continue; }
            const isLeg = Math.random() < currentProbs[r];
            const pool = isLeg ? pools.Leg : pools.Uni;
            let pick;
            if (!useRules) {
                pick = pool[Math.floor(Math.random() * pool.length)];
            } else {
                let valid = false;
                while (!valid) {
                    pick = pool[Math.floor(Math.random() * pool.length)];
                    if (pick.type === 1) { valid = true; } else {
                        let sameTypeCount = 0;
                        for(let k=0; k<lineVals.length; k++) { if (lineVals[k].type === pick.type) sameTypeCount++; }
                        let maxLimit = 99;
                        if (pick.type >= 20 && pick.type < 30) maxLimit = 1; else if (pick.type >= 40 && pick.type < 50) maxLimit = 2; 
                        if (sameTypeCount >= maxLimit) valid = false; else valid = true;
                    }
                }
            }
            lineVals.push(pick);
        }
        analyzeLines(lineVals, mode, results, calcType);
        
        // 追加不鎖定時的位置統計
        if (calcType === 'mystic' && !lockedInfo) {
            analyzePositionalLines(lineVals, mode, results, document.getElementById('partSelect').value);
        }
    }

    simState.currentIter = end;
    let pct = Math.round((simState.currentIter / simState.totalIterations) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').innerText = pct + '%';

    if (simState.currentIter < simState.totalIterations) { setTimeout(runChunk, 0); } else { finishProcess(); }
}

function analyzePositionalLines(lines, mode, res, part) {
    const st = getStatConfig(); // 引入等級參數來判斷頂%數值
    const targets = getSpecTargets(mode);
    targets.forEach(t => {
        const isMatch = (item) => {
            if (t.id === 'AnyBA') return item.id === 'Boss_40' || item.id === 'Att_Pct_13';
            if (t.id === 'AnyDM') return item.id === 'Drop' || item.id === 'Meso';
            if (t.id === 'HP_Top') return item.id === 'HP' && item.hp === st.base;
            if (t.id === 'All_Top') return item.id === 'All' && item.all === st.u1;
            if (t.id === 'STR_Top') return item.id === 'STR' && item.str === st.base;
            return item.id === t.id;
        };
        if (isMatch(lines[2])) res[`Pos_R3_${t.id}`] = (res[`Pos_R3_${t.id}`] || 0) + 1;
        if (isMatch(lines[1]) || isMatch(lines[2])) res[`Pos_R23_${t.id}`] = (res[`Pos_R23_${t.id}`] || 0) + 1;
    });
}

function getSpecTargets(mode) {
    const st = getStatConfig();
    if (mode === 'weapon_boss') return [{id:'Boss_40', n:'BOSS傷害+40%'}, {id:'Att_Pct_13', n:'物理攻擊力(魔法攻擊力)+13%'}, {id:'AnyBA', n:'BOSS傷害+40% 或 物理攻擊力(魔法攻擊力)+13%'}];
    if (mode === 'accessory_drop_meso') return [{id:'Drop', n:'道具掉落率%'}, {id:'Meso', n:'楓幣獲得量%'}, {id:'AnyDM', n:'道具掉落率% 或 楓幣獲得量%'}];
    if (mode === 'hat_cd') return [{id:'CD_2', n:'技能冷卻 -2秒'}];
    if (mode === 'glove_crit') return [{id:'CritD', n:'爆擊傷害 %'}];
    if (mode === 'emblem_att') return [{id:'Att_Pct_13', n:'物理攻擊力(魔法攻擊力)+13%'}];
    if (mode === 'all_stat') return [{id:'All_Top', n:`${st.u1}% 全屬性`}];
    if (mode === 'hp_stat') return [{id:'HP_Top', n:`${st.base}% HP`}];
    return [{id:'STR_Top', n:`${st.base}% 指定主屬`}];
}

function analyzeLines(lines, mode, res, calcType) {
    let achieved = {};
    if (calcType === 'violet') {
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 5; j++) {
                for (let k = j + 1; k < 6; k++) { checkCombination([lines[i], lines[j], lines[k]], mode, achieved); }
            }
        }
    } else { checkCombination(lines, mode, achieved); }
    for (let key in achieved) { res[key] = (res[key] || 0) + 1; }
}

function checkCombination(combo, mode, achieved) {
    const st = getStatConfig();
    
    if (mode === 'hat_cd') {
        let cdSum = 0; let countCD2 = 0;
        let hasBaseS = false, hasU1S = false, hasU2S = false, hasBaseH = false, hasU1H = false;
        combo.forEach(l => {
            if (l.val > 0 && l.id.startsWith('CD')) { cdSum += l.val; if (l.val === 2) countCD2++; }
            if (l.str >= st.base) hasBaseS = true; if (l.str >= st.u1) hasU1S = true; if (l.str >= st.u2)  hasU2S = true;
            if (l.hp >= st.base) hasBaseH = true; if (l.hp >= st.u1) hasU1H = true;
        });

        if (cdSum >= 6) achieved['CD6'] = true; if (cdSum >= 5) achieved['CD5'] = true; if (countCD2 >= 2) achieved['2L_CD2'] = true; 
        if (cdSum >= 4) {
            achieved['CD4_Any'] = true;
            if (hasBaseS) achieved['CD4_BaseS'] = true;
            if (hasU1S || hasBaseS) achieved['CD4_U1S'] = true;
            if (hasU2S || hasU1S || hasBaseS)  achieved['CD4_U2S'] = true;
            if (hasBaseH) achieved['CD4_BaseH'] = true;
            if (hasU1H || hasBaseH) achieved['CD4_U1H'] = true;
        }

    } else if (mode === 'glove_crit') {
        let critCount = 0;
        let hasBaseS = false, hasU1S = false, hasU2S = false, hasBaseH = false, hasU1H = false;
        combo.forEach(l => {
            if (l.id === 'CritD' || l.id === 'Crit') critCount++;
            if (l.str >= st.base) hasBaseS = true; if (l.str >= st.u1) hasU1S = true; if (l.str >= st.u2)  hasU2S = true;
            if (l.hp >= st.base) hasBaseH = true; if (l.hp >= st.u1) hasU1H = true;
        });
        
        if (critCount >= 3) achieved['Crit3'] = true;
        if (critCount >= 2) {
            achieved['Crit2_Any'] = true;
            if (hasBaseS) achieved['Crit2_BaseS'] = true;
            if (hasU1S || hasBaseS) achieved['Crit2_U1S'] = true;
            if (hasU2S || hasU1S || hasBaseS)  achieved['Crit2_U2S'] = true;
            if (hasBaseH) achieved['Crit2_BaseH'] = true;
            if (hasU1H || hasBaseH) achieved['Crit2_U1H'] = true;
        }

    } else if (mode === 'weapon_boss') {
        let bossSum = 0; let countB40 = 0; let hasAtt13 = false, hasAtt10 = false; let countA13 = 0;
        combo.forEach(l => {
            if (l.id === 'Boss' || l.type === 'B' || l.id.startsWith('Boss')) { bossSum += l.val; if (l.val === 40) countB40++; }
            if (l.id.startsWith('Att_Pct') || l.type === 'A') { if (l.val >= 13) { hasAtt13 = true; if (l.val === 13) countA13++; } if (l.val >= 10) hasAtt10 = true; }
        });
        
        if (countB40 >= 2) achieved['2L_Boss40'] = true;
        if (countA13 >= 2) achieved['2L_Att13'] = true;
        if ((countB40 + countA13) >= 2) achieved['2L_Boss40_Att13'] = true;

        if(bossSum >= 120) achieved['120B'] = true; if(bossSum >= 115) achieved['115B'] = true;
        if(bossSum >= 110) achieved['110B'] = true; if(bossSum >= 105) achieved['105B'] = true;
        if(bossSum >= 100) achieved['100B'] = true; if(bossSum >= 95) achieved['95B'] = true; if(bossSum >= 90) achieved['90B'] = true;
        if(bossSum >= 80) { if(hasAtt13) achieved['80B+13A'] = true; if(hasAtt10 || hasAtt13) achieved['80B+10A'] = true; achieved['80B'] = true; }
        if(bossSum >= 75) { if(hasAtt13) achieved['75B+13A'] = true; if(hasAtt10 || hasAtt13) achieved['75B+10A'] = true; achieved['75B'] = true; }
        if(bossSum >= 70) { if(hasAtt13) achieved['70B+13A'] = true; if(hasAtt10 || hasAtt13) achieved['70B+10A'] = true; achieved['70B'] = true; }
        if(bossSum >= 65) { if(hasAtt13) achieved['65B+13A'] = true; if(hasAtt10 || hasAtt13) achieved['65B+10A'] = true; achieved['65B'] = true; }
        if(bossSum >= 60) { if(hasAtt13) achieved['60B+13A'] = true; if(hasAtt10 || hasAtt13) achieved['60B+10A'] = true; achieved['60B'] = true; }

    } else if (mode === 'emblem_att') {
        let attSum = 0; let maxIgnore = 0; let countA13 = 0; 
        combo.forEach(l => {
            if (l.id.startsWith('Att_Pct') || l.type === 'A') { attSum += l.val; if (l.val === 13) countA13++; }
            if (l.id.startsWith('Ignore') || l.type === 'I') { if(l.val > maxIgnore) maxIgnore = l.val; }
        });

        if (countA13 >= 2) achieved['2L_Att13'] = true;
        if(attSum >= 39) achieved[39] = true; if(attSum >= 36) achieved[36] = true;
        if(attSum >= 33) achieved[33] = true; if(attSum >= 30) achieved[30] = true;
        
        let aCount = combo.filter(l=>l.id.startsWith('Att_Pct') || l.type==='A').length;
        if (aCount >= 2) {
             let atts = combo.filter(l=>l.id.startsWith('Att_Pct') || l.type==='A').map(l=>l.val).sort((a,b)=>b-a);
             let subSum = atts[0] + atts[1];
             if(subSum >= 26) { if(maxIgnore>=40) achieved['26A+40I']=true; if(maxIgnore>=35) achieved['26A+35I']=true; if(maxIgnore>=30) achieved['26A+30I']=true; }
             if(subSum >= 23) { if(maxIgnore>=40) achieved['23A+40I']=true; if(maxIgnore>=35) achieved['23A+35I']=true; if(maxIgnore>=30) achieved['23A+30I']=true; }
             if(subSum >= 20) { if(maxIgnore>=40) achieved['20A+40I']=true; if(maxIgnore>=35) achieved['20A+35I']=true; if(maxIgnore>=30) achieved['20A+30I']=true; }
        }

    } else if (mode === 'accessory_drop_meso') {
        let dropCount = 0; let mesoCount = 0;
        combo.forEach(l => {
            if (l.id === 'Drop') dropCount++;
            if (l.id === 'Meso') mesoCount++;
        });
        
        let totalDM = dropCount + mesoCount;
        if (totalDM >= 3) achieved['3L_DM'] = true;
        if (totalDM >= 2) achieved['2L_DM'] = true;
        if (dropCount >= 3) achieved['3L_Drop'] = true;
        if (dropCount >= 2 && mesoCount >= 1) achieved['2L_Drop_1L_Meso'] = true;
        if (dropCount >= 2) achieved['2L_Drop'] = true;
        if (mesoCount >= 2) achieved['2L_Meso'] = true;

    } else if (mode === 'all_stat') {
        let sumAll = 0; let countAllBase = 0;
        combo.forEach(l => { if (l.all > 0) { sumAll += l.all; if (l.all === st.u1) countAllBase++; } });
        if (countAllBase >= 2) achieved['2L_All'] = true;
        for(let i=0; i<=3; i++) { let target = st.u1 * 3 - i * 3; if(sumAll >= target) achieved['All_Tier'+i] = true; }

    } else if (mode === 'hp_stat') {
        let sumHP = 0; let countHPBase = 0;
        combo.forEach(l => { if (l.hp > 0) { sumHP += l.hp; if (l.hp === st.base) countHPBase++; } });
        if (countHPBase >= 2) achieved['2L_HP'] = true;
        for(let i=0; i<=3; i++) { let target = st.base * 3 - i * 3; if(sumHP >= target) achieved['HP_Tier'+i] = true; }

    } else {
        let sumS = 0; let countSBase = 0;
        combo.forEach(l => { sumS += l.str; if (l.str >= st.base) countSBase++; });
        if (countSBase >= 2) achieved['2L_STR'] = true; 
        for(let i=0; i<=6; i++) { let target = st.base * 3 - i * 3; if(sumS >= target) achieved['S_Tier'+i] = true; }
    }
}
// ==========================================
// 5. 數學理論核心
// ==========================================

function runMathDP(part, stateConfig, evaluateFn, useRules, lockedInfo) {
    const configKey = document.getElementById('calcType').value;
    const P_RANK = PROB_CONFIG[configKey].rates;

    const cfg = DB[part];
    let weights = { Leg: {}, Uni: {} };
    let totalWeightSums = { Leg: 0, Uni: 0 }; 

    for(let rank of ['Leg', 'Uni']) {
        cfg.pool.forEach(p => {
            let w = p[`w${rank}`] || 0;
            if(w > 0) {
                totalWeightSums[rank] += w; 
                let tag = stateConfig(p, rank); 
                if(tag !== null) { weights[rank][tag] = (weights[rank][tag] || 0) + w; }
            }
        });
    }

    let den = { Leg: Math.max(cfg.den.Leg, totalWeightSums.Leg), Uni: Math.max(cfg.den.Uni, totalWeightSums.Uni) };
    let startState = [0,0,0,0,0,0,0,0,0,0,0,0];
    let dp = {}; dp[startState.join(',')] = 1.0;
    let maxSlots = (configKey === 'mystic') ? 3 : 6;

    for (let slot = 0; slot < maxSlots; slot++) {
        if (lockedInfo && slot === lockedInfo.slot) continue; 
        let next_dp = {}; let pLeg = P_RANK[slot]; let pUni = 1.0 - pLeg;

        for (let key in dp) {
            let prob = dp[key]; if (prob === 0) continue;
            let state = key.split(',').map(Number);

            const processRank = (rank, rankProb) => {
                if (rankProb <= 0) return;
                let curDen = den[rank]; let wMap = weights[rank]; let reducedDen = curDen;
                let validKeys = []; let weightSum = 0;

                for(let tag in wMap) {
                    let w = wMap[tag];
                    if(useRules && isLimitReached(state, tag)) { reducedDen -= w; } 
                    else { validKeys.push(tag); weightSum += w; }
                }
                
                let baseP = prob * rankProb; let otherP = 1.0 - (weightSum / reducedDen);
                
                validKeys.forEach(tag => {
                    let p = (wMap[tag] / reducedDen); let idx = parseInt(tag);
                    let nextState = [...state]; nextState[idx] += 1; addProb(next_dp, nextState, baseP * p);
                });
                addProb(next_dp, state, baseP * otherP);
            };

            processRank('Leg', pLeg); processRank('Uni', pUni);
        }
        dp = next_dp;
    }

    let finalRes = {};
    for (let key in dp) { let state = key.split(',').map(Number); evaluateFn(state, finalRes, dp[key]); }
    return finalRes;
}

function addProb(dpObj, stateArr, p) { let k = stateArr.join(','); dpObj[k] = (dpObj[k] || 0) + p; }

function isLimitReached(state, tag) {
    let idx = parseInt(tag);
    if (idx === 8 && state[8] >= 1) return true; 
    if (idx === 9 && state[9] >= 2) return true; 
    if (idx === 10 && state[10] >= 1) return true; 
    if (idx === 11 && state[11] >= 2) return true; 
    return false;
}

function runGenericC63(part, configFn, idMap, checkFn, useRules, lockedInfo) {
    const calcType = document.getElementById('calcType').value;
    const evalFn = (s, res, prob) => {
        let fullLines = [];
        for(let idx=0; idx<s.length; idx++) {
            let count = s[idx];
            for(let k=0; k<count; k++) { fullLines.push(idMap[idx] || {id:'Junk', val:0, s:0, h:0, all:0, hp:0}); }
        }
        
        if (lockedInfo) {
            let item = lockedInfo.item;
            let mathLine = { id: item.id, val: item.val, s: item.str || 0, h: item.hp || 0, all: item.all || 0, hp: item.hp || 0 };
            if (item.id.startsWith('CD_')) mathLine.id = 'CD';
            else if (item.id === 'CritD') mathLine.id = 'Crit';
            else if (item.id.startsWith('Boss')) mathLine.type = 'B';
            else if (item.id.startsWith('Att_Pct')) mathLine.type = 'A';
            else if (item.id.startsWith('Ignore')) mathLine.type = 'I';
            else if (item.id === 'All') mathLine.id = 'All';
            else if (item.id === 'HP') mathLine.id = 'HP';
            else if (item.id === 'Drop') mathLine.id = 'Drop';
            else if (item.id === 'Meso') mathLine.id = 'Meso';
            fullLines.push(mathLine);
        }
        
        let targetLen = (calcType === 'mystic') ? 3 : 6;
        while(fullLines.length < targetLen) fullLines.push({id:'Junk', val:0, s:0, h:0, all:0, hp:0});

        let achieved = {};
        if (calcType === 'mystic') { 
            checkFn(fullLines, achieved); 
        } else {
            for (let i = 0; i < 4; i++) {
                for (let j = i + 1; j < 5; j++) {
                    for (let k = j + 1; k < 6; k++) { checkFn([fullLines[i], fullLines[j], fullLines[k]], achieved); }
                }
            }
        }
        for(let key in achieved) res[key] = (res[key]||0) + prob;
    };
    return runMathDP(part, configFn, evalFn, useRules, lockedInfo);
}

function calcMath_UniversalArmor(useRules, lockedInfo) {
    const st = getStatConfig();
    const ID_MAP = [
        {id:'Stat', s:st.base, h:0}, {id:'Stat', s:st.u1, h:0}, {id:'Stat', s:st.u2, h:0},
        {id:'HP', s:0, h:st.base}, {id:'HP', s:0, h:st.u1},
        {id:'Junk', s:0, h:0}, {id:'Junk', s:0, h:0}, {id:'Junk', s:0, h:0},
        {id:'Junk', s:0, h:0}, {id:'Junk', s:0, h:0}, {id:'Junk', s:0, h:0}, {id:'Junk', s:0, h:0}
    ];
    const config = (p, rank) => {
        if(p.name==='STR') return (rank==='Leg' ? 0 : 1);
        if(p.name==='All') return (rank==='Leg' ? 1 : 2);
        if(p.name==='HP') return (rank==='Leg' ? 3 : 4);
        if(p.type === 20) return 8; if(p.type === 40) return 9; 
        if(p.type === 21) return 10; if(p.type === 41) return 11;
        return null; 
    };
    const check3 = (lines, validMap) => {
        let sumS = 0; let countSBase = 0;
        for(let l of lines) { sumS += l.s || 0; if(l.s >= st.base) countSBase++; }
        if(countSBase >= 2) validMap['2L_STR'] = true;
        for(let i=0; i<=6; i++) { let t = st.base*3 - i*3; if(sumS >= t) validMap['S_Tier'+i] = true; }
    };
    const partName = document.getElementById('partSelect').value;
    return runGenericC63(partName, config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_AllStat(useRules, lockedInfo) {
    const st = getStatConfig();
    const ID_MAP = [
        {id:'All', all:st.u1}, {id:'All', all:st.u2},
        {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0},
        {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0}, {id:'Junk', all:0}
    ];
    const config = (p, rank) => {
        if(p.name==='All') return (rank==='Leg' ? 0 : 1);
        if(p.type === 20) return 8; if(p.type === 40) return 9; if(p.type === 21) return 10; if(p.type === 41) return 11;
        return 2; 
    };
    const check3 = (lines, validMap) => {
        let sum = 0; let countBase = 0;
        for(let l of lines) { sum += l.all || 0; if(l.all === st.u1) countBase++; }
        if(countBase >= 2) validMap['2L_All'] = true;
        for(let i=0; i<=3; i++) { let t = st.u1*3 - i*3; if(sum >= t) validMap['All_Tier'+i] = true; }
    };
    const partName = document.getElementById('partSelect').value;
    return runGenericC63(partName, config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_HP(useRules, lockedInfo) {
    const st = getStatConfig();
    const ID_MAP = [
        {id:'HP', hp:st.base}, {id:'HP', hp:st.u1},
        {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0},
        {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0}, {id:'Junk', hp:0}
    ];
    const config = (p, rank) => {
        if(p.name==='HP') return (rank==='Leg' ? 0 : 1);
        if(p.type === 20) return 8; if(p.type === 40) return 9; if(p.type === 21) return 10; if(p.type === 41) return 11;
        return 2;
    };
    const check3 = (lines, validMap) => {
        let sum = 0; let countBase = 0;
        for(let l of lines) { sum += l.hp || 0; if(l.hp === st.base) countBase++; }
        if(countBase >= 2) validMap['2L_HP'] = true;
        for(let i=0; i<=3; i++) { let t = st.base*3 - i*3; if(sum >= t) validMap['HP_Tier'+i] = true; }
    };
    const partName = document.getElementById('partSelect').value;
    return runGenericC63(partName, config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_Hat(useRules, lockedInfo) {
    const st = getStatConfig();
    const ID_MAP = [
        {id:'CD', val:2, s:0, h:0}, {id:'CD', val:1, s:0, h:0},      
        {id:'Stat', val:0, s:st.base, h:0}, {id:'Stat', val:0, s:st.u1, h:0}, {id:'Stat', val:0, s:st.u2, h:0},    
        {id:'HP', val:0, s:0, h:st.base}, {id:'HP', val:0, s:0, h:st.u1},     
        {id:'Junk', val:0, s:0, h:0}, {id:'Junk', val:0, s:0, h:0}, {id:'Junk', val:0, s:0, h:0}
    ];
    const config = (p, rank) => {
        if(p.name==='CD_2') return 0; if(p.name==='CD_1') return 1;
        if(p.name==='STR') return (rank==='Leg' ? 2 : 3); if(p.name==='All') return (rank==='Leg' ? 3 : 4); 
        if(p.name==='HP') return (rank==='Leg' ? 5 : 6);
        if(p.type === 20) return 8; if(p.type === 40) return 9; 
        return null;
    };
    const check3 = (lines, validMap) => {
        let cdSum = 0; let countCD2 = 0;
        let hasBaseS=false, hasU1S=false, hasU2S=false, hasBaseH=false, hasU1H=false;
        for(let l of lines) {
            if(l.id==='CD') { cdSum += l.val; if(l.val === 2) countCD2++; }
            if(l.s>=st.base) hasBaseS=true; if(l.s>=st.u1) hasU1S=true; if(l.s>=st.u2) hasU2S=true;
            if(l.h>=st.base) hasBaseH=true; if(l.h>=st.u1) hasU1H=true;
        }
        if (countCD2 >= 2) validMap['2L_CD2'] = true;
        if (cdSum >= 6) validMap['CD6'] = true; if (cdSum >= 5) validMap['CD5'] = true;
        if (cdSum >= 4) {
            validMap['CD4_Any'] = true;
            if(hasBaseS) validMap['CD4_BaseS']=true;
            if(hasU1S||hasBaseS) validMap['CD4_U1S']=true;
            if(hasU2S||hasU1S||hasBaseS) validMap['CD4_U2S']=true;
            if(hasBaseH) validMap['CD4_BaseH']=true;
            if(hasU1H||hasBaseH) validMap['CD4_U1H']=true;
        }
    };
    return runGenericC63('Hat', config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_Glove(useRules, lockedInfo) {
    const st = getStatConfig();
    const ID_MAP = [
        {id:'Crit', val:1, s:0, h:0},
        {id:'Stat', val:0, s:st.base, h:0}, {id:'Stat', val:0, s:st.u1, h:0}, {id:'Stat', val:0, s:st.u2, h:0},
        {id:'HP', val:0, s:0, h:st.base}, {id:'HP', val:0, s:0, h:st.u1},
        {id:'Junk', val:0, s:0, h:0}, {id:'Junk', val:0, s:0, h:0}, {id:'Junk', val:0, s:0, h:0}, {id:'Junk', val:0, s:0, h:0}
    ];
    const config = (p, rank) => {
        if(p.name==='CritD') return 0;
        if(p.name==='STR') return (rank==='Leg' ? 1 : 2); if(p.name==='All') return (rank==='Leg' ? 2 : 3);
        if(p.name==='HP') return (rank==='Leg' ? 4 : 5);
        if(p.type === 20) return 8; if(p.type === 40) return 9; 
        return null;
    };
    const check3 = (lines, validMap) => {
        let crit = 0; let hasBaseS=false, hasU1S=false, hasU2S=false, hasBaseH=false, hasU1H=false;
        for(let l of lines) {
            if(l.id==='Crit') crit++;
            if(l.s>=st.base) hasBaseS=true; if(l.s>=st.u1) hasU1S=true; if(l.s>=st.u2) hasU2S=true;
            if(l.h>=st.base) hasBaseH=true; if(l.h>=st.u1) hasU1H=true;
        }
        if(crit >= 3) validMap['Crit3'] = true;
        if(crit >= 2) {
            validMap['Crit2_Any'] = true;
            if(hasBaseS) validMap['Crit2_BaseS']=true;
            if(hasU1S||hasBaseS) validMap['Crit2_U1S']=true;
            if(hasU2S||hasU1S||hasBaseS) validMap['Crit2_U2S']=true;
            if(hasBaseH) validMap['Crit2_BaseH']=true;
            if(hasU1H||hasBaseH) validMap['Crit2_U1H']=true;
        }
    };
    return runGenericC63('Glove', config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_Weapon(useRules, lockedInfo) {
    const ID_MAP = [ {type:'B', val:40}, {type:'B', val:35}, {type:'B', val:30}, {type:'A', val:13}, {type:'A', val:10}, {type:'I', val:0} ];
    const config = (p, rank) => {
        if (p.name === 'Boss_40') return 0; if (p.name === 'Boss_35') return 1; if (p.name === 'Boss_30') return 2;
        if (p.name === 'Att_Pct_13') return 3; if (p.name === 'Att_Pct_10') return 4;
        if (p.name.startsWith('Ignore')) return 5; return null;
    };
    const check3 = (lines, validMap) => {
        let bSum = 0, hasA13 = false, hasA10 = false, countB40 = 0, countA13 = 0;
        for(let l of lines) {
            if(l.type === 'B') { bSum += l.val; if(l.val === 40) countB40++; }
            if(l.type === 'A') { if(l.val>=13) { hasA13=true; if(l.val === 13) countA13++; } if(l.val>=10) hasA10=true; }
        }
        if(countB40 >= 2) validMap['2L_Boss40'] = true;
        if(countA13 >= 2) validMap['2L_Att13'] = true;
        if((countB40 + countA13) >= 2) validMap['2L_Boss40_Att13'] = true;

        if(bSum >= 120) validMap['120B'] = true; if(bSum >= 115) validMap['115B'] = true;
        if(bSum >= 110) validMap['110B'] = true; if(bSum >= 105) validMap['105B'] = true;
        if(bSum >= 100) validMap['100B'] = true; if(bSum >= 95) validMap['95B'] = true; if(bSum >= 90) validMap['90B'] = true;
        if(bSum >= 80) { if(hasA13) validMap['80B+13A'] = true; if(hasA13||hasA10) validMap['80B+10A'] = true; validMap['80B'] = true; }
        if(bSum >= 75) { if(hasA13) validMap['75B+13A'] = true; if(hasA13||hasA10) validMap['75B+10A'] = true; validMap['75B'] = true; }
        if(bSum >= 70) { if(hasA13) validMap['70B+13A'] = true; if(hasA13||hasA10) validMap['70B+10A'] = true; validMap['70B'] = true; }
        if(bSum >= 65) { if(hasA13) validMap['65B+13A'] = true; if(hasA13||hasA10) validMap['65B+10A'] = true; validMap['65B'] = true; }
        if(bSum >= 60) { if(hasA13) validMap['60B+13A'] = true; if(hasA13||hasA10) validMap['60B+10A'] = true; validMap['60B'] = true; }
    };
    return runGenericC63('Weapon', config, ID_MAP, check3, useRules, lockedInfo);
}

function calcMath_Emblem(useRules, lockedInfo) {
    const ID_MAP = [ {type:'A', val:13}, {type:'A', val:10}, {type:'I', val:40}, {type:'I', val:35}, {type:'I', val:30} ];
    const config = (p, rank) => {
        if(p.name==='Att_Pct_13') return 0; if(p.name==='Att_Pct_10') return 1;
        if(p.name==='Ignore_40') return 2; if(p.name==='Ignore_35') return 3; if(p.name==='Ignore_30') return 4; return null;
    };
    const check3 = (lines, validMap) => {
        let attSum = 0, maxI = 0, countA13 = 0;
        for(let l of lines) {
            if(l.type==='A') { attSum += l.val; if(l.val === 13) countA13++; }
            if(l.type==='I' && l.val>maxI) maxI = l.val;
        }
        if (countA13 >= 2) validMap['2L_Att13'] = true;
        if(attSum >= 39) validMap[39] = true; if(attSum >= 36) validMap[36] = true;
        if(attSum >= 33) validMap[33] = true; if(attSum >= 30) validMap[30] = true;
        
        let aCount = lines.filter(l=>l.type==='A').length;
        if (aCount >= 2) {
             let atts = lines.filter(l=>l.type==='A').map(l=>l.val).sort((a,b)=>b-a); let subSum = atts[0] + atts[1];
             if(subSum >= 26) { if(maxI>=40) validMap['26A+40I']=true; if(maxI>=35) validMap['26A+35I']=true; if(maxI>=30) validMap['26A+30I']=true; }
             if(subSum >= 23) { if(maxI>=40) validMap['23A+40I']=true; if(maxI>=35) validMap['23A+35I']=true; if(maxI>=30) validMap['23A+30I']=true; }
             if(subSum >= 20) { if(maxI>=40) validMap['20A+40I']=true; if(maxI>=35) validMap['20A+35I']=true; if(maxI>=30) validMap['20A+30I']=true; }
        }
    };
    return runGenericC63('Emblem', config, ID_MAP, check3, useRules, lockedInfo);
}

// --- Accessory Drop/Meso ---
function calcMath_AccessoryDropMeso(useRules, lockedInfo) {
    const ID_MAP = [ {id:'Drop'}, {id:'Meso'} ];
    const config = (p, rank) => {
        if(p.name==='Drop') return 0;
        if(p.name==='Meso') return 1;
        return null;
    };
    const check3 = (lines, validMap) => {
        let dropCount = 0; let mesoCount = 0;
        for(let l of lines) {
            if(l.id === 'Drop') dropCount++;
            if(l.id === 'Meso') mesoCount++;
        }
        let totalDM = dropCount + mesoCount;
        if (totalDM >= 3) validMap['3L_DM'] = true;
        if (totalDM >= 2) validMap['2L_DM'] = true;
        if (dropCount >= 3) validMap['3L_Drop'] = true;
        if (dropCount >= 2 && mesoCount >= 1) validMap['2L_Drop_1L_Meso'] = true;
        if (dropCount >= 2) validMap['2L_Drop'] = true;
        if (mesoCount >= 2) validMap['2L_Meso'] = true;
    };
    return runGenericC63('Accessory', config, ID_MAP, check3, useRules, lockedInfo);
}

function calculatePositionalMath(part, mode, mathData) {
    const cfg = DB[part];
    const rates = PROB_CONFIG.mystic.rates;
    const targets = getSpecTargets(mode);

    targets.forEach(t => {
        const getProbInRank = (rank) => {
            let wSum = 0;
            if (t.id === 'AnyBA') {
                wSum = (cfg.pool.find(p=>p.name==='Boss_40')?.[`w${rank}`]||0) + (cfg.pool.find(p=>p.name==='Att_Pct_13')?.[`w${rank}`]||0);
            } else if (t.id === 'AnyDM') {
                wSum = (cfg.pool.find(p=>p.name==='Drop')?.[`w${rank}`]||0) + (cfg.pool.find(p=>p.name==='Meso')?.[`w${rank}`]||0);
            } else if (t.id === 'HP_Top') {
                wSum = rank === 'Leg' ? (cfg.pool.find(p=>p.name==='HP')?.[`w${rank}`]||0) : 0;
            } else if (t.id === 'All_Top') {
                wSum = rank === 'Leg' ? (cfg.pool.find(p=>p.name==='All')?.[`w${rank}`]||0) : 0;
            } else if (t.id === 'STR_Top') {
                wSum = rank === 'Leg' ? (cfg.pool.find(p=>p.name==='STR')?.[`w${rank}`]||0) : 0;
            } else {
                wSum = cfg.pool.find(p=>p.name===t.id)?.[`w${rank}`]||0;
            }
            return wSum / cfg.den[rank];
        };

        const pL = getProbInRank('Leg'), pU = getProbInRank('Uni');
        const pR2 = rates[1]*pL + (1-rates[1])*pU;
        const pR3 = rates[2]*pL + (1-rates[2])*pU;

        mathData[`Pos_R3_${t.id}`] = pR3;
        mathData[`Pos_R23_${t.id}`] = 1 - (1-pR2)*(1-pR3);
    });
}

function finishProcess() {
    const part = document.getElementById('partSelect').value;
    const useRules = true; 
    const lockedInfo = simState.lockedInfo;

    let mathData = null;
    if (part === 'Weapon') mathData = calcMath_Weapon(useRules, lockedInfo);
    else if (part === 'Emblem') mathData = calcMath_Emblem(useRules, lockedInfo);
    else if (part === 'Accessory' && simState.mode === 'accessory_drop_meso') mathData = calcMath_AccessoryDropMeso(useRules, lockedInfo);
    else if (simState.mode === 'all_stat') { mathData = calcMath_AllStat(useRules, lockedInfo); }
    else if (simState.mode === 'hp_stat') { mathData = calcMath_HP(useRules, lockedInfo); }
    else if (part === 'Hat') {
        if (simState.mode === 'hat_cd') mathData = calcMath_Hat(useRules, lockedInfo);
        else mathData = calcMath_UniversalArmor(useRules, lockedInfo);
    }
    else if (part === 'Glove') mathData = calcMath_Glove(useRules, lockedInfo);
    else mathData = calcMath_UniversalArmor(useRules, lockedInfo);

    simState.mathData = mathData; 
    
    // 追加不鎖定時的數學統計
    if (simState.calcType === 'mystic' && !simState.lockedInfo) {
        calculatePositionalMath(part, simState.mode, mathData);
    }
    
    renderResults(simState.results, simState.mode, mathData);
    
    document.getElementById('statusText').innerText = "運算完成";
    document.getElementById('btnRun').disabled = false;
    document.getElementById('calcType').disabled = false;
    document.getElementById('equipLevel').disabled = false;

    simState.running = false;
}

function renderResults(simRes, mode, mathData) {
    const area = document.getElementById('resultArea');
    area.innerHTML = "";
    const total = simState.totalIterations;
    const st = getStatConfig();

    const getTooltip = (target, type) => {
        let vals = [];
        if(type === 'hp') vals = [st.base, st.u1, 0];
        else if(type === 'str') vals = [st.base, st.u1, st.u2, 0];
        else if(type === 'all') vals = [st.u1, st.u2, 0];
        else return "";
        
        let combos = new Set();
        for(let i=0; i<vals.length; i++) {
            for(let j=i; j<vals.length; j++) {
                for(let k=j; k<vals.length; k++) {
                    if(vals[i]+vals[j]+vals[k] >= target && vals[i]+vals[j]+vals[k] > 0) {
                        let parts = [];
                        if(vals[i]>0) parts.push(vals[i]+'%');
                        if(vals[j]>0) parts.push(vals[j]+'%');
                        if(vals[k]>0) parts.push(vals[k]+'%');
                        combos.add(parts.join(' + '));
                    }
                }
            }
        }
        let arr = Array.from(combos).sort((a,b) => b.localeCompare(a));
        return arr.length > 0 ? `可能組合 (達標或超越)：\n` + arr.join("\n") : "";
    };

    const fmtLabel = (val, name, type) => {
        let isTierable = (type === 'str' || type === 'hp');
        let suffix = "";
        if(isTierable) {
            if(val === st.base*3) suffix = " <span class=\"tier-label\">(頂%)</span>";
            else if(val === st.base*2 + st.u1) suffix = " <span class=\"tier-label\">(次頂)</span>";
            else if(val === st.base + st.u1*2) suffix = " <span class=\"tier-label\">(次次頂)</span>";
        }
        let tooltipText = getTooltip(val, type);
        let icon = tooltipText ? ` <div class="tooltip-wrap"><span class="info-icon">ℹ️</span><div class="tooltip-content">${tooltipText}</div></div>` : '';
        return `${val}%↑ ${name}${suffix}${icon}`;
    };

    const renderTable = (title, rows) => {
        let html = `<div class="card"><div class="card-header">
            ${title}
            <div class="legend-box">顯示格式：<span class="sim-val">模擬實測</span> <span class="math-group">(<span class="math-val">數學理論</span>)</span></div>
        </div>
        <table><thead><tr><th style="width:40%">目標條件 (含以上)</th><th style="width:30%">成功期望顆數</th><th style="width:30%">單次成功機率</th></tr></thead><tbody>`;
        
        rows.forEach(r => {
            let count = simRes[r.key] || 0;
            let prob = count / total;
            let cubes = prob > 0 ? 1/prob : Infinity;
            let mathProb = (mathData && mathData[r.key] !== undefined) ? mathData[r.key] : null;
            let mathCubes = (mathProb !== null && mathProb > 0) ? 1/mathProb : ((mathProb === 0) ? Infinity : null);

            const fmtPct = (val) => (val*100).toFixed(4) + "%";
            const fmtNum = (val) => val === Infinity ? "∞" : Math.round(val).toLocaleString();

            let cubesHtml = `<span class="cube-val">${fmtNum(cubes)}</span>`;
            if(mathCubes !== null) cubesHtml += ` <span class="math-group">(<span class="math-val">${fmtNum(mathCubes)}</span>)</span>`;
            let probHtml = `<span class="sim-val">${fmtPct(prob)}</span>`;
            if(mathProb !== null) probHtml += ` <span class="math-group">(<span class="math-val">${fmtPct(mathProb)}</span>)</span>`;

            let note = "";
            if(r.broad) note = `<span class="note-broad">不限屬性</span>`;
            if(r.both) note = `<span class="note-strict">雙重達標</span>`;
            if(r.special) note = `<span class="note-special">雙排傳說</span>`;
            if(r.pos) note = `<span class="note-special">指定排</span>`;

            html += `<tr><td class="target-name">${r.label} ${note}</td><td>${cubesHtml}</td><td>${probHtml}</td></tr>`;
        });
        html += "</tbody></table></div>";
        return html;
    };

    let posRows = [];
    if (simState.calcType === 'mystic' && !simState.lockedInfo) {
        getSpecTargets(mode).forEach(t => {
            posRows.push({key:`Pos_R3_${t.id}`, label:`【第3排】出現 ${t.n}`, pos:true});
            posRows.push({key:`Pos_R23_${t.id}`, label:`【第2或3排】出現 ${t.n}`, pos:true});
        });
    }

    if (mode === 'hat_cd') {
        let r1 = [ ...posRows, {key:'2L_CD2', label:'雙排 -2秒 CD', special:true}, {key:'CD6', label:'-6秒↑ CD'}, {key:'CD5', label:'-5秒↑ CD'}, {key:'CD4_Any', label:'-4秒↑ CD'}, 
            {key:'CD4_BaseS', label:`-4秒↑ CD + ${st.base}%↑ 指定主屬`, both:true}, {key:'CD4_U1S', label:`-4秒↑ CD + ${st.u1}%↑ 指定主屬`, both:true}, {key:'CD4_U2S', label:`-4秒↑ CD + ${st.u2}%↑ 指定主屬`, both:true} ];
        let r2 = [ ...posRows, {key:'2L_CD2', label:'雙排 -2秒 CD', special:true}, {key:'CD6', label:'-6秒↑ CD'}, {key:'CD5', label:'-5秒↑ CD'}, {key:'CD4_Any', label:'-4秒↑ CD'}, 
            {key:'CD4_BaseH', label:`-4秒↑ CD + ${st.base}%↑ HP`, both:true}, {key:'CD4_U1H', label:`-4秒↑ CD + ${st.u1}%↑ HP`, both:true} ];
        area.innerHTML = renderTable("帽子 (CD & 指定主屬)", r1) + renderTable("帽子 (CD & HP)", r2);
    } else if (mode === 'glove_crit') {
        let r1 = [ ...posRows, {key:'Crit3', label:'3排↑ 爆傷'}, {key:'Crit2_Any', label:'2排↑ 爆傷'}, 
            {key:'Crit2_BaseS', label:`2排↑ 爆傷 + ${st.base}%↑ 指定主屬`, both:true}, {key:'Crit2_U1S', label:`2排↑ 爆傷 + ${st.u1}%↑ 指定主屬`, both:true}, {key:'Crit2_U2S', label:`2排↑ 爆傷 + ${st.u2}%↑ 指定主屬`, both:true} ];
        let r2 = [ ...posRows, {key:'Crit3', label:'3排↑ 爆傷'}, {key:'Crit2_Any', label:'2排↑ 爆傷'}, 
            {key:'Crit2_BaseH', label:`2排↑ 爆傷 + ${st.base}%↑ HP`, both:true}, {key:'Crit2_U1H', label:`2排↑ 爆傷 + ${st.u1}%↑ HP`, both:true} ];
        area.innerHTML = renderTable("手套 (爆傷 & 指定主屬)", r1) + renderTable("手套 (爆傷 & HP)", r2);
    } else if (mode === 'weapon_boss') {
        let toolTipText = "可能組合 (達標或超越)：\nBOSS傷害+40% + BOSS傷害+40%\n物理攻擊力(魔法攻擊力)+13% + 物理攻擊力(魔法攻擊力)+13%\nBOSS傷害+40% + 物理攻擊力(魔法攻擊力)+13%\nBOSS傷害+40% + BOSS傷害+40% + BOSS傷害+40%\n物理攻擊力(魔法攻擊力)+13% + 物理攻擊力(魔法攻擊力)+13% + 物理攻擊力(魔法攻擊力)+13%\nBOSS傷害+40% + BOSS傷害+40% + 物理攻擊力(魔法攻擊力)+13%\nBOSS傷害+40% + 物理攻擊力(魔法攻擊力)+13% + 物理攻擊力(魔法攻擊力)+13%";
        let toolTipHtml = ` <div class="tooltip-wrap"><span class="info-icon">ℹ️</span><div class="tooltip-content">${toolTipText}</div></div>`;

        let rows = [ 
            ...posRows,
            {key:'2L_Boss40_Att13', label:`任意兩排 物理攻擊力(魔法攻擊力)+13% 或 BOSS傷害+40%${toolTipHtml}`, special:true},
            {key:'2L_Boss40', label:'雙排 BOSS傷害+40%', special:true}, 
            {key:'2L_Att13', label:'雙排 物理攻擊力(魔法攻擊力)+13%', special:true}, 
            {key:'120B', label:'BOSS傷害+120%↑'}, {key:'115B', label:'BOSS傷害+115%↑'}, {key:'110B', label:'BOSS傷害+110%↑'}, {key:'105B', label:'BOSS傷害+105%↑'}, {key:'100B', label:'BOSS傷害+100%↑'}, {key:'95B', label:'BOSS傷害+95%↑'}, {key:'90B', label:'BOSS傷害+90%↑'}, 
            {key:'80B+13A', label:'BOSS傷害+80%↑ + 物理攻擊力(魔法攻擊力)+13%↑', both:true}, {key:'80B+10A', label:'BOSS傷害+80%↑ + 物理攻擊力(魔法攻擊力)+10%↑', both:true}, {key:'80B', label:'BOSS傷害+80%↑'}, 
            {key:'75B+13A', label:'BOSS傷害+75%↑ + 物理攻擊力(魔法攻擊力)+13%↑', both:true}, {key:'75B+10A', label:'BOSS傷害+75%↑ + 物理攻擊力(魔法攻擊力)+10%↑', both:true}, {key:'75B', label:'BOSS傷害+75%↑'}, 
            {key:'70B+13A', label:'BOSS傷害+70%↑ + 物理攻擊力(魔法攻擊力)+13%↑', both:true}, {key:'70B+10A', label:'BOSS傷害+70%↑ + 物理攻擊力(魔法攻擊力)+10%↑', both:true}, {key:'70B', label:'BOSS傷害+70%↑'}, 
            {key:'65B+13A', label:'BOSS傷害+65%↑ + 物理攻擊力(魔法攻擊力)+13%↑', both:true}, {key:'65B+10A', label:'BOSS傷害+65%↑ + 物理攻擊力(魔法攻擊力)+10%↑', both:true}, {key:'65B', label:'BOSS傷害+65%↑'}, 
            {key:'60B+13A', label:'BOSS傷害+60%↑ + 物理攻擊力(魔法攻擊力)+13%↑', both:true}, {key:'60B+10A', label:'BOSS傷害+60%↑ + 物理攻擊力(魔法攻擊力)+10%↑', both:true}, {key:'60B', label:'BOSS傷害+60%↑'} 
        ];
        area.innerHTML = renderTable("武器 (BOSS傷害 & 物理攻擊力(魔法攻擊力)%)", rows);
    } else if (mode === 'emblem_att') {
        let rows = [ 
            ...posRows,
            {key:'2L_Att13', label:'雙排 物理攻擊力(魔法攻擊力)+13%', special:true}, 
            {key:39, label:'物理攻擊力(魔法攻擊力)+39%'}, {key:36, label:'物理攻擊力(魔法攻擊力)+36%↑'}, {key:33, label:'物理攻擊力(魔法攻擊力)+33%↑'}, {key:30, label:'物理攻擊力(魔法攻擊力)+30%↑'}, 
            {key:'26A+40I', label:'物理攻擊力(魔法攻擊力)+26%↑ + 無視防禦+40%↑', both:true}, {key:'26A+35I', label:'物理攻擊力(魔法攻擊力)+26%↑ + 無視防禦+35%↑', both:true}, {key:'26A+30I', label:'物理攻擊力(魔法攻擊力)+26%↑ + 無視防禦+30%↑', both:true}, 
            {key:'23A+40I', label:'物理攻擊力(魔法攻擊力)+23%↑ + 無視防禦+40%↑', both:true}, {key:'23A+35I', label:'物理攻擊力(魔法攻擊力)+23%↑ + 無視防禦+35%↑', both:true}, {key:'23A+30I', label:'物理攻擊力(魔法攻擊力)+23%↑ + 無視防禦+30%↑', both:true}, 
            {key:'20A+40I', label:'物理攻擊力(魔法攻擊力)+20%↑ + 無視防禦+40%↑', both:true}, {key:'20A+35I', label:'物理攻擊力(魔法攻擊力)+20%↑ + 無視防禦+35%↑', both:true}, {key:'20A+30I', label:'物理攻擊力(魔法攻擊力)+20%↑ + 無視防禦+30%↑', both:true} 
        ];
        area.innerHTML = renderTable("徽章 (物理攻擊力(魔法攻擊力)% & 無視防禦)", rows);
    } else if (mode === 'accessory_drop_meso') {
        let toolTipText3L = "可能組合 (達標或超越)：\n道具掉落率% + 道具掉落率% + 道具掉落率%\n楓幣獲得量% + 楓幣獲得量% + 楓幣獲得量%\n道具掉落率% + 道具掉落率% + 楓幣獲得量%\n道具掉落率% + 楓幣獲得量% + 楓幣獲得量%";
        let toolTipHtml3L = ` <div class="tooltip-wrap"><span class="info-icon">ℹ️</span><div class="tooltip-content">${toolTipText3L}</div></div>`;

        let toolTipText2L = "可能組合 (達標或超越)：\n道具掉落率% + 道具掉落率%\n楓幣獲得量% + 楓幣獲得量%\n道具掉落率% + 楓幣獲得量%\n道具掉落率% + 道具掉落率% + 道具掉落率%\n楓幣獲得量% + 楓幣獲得量% + 楓幣獲得量%\n道具掉落率% + 道具掉落率% + 楓幣獲得量%\n道具掉落率% + 楓幣獲得量% + 楓幣獲得量%";
        let toolTipHtml2L = ` <div class="tooltip-wrap"><span class="info-icon">ℹ️</span><div class="tooltip-content">${toolTipText2L}</div></div>`;

        let rows = [ 
            ...posRows,
            {key:'3L_DM', label:`任意三排 道具掉落率% 或 楓幣獲得量%${toolTipHtml3L}`, special:true},
            {key:'3L_Drop', label:'三排 道具掉落率%', special:true},
            {key:'2L_Drop_1L_Meso', label:'兩排 道具掉落率% + 一排 楓幣獲得量%', special:true},
            {key:'2L_DM', label:`任意兩排 道具掉落率% 或 楓幣獲得量%${toolTipHtml2L}`, special:true},
            {key:'2L_Drop', label:'兩排 道具掉落率%', special:true}, 
            {key:'2L_Meso', label:'兩排 楓幣獲得量%', special:true}
        ];
        area.innerHTML = renderTable("飾品 (道具掉落率% & 楓幣獲得量%)", rows);
    } else if (mode === 'all_stat') {
        let rows = [ ...posRows, {key:'2L_All', label:`雙排 ${st.u1}% 全屬性`, special:true} ];
        for(let i=0; i<=3; i++) { let val = st.u1*3 - i*3; rows.push({key: 'All_Tier'+i, label: fmtLabel(val, '全屬性', 'all')}); }
        let pName = document.getElementById('partSelect').options[document.getElementById('partSelect').selectedIndex].text;
        area.innerHTML = renderTable(`${pName} (全屬性)`, rows);
    } else if (mode === 'hp_stat') {
        let rows = [ ...posRows, {key:'2L_HP', label:`雙排 ${st.base}% HP`, special:true} ];
        for(let i=0; i<=3; i++) { let val = st.base*3 - i*3; rows.push({key: 'HP_Tier'+i, label: fmtLabel(val, 'HP', 'hp')}); }
        let pName = document.getElementById('partSelect').options[document.getElementById('partSelect').selectedIndex].text;
        area.innerHTML = renderTable(`${pName} (HP%)`, rows);
    } else {
        let rows = [ ...posRows, {key:'2L_STR', label:`雙排 ${st.base}% 指定主屬`, special:true} ];
        for(let i=0; i<=6; i++) { let val = st.base*3 - i*3; rows.push({key: 'S_Tier'+i, label: fmtLabel(val, '指定主屬', 'str')}); }
        let pName = document.getElementById('partSelect').options[document.getElementById('partSelect').selectedIndex].text;
        area.innerHTML = renderTable(`指定主屬 (${pName})`, rows);
    }
}

updateUI();

// ==========================================
// localStorage 儲存機制
// ==========================================
const _SK13 = 'tool13_settings';

function _save13() {
    localStorage.setItem(_SK13, JSON.stringify({
        partSelect: document.getElementById('partSelect').value,
        modeSelect: document.getElementById('modeSelect').value,
        calcType:   document.getElementById('calcType').value,
        equipLevel: document.getElementById('equipLevel').value,
        iterSelect: document.getElementById('iterSelect').value,
        lockSelect: document.getElementById('lockSelect').value
    }));
}

function _load13() {
    const raw = localStorage.getItem(_SK13);
    if (!raw) return;
    try {
        const s = JSON.parse(raw);
        const set = (id, val) => { if (val !== undefined) { const el = document.getElementById(id); if (el) el.value = val; } };
        set('partSelect', s.partSelect);
        set('calcType',   s.calcType);
        set('equipLevel', s.equipLevel);
        set('iterSelect', s.iterSelect);
        updateUI();
        set('modeSelect', s.modeSelect);
        updateLockOptions();
        set('lockSelect', s.lockSelect);
        renderRankRates();
    } catch(e) {}
}

['partSelect', 'modeSelect', 'calcType', 'equipLevel', 'iterSelect', 'lockSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', _save13);
});

_load13();
