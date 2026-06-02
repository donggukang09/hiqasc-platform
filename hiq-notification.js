// ============================================
// 🔔 HIQASC 알림 시스템 v1.2
// <script src="hiq-notification.js"></script>
// ============================================

(function() {
    var NOTIFICATION_SHEET_ID = '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI';
    var NOTIFICATION_TAB_NAME = '알림';
    var POLL_INTERVAL = 60 * 1000;
    var TOAST_DURATION = 15000;

    // 사용자별 SEEN_KEY 생성
    function getCurrentUser() {
        return sessionStorage.getItem('userName') || sessionStorage.getItem('hiqasc_isAdmin') === 'true' ? 'admin' : '';
    }
    function getSeenKey() {
        var user = sessionStorage.getItem('userName') || (sessionStorage.getItem('hiqasc_isAdmin') === 'true' ? 'admin' : '');
        return user ? 'hiq_seen_alerts_' + user : 'hiq_seen_alerts';
    }
    function isAuthenticated() {
        return sessionStorage.getItem('hiqasc_authenticated') === 'true';
    }

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
        try { return JSON.parse(localStorage.getItem(getSeenKey()) || '[]'); }
        catch(e) { return []; }
    }
    function markAsSeen(id) {
        var seen = getSeenAlerts();
        if (seen.indexOf(id) === -1) {
            seen.push(id);
            localStorage.setItem(getSeenKey(), JSON.stringify(seen));
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
        // 로그인하지 않은 사용자에게는 알림/팝업 표시 안 함
        if (!isAuthenticated()) return;

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
                            // 브리핑 타입: 확인 팝업
                            if (type === 'briefing') {
                                if (location.pathname.indexOf('daily-briefing') === -1) {
                                    showBriefingPopup(id);
                                }
                            } else {
                                showToast(title, message, type);
                                markAsSeen(id);
                            }
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

    // ===== 브리핑 팝업 =====
    var briefingCss = '' +
    '.hiq-briefing-overlay {' +
        'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;' +
        'background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);' +
        'display:flex;align-items:center;justify-content:center;' +
        'animation:hiq-brief-fade 0.3s ease;' +
    '}' +
    '@keyframes hiq-brief-fade{from{opacity:0}to{opacity:1}}' +
    '.hiq-briefing-box {' +
        'background:#16161f;border:1px solid #2e2e44;border-radius:20px;' +
        'padding:40px;text-align:center;max-width:420px;width:90%;' +
        'box-shadow:0 30px 80px rgba(0,0,0,0.5),0 0 60px rgba(74,144,226,0.1);' +
        'animation:hiq-brief-pop 0.4s cubic-bezier(0.16,1,0.3,1);' +
        'position:relative;overflow:hidden;' +
    '}' +
    '@keyframes hiq-brief-pop{from{opacity:0;transform:scale(0.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
    '.hiq-briefing-box::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#4a90e2,#a78bfa,#22d3ee);}' +
    '.hiq-brief-icon{font-size:48px;margin-bottom:16px;animation:hiq-brief-bounce 1s ease infinite;}' +
    '@keyframes hiq-brief-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
    '.hiq-brief-title{font-family:"Orbitron",sans-serif;font-size:18px;font-weight:800;color:#4a90e2;letter-spacing:3px;margin-bottom:10px;}' +
    '.hiq-brief-msg{font-size:15px;color:#a0a0b8;margin-bottom:28px;line-height:1.6;}' +
    '.hiq-brief-btns{display:flex;gap:10px;justify-content:center;}' +
    '.hiq-brief-btn{font-family:"Manrope",sans-serif;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;cursor:pointer;border:none;transition:all 0.2s;}' +
    '.hiq-brief-btn.yes{background:linear-gradient(135deg,#4a90e2,#3574d0);color:#fff;box-shadow:0 4px 20px rgba(74,144,226,0.3);}' +
    '.hiq-brief-btn.yes:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(74,144,226,0.4);}' +
    '.hiq-brief-btn.no{background:rgba(255,255,255,0.05);color:#7a7a95;border:1px solid #2e2e44;}' +
    '.hiq-brief-btn.no:hover{background:rgba(255,255,255,0.08);color:#a0a0b8;}';

    var briefStyleEl = document.createElement('style');
    briefStyleEl.textContent = briefingCss;
    document.head.appendChild(briefStyleEl);

    function showBriefingPopup(alertId) {
        // 이미 떠있으면 무시
        if (document.querySelector('.hiq-briefing-overlay')) return;
        // 10분 쿨다운 (나중에 누른 경우)
        var lastDismiss = parseInt(sessionStorage.getItem('hiq_brief_dismiss') || '0');
        if (Date.now() - lastDismiss < 10 * 60 * 1000) return;

        playDingDong();
        setTimeout(function() { playDingDong(); }, 300);

        var overlay = document.createElement('div');
        overlay.className = 'hiq-briefing-overlay';
        overlay.innerHTML =
            '<div class="hiq-briefing-box">' +
                '<div class="hiq-brief-icon">📋</div>' +
                '<div class="hiq-brief-title">DAILY BRIEFING</div>' +
                '<div class="hiq-brief-msg">금일의 브리핑이 등록되었습니다.<br>지금 확인하시겠습니까?</div>' +
                '<div class="hiq-brief-btns">' +
                    '<button class="hiq-brief-btn no" id="hiqBriefNo">나중에</button>' +
                    '<button class="hiq-brief-btn yes" id="hiqBriefYes">확인하기</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        document.getElementById('hiqBriefYes').onclick = function() {
            markAsSeen(alertId);
            location.href = 'daily-briefing.html';
        };
        document.getElementById('hiqBriefNo').onclick = function() {
            overlay.style.animation = 'hiq-brief-fade 0.3s ease reverse forwards';
            setTimeout(function() { overlay.remove(); }, 300);
            // 10분 후 다시 표시 (세션 내)
            sessionStorage.setItem('hiq_brief_dismiss', Date.now());
        };
    }
})();
