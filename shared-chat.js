// shared-chat.js — 公開聊天室
// 所有頁面自動掛載，透過 shared-nav.js 載入

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════
  //  設定區
  // ═══════════════════════════════════════════════════
  var FIREBASE_CONFIG = {
    apiKey:            'AIzaSyDRvxzpvfrjdI8mJetr072BwotqFs1M3NI',
    authDomain:        'maple-84f2a.firebaseapp.com',
    databaseURL:       'https://maple-84f2a-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId:         'maple-84f2a',
    storageBucket:     'maple-84f2a.firebasestorage.app',
    messagingSenderId: '1056854283228',
    appId:             '1:1056854283228:web:0749fe19670a4fac9b7519'
  };

  var FB_VER   = '12.18.0';
  var MAX_MSGS = 50;
  var RATE_MS  = 5000;

  // ═══════════════════════════════════════════════════
  //  狀態變數
  // ═══════════════════════════════════════════════════
  var db         = null;
  var myUid      = null;
  var isAdmin    = false;
  var adminUids  = {};        // 從 Firebase 讀取的版主 UID 集合
  var lastSentAt = 0;
  var unread     = 0;
  var isOpen     = false;
  var isReady    = false;
  var authReady  = false;     // Firebase 匿名登入是否完成

  // 秘密啟動：點標題連續 5 下
  var titleClickCount = 0;
  var titleClickTimer = null;

  // ═══════════════════════════════════════════════════
  //  工具頁名稱
  // ═══════════════════════════════════════════════════
  var PAGE_MAP = {
    '/10': '星力強化計算機',
    '/11': '機率型卷軸分析',
    '/12': '超越等級箱子實驗室',
    '/13': '閃炫+紅閃分析',
    '/14': 'HEXA屬性策略分析',
    '/15': '寶玉加工分析',
    '/16': '寶玉研磨分析',
    '/17': '內潛最佳策略分析',
    '/18': '機率型卷軸複合動態策略',
    '/19': '珍貴的附加方塊分析',
    '/20': '結合方塊/結合附加方塊分析',
    '/21': '裝備附加屬性(星火)計算機',
    '/22': '殺人鯨拼圖期望值分析',
    '/23': '噴出岩輪迴星火(石板星火)計算機',
    '/24': '咒文的痕跡動態策略',
    '/api': 'API全資料擷取工具',
    '/donate': '贊助及留言板'
  };
  function getPageName() {
    var p = window.location.pathname;
    for (var k in PAGE_MAP) {
      if (Object.prototype.hasOwnProperty.call(PAGE_MAP, k) && p.indexOf(k) !== -1) return PAGE_MAP[k];
    }
    return '首頁';
  }

  // ═══════════════════════════════════════════════════
  //  CSS
  // ═══════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('chat-css')) return;
    var s = document.createElement('style');
    s.id = 'chat-css';
    s.textContent = '\
#chat-fab{\
  position:fixed!important;bottom:24px!important;right:24px!important;\
  width:52px!important;height:52px!important;border-radius:50%!important;\
  background:#0f766e!important;color:#fff!important;border:none!important;\
  cursor:pointer!important;font-size:26px!important;\
  display:flex!important;align-items:center!important;justify-content:center!important;\
  box-shadow:0 4px 16px rgba(15,118,110,.5)!important;\
  z-index:99990!important;transition:transform .2s,box-shadow .2s!important;\
  padding:0!important;line-height:1!important;\
}\
#chat-fab:hover{transform:scale(1.08)!important;box-shadow:0 6px 22px rgba(15,118,110,.65)!important;}\
#chat-badge{\
  position:absolute!important;top:-5px!important;right:-5px!important;\
  background:#ef4444!important;color:#fff!important;\
  border-radius:9999px!important;font-size:11px!important;font-weight:700!important;\
  min-width:19px!important;height:19px!important;display:none!important;\
  align-items:center!important;justify-content:center!important;\
  padding:0 4px!important;font-family:"Noto Sans TC",sans-serif!important;\
  box-shadow:0 1px 4px rgba(0,0,0,.25)!important;\
}\
#chat-win{\
  position:fixed!important;bottom:88px!important;right:24px!important;\
  width:360px!important;height:510px!important;\
  background:#fff!important;border-radius:16px!important;\
  box-shadow:0 8px 40px rgba(15,118,110,.2)!important;\
  z-index:99989!important;display:none!important;flex-direction:column!important;\
  overflow:hidden!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
  border:1px solid #e2e8f0!important;\
}\
#chat-win.open{display:flex!important;}\
#chat-hd{\
  background:#0f766e!important;color:#fff!important;\
  padding:12px 16px!important;font-weight:700!important;\
  display:flex!important;align-items:center!important;\
  justify-content:space-between!important;flex-shrink:0!important;\
}\
#chat-hd-l{display:flex!important;align-items:center!important;gap:9px!important;}\
#chat-dot{\
  width:8px!important;height:8px!important;background:#4ade80!important;\
  border-radius:50%!important;flex-shrink:0!important;\
}\
#chat-title-wrap{display:flex!important;flex-direction:column!important;gap:2px!important;}\
#chat-title{\
  font-size:15px!important;font-weight:700!important;\
  cursor:default!important;user-select:none!important;line-height:1.3!important;\
}\
#chat-subtitle{\
  font-size:10px!important;font-weight:400!important;\
  opacity:.75!important;line-height:1.3!important;\
}\
#chat-hd-r{display:flex!important;gap:6px!important;align-items:center!important;}\
.chat-hd-btn{\
  background:rgba(255,255,255,.2)!important;border:none!important;color:#fff!important;\
  border-radius:6px!important;padding:4px 8px!important;cursor:pointer!important;\
  font-size:13px!important;transition:background .15s!important;line-height:1.4!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
}\
.chat-hd-btn:hover{background:rgba(255,255,255,.32)!important;}\
#chat-msgs{\
  flex:1!important;overflow-y:auto!important;padding:12px!important;\
  display:flex!important;flex-direction:column!important;gap:8px!important;\
  background:#f8fafc!important;\
}\
#chat-msgs::-webkit-scrollbar{width:4px!important;}\
#chat-msgs::-webkit-scrollbar-thumb{background:#cbd5e1!important;border-radius:2px!important;}\
.cmsg{\
  display:flex!important;flex-direction:column!important;\
  max-width:82%!important;gap:3px!important;\
}\
.cmsg.me{align-self:flex-end!important;align-items:flex-end!important;}\
.cmsg.them{align-self:flex-start!important;align-items:flex-start!important;}\
.cmeta{\
  font-size:11px!important;color:#94a3b8!important;\
  display:flex!important;align-items:center!important;gap:5px!important;\
  flex-wrap:wrap!important;\
}\
.cnick{font-weight:600!important;color:#64748b!important;font-size:12px!important;}\
.cadmin-badge{\
  background:linear-gradient(135deg,#f59e0b,#d97706)!important;\
  color:#fff!important;font-size:10px!important;\
  padding:1px 6px!important;border-radius:4px!important;\
  font-weight:700!important;letter-spacing:.3px!important;\
}\
.cpage{\
  background:#ccfbf1!important;color:#0f766e!important;\
  font-size:10px!important;padding:1px 6px!important;\
  border-radius:4px!important;font-weight:600!important;\
}\
.cbubble{\
  padding:8px 12px!important;border-radius:12px!important;\
  font-size:13px!important;line-height:1.55!important;\
  word-break:break-word!important;position:relative!important;\
}\
.me .cbubble{\
  background:#0f766e!important;color:#fff!important;\
  border-bottom-right-radius:4px!important;\
}\
.them .cbubble{\
  background:#fff!important;color:#1e293b!important;\
  border:1px solid #e2e8f0!important;\
  border-bottom-left-radius:4px!important;\
  box-shadow:0 1px 3px rgba(0,0,0,.05)!important;\
}\
/* 版主訊息：金色外框 */\
.cmsg.is-admin-msg.them .cbubble{\
  border:1.5px solid #f59e0b!important;\
  background:#fffbeb!important;\
  box-shadow:0 1px 6px rgba(245,158,11,.15)!important;\
}\
.cmsg.is-admin-msg.me .cbubble{\
  background:linear-gradient(135deg,#0f766e,#134e4a)!important;\
  box-shadow:0 2px 10px rgba(15,118,110,.4)!important;\
}\
/* 刪除按鈕 */\
.cdel{\
  position:absolute!important;top:-6px!important;right:-6px!important;\
  background:#ef4444!important;border:none!important;color:#fff!important;\
  border-radius:50%!important;width:16px!important;height:16px!important;\
  cursor:pointer!important;font-size:9px!important;padding:0!important;\
  display:none!important;align-items:center!important;justify-content:center!important;\
  line-height:1!important;box-shadow:0 1px 3px rgba(0,0,0,.2)!important;\
}\
.cdel:hover{background:#dc2626!important;}\
.admin-on .cdel{display:flex!important;}\
.csys{\
  text-align:center!important;font-size:12px!important;color:#94a3b8!important;\
  padding:10px!important;font-style:italic!important;width:100%!important;\
  box-sizing:border-box!important;\
}\
/* 進場提示橫幅 */\
#chat-welcome{\
  background:#f0fdfa!important;border-bottom:1px solid #99f6e4!important;\
  padding:8px 12px!important;font-size:11.5px!important;color:#0f766e!important;\
  line-height:1.5!important;flex-shrink:0!important;\
}\
#chat-ft{\
  padding:10px 12px!important;border-top:1px solid #e2e8f0!important;\
  background:#fff!important;flex-shrink:0!important;\
}\
#chat-nick-row{\
  display:flex!important;align-items:center!important;\
  gap:6px!important;margin-bottom:8px!important;\
}\
#chat-nick-lbl{\
  font-size:12px!important;color:#64748b!important;\
  white-space:nowrap!important;flex-shrink:0!important;\
}\
#chat-nick{\
  flex:1!important;border:1px solid #e2e8f0!important;\
  border-radius:8px!important;padding:5px 10px!important;\
  font-size:13px!important;outline:none!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
  transition:border .15s!important;\
}\
#chat-nick:focus{border-color:#0f766e!important;}\
#chat-in-row{display:flex!important;gap:8px!important;}\
#chat-in{\
  flex:1!important;border:1px solid #e2e8f0!important;\
  border-radius:10px!important;padding:8px 12px!important;\
  font-size:13px!important;outline:none!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
  transition:border .15s!important;height:38px!important;\
  box-sizing:border-box!important;\
}\
#chat-in:focus{border-color:#0f766e!important;}\
#chat-send{\
  background:#0f766e!important;color:#fff!important;border:none!important;\
  border-radius:10px!important;padding:0 14px!important;cursor:pointer!important;\
  font-size:18px!important;transition:background .15s!important;\
  flex-shrink:0!important;height:38px!important;\
  display:flex!important;align-items:center!important;justify-content:center!important;\
}\
#chat-send:hover{background:#134e4a!important;}\
#chat-send:disabled{background:#94a3b8!important;cursor:not-allowed!important;}\
#chat-hint{\
  font-size:11px!important;color:#f59e0b!important;\
  margin-top:5px!important;display:none!important;\
}\
#chat-err{\
  font-size:12px!important;color:#dc2626!important;\
  margin-top:5px!important;display:none!important;\
  background:#fef2f2!important;border:1px solid #fca5a5!important;\
  border-radius:6px!important;padding:6px 10px!important;\
  font-weight:600!important;\
}\
/* 版主模式輸入框提示 */\
#chat-in.admin-input{\
  border-color:#f59e0b!important;\
  box-shadow:0 0 0 2px rgba(245,158,11,.2)!important;\
}\
@media(max-width:420px){\
  #chat-win{width:calc(100vw - 16px)!important;right:8px!important;bottom:80px!important;}\
  #chat-fab{bottom:16px!important;right:16px!important;}\
  body{padding-bottom:72px!important;}\
}\
/* ── 頁面底部補白（讓內容不被 FAB 遮住）── */\
body{padding-bottom:88px!important;}\
/* ── UID 後綴 ── */\
.cuid{\
  font-size:10px!important;color:#b0bec5!important;\
  font-weight:400!important;letter-spacing:.3px!important;\
}\
/* ── 已刪除訊息 ── */\
.cdel-tomb{\
  font-size:11px!important;color:#b0bec5!important;\
  font-style:italic!important;padding:6px 10px!important;\
  background:#f1f5f9!important;border-radius:8px!important;\
  border:1px dashed #e2e8f0!important;\
}\
/* ── 封鎖時間選單 ── */\
#chat-ban-modal{\
  position:absolute!important;inset:0!important;\
  background:rgba(15,23,42,.45)!important;\
  z-index:20!important;display:flex!important;\
  align-items:center!important;justify-content:center!important;\
  padding:20px!important;box-sizing:border-box!important;\
}\
#chat-ban-box{\
  background:#fff!important;border-radius:14px!important;\
  padding:20px!important;width:100%!important;\
  box-shadow:0 8px 32px rgba(0,0,0,.18)!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
}\
#chat-ban-box h4{\
  font-size:14px!important;font-weight:700!important;\
  color:#1e293b!important;margin:0 0 4px!important;\
}\
#chat-ban-box p{\
  font-size:12px!important;color:#64748b!important;margin:0 0 14px!important;\
}\
.chat-ban-opt{\
  display:block!important;width:100%!important;\
  padding:9px 0!important;margin-bottom:7px!important;\
  border:1px solid #e2e8f0!important;border-radius:8px!important;\
  background:#f8fafc!important;font-size:13px!important;\
  font-weight:600!important;color:#475569!important;\
  cursor:pointer!important;transition:background .15s,color .15s!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
}\
.chat-ban-opt:hover{background:#fee2e2!important;color:#dc2626!important;border-color:#fca5a5!important;}\
.chat-ban-opt.perm{background:#fef2f2!important;color:#dc2626!important;border-color:#fca5a5!important;}\
.chat-ban-opt.perm:hover{background:#dc2626!important;color:#fff!important;}\
#chat-ban-cancel{\
  display:block!important;width:100%!important;\
  padding:8px 0!important;border:none!important;\
  background:none!important;font-size:13px!important;\
  color:#94a3b8!important;cursor:pointer!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
}\
/* ── 封鎖按鈕 ── */\
.cban{\
  position:absolute!important;top:-6px!important;left:-6px!important;\
  background:#f59e0b!important;border:none!important;color:#fff!important;\
  border-radius:50%!important;width:16px!important;height:16px!important;\
  cursor:pointer!important;font-size:9px!important;padding:0!important;\
  display:none!important;align-items:center!important;justify-content:center!important;\
  line-height:1!important;box-shadow:0 1px 3px rgba(0,0,0,.2)!important;\
}\
.cban:hover{background:#d97706!important;}\
.admin-on .cban{display:flex!important;}\
/* ── 圖片縮圖 ── */\
.cmsg-img{\
  max-width:200px!important;max-height:180px!important;\
  border-radius:8px!important;cursor:pointer!important;\
  display:block!important;object-fit:cover!important;\
  border:1px solid #e2e8f0!important;\
  transition:opacity .15s!important;\
}\
.cmsg-img:hover{opacity:.88!important;}\
.cmsg-img-err{\
  font-size:11px!important;color:#94a3b8!important;\
  font-style:italic!important;\
}\
/* ── 免責聲明 overlay ── */\
#chat-disclaimer{\
  position:absolute!important;inset:0!important;\
  background:rgba(255,255,255,.98)!important;\
  z-index:10!important;display:flex!important;\
  flex-direction:column!important;justify-content:center!important;\
  align-items:center!important;padding:24px 20px!important;\
  box-sizing:border-box!important;\
}\
#chat-disclaimer h3{\
  font-size:15px!important;font-weight:700!important;color:#1e293b!important;\
  margin:0 0 14px!important;text-align:center!important;\
}\
#chat-disclaimer p{\
  font-size:12px!important;color:#475569!important;\
  line-height:1.8!important;margin:0 0 10px!important;\
  text-align:left!important;width:100%!important;\
}\
#chat-disclaimer ul{\
  font-size:12px!important;color:#475569!important;\
  line-height:1.8!important;margin:0 0 20px!important;\
  padding-left:18px!important;width:100%!important;box-sizing:border-box!important;\
}\
#chat-disclaimer-agree{\
  background:#0f766e!important;color:#fff!important;border:none!important;\
  border-radius:10px!important;padding:10px 0!important;\
  font-size:14px!important;font-weight:700!important;cursor:pointer!important;\
  font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif!important;\
  transition:background .15s!important;width:100%!important;\
}\
#chat-disclaimer-agree:hover{background:#134e4a!important;}\
';
    document.head.appendChild(s);
  }

  // ═══════════════════════════════════════════════════
  //  建立 UI
  // ═══════════════════════════════════════════════════
  function buildUI() {
    if (document.getElementById('chat-fab')) return;

    var fab = document.createElement('button');
    fab.id    = 'chat-fab';
    fab.title = '公開聊天室';
    fab.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M20 2H4C2.9 2 2 2.9 2 4v14c0 1.1.9 2 2 2h3l3 3 3-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>' +
      '</svg>' +
      '<span id="chat-badge"></span>';
    document.body.appendChild(fab);

    var win = document.createElement('div');
    win.id = 'chat-win';
    win.innerHTML =
      '<div id="chat-hd">' +
        '<div id="chat-hd-l">' +
          '<span id="chat-dot"></span>' +
          '<div id="chat-title-wrap">' +
            '<div id="chat-title">公開聊天室</div>' +
            '<div id="chat-subtitle">just for fun · 當然，提問或回報也可以</div>' +
          '</div>' +
        '</div>' +
        '<div id="chat-hd-r">' +
          '<button class="chat-hd-btn" id="chat-close-btn">✕</button>' +
        '</div>' +
      '</div>' +
      '<div id="chat-msgs">' +
        '<div id="chat-disclaimer">' +
          '<h3>使用須知</h3>' +
          '<p>這是一個公開聊天室，所有人均可看見你的發言。</p>' +
          '<ul>' +
            '<li>請對自己的發言負責，勿發表違法或侵權內容</li>' +
            '<li>禁止散布謠言、人身攻擊或任何形式的騷擾</li>' +
            '<li>禁止廣告、詐騙或惡意連結</li>' +
            '<li>管理員有權刪除訊息並封鎖違規使用者</li>' +
          '</ul>' +
          '<p>繼續使用即表示你同意遵守以上規範。</p>' +
          '<button id="chat-disclaimer-agree">我同意，進入聊天室</button>' +
        '</div>' +
        '<div class="csys" style="display:none" id="chat-loading">連線中…</div>' +
      '</div>' +
      '<div id="chat-ft">' +
        '<div id="chat-nick-row">' +
          '<span id="chat-nick-lbl">暱稱：</span>' +
          '<input id="chat-nick" type="text" maxlength="15" placeholder="你的暱稱" autocomplete="off">' +
        '</div>' +
        '<div id="chat-in-row">' +
          '<input id="chat-in" type="text" maxlength="200" placeholder="輸入訊息… (Enter 送出)">' +
          '<button id="chat-send">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="white"/>' +
          '</svg>' +
        '</button>' +
        '</div>' +
        '<div id="chat-hint">⏳ 請等 5 秒再發送</div>' +
        '<div id="chat-err"></div>' +
      '</div>';
    document.body.appendChild(win);

    var savedNick = localStorage.getItem('chat_nick') || '';
    document.getElementById('chat-nick').value = savedNick;
    document.getElementById('chat-nick').addEventListener('blur', function () {
      localStorage.setItem('chat_nick', this.value.trim());
    });

    fab.addEventListener('click', toggleChat);
    document.getElementById('chat-close-btn').addEventListener('click', toggleChat);
    document.getElementById('chat-send').addEventListener('click', sendMsg);
    document.getElementById('chat-in').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); sendMsg(); }
    });

    // ── 免責聲明同意按鈕 ──
    // 若已同意過，直接隱藏 overlay，顯示 loading
    if (localStorage.getItem('chat_agreed') === '1') {
      var disc = document.getElementById('chat-disclaimer');
      if (disc) disc.style.display = 'none';
      var loading = document.getElementById('chat-loading');
      if (loading) loading.style.display = '';
    }
    document.getElementById('chat-disclaimer-agree').addEventListener('click', function () {
      localStorage.setItem('chat_agreed', '1');
      document.getElementById('chat-disclaimer').style.display = 'none';
      document.getElementById('chat-loading').style.display = '';
      // 若 Firebase 已就緒，立即開始監聽
      if (authReady) listenMessages();
    });

    // ── 秘密啟動：連續點「公開聊天室」標題 5 下 ──
    document.getElementById('chat-title').addEventListener('click', function () {
      titleClickCount++;
      clearTimeout(titleClickTimer);
      if (titleClickCount >= 5) {
        titleClickCount = 0;
        triggerAdminLogin();
      } else {
        titleClickTimer = setTimeout(function () { titleClickCount = 0; }, 2000);
      }
    });

    // ── 偵測頁面底部 sticky 元素，自動讓 FAB 避開 ──
    avoidStickyBar();
  }

  // ═══════════════════════════════════════════════════
  //  避開頁面底部 sticky 元素
  // ═══════════════════════════════════════════════════
  function avoidStickyBar() {
    var fab = document.getElementById('chat-fab');
    var win = document.getElementById('chat-win');
    if (!fab) return;

    // 找 position:sticky 且 bottom 值合理的元素
    function findStickyBar() {
      var candidates = document.querySelectorAll(
        '.action-container, [class*="action-bar"], [class*="btn-row"], [class*="footer-bar"], [class*="bottom-bar"]'
      );
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        var s = window.getComputedStyle(el);
        if (s.position === 'sticky') {
          var btm = parseFloat(s.bottom);
          if (!isNaN(btm) && btm >= 0 && btm < 200) return el;
        }
      }
      return null;
    }

    var bar = findStickyBar();
    if (!bar) return; // 此頁無 sticky 底列，不需調整

    var barBtm = parseFloat(window.getComputedStyle(bar).bottom) || 0;

    function adjust() {
      var rect = bar.getBoundingClientRect();
      // 當 sticky 列「正在吸附」時，其底緣 ≈ window.innerHeight - barBtm
      // 捲到最底部時 sticky 回到自然位置，底緣會更高（數值更小）
      var isSticking = rect.bottom >= (window.innerHeight - barBtm - 4);
      if (isSticking) {
        var fabBtm = bar.offsetHeight + barBtm + 12;
        fab.style.setProperty('bottom', fabBtm + 'px', 'important');
        if (win) win.style.setProperty('bottom', (fabBtm + 52 + 8) + 'px', 'important');
      } else {
        // sticky 已回到自然位置 → FAB 回到預設
        fab.style.setProperty('bottom', '24px', 'important');
        if (win) win.style.setProperty('bottom', '88px', 'important');
      }
    }

    // DOM 完成後初始執行，並監聽 scroll
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        adjust();
        window.addEventListener('scroll', adjust, { passive: true });
      });
    } else {
      adjust();
      window.addEventListener('scroll', adjust, { passive: true });
    }
  }

  // ═══════════════════════════════════════════════════
  //  開關聊天視窗
  // ═══════════════════════════════════════════════════
  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById('chat-win').classList.toggle('open', isOpen);
    if (isOpen) {
      unread = 0;
      updateBadge();
      var msgs = document.getElementById('chat-msgs');
      msgs.scrollTop = msgs.scrollHeight;
      document.getElementById('chat-in').focus();
    }
  }

  function updateBadge() {
    var b = document.getElementById('chat-badge');
    if (unread > 0 && !isOpen) {
      b.textContent = unread > 99 ? '99+' : String(unread);
      b.style.display = 'flex';
    } else {
      b.style.display = 'none';
    }
  }

  // ═══════════════════════════════════════════════════
  //  管理員登入（秘密啟動）
  // ═══════════════════════════════════════════════════
  function triggerAdminLogin() {
    if (isAdmin) {
      // 再點一次退出管理員模式
      isAdmin = false;
      document.getElementById('chat-msgs').classList.remove('admin-on');
      document.getElementById('chat-in').classList.remove('admin-input');
      return;
    }
    if (!myUid || !db) return;
    // 直接查 Firebase：當前 UID 是否在 /chat/admins/ 中
    db.ref('chat/admins/' + myUid).once('value', function (snap) {
      if (snap.exists() && snap.val() === true) {
        isAdmin = true;
        document.getElementById('chat-msgs').classList.add('admin-on');
        document.getElementById('chat-in').classList.add('admin-input');
      }
      // 非版主：靜默，不給任何提示
    });
  }

  // ═══════════════════════════════════════════════════
  //  發送訊息
  // ═══════════════════════════════════════════════════
  function sendMsg() {
    var inEl    = document.getElementById('chat-in');
    var nickEl  = document.getElementById('chat-nick');
    var hint    = document.getElementById('chat-hint');
    var sendBtn = document.getElementById('chat-send');

    var text = inEl.value.trim();
    if (!text || !db || !myUid) return;

    var now = Date.now();
    if (now - lastSentAt < RATE_MS) {
      hint.style.setProperty('display', 'block', 'important');
      setTimeout(function () { hint.style.setProperty('display', 'none', 'important'); }, 2500);
      return;
    }

    var nick = (nickEl.value.trim() || '匿名楓民').slice(0, 15);
    localStorage.setItem('chat_nick', nick);
    sendBtn.disabled = true;

    // 先查封鎖狀態，再決定是否發送
    db.ref('chat/banned/' + myUid).once('value', function (snap) {
      if (snap.exists()) {
        var banData = snap.val();
        var expires = banData && banData.expires !== undefined ? banData.expires : -1;
        var stillBanned = (expires === -1) || (expires > Date.now());
        if (stillBanned) {
          var errMsg;
          if (expires === -1) {
            errMsg = '你已被永久封鎖，無法發送訊息。';
          } else {
            var unlockDate = new Date(expires);
            var now2       = Date.now();
            var diffMs     = expires - now2;
            var diffMin    = Math.ceil(diffMs / 60000);
            var timeStr    = unlockDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            var dateStr    = unlockDate.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
            if (diffMin <= 60) {
              errMsg = '你已被封鎖，還有 ' + diffMin + ' 分鐘後（' + timeStr + '）可發言。';
            } else {
              errMsg = '你已被封鎖，解除時間：' + dateStr + ' ' + timeStr + '。';
            }
          }
          showErr(errMsg);
          sendBtn.disabled = false;
          return;
        }
      }
      // 未被封鎖，正常發送
      db.ref('chat/messages').push({
        uid:      myUid,
        nickname: sanitize(nick),
        text:     sanitize(text.slice(0, 200)),
        page:     getPageName(),
        isAdmin:  isAdmin,
        ts:       firebase.database.ServerValue.TIMESTAMP
      }).then(function () {
        inEl.value = '';
        lastSentAt = Date.now();
        sendBtn.disabled = false;
      }).catch(function (err) {
        showErr(isPermDenied(err) ? '你已被封鎖，無法發送訊息。' : '發送失敗：' + err.message);
        sendBtn.disabled = false;
      });
    }).catch(function () {
      // 查詢失敗時仍允許嘗試發送
      db.ref('chat/messages').push({
        uid:      myUid,
        nickname: sanitize(nick),
        text:     sanitize(text.slice(0, 200)),
        page:     getPageName(),
        isAdmin:  isAdmin,
        ts:       firebase.database.ServerValue.TIMESTAMP
      }).then(function () {
        inEl.value = '';
        lastSentAt = Date.now();
        sendBtn.disabled = false;
      }).catch(function (err) {
        showErr(isPermDenied(err) ? '你已被封鎖，無法發送訊息。' : '發送失敗：' + err.message);
        sendBtn.disabled = false;
      });
    });
  }

  // ═══════════════════════════════════════════════════
  //  渲染單則訊息
  // ═══════════════════════════════════════════════════
  function renderMsg(id, data) {
    var isMine    = (data.uid === myUid);
    var isMsgAdmin = !!(data.isAdmin || adminUids[data.uid]);
    var time = '';
    if (data.ts) {
      var msgDate  = new Date(data.ts);
      var now      = new Date();
      var msgDay   = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
      var today    = new Date(now.getFullYear(),    now.getMonth(),    now.getDate());
      var diffDays = Math.round((today - msgDay) / 86400000);
      var hhmm     = msgDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 0)      time = hhmm;
      else if (diffDays === 1) time = '昨天 ' + hhmm;
      else                     time = (msgDate.getMonth() + 1) + '/' + msgDate.getDate() + ' ' + hhmm;
    }

    var div = document.createElement('div');
    div.className  = 'cmsg ' + (isMine ? 'me' : 'them') + (isMsgAdmin ? ' is-admin-msg' : '');
    div.dataset.id = id;

    // meta
    var meta = document.createElement('div');
    meta.className = 'cmeta';

    var nickSpan = document.createElement('span');
    nickSpan.className   = 'cnick';
    nickSpan.textContent = data.nickname || '匿名楓民';
    meta.appendChild(nickSpan);

    // UID 後綴：所有人都顯示
    if (data.uid) {
      var uidSpan = document.createElement('span');
      uidSpan.className   = 'cuid';
      uidSpan.textContent = '#' + data.uid.slice(-4);
      meta.appendChild(uidSpan);
    }

    // 版主標章
    if (isMsgAdmin) {
      var badge = document.createElement('span');
      badge.className   = 'cadmin-badge';
      badge.textContent = '管理者';
      meta.appendChild(badge);
    }

    if (data.page) {
      var pageSpan = document.createElement('span');
      pageSpan.className   = 'cpage';
      pageSpan.textContent = '#' + data.page;
      meta.appendChild(pageSpan);
    }

    var timeSpan = document.createElement('span');
    timeSpan.textContent = time;
    meta.appendChild(timeSpan);

    // 泡泡
    var bubble = document.createElement('div');
    bubble.className = 'cbubble';

    if (data.deleted) {
      var tomb = document.createElement('span');
      tomb.className   = 'cdel-tomb';
      tomb.textContent = '此訊息已被移除';
      bubble.appendChild(tomb);
    } else if (isImageUrl(data.text)) {
      // 圖片模式
      var img = document.createElement('img');
      img.className = 'cmsg-img';
      img.alt       = '圖片';
      img.src       = data.text;
      img.addEventListener('click', function () {
        window.open(data.text, '_blank', 'noopener,noreferrer');
      });
      img.addEventListener('error', function () {
        img.style.display = 'none';
        var err = document.createElement('span');
        err.className   = 'cmsg-img-err';
        err.textContent = '圖片無法顯示';
        bubble.insertBefore(err, img);
      });
      bubble.appendChild(img);
    } else {
      bubble.textContent = data.text || '';
    }

    // 刪除按鈕（admin-on class 控制顯示）
    var delBtn = document.createElement('button');
    delBtn.className   = 'cdel';
    delBtn.textContent = '✕';
    delBtn.title       = '刪除訊息';
    delBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!confirm('確定刪除這則訊息？')) return;
      // 軟刪除：保留資料庫紀錄，只標記 deleted:true
      db.ref('chat/messages/' + id).update({ deleted: true }).catch(function (err) {
        showErr(isPermDenied(err) ? '刪除失敗：請確認 UID 已加入 /chat/admins。' : '刪除失敗：' + err.message);
      });
    });
    bubble.appendChild(delBtn);

    // 封鎖按鈕（只對非自己的訊息顯示）
    if (!isMine && data.uid) {
      var banBtn = document.createElement('button');
      banBtn.className   = 'cban';
      banBtn.textContent = '!';
      banBtn.title       = '封鎖此使用者';
      banBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        showBanModal(data.uid, data.nickname || '匿名楓民');
      });
      bubble.appendChild(banBtn);
    }

    div.appendChild(meta);
    div.appendChild(bubble);
    return div;
  }

  // ═══════════════════════════════════════════════════
  //  錯誤訊息（顯示在輸入框下方）
  // ═══════════════════════════════════════════════════
  function isPermDenied(err) {
    var code = (err.code || '').toLowerCase();
    var msg  = (err.message || '').toLowerCase();
    return code.indexOf('permission') !== -1 || msg.indexOf('permission') !== -1;
  }

  function showErr(msg) {
    var el = document.getElementById('chat-err');
    if (!el) return;
    el.textContent = msg;
    el.style.setProperty('display', 'block', 'important');
    clearTimeout(showErr._t);
    showErr._t = setTimeout(function () {
      el.style.setProperty('display', 'none', 'important');
    }, 4000);
  }

  // ═══════════════════════════════════════════════════
  //  封鎖時間選單
  // ═══════════════════════════════════════════════════
  function showBanModal(uid, nickname) {
    var winEl = document.getElementById('chat-win');
    if (!winEl) return;

    var modal = document.createElement('div');
    modal.id = 'chat-ban-modal';

    var opts = [
      { label: '封鎖 5 分鐘',  mins: 5 },
      { label: '封鎖 30 分鐘', mins: 30 },
      { label: '封鎖 1 小時',  mins: 60 },
      { label: '封鎖 24 小時', mins: 1440 },
      { label: '永久封鎖',     mins: -1 }
    ];

    var box = document.createElement('div');
    box.id = 'chat-ban-box';
    box.innerHTML =
      '<h4>封鎖使用者</h4>' +
      '<p>' + sanitize(nickname) + ' #' + uid.slice(-4) + '</p>';

    opts.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.className   = 'chat-ban-opt' + (opt.mins === -1 ? ' perm' : '');
      btn.textContent = opt.label;
      btn.addEventListener('click', function () {
        var expires = opt.mins === -1 ? -1 : Date.now() + opt.mins * 60 * 1000;
        db.ref('chat/banned/' + uid).set({ expires: expires }).then(function () {
          modal.parentNode.removeChild(modal);
          // 同時刪除該使用者所有可見訊息（選擇性，可移除）
        }).catch(function (err) {
          showErr(isPermDenied(err) ? '封鎖失敗：請確認 UID 已加入 /chat/admins。' : '封鎖失敗：' + err.message);
          modal.parentNode.removeChild(modal);
        });
      });
      box.appendChild(btn);
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.id          = 'chat-ban-cancel';
    cancelBtn.textContent = '取消';
    cancelBtn.addEventListener('click', function () {
      modal.parentNode.removeChild(modal);
    });
    box.appendChild(cancelBtn);
    modal.appendChild(box);
    winEl.appendChild(modal);
  }

  // 判斷是否為圖片網址（https 開頭，副檔名或已知圖床）
  var IMG_RE = /^https:\/\/\S+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s]*)?$/i;
  var IMGUR_RE = /^https:\/\/(i\.)?imgur\.com\/\S+$/i;

  function isImageUrl(text) {
    return IMG_RE.test(text) || IMGUR_RE.test(text);
  }

  function sanitize(str) {
    return String(str || '').replace(/[<>&"]/g, function (c) {
      return { '<': '＜', '>': '＞', '&': '＆', '"': '＂' }[c];
    });
  }

  // ═══════════════════════════════════════════════════
  //  Firebase 監聽
  // ═══════════════════════════════════════════════════
  function listenMessages() {
    // 先讀版主 UID 列表
    db.ref('chat/admins').once('value', function (snap) {
      if (snap.exists()) adminUids = snap.val() || {};
    });

    var msgsEl = document.getElementById('chat-msgs');
    var msgRef = db.ref('chat/messages').limitToLast(MAX_MSGS);
    var isEmpty = true;

    function ensureNotEmpty() {
      if (isEmpty) { msgsEl.innerHTML = ''; isEmpty = false; }
    }
    function atBottom() {
      return (msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight) < 80;
    }

    msgRef.on('child_added', function (snap) {
      ensureNotEmpty();
      var el = renderMsg(snap.key, snap.val());
      msgsEl.appendChild(el);
      if (isAdmin) msgsEl.classList.add('admin-on');
      if (isReady && !isOpen) { unread++; updateBadge(); }
      if (atBottom() || snap.val().uid === myUid) msgsEl.scrollTop = msgsEl.scrollHeight;
    });

    // child_changed：訊息被軟刪除（deleted:true）時即時更新 UI
    msgRef.on('child_changed', function (snap) {
      var data = snap.val();
      var el   = msgsEl.querySelector('[data-id="' + snap.key + '"]');
      if (!el || !data.deleted) return;
      var bubble = el.querySelector('.cbubble');
      if (!bubble) return;
      bubble.innerHTML = '';
      var tomb = document.createElement('span');
      tomb.className   = 'cdel-tomb';
      tomb.textContent = '此訊息已被移除';
      bubble.appendChild(tomb);
      // 隱藏刪除與封鎖按鈕
      var btns = el.querySelectorAll('.cdel, .cban');
      btns.forEach(function (b) { b.style.display = 'none'; });
    });

    // child_removed：訊息被刪除
    msgRef.on('child_removed', function (snap) {
      var el = msgsEl.querySelector('[data-id="' + snap.key + '"]');
      if (!el) return;

      // 換成「已被移除」提示，3 秒後整個消失
      var bubble = el.querySelector('.cbubble');
      if (bubble) {
        bubble.innerHTML = '';
        var tomb = document.createElement('span');
        tomb.className   = 'cdel-tomb';
        tomb.textContent = '此訊息已被移除';
        bubble.appendChild(tomb);
      }
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (!msgsEl.querySelector('.cmsg')) {
          isEmpty = true;
          msgsEl.innerHTML = '<div class="csys">目前沒有訊息，快來打個招呼吧！</div>';
        }
      }, 3000);
    });

    msgRef.once('value', function (snap) {
      isReady = true;
      if (!snap.exists()) {
        msgsEl.innerHTML = '<div class="csys">目前沒有訊息，快來打個招呼吧！</div>';
      }
    });
  }

  // ═══════════════════════════════════════════════════
  //  初始化 Firebase
  // ═══════════════════════════════════════════════════
  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.error('[公開聊天室] Firebase SDK 載入失敗');
      var el = document.getElementById('chat-msgs');
      if (el) el.innerHTML = '<div class="csys">聊天室無法連線，請重新整理。</div>';
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    firebase.auth().signInAnonymously()
      .then(function (r) {
        myUid     = r.user.uid;
        authReady = true;
        // 只有在用戶已同意免責聲明後才開始監聽
        if (localStorage.getItem('chat_agreed') === '1') listenMessages();
      })
      .catch(function (err) {
        console.error('[公開聊天室] 匿名登入失敗:', err);
        var el = document.getElementById('chat-msgs');
        if (el) el.innerHTML = '<div class="csys">連線失敗，請確認 Firebase Anonymous Auth 已啟用。</div>';
      });
  }

  // ═══════════════════════════════════════════════════
  //  依序載入 Firebase SDK
  // ═══════════════════════════════════════════════════
  function loadSDKChain(srcs, idx, cb) {
    if (idx >= srcs.length) { cb(); return; }
    var s = document.createElement('script');
    s.src    = srcs[idx];
    s.onload = function () { loadSDKChain(srcs, idx + 1, cb); };
    s.onerror = function () { console.error('[公開聊天室] SDK 載入失敗:', srcs[idx]); };
    document.head.appendChild(s);
  }

  // ═══════════════════════════════════════════════════
  //  啟動
  // ═══════════════════════════════════════════════════
  function boot() {
    injectStyles();
    buildUI();
    loadSDKChain([
      'https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-auth-compat.js',
      'https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-database-compat.js'
    ], 0, initFirebase);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
