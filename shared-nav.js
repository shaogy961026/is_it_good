// shared-nav.js (導航列 + 頁尾 + GA + 滿版突破防護 + 恢復原始字體)

document.addEventListener("DOMContentLoaded", function() {

    const currentUrl = window.location.pathname.replace(/\/$/, "");

    // ==========================================
    // 0. 設定 Google Analytics (GA4) 與 SEO 等
    // ==========================================
    const gaMeasurementId = 'G-0EQ26B21GZ'; 
    if (gaMeasurementId && !document.querySelector(`script[src*='${gaMeasurementId}']`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', gaMeasurementId);
    }

    if (!document.title.includes("數位楓水研究室")) {
        document.title = "數位楓水研究室 | " + document.title;
    }

    if (!document.querySelector('script[type="application/ld+json"]')) {
        const siteData = { "@context": "https://schema.org", "@type": "WebSite", "name": "數位楓水研究室", "url": "https://shaogy961026.github.io/" };
        const ldJsonScript = document.createElement('script');
        ldJsonScript.type = 'application/ld+json';
        ldJsonScript.text = JSON.stringify(siteData);
        document.head.appendChild(ldJsonScript);
    }

    // ==========================================
    // 1. 注入強效 CSS 樣式 (導航與頁尾滿版突破)
    // ==========================================
    if (!document.getElementById("global-shared-style")) {
        const styleBlock = document.createElement("style");
        styleBlock.id = "global-shared-style";
        styleBlock.textContent = `
            html { overflow-x: hidden !important; overflow-y: scroll !important; }

            #global-nav {
                width: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background-color: #fff !important;
                border-bottom: 1px solid #ddd !important;
                margin-top: 0 !important;
                margin-bottom: 30px !important;
                padding-top: 15px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                box-sizing: border-box !important;
                z-index: 9999 !important;
            }

            #global-footer {
                width: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background-color: #fff !important;
                border-top: 1px solid #eee !important;
                margin-top: 60px !important;
                padding: 40px 20px !important;
                text-align: center !important;
                box-sizing: border-box !important;
                font-family: sans-serif !important;
                color: #7f8c8d !important;
                line-height: 1.8 !important;
                font-size: 0.9em !important;
            }

            #global-nav > ul {
                width: 100% !important;
                max-width: 1250px !important;
                display: flex !important;
                flex-wrap: wrap !important;
                list-style: none !important;
                padding: 0 15px 20px 15px !important;
                margin: 0 auto !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 6px !important;
                box-sizing: border-box !important;
            }

            #global-nav li { margin: 0 !important; padding: 0 !important; border: none !important; list-style-type: none !important; }

            /* 一般導航按鈕 */
            #global-nav a.nav-btn {
                box-sizing: border-box !important;
                text-decoration: none !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                font-weight: bold !important;
                font-family: sans-serif !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                transition: all 0.2s !important;
                white-space: nowrap !important;
                display: block !important;
                letter-spacing: 0px !important;
                border: none !important;
            }
            #global-nav a.nav-btn.active {
                background-color: #007bff !important; color: white !important;
                box-shadow: 0 2px 4px rgba(0,123,255,0.3) !important;
            }
            #global-nav a.nav-btn.normal {
                background-color: #f0f2f5 !important; color: #4b4f56 !important;
            }
            #global-nav a.nav-btn.normal:hover {
                background-color: #e4e6e9 !important; color: #007bff !important;
            }

            /* 下拉選單容器 */
            #global-nav .nav-dropdown {
                position: relative !important;
            }

            /* 分類按鈕 */
            #global-nav .nav-cat-btn {
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                padding: 8px 14px !important;
                border-radius: 20px !important;
                font-weight: bold !important;
                font-family: sans-serif !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                white-space: nowrap !important;
                cursor: pointer !important;
                background-color: #f0f2f5 !important;
                color: #4b4f56 !important;
                border: none !important;
                transition: all 0.2s !important;
                user-select: none !important;
            }
            #global-nav .nav-cat-btn:hover,
            #global-nav .nav-dropdown.open .nav-cat-btn {
                background-color: #e4e6e9 !important;
                color: #007bff !important;
            }
            #global-nav .nav-cat-btn.has-active {
                background-color: #007bff !important;
                color: white !important;
                box-shadow: 0 2px 4px rgba(0,123,255,0.3) !important;
            }
            #global-nav .nav-cat-btn .nav-arrow {
                font-size: 10px !important;
                transition: transform 0.2s !important;
                display: inline-block !important;
            }
            #global-nav .nav-dropdown.open .nav-cat-btn .nav-arrow {
                transform: rotate(180deg) !important;
            }

            /* 下拉選單 */
            #global-nav .nav-dropdown-menu {
                display: none !important;
                position: absolute !important;
                top: 100% !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background: white !important;
                border: 1px solid #ddd !important;
                border-radius: 10px !important;
                min-width: 210px !important;
                z-index: 10000 !important;
                box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
                padding: 6px 0 !important;
                list-style: none !important;
                margin: 0 !important;
            }
            /* 透明橋接區：填補按鈕與選單之間的空隙，防止 hover 中斷 */
            #global-nav .nav-dropdown-menu::before {
                content: "" !important;
                display: block !important;
                position: absolute !important;
                top: -8px !important;
                left: 0 !important;
                right: 0 !important;
                height: 8px !important;
            }
            #global-nav .nav-dropdown:hover .nav-dropdown-menu,
            #global-nav .nav-dropdown.open .nav-dropdown-menu {
                display: block !important;
            }
            #global-nav .nav-dropdown-menu li {
                padding: 0 !important; margin: 0 !important;
            }
            #global-nav .nav-dropdown-menu a {
                display: block !important;
                padding: 9px 18px !important;
                text-decoration: none !important;
                color: #4b4f56 !important;
                font-size: 13px !important;
                font-family: sans-serif !important;
                white-space: nowrap !important;
                transition: background 0.15s !important;
                border: none !important;
            }
            #global-nav .nav-dropdown-menu a:hover {
                background: #f0f2f5 !important;
                color: #007bff !important;
            }
            #global-nav .nav-dropdown-menu a.active {
                color: #007bff !important;
                font-weight: bold !important;
                background: #e8f0fe !important;
            }

            /* Logo */
            #global-nav img.nav-logo {
                height: 55px !important; width: auto !important; object-fit: contain !important;
                transition: transform 0.2s !important; display: block !important;
            }
            #global-nav a.nav-logo-link {
                text-decoration: none !important; display: flex !important;
                align-items: center !important; margin-bottom: 15px !important;
            }
            #global-nav a.nav-logo-link:hover img.nav-logo { transform: scale(1.03) !important; }
        `;
        document.head.appendChild(styleBlock);
    }

    // ==========================================
    // 2. 建立上方導航列 (Header) 結構
    // ==========================================

    // 自動偵測環境，計算正確的 base path
    // GitHub Pages: /is_it_good/10/  → basePath = /is_it_good/
    // 本地伺服器:   /10/             → basePath = /
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const basePath = (pathSegments[0] === 'is_it_good')
        ? '/is_it_good/'
        : '/';

    function toolUrl(id) { return basePath + id + '/'; }
    function extraUrl(path) { return basePath + path; }

    const NAV_CATEGORIES = [
        {
            name: "星力",
            items: [
                { name: "星力強化計算機", url: toolUrl(10) }
            ]
        },
        {
            name: "卷軸",
            items: [
                { name: "機率型卷軸分析",          url: toolUrl(11) },
                { name: "機率型卷軸複合動態策略",   url: toolUrl(18) },
                { name: "咒文的痕跡動態策略",       url: toolUrl(24) }
            ]
        },
        {
            name: "追加屬性",
            items: [
                { name: "裝備附加屬性(星火)計算機",         url: toolUrl(21) },
                { name: "噴出岩輪迴星火(石板星火)計算機",   url: toolUrl(23) }
            ]
        },
        {
            name: "潛在能力及附加潛在能力",
            items: [
                { name: "閃炫+紅閃分析",            url: toolUrl(13) },
                { name: "珍貴的附加方塊分析",        url: toolUrl(19) },
                { name: "結合方塊/結合附加方塊分析", url: toolUrl(20) }
            ]
        },
        {
            name: "其他",
            items: [
                { name: "內潛最佳策略分析",              url: toolUrl(17) },
                { name: "HEXA屬性策略分析",              url: toolUrl(14) },
                { name: "寶玉加工分析",                  url: toolUrl(15) },
                { name: "寶玉研磨分析",                  url: toolUrl(16) },
                { name: "殺人鯨拼圖期望值分析",          url: toolUrl(22) },
                { name: "API全資料擷取工具",             url: extraUrl('api/') }
            ]
        }
    ];

    const NAV_EXTRAS = [
        { name: "支持本站(贊助及留言板)", url: extraUrl('donate') }
    ];

    function isActive(url) {
        return currentUrl === url.replace(/\/$/, "") ||
               currentUrl.startsWith(url.replace(/\/$/, ""));
    }

    let navContainer = document.getElementById("global-nav");
    if (!navContainer) {
        navContainer = document.createElement("div");
        navContainer.id = "global-nav";
        document.body.prepend(navContainer);
    }

    // Logo
    const logoLink = document.createElement("a");
    logoLink.href = basePath;
    logoLink.className = "nav-logo-link";
    const logoImg = document.createElement("img");
    logoImg.src = basePath + "logo.png";
    logoImg.alt = "數位楓水研究室";
    logoImg.className = "nav-logo";
    logoLink.appendChild(logoImg);

    const navList = document.createElement("ul");

    // 分類下拉選單
    NAV_CATEGORIES.forEach(cat => {
        const li = document.createElement("li");

        if (cat.items.length === 1) {
            // 只有一個工具：直接連結
            const a = document.createElement("a");
            a.textContent = cat.items[0].name;
            a.href = cat.items[0].url;
            a.className = "nav-btn " + (isActive(cat.items[0].url) ? "active" : "normal");
            li.appendChild(a);
        } else {
            // 多個工具：下拉選單
            li.className = "nav-dropdown";
            const hasActiveItem = cat.items.some(item => isActive(item.url));

            const catBtn = document.createElement("span");
            catBtn.className = "nav-cat-btn" + (hasActiveItem ? " has-active" : "");
            const labelSpan = document.createTextNode(cat.name + " ");
            const arrowSpan = document.createElement("span");
            arrowSpan.className = "nav-arrow";
            arrowSpan.textContent = "▾";
            catBtn.appendChild(labelSpan);
            catBtn.appendChild(arrowSpan);

            const dropMenu = document.createElement("ul");
            dropMenu.className = "nav-dropdown-menu";

            cat.items.forEach(item => {
                const menuLi = document.createElement("li");
                const a = document.createElement("a");
                a.textContent = item.name;
                a.href = item.url;
                if (isActive(item.url)) a.className = "active";
                menuLi.appendChild(a);
                dropMenu.appendChild(menuLi);
            });

            li.appendChild(catBtn);
            li.appendChild(dropMenu);

            // 手機點擊展開
            catBtn.addEventListener("click", function(e) {
                e.stopPropagation();
                const isOpen = li.classList.contains("open");
                document.querySelectorAll("#global-nav .nav-dropdown.open")
                    .forEach(el => el.classList.remove("open"));
                if (!isOpen) li.classList.add("open");
            });
        }

        navList.appendChild(li);
    });

    // 額外連結
    NAV_EXTRAS.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.textContent = item.name;
        a.href = item.url;
        a.className = "nav-btn " + (isActive(item.url) ? "active" : "normal");
        li.appendChild(a);
        navList.appendChild(li);
    });

    // 點擊其他地方關閉下拉
    document.addEventListener("click", function() {
        document.querySelectorAll("#global-nav .nav-dropdown.open")
            .forEach(el => el.classList.remove("open"));
    });

    navContainer.innerHTML = "";
    navContainer.appendChild(logoLink);
    navContainer.appendChild(navList);

    // ==========================================
    // 3. 下方頁尾 (Footer) + 自動抓取 GitHub 更新時間
    // ==========================================
    if (currentUrl.endsWith(extraUrl('api').replace(/\/$/, '')) || 
        currentUrl.endsWith(extraUrl('donate').replace(/\/$/, ''))) {
        return; 
    }

    let footer = document.getElementById("global-footer");
    if (!footer) {
        footer = document.createElement("footer");
        footer.id = "global-footer";
        document.body.appendChild(footer);
    }

    footer.innerHTML = `
        <div style="margin-bottom: 25px; color: #1e8e3e; background-color: #e6f4ea; border: 1px solid #cce8d6; padding: 12px 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="font-size: 0.9em; color: #555;">網站最後維護時間：<span id="github-update-time" style="font-weight: bold; color: #333;">抓取中...</span></div>
        </div>
        <p style="margin: 0;">本計算機非官方開發，僅供參考，若有疏漏敬請見諒。<br>詳細計算過程與邏輯皆公開於網頁原始碼 (JavaScript) 中。</p>
        <p style="margin: 15px 0 0 0;">若部分工具需要填寫主屬性與攻擊力的換算或屬性權重，<br>推薦參考 <a href="https://maplescouter.com/" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; font-weight: bold;">Maplescouter</a> 進行數值換算。</p>
        <p style="margin: 15px 0 0 0;"><strong>您的意見對我非常重要！</strong><br>若發現錯誤、有任何疑問或建議，歡迎隨時來信聯繫作者或至留言版留言：<br><a href="mailto:shaogy961026@gmail.com" style="color: #007bff; text-decoration: none; font-weight: bold;">shaogy961026@gmail.com</a></p>
    `;

    const cachedUpdateTime = sessionStorage.getItem('github_update_time');
    if (cachedUpdateTime) {
        document.getElementById('github-update-time').textContent = cachedUpdateTime;
    } else {
        fetch('https://api.github.com/repos/shaogy961026/is_it_good/commits?per_page=1')
            .then(response => response.json())
            .then(data => {
                if (data && data[0] && data[0].commit) {
                    const date = new Date(data[0].commit.committer.date);
                    const formatted = date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    sessionStorage.setItem('github_update_time', formatted);
                    document.getElementById('github-update-time').textContent = formatted;
                } else {
                    document.getElementById('github-update-time').textContent = "近期";
                }
            })
            .catch(() => document.getElementById('github-update-time').textContent = "近期");
    }
});
