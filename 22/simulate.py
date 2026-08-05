"""
殺人鯨拼圖開箱模擬驗證
與 22/index.html 的理論計算結果對比
"""

import numpy as np
import time

rng = np.random.default_rng()

# ── 機率表 ─────────────────────────────────────────────────────────────
prob_n  = [0.04, 0.04, 0.02, 0.06, 0.05, 0.06, 0.02, 0.06, 0.05, 0.06, 0.02, 0.06]
prob_a  = [0.02, 0.06, 0.02, 0.04, 0.02, 0.06, 0.04, 0.04, 0.04, 0.06, 0.04, 0.02]
prob_t  = [0.10, 0.12, 0.01, 0.08, 0.10, 0.12, 0.015, 0.10, 0.06, 0.07, 0.01, 0.10]
prob_ta = [0.005, 0.015, 0.005, 0.01, 0.005, 0.015, 0.01, 0.01, 0.01, 0.015, 0.01, 0.005]

# ── 攻擊力加成（社群數據）────────────────────────────────────────────────
atk_n  = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
atk_a  = [2, 0, 2, 0, 1, 0, 3, 0, 2, 0, 2, 0]
atk_t  = [3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 3]
atk_ta = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

# ── 分解碎片機率分布（來自網頁機率表）────────────────────────────────────
FRAG_VALS     = np.array([1, 2, 3, 4, 5], dtype=np.int32)
FRAG_N_PROBS  = np.array([0.40, 0.35, 0.10, 0.10, 0.05])  # 一般版 / 真版
FRAG_A_PROBS  = np.array([0.30, 0.35, 0.20, 0.10, 0.05])  # 覺醒版


def run_simulation(target: int, n_sims: int = 20000) -> dict:
    """
    模擬指定目標開箱過程（全部空白開始）

    State: 0=空, 1=持有一般版, 2=持有覺醒版
    優先保留覺醒：持有一般版時若抽到覺醒版 → 升級（分解舊一般版）
    碎片依實際機率分布抽取，非固定期望值。
    """
    if target in (1, 2):
        probs = np.array(prob_n + prob_a, dtype=float)
        atk_norm, atk_awak, set_bonus = atk_n, atk_a, 25
    else:
        probs = np.array(prob_t + prob_ta, dtype=float)
        atk_norm, atk_awak, set_bonus = atk_t, atk_ta, 40

    probs /= probs.sum()

    all_boxes = np.empty(n_sims, dtype=np.int32)
    all_awak  = np.empty(n_sims, dtype=np.int32)
    all_atk   = np.empty(n_sims, dtype=np.float64)
    all_frags = np.empty(n_sims, dtype=np.float64)

    BATCH = 3000  # 預先產生隨機結果批次，減少 Python 呼叫開銷

    for sim in range(n_sims):
        state   = [0] * 12
        boxes   = 0
        frags   = 0
        buf     = rng.choice(24, size=BATCH, p=probs)
        fn_buf  = rng.choice(FRAG_VALS, size=BATCH, p=FRAG_N_PROBS)
        fa_buf  = rng.choice(FRAG_VALS, size=BATCH, p=FRAG_A_PROBS)
        buf_i   = 0

        while True:
            if target in (1, 3) and all(s > 0 for s in state):
                break
            if target in (2, 4) and all(s == 2 for s in state):
                break

            if buf_i >= BATCH:
                buf    = rng.choice(24, size=BATCH, p=probs)
                fn_buf = rng.choice(FRAG_VALS, size=BATCH, p=FRAG_N_PROBS)
                fa_buf = rng.choice(FRAG_VALS, size=BATCH, p=FRAG_A_PROBS)
                buf_i  = 0

            drop     = int(buf[buf_i])
            piece    = drop % 12
            is_awak  = drop >= 12
            boxes   += 1
            cur      = state[piece]

            if cur == 0:
                # 空槽 → 填入（保留，不計入碎片）
                state[piece] = 2 if is_awak else 1

            elif cur == 1 and is_awak:
                # 持有一般版 → 抽到覺醒版 → 升級，分解舊一般版
                frags += int(fn_buf[buf_i])
                state[piece] = 2

            else:
                # 重複或同類 → 直接分解
                frags += int(fa_buf[buf_i]) if is_awak else int(fn_buf[buf_i])

            buf_i += 1

        awakened = sum(1 for s in state if s == 2)
        atk = sum(atk_awak[i] if state[i] == 2 else atk_norm[i] for i in range(12)) + set_bonus

        all_boxes[sim] = boxes
        all_awak[sim]  = awakened
        all_atk[sim]   = atk
        all_frags[sim] = frags

    return {
        'boxes_mean': float(np.mean(all_boxes)),
        'boxes_se':   float(np.std(all_boxes)  / np.sqrt(n_sims)),
        'awak_mean':  float(np.mean(all_awak)),
        'atk_mean':   float(np.mean(all_atk)),
        'atk_se':     float(np.std(all_atk)    / np.sqrt(n_sims)),
        'frags_mean': float(np.mean(all_frags)),
        'frags_se':   float(np.std(all_frags)  / np.sqrt(n_sims)),
    }


NAMES = {
    1: "目標1：湊齊殺人鯨拼圖（不限覺醒，優先保留覺醒）",
    2: "目標2：湊齊覺醒殺人鯨拼圖（全覺醒）",
    3: "目標3：湊齊真殺人鯨拼圖（不限覺醒，優先保留覺醒）",
    4: "目標4：湊齊真覺醒殺人鯨拼圖（全覺醒）",
}

BOX_TYPE = {1: "藍箱", 2: "藍箱", 3: "紫箱", 4: "紫箱"}

N_SIMS = 20000

print("=" * 65)
print(f"  殺人鯨拼圖開箱模擬驗證  ｜  每目標 {N_SIMS:,} 次模擬")
print("  初始狀態：12 部位全空（未持有任何拼圖）")
print("=" * 65)

for t in [1, 2, 3, 4]:
    t0 = time.time()
    r  = run_simulation(t, N_SIMS)
    elapsed = time.time() - t0
    bt = BOX_TYPE[t]

    print(f"\n{NAMES[t]}")
    print(f"  開箱數（{bt}）         : {r['boxes_mean']:.2f}  (誤差 ±{r['boxes_se']:.2f})")
    print(f"  覺醒片數              : {r['awak_mean']:.2f} / 12")
    print(f"  攻擊力(魔力)加成      : +{r['atk_mean']:.2f}  (誤差 ±{r['atk_se']:.2f})")
    print(f"  開箱過程產生碎片      : {r['frags_mean']:.2f}  (誤差 ±{r['frags_se']:.2f})")
    print(f"  耗時: {elapsed:.1f}s")

print("\n" + "=" * 65)
print("  說明：")
print("  - 開箱數 對應網頁「理論平均需要購買並開啟 N 箱」")
print("  - 覺醒片數 對應「預估最終保留 N 個覺醒拼圖」")
print("  - 攻擊力加成 對應「預估合計攻擊力(魔力)：+N」")
print("  - 產生碎片 = 開箱過程中分解掉的碎片總數")
print("    （注意：已持有的拼圖不算，網頁 E_DismantledF 含保留片修正）")
print("=" * 65)
