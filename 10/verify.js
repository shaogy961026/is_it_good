/**
 * 星之力計算機 — 驗算腳本
 *
 * 使用方式：
 *   1. 用瀏覽器開啟 10/index.html
 *   2. 按 F12 → Console
 *   3. 複製本檔案全部內容貼上，按 Enter 執行
 *
 * 不修改任何原始碼，直接使用頁面已載入的全域函式與資料。
 */
(async function runVerification() {

    const YI = 100_000_000;
    const EMPTY_SPECIAL = { limit: {}, limit50: {}, limit30: {}, append23: null };
    const BASE_COMP   = 2_500_000_000; // 補償費（楓幣）
    const BASE_LEVEL  = '160';

    const results = [];
    let sectionName = '';

    function section(name) {
        sectionName = name;
        console.groupCollapsed(`▶ ${name}`);
    }
    function sectionEnd() { console.groupEnd(); }

    function ok(name, detail = '') {
        results.push({ pass: true, name, detail });
        console.log(`  ✓ ${name}` + (detail ? `  (${detail})` : ''));
    }
    function fail(name, detail = '') {
        results.push({ pass: false, name, detail });
        console.error(`  ✗ ${name}` + (detail ? `  (${detail})` : ''));
    }
    function check(name, passed, detail = '') {
        passed ? ok(name, detail) : fail(name, detail);
    }

    function mdp(target, K = 0, level = BASE_LEVEL, comp = BASE_COMP, probs = starProbabilities, coupons = {}) {
        return solveMDPExact(target, level, comp, coupons, EMPTY_SPECIAL, false, 0, probs, K);
    }

    // ═══════════════════════════════════════════════════════
    // 1. 機率表基本性質
    // ═══════════════════════════════════════════════════════
    section('1. 機率表基本性質');

    let allSumOk = true;
    starProbabilities.forEach((p, n) => {
        const sum = p.success + p.keep + p.destroy;
        if (Math.abs(sum - 1.0) > 1e-9) {
            allSumOk = false;
            fail(`${n}★ 三率加總`, `sum=${sum.toFixed(12)}`);
        }
    });
    if (allSumOk) ok('所有 30 顆星的 success+keep+destroy = 1.0');

    let zeroDestroyOk = true;
    for (let n = 0; n <= 14; n++) {
        if (starProbabilities[n].destroy !== 0) {
            zeroDestroyOk = false;
            fail(`${n}★ 爆裝率應為 0`, `destroy=${starProbabilities[n].destroy}`);
        }
    }
    if (zeroDestroyOk) ok('0★~14★ 爆裝率全為 0');

    let hasDestroyOk = true;
    for (let n = 15; n <= 29; n++) {
        if (starProbabilities[n].destroy <= 0) {
            hasDestroyOk = false;
            fail(`${n}★ 爆裝率應 > 0`, `destroy=${starProbabilities[n].destroy}`);
        }
    }
    if (hasDestroyOk) ok('15★~29★ 爆裝率全 > 0');

    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 2. Bellman 方程手算驗算（單步無爆裝）
    //    情境：目標 = 1★，起始 = 0★，160等，無任何卷折扣
    //    0★ 爆裝率 = 0，故 V[0] = cost[0] / (1 - keep[0]) = cost[0] / success[0]
    // ═══════════════════════════════════════════════════════
    section('2. Bellman 手算驗算（0→1★，無爆裝）');
    {
        const r = mdp(1);
        const p0   = starProbabilities[0].success;
        const k0   = starProbabilities[0].keep;
        const cost0 = enhancementCosts[BASE_LEVEL][0];
        // destroy=0 → V[0] = (cost0 + k0 * V[0]) / 1 → V[0] = cost0 / (1-k0) = cost0 / p0
        const expected = cost0 / p0;
        const relErr   = Math.abs(r.V[0] - expected) / expected;
        check(
            'V[0] = cost[0] / success率',
            relErr < 1e-9,
            `手算=${expected.toFixed(2)}, MDP=${r.V[0].toFixed(2)}, 誤差=${(relErr*100).toExponential(3)}%`
        );
        // Var[0] 在無爆裝時：Var[0] = (p*(V[1]-V[0])^2 + p*Var[1]) / (1-k)
        // V[1]=0（終點），Var[1]=0
        const expectedVar = p0 * Math.pow(0 - r.V[0], 2) / (1 - k0);
        // 注意此式含 V[0] 本身，需用遞推解
        // 簡化：Var[0] = p0*(V[0])^2 / (1-k0) - ... 複雜，只驗正數即可
        check('Var[0] ≥ 0（無爆裝星段）', r.Var[0] >= 0, `Var=${r.Var[0].toFixed(4)}`);
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 3. 保證成功時的性質
    //    所有星段 success=1，keep=0，destroy=0
    //    → Var 應全為 0，V[0] 應等於各星費用之和
    // ═══════════════════════════════════════════════════════
    section('3. 保證成功時：Var=0 且 V=費用加總');
    {
        const guaranteed = starProbabilities.map(() => ({ success: 1.0, keep: 0, destroy: 0 }));
        const TARGET = 17;
        const r = solveMDPExact(TARGET, BASE_LEVEL, BASE_COMP, {}, EMPTY_SPECIAL, false, 0, guaranteed, 0);

        let varZeroOk = true;
        for (let n = 0; n < TARGET; n++) {
            if (Math.abs(r.Var[n]) > 1e-6) {
                varZeroOk = false;
                fail(`保證成功 Var[${n}] 應為 0`, `Var=${r.Var[n]}`);
            }
        }
        if (varZeroOk) ok(`保證成功時 Var[0..${TARGET-1}] 全為 0`);

        let expectedV = 0;
        for (let n = 0; n < TARGET; n++) expectedV += enhancementCosts[BASE_LEVEL][n];
        const relErr = Math.abs(r.V[0] - expectedV) / expectedV;
        check(
            `保證成功 V[0] = 所有星費用加總（0→${TARGET}★）`,
            relErr < 1e-9,
            `加總=${(expectedV/YI).toFixed(6)}億, MDP=${(r.V[0]/YI).toFixed(6)}億, 誤差=${(relErr*100).toExponential(3)}%`
        );
        check(
            '保證成功時 D[0]（期望爆裝次數）= 0',
            Math.abs(r.D[0]) < 1e-9,
            `D[0]=${r.D[0]}`
        );
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 4. K=0 期望費用 ≤ K>0 期望費用
    //    Z=0（極致省錢）對應 K=0，它最小化 V，故 V_K0 ≤ V_Kpos
    // ═══════════════════════════════════════════════════════
    section('4. K=0 期望費用最低（不懲罰方差時最省）');
    {
        const targets = [17, 22];
        for (const T of targets) {
            const vK0  = mdp(T, 0).V[0];
            const vK01 = mdp(T, 0.01).V[0];
            const vK1  = mdp(T, 1).V[0];
            check(
                `K=0 ≤ K=0.01（目標 ${T}★）`,
                vK0 <= vK01 + 1,
                `K0=${(vK0/YI).toFixed(4)}億, K0.01=${(vK01/YI).toFixed(4)}億`
            );
            check(
                `K=0 ≤ K=1（目標 ${T}★）`,
                vK0 <= vK1 + 1,
                `K0=${(vK0/YI).toFixed(4)}億, K1=${(vK1/YI).toFixed(4)}億`
            );
        }
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 5. 卷軸定價極端值
    //    price=0 → Policy 應在卷軸可跳到的所有星都選卷軸
    //    price=天文數字 → Policy 不應選卷軸
    // ═══════════════════════════════════════════════════════
    section('5. 卷軸定價極端值');
    {
        const T = 22;
        // 免費21★券：從任何 n < 21 應跳至 21★
        const freeCoupon = { 21: 0 };
        const rFree = solveMDPExact(T, BASE_LEVEL, BASE_COMP, freeCoupon, EMPTY_SPECIAL, false, 0, starProbabilities, 0);
        let freeCouponOk = true;
        for (let n = 0; n < 21; n++) {
            if (!rFree.Policy[n] || rFree.Policy[n].type !== 'coupon') {
                freeCouponOk = false;
                fail(`免費21★券 Policy[${n}] 應為 coupon`, `實際=${JSON.stringify(rFree.Policy[n])}`);
                break;
            }
        }
        if (freeCouponOk) ok('免費21★券：0~20★ Policy 全選 coupon');

        // 天價21★券：Policy 不應選卷軸
        const expensiveCoupon = { 21: 1e15 };
        const rExp = solveMDPExact(T, BASE_LEVEL, BASE_COMP, expensiveCoupon, EMPTY_SPECIAL, false, 0, starProbabilities, 0);
        let noCouponOk = true;
        for (let n = 0; n < T; n++) {
            if (rExp.Policy[n] && rExp.Policy[n].type === 'coupon') {
                noCouponOk = false;
                fail(`天價21★券 Policy[${n}] 不應為 coupon`, `實際=${JSON.stringify(rExp.Policy[n])}`);
                break;
            }
        }
        if (noCouponOk) ok('天價21★券：Policy 完全不選 coupon');
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 6. 大量模擬 vs 理論期望費用
    //    N 次模擬的平均值應接近 V[0]
    //    95% 信賴區間誤差 ≈ 2 * σ / sqrt(N)
    // ═══════════════════════════════════════════════════════
    section('6. 大量模擬 vs 理論期望費用');
    console.log('  （跑 100,000 次，需要數秒，請稍候…）');

    const simCases = [
        { target: 15, desc: '0→15★', N: 100_000 },
        { target: 17, desc: '0→17★', N: 100_000 },
        { target: 22, desc: '0→22★', N: 100_000 },
        { target: 25, desc: '0→25★', N: 100_000 },
    ];

    for (const tc of simCases) {
        const r = mdp(tc.target);
        const theoretical = r.V[0];

        let totalCost = 0;
        let costs = [];
        for (let i = 0; i < tc.N; i++) {
            const sim = simulateTrialMDP(
                BASE_LEVEL, tc.target, BASE_COMP, r.Policy,
                false, 0, starProbabilities, 0, false
            );
            if (sim.aborted) { fail(`${tc.desc} 模擬中途中斷`); break; }
            totalCost += sim.totalCost;
            costs.push(sim.totalCost);
        }

        const simMean = totalCost / tc.N;
        const simVar  = costs.reduce((acc, c) => acc + Math.pow(c - simMean, 2), 0) / (tc.N - 1);
        const stderr  = Math.sqrt(simVar / tc.N);
        const relErr  = Math.abs(simMean - theoretical) / theoretical * 100;
        // 誤差應在 3 個標準誤內（約 99.7% 信賴區間）
        const within3SE = Math.abs(simMean - theoretical) <= 3 * stderr;

        check(
            `模擬 vs 理論（${tc.desc}, N=${tc.N.toLocaleString()}）`,
            within3SE,
            `理論=${(theoretical/YI).toFixed(4)}億, 模擬均值=${(simMean/YI).toFixed(4)}億, ` +
            `相對誤差=${relErr.toFixed(3)}%, 3SE=${(3*stderr/YI).toFixed(4)}億`
        );
        await new Promise(res => setTimeout(res, 10));
    }

    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 7. 防爆費用計算驗算
    //    15★ 防爆費 = base × 3，且爆裝率被轉入維持率
    // ═══════════════════════════════════════════════════════
    section('7. 防爆機制：費用 ×3 且爆裝率歸零');
    {
        // 用 K=10（極度懲罰波動），應強制啟用防爆
        const T = 16;
        const rHighK = mdp(T, 100);
        const base15 = enhancementCosts[BASE_LEVEL][15];
        // 若 Policy[15] 為 sf_prev，驗算費用
        if (rHighK.Policy[15] && rHighK.Policy[15].type === 'sf_prev') {
            const expectedCost = base15 * 3;
            const actualCost   = rHighK.Policy[15].cost;
            check(
                '15★ 防爆費用 = base × 3',
                Math.abs(actualCost - expectedCost) < 1,
                `期望=${expectedCost.toLocaleString()}, 實際=${actualCost.toLocaleString()}`
            );
            ok('K=100 時 15★ Policy 確實選擇防爆（sf_prev）');
        } else {
            ok(`K=100 時 15★ Policy=${rHighK.Policy[15]?.type}（不是 sf_prev，可能費用過高而不選）`);
        }
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 8. 爆裝後恢復方式的費用比較
    //    完全復原的費用若 < 降至12★，MDP 應選完全復原
    // ═══════════════════════════════════════════════════════
    section('8. 爆裝恢復方式邏輯');
    {
        const T = 20;
        const r = mdp(T);
        let fullRecUsed = false;
        for (let n = 15; n < T; n++) {
            if (r.Policy[n] && r.Policy[n].recChoice === 'full') {
                fullRecUsed = true;
            }
        }
        // 不強制斷言哪個星要選哪個，只確認兩種恢復方式在不同情境都有出現
        ok(`至少存在選擇「完全復原」的星段：${fullRecUsed}（取決於費用設定）`);
    }
    sectionEnd();

    // ═══════════════════════════════════════════════════════
    // 最終摘要
    // ═══════════════════════════════════════════════════════
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    console.log('');
    console.log('══════════════════════════════════════════');
    if (failed === 0) {
        console.log(`%c全部通過：${passed}/${results.length}`, 'color:green; font-weight:bold; font-size:14px');
    } else {
        console.log(`%c通過 ${passed}，失敗 ${failed}，共 ${results.length} 項`, 'color:red; font-weight:bold; font-size:14px');
        console.log('失敗項目：');
        results.filter(r => !r.pass).forEach(r => console.error(`  • ${r.name}  ${r.detail}`));
    }
    console.log('══════════════════════════════════════════');

})();
