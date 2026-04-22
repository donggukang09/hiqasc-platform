// ============================================
// 🔔 HIQASC 알림 시스템 v1.1
// 각 페이지에 아래 한 줄만 추가하면 됩니다:
// <script src="hiq-notification.js"></script>
// ============================================

(function() {
    var NOTIFICATION_SHEET_ID = '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI';
    var NOTIFICATION_TAB_NAME = '알림';
    var POLL_INTERVAL = 60 * 1000;
    var SEEN_KEY = 'hiq_seen_alerts';
    var TOAST_DURATION = 15000;

    // ── CSS 자동 주입 ──
    var css = '' +
    '.hiq-notification-overlay {' +
        'position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 99999;' +
        'display: flex; flex-direction: column; align-items: center; gap: 14px; pointer-events: none;' +
    '}' +
    '.hiq-toast {' +
        'pointer-events: all; min-width: 460px; max-width: 560px;' +
        'background: linear-gradient(135deg, #1a2a4a 0%, #1e1e3a 100%);' +
        'border-radius: 16px; border: 2px solid rgba(74,144,226,0.4);' +
        'box-shadow: 0 16px 50px rgba(0,0,0,0.6), 0 0 30px rgba(74,144,226,0.15);' +
        'overflow: hidden;' +
        'animation: hiq-toast-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);' +
    '}' +
    '.hiq-toast.removing { animation: hiq-toast-out 0.4s ease forwards; }' +
    '@keyframes hiq-toast-in {' +
        'from { opacity: 0; transform: translateY(-30px) scale(0.9); }' +
        'to { opacity: 1; transform: translateY(0) scale(1); }' +
    '}' +
    '@keyframes hiq-toast-out { to { opacity: 0; transform: translateY(-20px) scale(0.95); } }' +
    '.hiq-toast-accent { height: 4px; width: 100%; }' +
    '.hiq-toast-accent.info { background: linear-gradient(90deg, #4a90e2, #64b5f6, #4a90e2); background-size: 200% 100%; animation: hiq-accent-shimmer 2s infinite; }' +
    '.hiq-toast-accent.success { background: linear-gradient(90deg, #27ae60, #66d9a0, #27ae60); background-size: 200% 100%; animation: hiq-accent-shimmer 2s infinite; }' +
    '.hiq-toast-accent.warning { background: linear-gradient(90deg, #f39c12, #ffd54f, #f39c12); background-size: 200% 100%; animation: hiq-accent-shimmer 2s infinite; }' +
    '@keyframes hiq-accent-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }' +
    '.hiq-toast-content {' +
        'padding: 20px 22px; display: flex; align-items: flex-start; gap: 16px;' +
    '}' +
    '.hiq-toast-icon {' +
        'width: 50px; height: 50px; border-radius: 12px;' +
        'display: flex; align-items: center; justify-content: center;' +
        'font-size: 26px; flex-shrink: 0;' +
    '}' +
    '.hiq-toast-icon.info { background: rgba(74,144,226,0.2); border: 1px solid rgba(74,144,226,0.3); }' +
    '.hiq-toast-icon.success { background: rgba(39,174,96,0.2); border: 1px solid rgba(39,174,96,0.3); }' +
    '.hiq-toast-icon.warning { background: rgba(243,156,18,0.2); border: 1px solid rgba(243,156,18,0.3); }' +
    '.hiq-toast-body { flex: 1; }' +
    '.hiq-toast-title {' +
        'font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 6px; letter-spacing: -0.3px;' +
    '}' +
    '.hiq-toast-msg {' +
        'font-size: 14px; color: #c8d6e5; line-height: 1.6; white-space: pre-line;' +
    '}' +
    '.hiq-toast-time { font-size: 12px; color: #8899aa; margin-top: 8px; }' +
    '.hiq-toast-close {' +
        'background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: #8899aa;' +
        'width: 32px; height: 32px; border-radius: 8px;' +
        'font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;' +
        'transition: all 0.2s; flex-shrink: 0;' +
    '}' +
    '.hiq-toast-close:hover { background: rgba(231,76,60,0.2); border-color: rgba(231,76,60,0.4); color: #e74c3c; }' +
    '.hiq-toast-progress { height: 3px; background: rgba(255,255,255,0.06); }' +
    '.hiq-toast-progress-bar {' +
        'height: 100%; border-radius: 0 0 16px 16px;' +
        'animation: hiq-progress-shrink ' + (TOAST_DURATION / 1000) + 's linear forwards;' +
    '}' +
    '.hiq-toast-progress-bar.info { background: rgba(74,144,226,0.5); }' +
    '.hiq-toast-progress-bar.success { background: rgba(39,174,96,0.5); }' +
    '.hiq-toast-progress-bar.warning { background: rgba(243,156,18,0.5); }' +
    '@keyframes hiq-progress-shrink { from { width: 100%; } to { width: 0%; } }' +
    '.hiq-toast.type-success { border-color: rgba(39,174,96,0.4); }' +
    '.hiq-toast.type-success:hover { border-color: rgba(39,174,96,0.7); }' +
    '.hiq-toast.type-warning { border-color: rgba(243,156,18,0.4); }' +
    '.hiq-toast.type-warning:hover { border-color: rgba(243,156,18,0.7); }' +
    '.hiq-toast:hover { border-color: rgba(74,144,226,0.7); }' +
    '@media (max-width: 768px) {' +
        '.hiq-notification-overlay { left: 10px; right: 10px; transform: none; }' +
        '.hiq-toast { min-width: auto; max-width: 100%; }' +
    '}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    function ensureOverlay() {
        var overlay = document.getElementById('hiqNotificationOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'hiqNotificationOverlay';
            overlay.className = 'hiq-notification-overlay';
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function getSeenAlerts() {
        try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); }
        catch(e) { return []; }
    }
    function markAsSeen(id) {
        var seen = getSeenAlerts();
        if (seen.indexOf(id) === -1) {
            seen.push(id);
            localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
        }
    }

    var _audioCtx = null;
    function _getCtx() {
        if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return _audioCtx;
    }
    function playDingDong() {
        try {
            var ctx = _getCtx();
            var vol = 0.4;
            var o1 = ctx.createOscillator(), g1 = ctx.createGain();
            o1.type = 'sine';
            o1.frequency.setValueAtTime(880, ctx.currentTime);
            g1.gain.setValueAtTime(vol, ctx.currentTime);
            g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            o1.connect(g1); g1.connect(ctx.destination);
            o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.35);
            var o2 = ctx.createOscillator(), g2 = ctx.createGain();
            o2.type = 'sine';
            o2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.18);
            g2.gain.setValueAtTime(0.001, ctx.currentTime);
            g2.gain.setValueAtTime(vol * 0.9, ctx.currentTime + 0.18);
            g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
            o2.connect(g2); g2.connect(ctx.destination);
            o2.start(ctx.currentTime + 0.18); o2.stop(ctx.currentTime + 0.55);
        } catch(e) {}
    }

    function showToast(title, message, type) {
        type = type || 'info';
        var overlay = ensureOverlay();
        var icons = { info: '🔔', success: '✅', warning: '⚠️' };
        var now = new Date();
        var timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        var typeClass = type !== 'info' ? ' type-' + type : '';

        var toast = document.createElement('div');
        toast.className = 'hiq-toast' + typeClass;
        toast.innerHTML =
            '<div class="hiq-toast-accent ' + type + '"></div>' +
            '<div class="hiq-toast-content">' +
                '<div class="hiq-toast-icon ' + type + '">' + (icons[type] || '🔔') + '</div>' +
                '<div class="hiq-toast-body">' +
                    '<div class="hiq-toast-title">' + title + '</div>' +
                    '<div class="hiq-toast-msg">' + message + '</div>' +
                    '<div class="hiq-toast-time">' + timeStr + '</div>' +
                '</div>' +
                '<button class="hiq-toast-close" onclick="this.closest(\'.hiq-toast\').classList.add(\'removing\');setTimeout(function(){this.remove()}.bind(this.closest(\'.hiq-toast\')),400)">&times;</button>' +
            '</div>' +
            '<div class="hiq-toast-progress"><div class="hiq-toast-progress-bar ' + type + '"></div></div>';
        overlay.appendChild(toast);

        playDingDong();

        if (TOAST_DURATION > 0) {
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.classList.add('removing');
                    setTimeout(function() { toast.remove(); }, 400);
                }
            }, TOAST_DURATION);
        }

        var all = overlay.querySelectorAll('.hiq-toast');
        if (all.length > 4) {
            all[0].classList.add('removing');
            setTimeout(function() { all[0].remove(); }, 400);
        }
    }

    function checkNotifications() {
        var url = 'https://docs.google.com/spreadsheets/d/' + NOTIFICATION_SHEET_ID +
                  '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(NOTIFICATION_TAB_NAME);

        fetch(url)
            .then(function(res) { return res.text(); })
            .then(function(text) {
                var json = JSON.parse(text.substring(47).slice(0, -2));
                var rows = json.table.rows;
                var seen = getSeenAlerts();
                var dataStartRow = 0;
                if (rows.length > 0 && rows[0].c && rows[0].c[0]) {
                    var fv = rows[0].c[0].v;
                    if (fv === 'id' || fv === 'ID') dataStartRow = 1;
                }
                for (var i = dataStartRow; i < rows.length; i++) {
                    var row = rows[i];
                    if (!row.c) continue;
                    var id = row.c[0] ? String(row.c[0].v) : '';
                    var title = row.c[1] ? String(row.c[1].v) : '';
                    var message = row.c[2] ? String(row.c[2].v) : '';
                    var type = row.c[3] ? String(row.c[3].v).toLowerCase() : 'info';
                    var active = row.c[4] ? row.c[4].v : false;
                    if (active === true || active === 'TRUE' || active === 'true') {
                        if (seen.indexOf(id) === -1) {
                            showToast(title, message, type);
                            markAsSeen(id);
                        }
                    }
                }
            })
            .catch(function(err) {
                console.error('HIQASC 알림 폴링 오류:', err);
            });
    }

    setTimeout(function() { checkNotifications(); }, 3000);
    setInterval(function() { checkNotifications(); }, POLL_INTERVAL);

    window.hiqShowToast = showToast;
    window.hiqPlayDingDong = playDingDong;
})();
