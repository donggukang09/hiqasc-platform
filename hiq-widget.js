// ============================================
// HIQASC 메인 허브 위젯 v1.0
// index.html에 <script src="hiq-widget.js"></script> 추가
// config.js 이후에 로드할 것
// ============================================

(function() {
'use strict';

// ===== 설정 =====
const WIDGET_VERSION = '1.0';
const REPAIR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDhNw51lRHIBQ3amB4j8EBpwx1LlXm0rDIjHlsTUA07P0hN2JOaHn5XxRyprltW9p5/exec';
const SHEET_IDS = {
    main: '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI',
    leave: '1cmMEbIkmEL629RT04hpUUgXddnSVLGo1YwRzBwfyzCY'
};
// 공지사항 시트 — 나중에 설정
const NOTICE_SHEET_ID = '1M0a3B4MAko6MZAnZjl2IpRzFXjbESx--ZiiRvTHqJMs';
const NOTICE_TAB_NAME = '위젯';

// ===== CSS 삽입 =====
const css = document.createElement('style');
css.textContent = `
.wt-toggle{position:fixed;right:0;top:50%;transform:translateY(-50%);width:32px;height:90px;background:linear-gradient(180deg,#4a90e2,#357abd);border:none;border-radius:10px 0 0 10px;color:#fff;font-size:13px;cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-family:'Manrope',sans-serif;font-weight:700;letter-spacing:2px;box-shadow:-2px 0 10px rgba(0,0,0,.3);transition:all .3s}
.wt-toggle:hover{width:38px;background:linear-gradient(180deg,#5a9fe2,#4a90e2)}
.wt-toggle.active{right:310px}
.wt-panel{position:fixed;right:-310px;top:0;width:310px;height:100vh;background:#1e1e1e;border-left:1px solid #333;z-index:9997;overflow-y:auto;transition:right .35s cubic-bezier(.4,0,.2,1);box-shadow:-5px 0 30px rgba(0,0,0,.5)}
.wt-panel.open{right:0}
.wt-panel::-webkit-scrollbar{width:4px}
.wt-panel::-webkit-scrollbar-thumb{background:#444;border-radius:2px}
.wt-hdr{padding:16px 16px 12px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-bottom:1px solid #2a2a4a;position:sticky;top:0;z-index:1}
.wt-hdr-title{font-family:'Outfit','Manrope',sans-serif;font-size:.78em;font-weight:700;color:#4a90e2;letter-spacing:2px}
.wt-time{padding:16px;text-align:center;background:linear-gradient(135deg,#0f1923,#162231);border-bottom:1px solid #1a2a3a}
.wt-clock{font-family:'Outfit','Manrope',sans-serif;font-size:2.4em;font-weight:800;color:#fff;letter-spacing:2px;line-height:1}
.wt-clock-s{font-size:.38em;color:#4a90e2;vertical-align:super}
.wt-date{font-size:.8em;color:#8899aa;margin-top:4px}
.wt-greet{font-size:.75em;color:#4a90e2;margin-top:6px;font-weight:600}
.wt-card{margin:10px;padding:14px;background:#252525;border-radius:10px;border:1px solid #333;transition:border-color .3s}
.wt-card:hover{border-color:#4a90e2}
.wt-card-t{font-size:.72em;font-weight:700;color:#4a90e2;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:5px}
.wt-card-t::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#333,transparent)}
.as-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.as-item{text-align:center;padding:10px 6px;background:#1e1e1e;border-radius:8px;border:1px solid #333}
.as-val{font-family:'Outfit','Manrope',sans-serif;font-size:1.5em;font-weight:800;line-height:1}
.as-val.intake{color:#4a90e2}.as-val.done{color:#27ae60}.as-val.remain{color:#e74c3c}
.as-lbl{font-size:.68em;color:#888;margin-top:3px}
/* 미니 타이머 */
.mt-row{display:flex;gap:6px;margin-bottom:8px}
.mt-sel{flex:1;padding:6px 8px;background:#1e1e1e;border:1px solid #444;border-radius:6px;color:#ddd;font-size:.75em;font-family:'Manrope',sans-serif}
.mt-inp{width:100%;padding:6px 8px;background:#1e1e1e;border:1px solid #444;border-radius:6px;color:#ddd;font-size:.75em;font-family:'Manrope',sans-serif;margin-bottom:8px}
.mt-display{text-align:center;font-family:'Outfit','Manrope',sans-serif;font-size:2em;font-weight:800;color:#fff;padding:8px 0;letter-spacing:1px}
.mt-ms{font-size:.4em;color:#4a90e2}
.mt-info{text-align:center;font-size:.7em;color:#888;margin-bottom:8px;min-height:1.2em}
.mt-btns{display:flex;gap:6px}
.mt-btn{flex:1;padding:8px;border:none;border-radius:6px;font-size:.72em;font-weight:700;cursor:pointer;font-family:'Manrope',sans-serif;transition:all .2s}
.mt-btn:disabled{opacity:.4;cursor:default}
.mt-btn.start{background:#27ae60;color:#fff}.mt-btn.start:hover:not(:disabled){background:#2ecc71}
.mt-btn.pause{background:#f39c12;color:#fff}.mt-btn.pause:hover:not(:disabled){background:#f1c40f}
.mt-btn.stop{background:#e74c3c;color:#fff}.mt-btn.stop:hover:not(:disabled){background:#ff6b6b}
.mt-btn.reset{background:#555;color:#fff}.mt-btn.reset:hover:not(:disabled){background:#777}
.mt-msg{font-size:.7em;margin-top:6px;padding:4px 8px;border-radius:4px;display:none}
.mt-msg.ok{display:block;background:rgba(39,174,96,.15);color:#27ae60}
.mt-msg.err{display:block;background:rgba(231,76,60,.15);color:#e74c3c}
/* 공지 */
.nt-list{display:flex;flex-direction:column;gap:6px}
.nt-item{padding:8px 10px;background:#1e1e1e;border-radius:6px;border-left:3px solid #4a90e2;transition:all .2s}
.nt-item:hover{background:#2a2a3a}
.nt-item.urgent{border-left-color:#e74c3c;background:rgba(231,76,60,.04)}
.nt-badge{display:inline-block;font-size:.58em;font-weight:700;padding:2px 5px;border-radius:3px;margin-right:4px;vertical-align:middle}
.nt-badge.urgent{background:#e74c3c;color:#fff}.nt-badge.info{background:#4a90e2;color:#fff}.nt-badge.update{background:#f39c12;color:#fff}
.nt-text{font-size:.78em;color:#ccc;line-height:1.4}
.nt-date{font-size:.62em;color:#666;margin-top:3px}

.wt-foot{padding:12px 16px;text-align:center;font-size:.6em;color:#444;border-top:1px solid #2a2a2a}
`;
document.head.appendChild(css);

// ===== HTML 생성 =====
const toggle = document.createElement('button');
toggle.className = 'wt-toggle';
toggle.id = 'wtToggle';
toggle.innerHTML = '📊 위젯';
toggle.onclick = function() {
    document.getElementById('wtPanel').classList.toggle('open');
    this.classList.toggle('active');
};
document.body.appendChild(toggle);

const panel = document.createElement('div');
panel.className = 'wt-panel';
panel.id = 'wtPanel';
panel.innerHTML = `
<div class="wt-hdr"><div class="wt-hdr-title">📊 HIQASC Dashboard</div></div>
<div class="wt-time">
    <div class="wt-clock" id="wtClock">00:00<span class="wt-clock-s">:00</span></div>
    <div class="wt-date" id="wtDate"></div>
    <div class="wt-greet" id="wtGreet"></div>
</div>
<div class="wt-card" id="wtWeatherCard">
    <div class="wt-card-t">🌤️ 오늘의 날씨</div>
    <div style="display:flex;align-items:center;gap:10px" id="wtWxRow">
        <div style="font-size:2em" id="wtWxIcon">⏳</div>
        <div>
            <div style="font-family:'Outfit',sans-serif;font-size:1.6em;font-weight:700;color:#fff" id="wtWxTemp">--°</div>
            <div style="font-size:.75em;color:#888" id="wtWxDesc">위치 확인 중...</div>
        </div>
    </div>
    <div style="font-size:.7em;color:#666;margin-top:6px;display:flex;gap:12px" id="wtWxDetail"></div>
</div>
<div class="wt-card">
    <div class="wt-card-t">📦 오늘의 AS 현황</div>
    <div class="as-grid">
        <div class="as-item"><div class="as-val intake" id="wtIntake">--</div><div class="as-lbl">입고</div></div>
        <div class="as-item"><div class="as-val done" id="wtDone">--</div><div class="as-lbl">완료</div></div>
        <div class="as-item"><div class="as-val remain" id="wtRemain">--</div><div class="as-lbl">잔여</div></div>
    </div>
</div>
<div class="wt-card">
    <div class="wt-card-t">🏖️ 금일 연차자</div>
    <div id="wtLeaveList" style="font-size:.8em;color:#888;text-align:center;padding:4px 0">확인 중...</div>
</div>
<div class="wt-card">
    <div class="wt-card-t">⏱️ 리페어 타이머</div>
    <div class="mt-row">
        <select class="mt-sel" id="wtTech"><option value="">테크니션</option></select>
        <select class="mt-sel" id="wtModel"><option value="">모델명</option></select>
    </div>
    <input class="mt-inp" id="wtSymptom" placeholder="증상 입력">
    <div class="mt-display" id="wtTimer">00:00:00<span class="mt-ms">.00</span></div>
    <div class="mt-info" id="wtTimerInfo"></div>
    <div class="mt-btns">
        <button class="mt-btn start" id="wtStart" onclick="HIQW.startTimer()">▶ 시작</button>
        <button class="mt-btn pause" id="wtPause" onclick="HIQW.pauseTimer()" disabled>⏸</button>
        <button class="mt-btn stop" id="wtStop" onclick="HIQW.stopTimer()" disabled>⏹ 저장</button>
        <button class="mt-btn reset" id="wtReset" onclick="HIQW.resetTimer()">↺</button>
    </div>
    <div class="mt-msg" id="wtSaveMsg"></div>
</div>
<div class="wt-card">
    <div class="wt-card-t">📢 공지 / 전달사항</div>
    <div class="nt-list" id="wtNotice">
        <div class="nt-item"><div class="nt-text" style="color:#666;text-align:center">공지사항 시트 연동 준비 중</div></div>
    </div>
</div>

<div class="wt-foot">HIQASC Widget v${WIDGET_VERSION} • 자동 갱신 5분</div>
`;
document.body.appendChild(panel);

// ===== 시계 =====
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('wtClock').innerHTML = h+':'+m+'<span class="wt-clock-s">:'+s+'</span>';
    const days = ['일','월','화','수','목','금','토'];
    document.getElementById('wtDate').textContent = now.getFullYear()+'.'+ String(now.getMonth()+1).padStart(2,'0')+'.'+ String(now.getDate()).padStart(2,'0')+' ('+days[now.getDay()]+')';
    const hr = now.getHours();
    let g;
    if(hr<9)g='☀️ 좋은 아침이에요!';else if(hr<12)g='💪 오전 파이팅!';else if(hr<14)g='🍱 점심 맛있게!';else if(hr<18)g='☕ 오후도 힘내요!';else g='🌙 수고하셨습니다!';
    document.getElementById('wtGreet').textContent = g;
}
setInterval(updateClock, 1000);
updateClock();



// ===== 날씨 =====
function loadWeather() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            fetchWeather(pos.coords.latitude + ',' + pos.coords.longitude);
        }, function() { fetchWeather('Gwangju,South Korea'); });
    } else {
        fetchWeather('Gwangju,South Korea');
    }
}

function fetchWeather(loc) {
    fetch('https://wttr.in/' + loc + '?format=j1')
        .then(function(r){return r.json();})
        .then(function(data) {
            var cur = data.current_condition[0];
            var temp = cur.temp_C;
            var feel = cur.FeelsLikeC;
            var humid = cur.humidity;
            var wind = cur.windspeedKmph;
            var desc = (cur.lang_ko && cur.lang_ko[0]) ? cur.lang_ko[0].value : cur.weatherDesc[0].value;
            var city = data.nearest_area[0].areaName[0].value;
            var icon = '☀️';
            if(desc.indexOf('맑')>=0)icon='☀️';
            else if(desc.indexOf('구름')>=0||desc.indexOf('흐')>=0)icon='⛅';
            else if(desc.indexOf('비')>=0||desc.indexOf('소나기')>=0)icon='🌧️';
            else if(desc.indexOf('눈')>=0)icon='❄️';
            else if(desc.indexOf('안개')>=0)icon='🌫️';
            else if(desc.indexOf('천둥')>=0)icon='⛈️';
            document.getElementById('wtWxIcon').textContent = icon;
            document.getElementById('wtWxTemp').textContent = temp + '°';
            document.getElementById('wtWxDesc').textContent = desc + ' • ' + city;
            document.getElementById('wtWxDetail').innerHTML = '<span>💧 습도 ' + humid + '%</span><span>💨 바람 ' + wind + 'km/h</span><span>🌡️ 체감 ' + feel + '°</span>';
        }).catch(function() {
            document.getElementById('wtWxIcon').textContent = '❓';
            document.getElementById('wtWxTemp').textContent = '--°';
            document.getElementById('wtWxDesc').textContent = '날씨 정보를 가져올 수 없습니다';
            document.getElementById('wtWxDetail').innerHTML = '';
        });
}
loadWeather();

// ===== AS 현황 (machine-dashboard.html 로직 그대로) =====
var WIDGET_MODEL_DB = [];
var WIDGET_EXCLUDED = ['Vertuo Creatista'];

function widgetParseSheets(text, isModel) {
    var json = JSON.parse(text.substring(47).slice(0,-2));
    var rows = json.table.rows;
    var cols, startRow = 0;
    if (isModel) {
        cols = ['International Machine ID','model line','model'];
        startRow = 1;
    } else {
        cols = json.table.cols.map(function(c){return c.label;});
    }
    return rows.slice(startRow).map(function(row) {
        var obj = {};
        row.c.forEach(function(cell, i) {
            obj[cols[i]] = cell ? cell.v : null;
        });
        return obj;
    });
}

function widgetGetModelInfo(machineId) {
    var searchId = String(machineId).trim();
    for (var i = 0; i < WIDGET_MODEL_DB.length; i++) {
        var m = WIDGET_MODEL_DB[i];
        if (String(m['International Machine ID']).trim() === searchId) {
            var modelName = m['model'];
            var line = m['model line'];
            if (WIDGET_EXCLUDED.indexOf(modelName) >= 0) return { line:'OTHER' };
            return { line: line };
        }
    }
    return { line: 'OTHER' };
}

function widgetCountValid(data) {
    var count = 0;
    data.forEach(function(row) {
        var machineId = row['International Machine ID'];
        if (!machineId) return;
        var info = widgetGetModelInfo(machineId);
        if (info.line === 'ORIGINAL' || info.line === 'VERTUO') count++;
    });
    return count;
}

function loadASStats() {
    var sheetId = '111K9l8gt-14roqvynNFEJrT2aLsTYjU8gQBsKNiyFmI';
    var modelUrl = 'https://docs.google.com/spreadsheets/d/'+sheetId+'/gviz/tq?tqx=out:json&sheet=model&_='+Date.now();
    var completeUrl = 'https://docs.google.com/spreadsheets/d/'+sheetId+'/gviz/tq?tqx=out:json&sheet=완료&_='+Date.now();
    var remainUrl = 'https://docs.google.com/spreadsheets/d/'+sheetId+'/gviz/tq?tqx=out:json&sheet=잔여&_='+Date.now();

    Promise.all([
        fetch(modelUrl).then(function(r){return r.text();}),
        fetch(completeUrl).then(function(r){return r.text();}),
        fetch(remainUrl).then(function(r){return r.text();})
    ]).then(function(results) {
        WIDGET_MODEL_DB = widgetParseSheets(results[0], true);
        var completeData = widgetParseSheets(results[1], false);
        var remainData = widgetParseSheets(results[2], false);
        var done = widgetCountValid(completeData);
        var remain = widgetCountValid(remainData);
        var intake = done + remain;
        document.getElementById('wtDone').textContent = done.toLocaleString();
        document.getElementById('wtRemain').textContent = remain.toLocaleString();
        document.getElementById('wtIntake').textContent = intake.toLocaleString();
    }).catch(function(e) {
        console.error('Widget AS load error:', e);
        document.getElementById('wtIntake').textContent = '-';
        document.getElementById('wtDone').textContent = '-';
        document.getElementById('wtRemain').textContent = '-';
    });
}
loadASStats();
setInterval(loadASStats, 300000);


// ===== 금일 연차자 =====
function loadLeaveToday() {
    var leaveSheetId = '1cmMEbIkmEL629RT04hpUUgXddnSVLGo1YwRzBwfyzCY';
    var url = 'https://docs.google.com/spreadsheets/d/' + leaveSheetId + "/gviz/tq?tqx=out:json;responseHandler:wt_leave&sheet=" + encodeURIComponent('연차신청') + "&headers=1&tq=" + encodeURIComponent("SELECT B, E, F, I WHERE I = '승인'") + "&_=" + Date.now();
    // B=이름, E=시작일, F=종료일, I=승인상태

    window.wt_leave = function(r) {
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
        var onLeave = [];

        if (r.table && r.table.rows) {
            r.table.rows.forEach(function(row) {
                if (!row.c) return;
                var name = row.c[0] ? (row.c[0].f || row.c[0].v || '') : '';
                var startRaw = row.c[1] ? (row.c[1].f || String(row.c[1].v || '')) : '';
                var endRaw = row.c[2] ? (row.c[2].f || String(row.c[2].v || '')) : '';

                var startDate = wtNormalizeDate(startRaw);
                var endDate = wtNormalizeDate(endRaw);

                if (name && startDate && endDate && startDate <= todayStr && endDate >= todayStr) {
                    onLeave.push(name);
                }
            });
        }

        var el = document.getElementById('wtLeaveList');
        if (onLeave.length === 0) {
            el.innerHTML = '<div style="color:#27ae60;font-weight:600">✅ 금일 연차자 없음</div>';
        } else {
            var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">';
            onLeave.forEach(function(name) {
                html += '<span style="display:inline-block;padding:4px 10px;background:rgba(230,126,34,.12);border:1px solid rgba(230,126,34,.3);border-radius:6px;color:#e67e22;font-weight:600;font-size:.85em">🏖️ ' + name + '</span>';
            });
            html += '</div>';
            html += '<div style="color:#666;font-size:.75em;margin-top:6px">' + onLeave.length + '명 연차</div>';
            el.innerHTML = html;
        }

        delete window.wt_leave;
    };
    var s = document.createElement('script'); s.src = url; document.body.appendChild(s);
}

function wtNormalizeDate(val) {
    if (!val) return '';
    var str = String(val).trim();
    var gm = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
    if (gm) return gm[1] + '-' + String(parseInt(gm[2])+1).padStart(2,'0') + '-' + String(gm[3]).padStart(2,'0');
    var dm = str.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
    if (dm) return dm[1] + '-' + String(dm[2]).padStart(2,'0') + '-' + String(dm[3]).padStart(2,'0');
    var hm = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (hm) return hm[1] + '-' + String(hm[2]).padStart(2,'0') + '-' + String(hm[3]).padStart(2,'0');
    return str;
}

loadLeaveToday();
setInterval(loadLeaveToday, 300000);

// ===== 리페어 타이머 (미니 버전) =====
let wtElapsed = 0, wtRunning = false, wtPaused = false, wtInterval = null, wtStartTime = 0;

// 타이머 상태 저장/복원
function saveTimerState() {
    var state = {
        running: wtRunning,
        paused: wtPaused,
        startTime: wtStartTime,
        elapsed: wtElapsed,
        tech: document.getElementById('wtTech').value,
        model: document.getElementById('wtModel').value,
        symptom: document.getElementById('wtSymptom').value
    };
    sessionStorage.setItem('wt_timer', JSON.stringify(state));
}

function restoreTimerState() {
    var saved = sessionStorage.getItem('wt_timer');
    if (!saved) return;
    try {
        var state = JSON.parse(saved);
        if (!state.tech && !state.running && !state.paused) return;

        // 드롭다운 값 복원 (드롭다운 로드 후 실행해야 하므로 딜레이)
        setTimeout(function() {
            if (state.tech) document.getElementById('wtTech').value = state.tech;
            if (state.model) document.getElementById('wtModel').value = state.model;
            if (state.symptom) document.getElementById('wtSymptom').value = state.symptom;

            if (state.running) {
                // 실행 중이었으면 — 경과 시간 계산해서 이어서
                wtStartTime = state.startTime;
                wtElapsed = Date.now() - wtStartTime;
                wtRunning = true;
                wtInterval = setInterval(function(){wtElapsed=Date.now()-wtStartTime;updateTimerDisplay();saveTimerState();},50);
                document.getElementById('wtTimerInfo').textContent = state.tech + ' · ' + state.model + ' 수리 중...';
                document.getElementById('wtStart').disabled = true;
                document.getElementById('wtPause').disabled = false;
                document.getElementById('wtStop').disabled = false;
                document.getElementById('wtTech').disabled = true;
                document.getElementById('wtModel').disabled = true;
                document.getElementById('wtSymptom').disabled = true;
            } else if (state.paused) {
                // 일시정지 상태였으면
                wtElapsed = state.elapsed;
                wtPaused = true;
                updateTimerDisplay();
                document.getElementById('wtTimerInfo').textContent = state.tech + ' · ' + state.model + ' (일시정지)';
                document.getElementById('wtStart').disabled = false;
                document.getElementById('wtStart').textContent = '▶ 계속';
                document.getElementById('wtPause').disabled = true;
                document.getElementById('wtStop').disabled = false;
                document.getElementById('wtTech').disabled = true;
                document.getElementById('wtModel').disabled = true;
                document.getElementById('wtSymptom').disabled = true;
            }
        }, 1500); // 드롭다운 로드 대기
    } catch(e) {}
}

function loadTimerData() {
    // 테크니션
    const tUrl = `https://docs.google.com/spreadsheets/d/${SHEET_IDS.leave}/gviz/tq?tqx=out:json;responseHandler:wt_tech&sheet=테크니션정보&headers=1&tq=${encodeURIComponent('SELECT A')}&_=${Date.now()}`;
    window.wt_tech = function(r) {
        const sel = document.getElementById('wtTech');
        if(r.table && r.table.rows) {
            r.table.rows.forEach(row => {
                if(row.c && row.c[0] && row.c[0].v) {
                    const o = document.createElement('option');
                    o.value = o.textContent = row.c[0].v;
                    sel.appendChild(o);
                }
            });
        }
        delete window.wt_tech;
    };
    const s1 = document.createElement('script'); s1.src = tUrl; document.body.appendChild(s1);

    // 모델
    const mUrl = `https://docs.google.com/spreadsheets/d/${SHEET_IDS.main}/gviz/tq?tqx=out:json;responseHandler:wt_model&sheet=모델목록&headers=1&tq=${encodeURIComponent('SELECT A')}&_=${Date.now()}`;
    window.wt_model = function(r) {
        const sel = document.getElementById('wtModel');
        if(r.table && r.table.rows) {
            r.table.rows.forEach(row => {
                if(row.c && row.c[0] && row.c[0].v) {
                    const o = document.createElement('option');
                    o.value = o.textContent = row.c[0].v;
                    sel.appendChild(o);
                }
            });
        }
        delete window.wt_model;
    };
    const s2 = document.createElement('script'); s2.src = mUrl; document.body.appendChild(s2);
}
loadTimerData();
restoreTimerState();

function updateTimerDisplay() {
    const t = wtElapsed;
    const h = Math.floor(t/3600000), m = Math.floor((t%3600000)/60000), s = Math.floor((t%60000)/1000), ms = Math.floor((t%1000)/10);
    document.getElementById('wtTimer').innerHTML = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}<span class="mt-ms">.${String(ms).padStart(2,'0')}</span>`;
}

window.HIQW = {
    startTimer: function() {
        const tech = document.getElementById('wtTech').value;
        const model = document.getElementById('wtModel').value;
        if(!tech){alert('테크니션을 선택하세요.');return;}
        if(!model){alert('모델명을 선택하세요.');return;}

        if(wtPaused) {
            wtStartTime = Date.now() - wtElapsed;
            wtPaused = false;
        } else {
            wtStartTime = Date.now();
            wtElapsed = 0;
        }
        wtRunning = true;
        wtInterval = setInterval(()=>{wtElapsed=Date.now()-wtStartTime;updateTimerDisplay();saveTimerState();},50);
        document.getElementById('wtTimerInfo').textContent = `${tech} · ${model} 수리 중...`;
        document.getElementById('wtStart').disabled = true;
        document.getElementById('wtPause').disabled = false;
        document.getElementById('wtStop').disabled = false;
        document.getElementById('wtTech').disabled = true;
        document.getElementById('wtModel').disabled = true;
        document.getElementById('wtSymptom').disabled = true;
    },

    pauseTimer: function() {
        if(!wtRunning) return;
        clearInterval(wtInterval);
        wtRunning = false;
        wtPaused = true;
        document.getElementById('wtStart').disabled = false;
        document.getElementById('wtStart').textContent = '▶ 계속';
        document.getElementById('wtPause').disabled = true;
        document.getElementById('wtTimerInfo').textContent += ' (일시정지)';
        saveTimerState();
    },

    stopTimer: function() {
        if(!wtRunning && !wtPaused) return;
        clearInterval(wtInterval);
        wtRunning = false;
        wtPaused = false;

        const tech = document.getElementById('wtTech').value;
        const model = document.getElementById('wtModel').value;
        const symptom = document.getElementById('wtSymptom').value;
        const totalSeconds = Math.round(wtElapsed/1000);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        const timeDisplay = document.getElementById('wtTimer').textContent.replace(/\.\d+$/,'');

        const record = {
            time: timeStr,
            date: `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`,
            timestamp: now.toLocaleString('ko-KR'),
            technician: tech,
            model: model,
            symptom: symptom,
            timeDisplay: timeDisplay,
            seconds: totalSeconds
        };

        // 저장
        const msg = document.getElementById('wtSaveMsg');
        fetch(REPAIR_SCRIPT_URL, {
            method:'POST', mode:'no-cors',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(record)
        }).then(()=>{
            msg.className='mt-msg ok';msg.textContent='✅ 저장 완료!';
        }).catch(e=>{
            msg.className='mt-msg err';msg.textContent='❌ 저장 실패';
        });

        document.getElementById('wtTimerInfo').textContent = `✅ ${timeDisplay} 저장!`;
        document.getElementById('wtStart').disabled = true;
        document.getElementById('wtPause').disabled = true;
        document.getElementById('wtStop').disabled = true;
        sessionStorage.removeItem('wt_timer');
    },

    resetTimer: function() {
        clearInterval(wtInterval);
        wtRunning = false; wtPaused = false; wtElapsed = 0;
        updateTimerDisplay();
        document.getElementById('wtTimerInfo').textContent = '';
        document.getElementById('wtStart').textContent = '▶ 시작';
        document.getElementById('wtStart').disabled = false;
        document.getElementById('wtPause').disabled = true;
        document.getElementById('wtStop').disabled = true;
        document.getElementById('wtTech').disabled = false;
        document.getElementById('wtModel').disabled = false;
        document.getElementById('wtSymptom').disabled = false;
        document.getElementById('wtSymptom').value = '';
        const msg = document.getElementById('wtSaveMsg');
        msg.className='mt-msg';msg.style.display='none';
        sessionStorage.removeItem('wt_timer');
    }
};

// ===== 공지사항 (Google Sheets 연동 준비) =====
function loadNotices() {
    if(!NOTICE_SHEET_ID) return; // 시트 ID 없으면 스킵
    const url = `https://docs.google.com/spreadsheets/d/${NOTICE_SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:wt_notice&sheet=${encodeURIComponent(NOTICE_TAB_NAME)}&headers=1&tq=${encodeURIComponent('SELECT A,B,C,D ORDER BY A DESC LIMIT 5')}&_=${Date.now()}`;
    // A=날짜, B=유형(긴급/안내/업데이트), C=내용, D=작성자
    window.wt_notice = function(r) {
        const list = document.getElementById('wtNotice');
        list.innerHTML = '';
        if(r.table && r.table.rows && r.table.rows.length > 0) {
            r.table.rows.forEach(row => {
                // 날짜 파싱 — gviz는 "Date(2026,3,29)" 형태로 반환 (월 0-indexed)
                let date = '';
                if(row.c[0]) {
                    if(row.c[0].f) {
                        date = row.c[0].f; // 포맷된 값 우선
                    } else if(row.c[0].v && typeof row.c[0].v === 'string' && row.c[0].v.indexOf('Date(') === 0) {
                        var dm = row.c[0].v.match(/Date\((\d+),(\d+),(\d+)\)/);
                        if(dm) date = (parseInt(dm[2])+1) + '/' + dm[3];
                    } else {
                        date = row.c[0].v || '';
                    }
                }
                const type = (row.c[1]&&row.c[1].v)||'안내';
                const text = (row.c[2]&&row.c[2].v)||'';
                const author = (row.c[3]&&(row.c[3].f||row.c[3].v))||'';
                const badgeClass = type === '긴급' ? 'urgent' : type === '업데이트' ? 'update' : 'info';
                const itemClass = type === '긴급' ? 'nt-item urgent' : 'nt-item';
                list.innerHTML += `<div class="${itemClass}"><div class="nt-text"><span class="nt-badge ${badgeClass}">${type}</span>${text}</div><div class="nt-date">${date} • ${author}</div></div>`;
            });
        } else {
            list.innerHTML = '<div class="nt-item"><div class="nt-text" style="color:#666;text-align:center">공지사항이 없습니다</div></div>';
        }
        delete window.wt_notice;
    };
    const s = document.createElement('script'); s.src = url; document.body.appendChild(s);
}
loadNotices();



})();
