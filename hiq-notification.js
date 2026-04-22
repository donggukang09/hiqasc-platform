// ============================================
// 🔔 HIQASC 알림 시스템 v1.2
// <script src="hiq-notification.js"></script>
// ============================================

(function() {
    var NOTIFICATION_SHEET_ID = '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI';
    var NOTIFICATION_TAB_NAME = '알림';
    var POLL_INTERVAL = 60 * 1000;
    var SEEN_KEY = 'hiq_seen_alerts';
    var TOAST_DURATION = 15000;

    var css = '' +
    '.hiq-notification-overlay {' +
        'position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 99999;' +
        'display: flex; flex-direction: column; align-items: center; gap: 16px; pointer-events: none;' +
    '}' +
    '.hiq-toast {' +
        'pointer-events: all; min-width: 540px; max-width: 660px;' +
        'background: #f0f2f5;' +
        'border-radius: 18px; border: 3px solid #4a90e2;' +
        'box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05);' +
        'overflow: hidden;' +
        'animation: hiq-toast-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);' +
    '}' +
    '.hiq-toast.removing { animation: hiq-toast-out 0.4s ease forwards; }' +
    '@keyframes hiq-toast-in {' +
        'from { opacity: 0; transform: translateY(-30px) scale(0.9); }' +
        'to { opacity: 1; transform: translateY(0) scale(1); }' +
    '}' +
    '@keyframes hiq-toast-out { to { opacity: 0; transform: translateY(-20px) scale(0.95); } }' +

    '.hiq-toast-accent { height: 5px; width: 100%; }' +
    '.hiq-toast-accent.info { background: linear-gradient(90deg, #4a90e2, #64b5f6, #4a90e2); background-size: 200% 100%; animation: hiq-shimmer 2s infinite; }' +
    '.hiq-toast-accent.success { background: linear-gradient(90deg, #27ae60, #66d9a0, #27ae60); background-size: 200% 100%; animation: hiq-shimmer 2s infinite; }' +
    '.hiq-toast-accent.warning { background: linear-gradient(90deg, #e67e22, #ffd54f, #e67e22); background-size: 200% 100%; animation: hiq-shimmer 2s infinite; }' +
    '@keyframes hiq-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }' +

    '.hiq-toast-content {' +
        'padding: 24px 26px; display: flex; align-items: flex-start; gap: 18px;' +
    '}' +
    '.hiq-toast-icon {' +
        'width: 60px; height: 60px; border-radius: 14px;' +
        'display: flex; align-items: center; justify-content: center;' +
        'font-size: 32px; flex-shrink: 0;' +
    '}' +
    '.hiq-toast-icon.info { background: rgba(74,144,226,0.15); border: 2px solid rgba(74,144,226,0.3); }' +
    '.hiq-toast-icon.success { background: rgba(39,174,96,0.15); border: 2px solid rgba(39,174,96,0.3); }' +
    '.hiq-toast-icon.warning { background: rgba(230,126,34,0.15); border: 2px solid rgba(230,126,34,0.3); }' +

    '.hiq-toast-body { flex: 1; }' +
    '.hiq-toast-title {' +
        'font-size: 24px; font-weight: 900; color: #1a1a2e; margin-bottom: 8px; letter-spacing: -0.5px; line-height: 1.3;' +
    '}' +
    '.hiq-toast-msg {' +
        'font-size: 18px; color: #333; line-height: 1.6; white-space: pre-line; font-weight: 500;' +
    '}' +
    '.hiq-toast-time { font-size: 13px; color: #999; margin-top: 10px; font-weight: 400; }' +

    '.hiq-toast-close {' +
        'background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.1); color: #999;' +
        'width: 36px; height: 36px; border-radius: 10px;' +
        'font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;' +
        'transition: all 0.2s; flex-shrink: 0;' +
    '}' +
    '.hiq-toast-close:hover { background: rgba(231,76,60,0.15); border-color: rgba(231,76,60,0.3); color: #e74c3c; }' +

    '.hiq-toast-progress { height: 4px; background: rgba(0,0,0,0.06); }' +
    '.hiq-toast-progress-bar {' +
        'height: 100%;' +
        'animation: hiq-progress-shrink ' + (TOAST_DURATION / 1000) + 's linear forwards;' +
    '}' +
    '.hiq-toast-progress-bar.info { background: #4a90e2; }' +
    '.hiq-toast-progress-bar.success { background: #27ae60; }' +
    '.hiq-toast-progress-bar.warning { background: #e67e22; }' +
    '@keyframes hiq-progress-shrink { from { width: 100%; } to { width: 0%; } }' +

    '.hiq-toast.type-success { border-color: #27ae60; }' +
    '.hiq-toast.type-warning { border-color: #e67e22; }' +

    '@media (max-width: 768px) {' +
        '.hiq-notification-overlay { left: 10px; right: 10px; transform: none; }' +
        '.hiq-toast { min-width: auto; max-width: 100%; }' +
        '.hiq-toast-title { font-size: 20px; }' +
        '.hiq-toast-msg { font-size: 16px; }' +
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
