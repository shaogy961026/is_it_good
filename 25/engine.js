// ============================================================
// 25/engine.js — 最省洗練路線 DP 引擎
// 機率來源：計算機13 (潛能方塊 DB/DB_MIRROR) + 計算機20 (結合方塊 DB.main)
// 核心：位置敏感值迭代 MDP，不預寫策略，DP 自己找最省路線。
//
// 方塊：
//   violet 閃炫  : 6排挑最佳3排、可放任意位置、整把覆蓋
//   mystic 紅閃  : 鎖任一排(保留)、另2排按"位置傳說率"重洗
//   equal  對等  : 三排全必傳說、整把覆蓋
//   mirror 鏡射  : 專屬池、第2排20%複製第1排、整把覆蓋
//   combine 結合 : 每顆必耗、系統1/3隨機選一排、選中想洗的排才覆蓋(位置無關、15%傳說)
//
// 位置傳說率(閃炫6排): [1,0.2,0.15,1,0.2,0.15]；(紅閃/鏡射3排): [1,0.2,0.05]；對等:[1,1,1]
// ============================================================
(function(global){
'use strict';

// ---------- 計算機13 一般池 DB ----------
const DB = {
  Hat:{den:{Leg:43,Uni:53},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"CD_2",val:2,type:1,wLeg:2,wUni:0},{name:"CD_1",val:1,type:1,wLeg:3,wUni:0},{name:"Decent",val:0,type:20,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:31}]},
  Glove:{den:{Leg:42,Uni:57},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"CritD",val:1,type:1,wLeg:4,wUni:0},{name:"Decent",val:0,type:20,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:35}]},
  Weapon:{den:{Leg:45,Uni:46},pool:[{name:"Att_13",val:13,type:1,wLeg:2,wUni:0},{name:"Att_10",val:10,type:1,wLeg:0,wUni:3},{name:"Boss_40",val:40,type:1,wLeg:2,wUni:0},{name:"Boss_35",val:35,type:1,wLeg:4,wUni:0},{name:"Boss_30",val:30,type:1,wLeg:0,wUni:3},{name:"Ign_40",val:40,type:1,wLeg:3,wUni:0},{name:"Ign_35",val:35,type:1,wLeg:3,wUni:0},{name:"Ign_30",val:30,type:1,wLeg:0,wUni:4},{name:"OtherStats",val:0,type:1,wLeg:31,wUni:36}]},
  Emblem:{den:{Leg:39,Uni:43},pool:[{name:"Att_13",val:13,type:1,wLeg:2,wUni:0},{name:"Att_10",val:10,type:1,wLeg:0,wUni:3},{name:"Ign_40",val:40,type:1,wLeg:3,wUni:0},{name:"Ign_35",val:35,type:1,wLeg:3,wUni:0},{name:"Ign_30",val:30,type:1,wLeg:0,wUni:4},{name:"OtherStats",val:0,type:1,wLeg:31,wUni:36}]},
  Accessory:{den:{Leg:41,Uni:41},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"Drop",val:0,type:1,wLeg:3,wUni:0},{name:"Meso",val:0,type:1,wLeg:3,wUni:0},{name:"OtherStats",val:0,type:1,wLeg:24,wUni:34}]},
  Top:{den:{Leg:41,Uni:63},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"InvincDur",val:0,type:21,wLeg:3,wUni:4},{name:"InvincCh",val:0,type:41,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:43}]},
  Bottom:{den:{Leg:35,Uni:55},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"Decent",val:0,type:20,wLeg:0,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:10},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:31}]},
  Shoes:{den:{Leg:38,Uni:53},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"Decent",val:0,type:20,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:31}]},
  Cape:{den:{Leg:35,Uni:49},pool:[{name:"STR",val:0,type:1,wLeg:4,wUni:5},{name:"HP",val:0,type:1,wLeg:4,wUni:6},{name:"All",val:0,type:1,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:16,wUni:31}]}
};

// ---------- 計算機13 鏡射專用池 ----------
const DB_MIRROR = {
  Hat:{den:{Leg:32,Uni:35},pool:[{name:"STR",val:0,type:1,wLeg:2,wUni:2},{name:"HP",val:0,type:1,wLeg:2,wUni:2},{name:"All",val:0,type:1,wLeg:2,wUni:2},{name:"CD_2",val:2,type:1,wLeg:2,wUni:0},{name:"CD_1",val:1,type:1,wLeg:3,wUni:0},{name:"Decent",val:0,type:20,wLeg:3,wUni:1},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:10,wUni:20}]},
  Glove:{den:{Leg:31,Uni:39},pool:[{name:"STR",val:0,type:1,wLeg:2,wUni:2},{name:"HP",val:0,type:1,wLeg:2,wUni:2},{name:"All",val:0,type:1,wLeg:2,wUni:2},{name:"CritD",val:1,type:1,wLeg:4,wUni:0},{name:"Decent",val:0,type:20,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:10,wUni:21}]},
  Weapon:{den:{Leg:36,Uni:37},pool:[{name:"Att_13",val:13,type:1,wLeg:1,wUni:0},{name:"Att_10",val:10,type:1,wLeg:0,wUni:1},{name:"Boss_40",val:40,type:1,wLeg:1,wUni:0},{name:"Boss_35",val:35,type:1,wLeg:2,wUni:0},{name:"Boss_30",val:30,type:1,wLeg:0,wUni:2},{name:"Ign_40",val:40,type:1,wLeg:2,wUni:0},{name:"Ign_35",val:35,type:1,wLeg:2,wUni:0},{name:"Ign_30",val:30,type:1,wLeg:0,wUni:2},{name:"OtherStats",val:0,type:1,wLeg:28,wUni:32}]},
  Emblem:{den:{Leg:33,Uni:35},pool:[{name:"Att_13",val:13,type:1,wLeg:1,wUni:0},{name:"Att_10",val:10,type:1,wLeg:0,wUni:1},{name:"Ign_40",val:40,type:1,wLeg:2,wUni:0},{name:"Ign_35",val:35,type:1,wLeg:2,wUni:0},{name:"Ign_30",val:30,type:1,wLeg:0,wUni:2},{name:"OtherStats",val:0,type:1,wLeg:28,wUni:32}]},
  Accessory:{den:{Leg:30,Uni:23},pool:[{name:"STR",val:0,type:1,wLeg:2,wUni:2},{name:"HP",val:0,type:1,wLeg:2,wUni:2},{name:"All",val:0,type:1,wLeg:2,wUni:2},{name:"Drop",val:0,type:1,wLeg:3,wUni:0},{name:"Meso",val:0,type:1,wLeg:3,wUni:0},{name:"OtherStats",val:0,type:1,wLeg:18,wUni:17}]},
  Top:{den:{Leg:30,Uni:45},pool:[{name:"STR",val:0,type:1,wLeg:2,wUni:2},{name:"HP",val:0,type:1,wLeg:2,wUni:2},{name:"All",val:0,type:1,wLeg:2,wUni:2},{name:"InvincDur",val:0,type:21,wLeg:3,wUni:4},{name:"InvincCh",val:0,type:41,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:10,wUni:23}]},
  Bottom:{den:{Leg:12,Uni:37},pool:[{name:"STR",val:0,type:1,wLeg:1,wUni:2},{name:"HP",val:0,type:1,wLeg:1,wUni:2},{name:"All",val:0,type:1,wLeg:1,wUni:2},{name:"Decent",val:0,type:20,wLeg:0,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:4,wUni:10},{name:"OtherStats",val:0,type:1,wLeg:5,wUni:17}]},
  Shoes:{den:{Leg:27,Uni:35},pool:[{name:"STR",val:0,type:1,wLeg:2,wUni:2},{name:"HP",val:0,type:1,wLeg:2,wUni:2},{name:"All",val:0,type:1,wLeg:2,wUni:2},{name:"Decent",val:0,type:20,wLeg:3,wUni:4},{name:"IgnoreDmg",val:0,type:40,wLeg:8,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:10,wUni:17}]},
  Cape:{den:{Leg:12,Uni:31},pool:[{name:"STR",val:0,type:1,wLeg:1,wUni:2},{name:"HP",val:0,type:1,wLeg:1,wUni:2},{name:"All",val:0,type:1,wLeg:1,wUni:2},{name:"IgnoreDmg",val:0,type:40,wLeg:4,wUni:8},{name:"OtherStats",val:0,type:1,wLeg:5,wUni:17}]}
};

// ---------- 計算機20 結合方塊 DB.main (原始萬分比) ----------
const COMB_LEG_W = 0.15, COMB_UNI_W = 0.85;
const COMB = {
  // 部位 -> {leg:[[name,permille],...], uni:[...]}
  Hat:{leg:[["CD_2s",1111],["CD_1s",1111],["Skill",1250],["STR%",556],["DEX%",556],["INT%",556],["LUK%",556],["HP%",556],["MP%",1111],["All%",139],["IgnoreDmg",1250],["IgnoreDmg",1250]],
       uni:[["Skill",1311],["STR%",656],["DEX%",656],["INT%",656],["LUK%",656],["HP%",656],["MP%",1311],["All%",164],["IgnoreDmg",1311],["IgnoreDmg",1311],["HPrec",1311]]},
  Glove:{leg:[["CritD",339],["Skill",1356],["STR%",678],["DEX%",678],["INT%",678],["LUK%",678],["HP%",678],["MP%",1695],["All%",169],["IgnoreDmg",1525],["IgnoreDmg",1525]],
         uni:[["STR",575],["DEX",575],["INT",575],["LUK",575],["Skill",920],["STR%",575],["DEX%",575],["INT%",575],["LUK%",575],["HP%",575],["MP%",920],["All%",115],["IgnoreDmg",920],["IgnoreDmg",920],["HPrec",1034]]},
  Weapon:{leg:[["Att%",324],["Matt%",324],["TotalDmg%",1618],["Ign35",2589],["Ign40",1618],["Boss35",518],["Boss40",113],["Crit%",2104],["Att",113],["Matt",113],["STR%",113],["DEX%",113],["INT%",113],["LUK%",113],["All%",113]],
          uni:[["Att%",822],["Matt%",822],["TotalDmg%",1644],["Ign30",2055],["Boss30",548],["Crit%",2740],["STR%",274],["DEX%",274],["INT%",274],["LUK%",274],["All%",274]]},
  Emblem:{leg:[["Att%",345],["Matt%",345],["TotalDmg%",1727],["Ign35",2763],["Ign40",1727],["Crit%",2245],["Att",121],["Matt",121],["STR%",121],["DEX%",121],["INT%",121],["LUK%",121],["All%",121]],
          uni:[["Att%",870],["Matt%",870],["TotalDmg%",1739],["Ign30",2174],["Crit%",2899],["STR%",290],["DEX%",290],["INT%",290],["LUK%",290],["All%",290]]},
  Accessory:{leg:[["STR%",702],["DEX%",702],["INT%",702],["LUK%",702],["HP%",702],["MP%",1404],["All%",175],["MPcost",1404],["MPcost",1404],["Meso",1053],["Drop",1053]],
             uni:[["STR%",1351],["DEX%",1351],["INT%",1351],["LUK%",1351],["HP%",1351],["MP%",1351],["All%",270],["HPrec",1622]]},
  Top:{leg:[["Invinc",1379],["Invinc",1379],["STR%",690],["DEX%",690],["INT%",690],["LUK%",690],["HP%",690],["MP%",1207],["All%",172],["IgnoreDmg",1207],["IgnoreDmg",1207]],
       uni:[["Invinc",889],["Invinc",889],["Reflect",1000],["Reflect",1000],["STR%",444],["DEX%",444],["INT%",444],["LUK%",444],["HP%",444],["MP%",889],["All%",111],["IgnoreDmg",1000],["IgnoreDmg",1000],["HPrec",1000]]},
  // 下衣/鞋子/披風(通用防具) 用對應池
  Bottom:{leg:[["STR%",1026],["DEX%",1026],["INT%",1026],["LUK%",1026],["HP%",1026],["MP%",1538],["All%",256],["IgnoreDmg",1538],["IgnoreDmg",1538]],
          uni:[["Skill",1250],["STR%",714],["DEX%",714],["INT%",714],["LUK%",714],["HP%",714],["MP%",1250],["All%",179],["IgnoreDmg",1250],["IgnoreDmg",1250],["HPrec",1250]]},
  Shoes:{leg:[["Skill",1250],["STR%",833],["DEX%",833],["INT%",833],["LUK%",833],["HP%",833],["MP%",1458],["All%",208],["IgnoreDmg",1458],["IgnoreDmg",1458]],
         uni:[["Skill",1000],["STR%",714],["DEX%",714],["INT%",714],["LUK%",714],["HP%",714],["MP%",1286],["All%",143],["IgnoreDmg",1286],["IgnoreDmg",1286],["HPrec",1429]]},
  Cape:{leg:[["STR%",1026],["DEX%",1026],["INT%",1026],["LUK%",1026],["HP%",1026],["MP%",1538],["All%",769],["IgnoreDmg",1282],["IgnoreDmg",1282]],
        uni:[["STR%",877],["DEX%",877],["INT%",877],["LUK%",877],["HP%",877],["MP%",1228],["All%",175],["IgnoreDmg",1404],["IgnoreDmg",1404],["HPrec",1404]]},
  Emblem_:{} // placeholder
};
// 徽章結合池沿用 Emblem；飾品/防具已列。combine 不含部分部位時 fallback 用 Accessory/Cape。

// ---------- 等級參數 ----------
function statConfig(level){ const base = (level==='150')?12:13; return {base:base, u1:base-3, u2:base-6}; }

// ============================================================
// 目標定義：每個部位有一組可選目標。每個目標給 evaluate(tiers) 判定達標，
// 以及把詞條映射成 tier 的函式 tierOf(name,val, rank, level)。
// 我們用統一抽象：一排的"等級" lvl ∈ {0無效, 1,2,3,...}，各目標自己定義。
// DP 以 tier 陣列(排序或位置敏感)運作。
// ============================================================

// 把一個部位的 pool 轉成「單排洗一次得到各 tier 的機率(給定傳說率 r)」
// tierFn(item, rank) 回傳該詞條的 tier(整數, 0=無效) 或 null(視為無效)
// rank: 'Leg' or 'Uni'
function lineTierDist(pool, den, tierFn, r, maxTier){
  // 回傳長度 maxTier+1 的陣列, index=tier, 值=機率
  // 分母 = max(該 rank 權重總和, den)。計算機13 的池是權重展開陣列, 不足 den 才補 Junk,
  //   故實際抽樣分母 = max(權重和, den)。直接用 den 會在"權重和>den"的部位(如飾品罕見49>41)算錯。
  const out = new Array(maxTier+1).fill(0);
  const wsum = {Leg:0, Uni:0};
  pool.forEach(p=>{ wsum.Leg+=(p.wLeg||0); wsum.Uni+=(p.wUni||0); });
  const divLeg = Math.max(wsum.Leg, den.Leg);
  const divUni = Math.max(wsum.Uni, den.Uni);
  const addRank = (rank, rankProb)=>{
    if(rankProb<=0) return;
    const div = rank==='Leg'?divLeg:divUni;
    pool.forEach(p=>{
      const w = (rank==='Leg'?p.wLeg:p.wUni)||0;
      if(w<=0) return;
      const t = tierFn(p, rank);
      if(t && t>=1 && t<=maxTier) out[t]+= rankProb*(w/div);
    });
    // 其餘(含分母殘量 + 無效詞條) 歸 tier0
  };
  // 先全部當 tier0, 再把有效的加上去; tier0 = 1 - Σ有效
  addRank('Leg', r);
  addRank('Uni', 1-r);
  let eff=0; for(let i=1;i<=maxTier;i++) eff+=out[i];
  out[0]=1-eff;
  return out;
}

// 結合池 → 單排洗一次 tier 機率(位置無關, 15%/85%)
// combTierFn(name) 回傳 tier(需配合 rank: leg詞條/uni詞條各自的數值不同時, 由目標映射處理)
function combLineTierDist(combPart, legTierFn, uniTierFn, maxTier){
  const out=new Array(maxTier+1).fill(0);
  const sum=arr=>arr.reduce((a,b)=>a+b[1],0);
  const legTot=sum(combPart.leg), uniTot=sum(combPart.uni);
  combPart.leg.forEach(([n,w])=>{ const t=legTierFn(n); if(t&&t>=1&&t<=maxTier) out[t]+=COMB_LEG_W*(w/legTot); });
  combPart.uni.forEach(([n,w])=>{ const t=uniTierFn(n); if(t&&t>=1&&t<=maxTier) out[t]+=COMB_UNI_W*(w/uniTot); });
  let eff=0; for(let i=1;i<=maxTier;i++) eff+=out[i];
  out[0]=1-eff;
  return out;
}

global.MapleDP = { DB, DB_MIRROR, COMB, COMB_LEG_W, COMB_UNI_W, statConfig, lineTierDist, combLineTierDist };

})(typeof window!=='undefined'?window:globalThis);

// ============================================================
// 目標規格 (GOALS)
// 每個目標產生一個 spec:
//   maxTier: 最高 tier 編號
//   potTierFn(item, rank, st): 一般池/鏡射池 詞條 → tier
//   combLegFn(name)/combUniFn(name): 結合池 傳說/罕見詞條 → tier
//   reached(sortedTiers): 達標判定(傳入排序或位置陣列, 見 solver)
//   needPos: 是否位置敏感(武器頂%/次頂等需要, 一般加總型不需要但位置敏感不影響正確性)
//   label, desc
// tier 語意由各目標自訂; solver 只看 reached。
// ============================================================
(function(global){
'use strict';
const E = global.MapleDP;

// ---- 工具: 主屬/HP/全屬 的 tier（階差，數值每降一階 tier+1）----
// 對 STR(主屬): Leg=base, Uni=u1; tier: base→0階... 用 (base - val)/3
// 對 HP: Leg=base, Uni=u1
// 對 All: Leg=u1, Uni=u2
function statVal(item, rank, st){
  // 回傳該詞條在該 rank 的實際數值(%), 非目標詞條回 null
  const n=item.name;
  if(n==='STR') return rank==='Leg'?st.base:st.u1;
  if(n==='HP')  return rank==='Leg'?st.base:st.u1;
  if(n==='All') return rank==='Leg'?st.u1:st.u2;
  return null;
}

// 建立「主屬類」目標(STR/HP/All) — 達標 = 三排全有效且階差合計<=門檻 (對齊計算機13的加總門檻)
// kind: 'STR'|'HP'|'All' ; thresh: 0=頂%, 1=次頂, 2=次次頂
// 注意：保留的頂/次頂/次次頂門檻(0/1/2)下，「加總門檻」等價於「三排全有效+階差合計<=門檻」
//   (廢排湊不出高門檻)，故此處用與等級無關的階差模型，結果與計算機13的 sumS>=base*3-thresh*3 一致。
// 重要：主屬(STR)目標把全屬(All)折進主屬(全屬能加主屬)；全屬目標只認全屬；HP 只認 HP。
//   主屬階差: STR-Leg=0, STR-Uni=1, All-Leg=1(u1=主屬次級), All-Uni=2(u2)
//   全屬階差: All-Leg=0, All-Uni=1 ; HP 階差: HP-Leg=0, HP-Uni=1
// tier 編碼(主屬): 1=階差0, 2=階差1, 3=階差2 (maxTier=3); (全屬/HP): 1=階差0, 2=階差1 (maxTier=2)
function makeStatGoal(kind, thresh, label){
  if(kind==='STR'){
    return {
      kind:'stat', statName:'STR', thresh, label, maxTier:3,
      potTierFn(item, rank){
        if(item.name==='STR') return rank==='Leg'?1:2;      // base(階差0) / u1(階差1)
        if(item.name==='All') return rank==='Leg'?2:3;      // u1(階差1) / u2(階差2) 全屬折進主屬
        return 0;
      },
      combLegFn(name){ if(name==='STR%') return 1; if(name==='All%') return 2; return 0; }, // 傳說池: 主屬階差0, 全屬階差1
      combUniFn(name){ if(name==='STR%') return 2; if(name==='All%') return 3; return 0; }, // 罕見池: 主屬階差1, 全屬階差2
      reachedTiers(tiers){ if(!tiers.every(t=>t>=1)) return false; let d=0; for(const t of tiers) d+=(t-1); return d<=thresh; }
    };
  }
  // 全屬 / HP：單一屬性，頂=階差0、次=階差1
  return {
    kind:'stat', statName:kind, thresh, label, maxTier:2,
    potTierFn(item, rank){ if(item.name!==kind) return 0; return rank==='Leg'?1:2; },
    combLegFn(name){ return (name===(kind+'%'))?1:0; },
    combUniFn(name){ return (name===(kind+'%'))?2:0; },
    reachedTiers(tiers){ if(!tiers.every(t=>t>=1)) return false; let d=0; for(const t of tiers) d+=(t-1); return d<=thresh; }
  };
}

// 武器 BOSS/物攻 目標(頂%/次頂/次次頂)
function makeWeaponGoal(thresh, label){
  // tier: 0無效, 1=階差0(Boss40/Att13), 2=階差1(Boss35/Att10), 3=階差2(Boss30)
  return {
    kind:'weapon', thresh, label, maxTier:3,
    potTierFn(item){
      const n=item.name;
      if(n==='Boss_40'||n==='Att_13') return 1;
      if(n==='Boss_35'||n==='Att_10') return 2;
      if(n==='Boss_30') return 3;
      return 0;
    },
    combLegFn(name){ if(name==='Boss40'||name==='Att%') return 1; if(name==='Boss35') return 2; return 0; },
    combUniFn(name){ if(name==='Att%') return 2; if(name==='Boss30') return 3; return 0; },
    reachedTiers(tiers){
      if(!tiers.every(t=>t>=1)) return false;
      let d=0; for(const t of tiers) d+=(t-1);
      return d<=thresh;
    }
  };
}

// 徽章 物攻% 目標(頂%/次頂/次次頂) — 徽章只有物攻, 無 Boss
function makeEmblemGoal(thresh, label){
  return {
    kind:'emblem', thresh, label, maxTier:2, // 1=Att13, 2=Att10 (徽章無更低階)
    potTierFn(item){ if(item.name==='Att_13') return 1; if(item.name==='Att_10') return 2; return 0; },
    combLegFn(name){ if(name==='Att%') return 1; return 0; },
    combUniFn(name){ if(name==='Att%') return 2; return 0; },
    reachedTiers(tiers){ if(!tiers.every(t=>t>=1)) return false; let d=0; for(const t of tiers)d+=(t-1); return d<=thresh; }
  };
}

// 飾品 掉寶/楓幣 目標 — 只有一階(有/無), 達標 = N 排命中
function makeDropMesoGoal(need, which, label){
  // which: 'Drop'|'Meso'|'Any'
  const match=(n)=> which==='Any'? (n==='Drop'||n==='Meso') : n===which;
  const matchComb=(n)=> which==='Any'? (n==='Drop'||n==='Meso') : n===which;
  return {
    kind:'dropmeso', need, label, maxTier:1,
    potTierFn(item){ return match(item.name)?1:0; },
    combLegFn(name){ return matchComb(name)?1:0; },
    combUniFn(name){ return 0; }, // 結合罕見池 掉寶/楓幣 僅在傳說池
    reachedTiers(tiers){ return tiers.filter(t=>t>=1).length>=need; }
  };
}

// 帽子 CD 目標 — CD_2=2秒, CD_1=1秒; 達標 = 總秒數>=門檻
function makeCDGoal(sec, label){
  return {
    kind:'cd', sec, label, maxTier:2, // 1=CD_2(2秒), 2=CD_1(1秒)
    potTierFn(item){ if(item.name==='CD_2') return 1; if(item.name==='CD_1') return 2; return 0; },
    combLegFn(name){ if(name==='CD_2s') return 1; if(name==='CD_1s') return 2; return 0; },
    combUniFn(name){ return 0; },
    reachedTiers(tiers){ let s=0; for(const t of tiers){ if(t===1)s+=2; else if(t===2)s+=1; } return s>=sec; }
  };
}

// 帽子 CD + 一排指定屬性 — 達標 = CD總秒數>=sec 且 至少一排該屬性達指定等級
// extra: 'STR'(主屬) | 'HP' | 'All'(全屬)
// want: 'top'(頂級) | 'sub'(次級以上, 含頂級)
// tier: 1=CD_2(2秒), 2=CD_1(1秒), 3=屬性頂級, 4=屬性次級, 0=其他
// 屬性頂/次的數值分級: STR/HP → 頂=base, 次=u1；All → 頂=u1, 次=u2
function makeCDPlusGoal(sec, extra, want, label){
  return {
    kind:'cdplus', sec, extra, want, label, maxTier:4,
    potTierFn(item, rank, st){
      if(item.name==='CD_2') return 1;
      if(item.name==='CD_1') return 2;
      if(item.name===extra){
        const top = extra==='All' ? st.u1 : st.base;
        const v = extra==='All' ? (rank==='Leg'?st.u1:st.u2) : (rank==='Leg'?st.base:st.u1);
        return v===top ? 3 : 4; // 傳說=頂級(3), 罕見=次級(4)
      }
      // 主屬目標：全屬折進主屬。All-Leg(u1)=主屬次級→4；All-Uni(u2)低於次級→不計
      if(extra==='STR' && item.name==='All') return rank==='Leg' ? 4 : 0;
      return 0;
    },
    combLegFn(name){ // 結合傳說池: CD / 屬性頂級
      if(name==='CD_2s') return 1; if(name==='CD_1s') return 2;
      if(extra==='STR' && name==='STR%') return 3;
      if(extra==='STR' && name==='All%') return 4; // 全屬傳說=u1=主屬次級
      if(extra==='HP' && name==='HP%') return 3;
      if(extra==='All' && name==='All%') return 3;
      return 0;
    },
    combUniFn(name){ // 結合罕見池: 屬性次級
      if(extra==='STR' && name==='STR%') return 4;
      // 全屬罕見=u2 低於主屬次級→不計 (extra==='STR' 時 All% 不給分)
      if(extra==='HP' && name==='HP%') return 4;
      if(extra==='All' && name==='All%') return 4;
      return 0;
    },
    reachedTiers(tiers){
      let s=0, hasExtra=false;
      for(const t of tiers){
        if(t===1)s+=2; else if(t===2)s+=1;
        else if(t===3) hasExtra=true;              // 頂級一律算
        else if(t===4 && want==='sub') hasExtra=true; // 次級只在"次級以上"目標算
      }
      return s>=sec && hasExtra;
    }
  };
}

// 帽子 CD-2秒(佔1排) + 剩兩排指定屬性 — 達標 = 一排 CD-2秒 且 另兩排皆為該屬性，階差合計<=thresh
// -2CD 只佔一排，剩兩排都要湊屬性。頂(thresh0)=兩排皆頂；次(thresh1)=一頂一次(含兩頂)
// extra: 'STR'|'HP'|'All' ; 屬性頂/次數值: STR/HP → 頂=base,次=u1；All → 頂=u1,次=u2
// tier: 1=CD_2(2秒), 2=CD_1(1秒), 3=屬性頂級, 4=屬性次級, 0=其他
function makeCD2TwoStatGoal(extra, thresh, label){
  return {
    kind:'cd2stat', extra, thresh, label, maxTier:4,
    potTierFn(item, rank, st){
      if(item.name==='CD_2') return 1;
      if(item.name==='CD_1') return 2;
      if(item.name===extra){
        const top = extra==='All' ? st.u1 : st.base;
        const v = extra==='All' ? (rank==='Leg'?st.u1:st.u2) : (rank==='Leg'?st.base:st.u1);
        return v===top ? 3 : 4;
      }
      // 主屬目標：全屬折進主屬。All-Leg(u1)=主屬次級→4；All-Uni(u2)低於次級→不計
      if(extra==='STR' && item.name==='All') return rank==='Leg' ? 4 : 0;
      return 0;
    },
    combLegFn(name){
      if(name==='CD_2s') return 1; if(name==='CD_1s') return 2;
      if(extra==='STR' && name==='STR%') return 3;
      if(extra==='STR' && name==='All%') return 4; // 全屬傳說=u1=主屬次級
      if(extra==='HP' && name==='HP%') return 3;
      if(extra==='All' && name==='All%') return 3;
      return 0;
    },
    combUniFn(name){
      if(extra==='STR' && name==='STR%') return 4;
      // 全屬罕見=u2 低於主屬次級→不計
      if(extra==='HP' && name==='HP%') return 4;
      if(extra==='All' && name==='All%') return 4;
      return 0;
    },
    reachedTiers(tiers){
      let cdSum=0; const defs=[];
      for(const t of tiers){
        if(t===1)cdSum+=2; else if(t===2)cdSum+=1;
        else if(t===3)defs.push(0); else if(t===4)defs.push(1);
      }
      if(defs.length<2) return false;           // 必須至少兩排屬性
      defs.sort((a,b)=>a-b);
      const bestTwo=defs[0]+defs[1];            // 取階差最小的兩排
      return cdSum>=2 && bestTwo<=thresh;       // 一排 CD-2秒 + 兩排屬性(階差合計達標)
    }
  };
}

// 手套 爆傷 目標 — 達標 = N 排爆傷
function makeCritGoal(need, label){
  return {
    kind:'crit', need, label, maxTier:1,
    potTierFn(item){ return item.name==='CritD'?1:0; },
    combLegFn(name){ return name==='CritD'?1:0; },
    combUniFn(name){ return 0; },
    reachedTiers(tiers){ return tiers.filter(t=>t>=1).length>=need; }
  };
}

// 手套 爆傷 + 一排指定屬性 — 達標 = N排爆傷 且 至少一排該屬性達指定等級
// extra: 'STR'|'HP'|'All' ; want: 'top'(頂級) | 'sub'(次級以上, 含頂級)
// tier: 1=爆傷, 3=屬性頂級, 4=屬性次級, 0=其他
// 屬性頂/次的數值分級: STR/HP → 頂=base, 次=u1；All → 頂=u1, 次=u2
function makeCritPlusGoal(need, extra, want, label){
  return {
    kind:'critplus', need, extra, want, label, maxTier:4,
    potTierFn(item, rank, st){
      if(item.name==='CritD') return 1;
      if(item.name===extra){
        const top = extra==='All' ? st.u1 : st.base;
        const v = extra==='All' ? (rank==='Leg'?st.u1:st.u2) : (rank==='Leg'?st.base:st.u1);
        return v===top ? 3 : 4;
      }
      // 主屬目標：全屬折進主屬。All-Leg(u1)=主屬次級→4；All-Uni(u2)低於次級→不計
      if(extra==='STR' && item.name==='All') return rank==='Leg' ? 4 : 0;
      return 0;
    },
    combLegFn(name){
      if(name==='CritD') return 1;
      if(extra==='STR' && name==='STR%') return 3;
      if(extra==='STR' && name==='All%') return 4; // 全屬傳說=u1=主屬次級
      if(extra==='HP' && name==='HP%') return 3;
      if(extra==='All' && name==='All%') return 3;
      return 0;
    },
    combUniFn(name){
      if(extra==='STR' && name==='STR%') return 4;
      // 全屬罕見=u2 低於主屬次級→不計
      if(extra==='HP' && name==='HP%') return 4;
      if(extra==='All' && name==='All%') return 4;
      return 0;
    },
    reachedTiers(tiers){
      let crit=0, hasExtra=false;
      for(const t of tiers){
        if(t===1)crit++;
        else if(t===3) hasExtra=true;
        else if(t===4 && want==='sub') hasExtra=true;
      }
      return crit>=need && hasExtra;
    }
  };
}

// ---- 各部位可選目標清單 ----
// 回傳 [{id, build:(st)=>spec}]
const GOALS = {
  Weapon:[
    {id:'w_top', name:'頂%', build:()=>makeWeaponGoal(0,'頂%')},
    {id:'w_near', name:'次頂', build:()=>makeWeaponGoal(1,'次頂')},
    {id:'w_near2', name:'次次頂', build:()=>makeWeaponGoal(2,'次次頂')},
  ],
  Emblem:[
    {id:'e_top', name:'頂%', build:()=>makeEmblemGoal(0,'頂%')},
    {id:'e_near', name:'次頂', build:()=>makeEmblemGoal(1,'次頂')},
    {id:'e_near2', name:'次次頂', build:()=>makeEmblemGoal(2,'次次頂')},
  ],
  Hat:[
    {id:'cd6', name:'CD -6秒', build:()=>makeCDGoal(6,'CD-6秒')},
    {id:'cd5', name:'CD -5秒', build:()=>makeCDGoal(5,'CD-5秒')},
    {id:'cd4', name:'CD -4秒', build:()=>makeCDGoal(4,'CD-4秒')},
    {id:'cd4_str_top', name:'CD -4秒 + 頂主屬', build:()=>makeCDPlusGoal(4,'STR','top','CD-4秒+頂主屬')},
    {id:'cd4_str_sub', name:'CD -4秒 + 次主屬', build:()=>makeCDPlusGoal(4,'STR','sub','CD-4秒+次主屬')},
    {id:'cd4_hp_top', name:'CD -4秒 + 頂HP', build:()=>makeCDPlusGoal(4,'HP','top','CD-4秒+頂HP')},
    {id:'cd4_hp_sub', name:'CD -4秒 + 次HP', build:()=>makeCDPlusGoal(4,'HP','sub','CD-4秒+次HP')},
    {id:'cd4_all_top', name:'CD -4秒 + 頂全屬', build:()=>makeCDPlusGoal(4,'All','top','CD-4秒+頂全屬')},
    {id:'cd4_all_sub', name:'CD -4秒 + 次全屬', build:()=>makeCDPlusGoal(4,'All','sub','CD-4秒+次全屬')},
    {id:'cd2_str_top', name:'CD -2秒 + 兩排頂主屬', build:()=>makeCD2TwoStatGoal('STR',0,'CD-2秒+兩排頂主屬')},
    {id:'cd2_str_sub', name:'CD -2秒 + 兩排主屬(含次)', build:()=>makeCD2TwoStatGoal('STR',1,'CD-2秒+兩排主屬(含次)')},
    {id:'cd2_hp_top', name:'CD -2秒 + 兩排頂HP', build:()=>makeCD2TwoStatGoal('HP',0,'CD-2秒+兩排頂HP')},
    {id:'cd2_hp_sub', name:'CD -2秒 + 兩排HP(含次)', build:()=>makeCD2TwoStatGoal('HP',1,'CD-2秒+兩排HP(含次)')},
    {id:'cd2_all_top', name:'CD -2秒 + 兩排頂全屬', build:()=>makeCD2TwoStatGoal('All',0,'CD-2秒+兩排頂全屬')},
    {id:'cd2_all_sub', name:'CD -2秒 + 兩排全屬(含次)', build:()=>makeCD2TwoStatGoal('All',1,'CD-2秒+兩排全屬(含次)')},
    {id:'str_top', name:'指定主屬 頂%', build:()=>makeStatGoal('STR',0,'主屬頂%')},
    {id:'str_near', name:'指定主屬 次頂', build:()=>makeStatGoal('STR',1,'主屬次頂')},
    {id:'str_near2', name:'指定主屬 次次頂', build:()=>makeStatGoal('STR',2,'主屬次次頂')},
    {id:'hp_top', name:'HP% 頂%', build:()=>makeStatGoal('HP',0,'HP頂%')},
    {id:'hp_near', name:'HP% 次頂', build:()=>makeStatGoal('HP',1,'HP次頂')},
    {id:'hp_near2', name:'HP% 次次頂', build:()=>makeStatGoal('HP',2,'HP次次頂')},
  ],
  Glove:[
    {id:'crit3', name:'三排爆傷', build:()=>makeCritGoal(3,'三排爆傷')},
    {id:'crit2_str_top', name:'兩排爆傷 + 頂主屬', build:()=>makeCritPlusGoal(2,'STR','top','兩排爆傷+頂主屬')},
    {id:'crit2_str_sub', name:'兩排爆傷 + 次主屬', build:()=>makeCritPlusGoal(2,'STR','sub','兩排爆傷+次主屬')},
    {id:'crit2_hp_top', name:'兩排爆傷 + 頂HP', build:()=>makeCritPlusGoal(2,'HP','top','兩排爆傷+頂HP')},
    {id:'crit2_hp_sub', name:'兩排爆傷 + 次HP', build:()=>makeCritPlusGoal(2,'HP','sub','兩排爆傷+次HP')},
    {id:'crit2_all_top', name:'兩排爆傷 + 頂全屬', build:()=>makeCritPlusGoal(2,'All','top','兩排爆傷+頂全屬')},
    {id:'crit2_all_sub', name:'兩排爆傷 + 次全屬', build:()=>makeCritPlusGoal(2,'All','sub','兩排爆傷+次全屬')},
    // 手套只保留有爆傷的目標；純主屬/HP/全屬無爆傷組合不列
  ],
  Accessory:[
    {id:'drop3', name:'掉寶三排', build:()=>makeDropMesoGoal(3,'Drop','掉寶三排')},
    {id:'meso3', name:'楓幣三排', build:()=>makeDropMesoGoal(3,'Meso','楓幣三排')},
    {id:'dm_any2', name:'掉寶/楓幣 兩排', build:()=>makeDropMesoGoal(2,'Any','掉寶楓幣兩排')},
    {id:'str_top', name:'指定主屬 頂%', build:()=>makeStatGoal('STR',0,'主屬頂%')},
    {id:'str_near', name:'指定主屬 次頂', build:()=>makeStatGoal('STR',1,'主屬次頂')},
    {id:'str_near2', name:'指定主屬 次次頂', build:()=>makeStatGoal('STR',2,'主屬次次頂')},
    {id:'hp_top', name:'HP% 頂%', build:()=>makeStatGoal('HP',0,'HP頂%')},
    {id:'hp_near', name:'HP% 次頂', build:()=>makeStatGoal('HP',1,'HP次頂')},
    {id:'hp_near2', name:'HP% 次次頂', build:()=>makeStatGoal('HP',2,'HP次次頂')},
  ],
};
// 防具類(帽子以外的 Top/Bottom/Shoes/Cape) 共用主屬/HP/全屬 頂%/次頂/次次頂目標
['Top','Bottom','Shoes','Cape'].forEach(part=>{
  GOALS[part]=[
    {id:'str_top', name:'指定主屬 頂%', build:()=>makeStatGoal('STR',0,'主屬頂%')},
    {id:'str_near', name:'指定主屬 次頂', build:()=>makeStatGoal('STR',1,'主屬次頂')},
    {id:'str_near2', name:'指定主屬 次次頂', build:()=>makeStatGoal('STR',2,'主屬次次頂')},
    {id:'hp_top', name:'HP% 頂%', build:()=>makeStatGoal('HP',0,'HP頂%')},
    {id:'hp_near', name:'HP% 次頂', build:()=>makeStatGoal('HP',1,'HP次頂')},
    {id:'hp_near2', name:'HP% 次次頂', build:()=>makeStatGoal('HP',2,'HP次次頂')},
    {id:'all_top', name:'全屬性% 頂%', build:()=>makeStatGoal('All',0,'全屬頂%')},
    {id:'all_near', name:'全屬性% 次頂', build:()=>makeStatGoal('All',1,'全屬次頂')},
    {id:'all_near2', name:'全屬性% 次次頂', build:()=>makeStatGoal('All',2,'全屬次次頂')},
  ];
});

// 部位中文名
const PART_NAMES = {Weapon:'武器/輔助武器', Emblem:'徽章', Hat:'帽子', Glove:'手套', Accessory:'飾品(墜飾/戒指/臉飾/眼飾/耳環)', Top:'上衣/套服', Bottom:'下衣', Shoes:'鞋子', Cape:'披風/腰帶/肩膀/心臟/胸章'};
// 結合池部位對應(有些部位結合池 fallback)
const COMB_MAP = {Weapon:'Weapon', Emblem:'Emblem', Hat:'Hat', Glove:'Glove', Accessory:'Accessory', Top:'Top', Bottom:'Bottom', Shoes:'Shoes', Cape:'Cape'};

E.GOALS=GOALS; E.PART_NAMES=PART_NAMES; E.COMB_MAP=COMB_MAP; E.makeStatGoal=makeStatGoal;

})(typeof window!=='undefined'?window:globalThis);

// ============================================================
// DP SOLVER (位置敏感值迭代, 不預寫策略)
// ============================================================
(function(global){
'use strict';
const E = global.MapleDP;

const RATES = {
  violet:[1,0.2,0.15,1,0.2,0.15],
  mystic:[1,0.2,0.05],
  equal:[1,1,1],
  mirror:[1,0.2,0.05]
};

// 給定部位+目標+等級, 預算各方塊「單排洗一次 tier 機率」
// 一般池(violet/mystic/equal)用 DB; 鏡射用 DB_MIRROR; 結合用 COMB
function buildTierDists(part, spec, level){
  const st = E.statConfig(level);
  const maxT = spec.maxTier;
  const dbN = E.DB[part], dbM = E.DB_MIRROR[part];
  const tierOfN = (item,rank)=> spec.potTierFn(item,rank,st);

  // 一般池 單排(傳說率r) tier 機率
  const normLine = (r)=> E.lineTierDist(dbN.pool, dbN.den, tierOfN, r, maxT);
  const mirrorLine = (r)=> E.lineTierDist(dbM.pool, dbM.den, (item,rank)=>spec.potTierFn(item,rank,st), r, maxT);

  // 結合池 單排 tier 機率
  const combPart = E.COMB[E.COMB_MAP[part]] || E.COMB.Accessory;
  const combLine = E.combLineTierDist(combPart,
      (name)=>spec.combLegFn(name,st), (name)=>spec.combUniFn(name,st), maxT);

  return {st, maxT, normLine, mirrorLine, combLine};
}

// 位置敏感狀態: 3 排 tier, 值 0..maxT。key = 字串
// 整洗型(violet/equal/mirror)產生"3排 tier 多重集"分佈, DP 轉到最佳位置排列。
// violet 6排挑最佳3排(tier 越高越好? 不一定 — reached 決定, 但一般"階差小=tier小=好"對 stat/weapon;
//   對 dropmeso/crit/cd 則 tier1 才是好。統一用"對 reached 最有利"— 但挑排需要啟發式。
//   做法: 挑排時用 spec 提供的 rank 分數 goodness(tier): tier 離達標越近越高。
// 我們用通用 goodness: 對 reached 而言, 哪個 tier 更好? 用"該 tier 的達成貢獻"排序。
// 簡化且正確: 列舉時直接保留 3 排的多重集, 由 DP 的 V 決定最佳位置; 挑排(6選3)則枚舉 C(6,3) 取 min V。
function solve(part, spec, level, costs, allowMystic){
  const T = buildTierDists(part, spec, level);
  const maxT = T.maxT;
  const nStates = Math.pow(maxT+1,3);
  const idx = (a,b,c)=> a*(maxT+1)*(maxT+1)+b*(maxT+1)+c;
  const decode = (i)=>{ const c=i%(maxT+1); i=(i-c)/(maxT+1); const b=i%(maxT+1); const a=(i-b)/(maxT+1); return [a,b,c]; };
  const reached = (s)=> spec.reachedTiers(s);

  // 預算整洗型多重集分佈(排序後 key) : violet / equal / mirror
  // 用遞迴枚舉各排 tier
  function buildWhole(rates, lineOf, mirror){
    const dist={}; const n=rates.length;
    const t=new Array(n).fill(0);
    const vecs=rates.map(r=>lineOf(r));
    function add(a3,p){ const srt=[...a3].sort((x,y)=>x-y).join(''); dist[srt]=(dist[srt]||0)+p; }
    function rec(i,prob){
      if(prob<1e-12) return;
      if(i===n){
        if(mirror){ const b=t.slice(0,3); add(b,prob*0.8); add([b[0],b[0],b[2]],prob*0.2); }
        else if(n===6){ add(pickBest3(t),prob); }
        else add(t.slice(0,3),prob);
        return;
      }
      for(let v=0;v<=maxT;v++){ if(vecs[i][v]>0){ t[i]=v; rec(i+1,prob*vecs[i][v]); } }
    }
    rec(0,1); return dist;
  }
  // 6選3: 枚舉 C(6,3), 取"最好"3排。好壞由最終 V 決定, 但這裡還沒有 V。
  // 折衷: 挑排時以 reached 導向 — 盡量讓 reached 成立; 否則挑 tier 分佈最可能有用的。
  // 做法: 枚舉所有 C(6,3) 組合, 回傳"排序後多重集"中, 之後由 DP whole 轉移時對每個多重集取最佳位置。
  //   但 6選3 必須在此刻決定留哪 3 排。為正確, 我們改為: buildWhole for violet 枚舉 6 排後,
  //   對 C(6,3) 全組合各取其多重集, 選"V 最小"者 — 需要 V。故 violet 用 lazy: 存"6排多重集", 轉移時再挑。
  // 簡化(且實務正確): 挑排啟發式 = 讓達標貢獻最大。我們用一個 goodness(tier) 分數:
  //   跑一次"貪婪 reached 傾向"排序。但不同目標 tier 好壞不同。
  //   通用解: goodness(tier) = -(到該目標的"階差權重"). 由 spec 提供 tierGoodness, 預設 tier 小者好(stat/weapon),
  //   但 dropmeso/crit/cd 的 tier1 才好。改用: 命中(tier>=1 且是目標)一律好, 其中 tier 小更好。
  function tierGoodness(tier){
    if(tier===0) return 0;          // 無效最差
    return (maxT+1) - tier;         // tier 越小分數越高(頂級最好)
  }
  function pickBest3(six){
    const arr=[...six].sort((x,y)=> tierGoodness(y)-tierGoodness(x)).slice(0,3);
    return arr;
  }

  const WD = {
    violet: buildWhole(RATES.violet, T.normLine, false),
    equal:  buildWhole(RATES.equal,  T.normLine, false),
    mirror: buildWhole(RATES.mirror, T.mirrorLine, true)
  };

  // ---- 預計算所有狀態的解碼 & 達標 ----
  const DEC=new Array(nStates), REACH=new Uint8Array(nStates);
  for(let i=0;i<nStates;i++){ const s=decode(i); DEC[i]=s; REACH[i]=reached(s)?1:0; }

  const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

  // 整洗型: 多重集 → [{cands:[候選state], p}] (迭代時取 V 最小候選), 預計算候選清單
  function compileWhole(dist){
    const entries=[];
    for(const mk in dist){
      const b=mk.split('').map(Number);
      const seen={}, cands=[];
      for(const pm of perms){ const kk=idx(b[pm[0]],b[pm[1]],b[pm[2]]); if(!seen[kk]){seen[kk]=1;cands.push(kk);} }
      entries.push({cands, p:dist[mk]});
    }
    return entries;
  }
  const WHOLE={ violet:compileWhole(WD.violet), equal:compileWhole(WD.equal), mirror:compileWhole(WD.mirror) };

  // 紅閃/結合: 轉移與 V 無關 → 預計算每 state 的 {selfP, trans:[{k,p}]}
  function compileMystic(lock){
    const cache=new Array(nStates);
    for(let i=0;i<nStates;i++){
      if(REACH[i]) continue;
      const s=DEC[i]; const o=[0,1,2].filter(x=>x!==lock);
      const vA=T.normLine(RATES.mystic[o[0]]), vB=T.normLine(RATES.mystic[o[1]]);
      const agg={};
      for(let x=0;x<=maxT;x++)for(let y=0;y<=maxT;y++){ if(vA[x]<=0||vB[y]<=0)continue; const ns=s.slice(); ns[o[0]]=x; ns[o[1]]=y; const k=idx(ns[0],ns[1],ns[2]); agg[k]=(agg[k]||0)+vA[x]*vB[y]; }
      const selfP=agg[i]||0; const trans=[];
      for(const k in agg){ if(+k!==i) trans.push({k:+k,p:agg[k]}); }
      cache[i]={selfP, trans};
    }
    return cache;
  }
  function compileComb(W){
    const cache=new Array(nStates);
    for(let i=0;i<nStates;i++){
      if(REACH[i]) continue;
      const s=DEC[i]; const agg={};
      for(let pos=0;pos<3;pos++){
        if(W.indexOf(pos)>=0){ for(let t=0;t<=maxT;t++){ const ns=s.slice(); ns[pos]=t; const k=idx(ns[0],ns[1],ns[2]); agg[k]=(agg[k]||0)+(1/3)*T.combLine[t]; } }
        else { agg[i]=(agg[i]||0)+1/3; }
      }
      const selfP=agg[i]||0; const trans=[];
      for(const k in agg){ if(+k!==i) trans.push({k:+k,p:agg[k]}); }
      cache[i]={selfP, trans};
    }
    return cache;
  }
  const combWsets=[]; for(let m=1;m<8;m++) combWsets.push([0,1,2].filter(p=>m&(1<<p)));
  const MYST = allowMystic ? [compileMystic(0),compileMystic(1),compileMystic(2)] : null;
  const COMBC = combWsets.map(W=>compileComb(W));

  // V 值迭代 (Gauss-Seidel 原地更新, 收斂快)
  const V=new Float64Array(nStates).fill(1e15);
  const POL=new Array(nStates).fill(null);
  for(let i=0;i<nStates;i++){ if(REACH[i]) V[i]=0; }

  function wholeCost(i, c, entries){
    let selfP=0, acc=0;
    for(let e=0;e<entries.length;e++){
      const cands=entries[e].cands, p=entries[e].p;
      let bv=V[cands[0]], bk=cands[0];
      for(let j=1;j<cands.length;j++){ const kk=cands[j]; if(V[kk]<bv){bv=V[kk];bk=kk;} }
      if(bk===i) selfP+=p; else acc+=p*bv;
    }
    if(selfP>0.9999999) return 1e15;
    return (c+acc)/(1-selfP);
  }
  function fixCost(i, c, cell){
    if(!cell || cell.selfP>0.9999999) return 1e15;
    let acc=0; const tr=cell.trans;
    for(let j=0;j<tr.length;j++) acc+=tr[j].p*V[tr[j].k];
    return (c+acc)/(1-cell.selfP);
  }

  // 某方塊成本為 null/undefined/非正數 視為「停用」(使用者留空=不使用)
  const on = (c)=> (typeof c==='number' && isFinite(c) && c>0);
  const useV=on(costs.violet), useE=on(costs.equal), useMi=on(costs.mirror), useMy=allowMystic&&on(costs.mystic), useC=on(costs.combine);

  for(let iter=0;iter<6000;iter++){
    let delta=0;
    for(let i=0;i<nStates;i++){
      if(REACH[i]){ V[i]=0; continue; }
      let best=1e15, act=null;
      if(useV){ let cc=wholeCost(i,costs.violet,WHOLE.violet); if(cc<best){best=cc;act={type:'violet'};} }
      if(useE){ let cc=wholeCost(i,costs.equal,WHOLE.equal); if(cc<best){best=cc;act={type:'equal'};} }
      if(useMi){ let cc=wholeCost(i,costs.mirror,WHOLE.mirror); if(cc<best){best=cc;act={type:'mirror'};} }
      if(useMy){ for(let L=0;L<3;L++){ let cc=fixCost(i,costs.mystic,MYST[L][i]); if(cc<best){best=cc;act={type:'mystic',lock:L};} } }
      if(useC){ for(let w=0;w<combWsets.length;w++){ let cc=fixCost(i,costs.combine,COMBC[w][i]); if(cc<best){best=cc;act={type:'combine',W:combWsets[w]};} } }
      const d=Math.abs(best-V[i]); if(d>delta) delta=d;
      V[i]=best; POL[i]=act;
    }
    if(delta<0.005) break;
  }

  return {V, POL, maxT, idx, decode, reached, start:idx(0,0,0)};
}

E.solve = solve;
E.RATES = RATES;

})(typeof window!=='undefined'?window:globalThis);

// ============================================================
// 操作指引輔助：把 POL 動作翻成人話，並產生「代表性狀態 → 做什麼」的指引表
// ============================================================
(function(global){
'use strict';
const E = global.MapleDP;

const CUBE_NAME = {violet:'閃炫方塊', mystic:'紅閃', equal:'新對等方塊', mirror:'閃耀鏡射方塊', combine:'結合方塊'};

// 把 tier 轉成該目標的人話描述。傳入 st(等級數值)時會標出實際 % 數值。
function tierLabel(spec, tier, st){
  if(tier===0) return '無用';
  // 屬性名+頂/次對應的實際%：主屬(STR)頂=base,次=u1,第三=u2；HP 頂=base,次=u1；全屬 頂=u1,次=u2
  const statName={HP:'HP',All:'全屬',STR:'主屬'};
  function statPct(extra, lvl){ // lvl: 'top'|'sub'|'t3'
    if(!st) return '';
    const v = extra==='All'
      ? (lvl==='top'?st.u1:(lvl==='sub'?st.u2:0))
      : (lvl==='top'?st.base:(lvl==='sub'?st.u1:st.u2));
    return v? (' '+v+'%') : '';
  }
  if(spec.kind==='weapon'){ return ({1:'BOSS40/物攻13',2:'BOSS35/物攻10',3:'BOSS30'})[tier]||('t'+tier); }
  if(spec.kind==='emblem'){ return ({1:'物攻13%',2:'物攻10%'})[tier]||('t'+tier); }
  if(spec.kind==='stat'){
    const ex=spec.statName; const nm=statName[ex]||'主屬';
    const m={1:nm+statPct(ex,'top'),2:nm+statPct(ex,'sub'),3:nm+statPct(ex,'t3')};
    return m[tier]||('t'+tier);
  }
  if(spec.kind==='cd'){ return ({1:'CD-2秒',2:'CD-1秒'})[tier]||('t'+tier); }
  if(spec.kind==='cdplus'){ const ex=spec.extra, nm=statName[ex]||'主屬'; return ({1:'CD-2秒',2:'CD-1秒',3:nm+statPct(ex,'top'),4:nm+statPct(ex,'sub')})[tier]||('t'+tier); }
  if(spec.kind==='cd2stat'){ const ex=spec.extra, nm=statName[ex]||'主屬'; return ({1:'CD-2秒',2:'CD-1秒',3:nm+statPct(ex,'top'),4:nm+statPct(ex,'sub')})[tier]||('t'+tier); }
  if(spec.kind==='crit') return '爆傷';
  if(spec.kind==='critplus'){ const ex=spec.extra, nm=statName[ex]||'主屬'; return ({1:'爆傷',3:nm+statPct(ex,'top'),4:nm+statPct(ex,'sub')})[tier]||('t'+tier); }
  if(spec.kind==='dropmeso') return '目標詞條';
  return 't'+tier;
}

// 把一個狀態的三排 tier 描述成「目前裝備長相」
function stateDesc(spec, tiers){
  const parts = tiers.map((t,i)=>'第'+(i+1)+'排:'+tierLabel(spec,t));
  return parts.join('、');
}

// 把動作翻成人話(含紅閃鎖哪排、結合洗哪些排)
function actionDesc(spec, act){
  if(!act) return '—';
  if(act.type==='violet') return '用【閃炫方塊】整把重洗，6排挑最好的3排（可任意放位置）';
  if(act.type==='equal')  return '用【新對等方塊】整把重洗（三排全保證傳說）';
  if(act.type==='mirror') return '用【閃耀鏡射方塊】整把重洗（第2排有20%複製第1排）';
  if(act.type==='mystic') return '用【紅閃】鎖住第'+(act.lock+1)+'排（保留它），重洗另外兩排';
  if(act.type==='combine'){
    const pos=act.W.map(x=>'第'+(x+1)+'排').join('、');
    return '用【結合方塊】：系統每顆隨機選一排，只有選到 '+pos+' 時才洗（選到其他排就不洗、但方塊仍消耗）';
  }
  return act.type;
}

// 產生「關鍵決策指引」：列出從空白到達標會遇到的代表狀態與對應動作
// 做法: 從 start 出發, 列出所有"可能遇到且策略不同"的狀態分組(用動作簽名歸類)
function buildGuide(res, spec){
  const {V, POL, maxT, idx, decode, reached, start} = res;
  const n=Math.pow(maxT+1,3);
  // 收集所有非達標狀態, 依"排序後 tier 多重集 + 動作類型"做代表, 避免 27/64 條全列
  const seen=new Set();
  const rows=[];
  for(let i=0;i<n;i++){
    const s=decode(i);
    if(reached(s)) continue;
    if(V[i]>=1e14) continue;
    const srt=[...s].sort((a,b)=>a-b).join('');
    const act=POL[i];
    const sig=srt+'|'+(act?act.type+(act.lock!=null?act.lock:'')+(act.W?act.W.join(''):''):'');
    if(seen.has(sig)) continue;
    seen.add(sig);
    rows.push({ tiers:s, sorted:srt, act, cost:V[i] });
  }
  // 依成本(越接近達標成本越低)排序, 讓"快完成"的狀態在後
  rows.sort((a,b)=> b.cost-a.cost);
  return rows;
}

E.CUBE_NAME=CUBE_NAME;
E.tierLabel=tierLabel; E.stateDesc=stateDesc; E.actionDesc=actionDesc; E.buildGuide=buildGuide;

})(typeof window!=='undefined'?window:globalThis);
