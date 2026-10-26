/**
 * 마감 셀프체크 현황 위젯 — 화면 왼쪽 고정 패널 (접기/펼치기)
 *
 * 사용법 (index.html):
 *   1) 메인 화면 영역 안에        <div id="closing-board"></div>
 *   2) </body> 바로 위에          <script src="closing-board.js"></script>
 *
 * DEVELOPED BY DONGGU KANG
 */
(function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH2PVmFBVK-m17gJN5waBhOBHIZSAy0i-d34101gub4hc0PR7gkYQNYFoSsDM_goXX/exec';
  const SELF_CHECK_URL = 'closing-check.html';
  const REFRESH_MS = 60 * 1000;
  const STATE_KEY = 'hiq_closingboard_open';
  const WIDE_SCREEN = 1680;   // 이 폭 이상이면 기본 펼침, 미만이면 기본 접힘

  const CSS = `
  #closing-board{position:fixed;left:20px;top:20px;z-index:90;font-family:'Manrope','Pretendard','Malgun Gothic',sans-serif;color:#e8e8e8}
  .cb-panel{width:240px;max-height:calc(100vh - 40px);overflow-y:auto;background:#353535;border:1px solid #4a4a4a;border-radius:14px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.35);box-sizing:border-box}
  .cb-panel::-webkit-scrollbar{width:6px}.cb-panel::-webkit-scrollbar-thumb{background:#555;border-radius:6px}
  .cb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
  .cb-title{font-size:14px;font-weight:800;margin:0;line-height:1.3}
  .cb-title span{color:#4a90e2}
  .cb-sub{font-size:11px;color:#9a9a9a;margin-top:2px}
  .cb-x{border:1px solid #4a4a4a;background:#2a2a2a;color:#aaa;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:13px;line-height:1;flex:0 0 26px}
  .cb-x:hover{color:#fff;border-color:#4a90e2}
  .cb-rounds{display:flex;flex-direction:column;gap:6px;margin:12px 0}
  .cb-r{background:#2a2a2a;border:1px solid #444;border-radius:8px;padding:7px 9px}
  .cb-r.cur{border-color:#4a90e2}
  .cb-r-top{display:flex;justify-content:space-between;font-size:12px}
  .cb-r-top b{font-weight:700}
  .cb-r-top .n{font-weight:800}
  .cb-r-top .n small{color:#9a9a9a;font-weight:600}
  .cb-bar{height:4px;border-radius:4px;background:#444;margin-top:5px;overflow:hidden}
  .cb-bar i{display:block;height:100%;background:#27ae60}
  .cb-miss{font-size:11.5px;line-height:1.5;background:rgba(214,69,69,.12);border:1px solid rgba(214,69,69,.35);color:#ff9b9b;border-radius:8px;padding:7px 9px;margin-bottom:10px}
  .cb-allok{font-size:11.5px;background:rgba(39,174,96,.12);border:1px solid rgba(39,174,96,.35);color:#7ddba3;border-radius:8px;padding:7px 9px;margin-bottom:10px}
  .cb-t{width:100%;border-collapse:collapse;font-size:12px}
  .cb-t th,.cb-t td{padding:5px 3px;border-bottom:1px solid #444;text-align:center;white-space:nowrap}
  .cb-t th{font-size:11px;color:#9a9a9a;font-weight:700}
  .cb-t th.cur{color:#4a90e2}
  .cb-t td:first-child,.cb-t th:first-child{text-align:left;font-weight:700;max-width:90px;overflow:hidden;text-overflow:ellipsis}
  .cb-t td.ok{color:#5fd08f}.cb-t td.late{color:#f0a35e}.cb-t td.bad{color:#ff8585}.cb-t td.now{color:#8cbcf2}.cb-t td.none{color:#666}
  .cb-t td small{display:block;font-size:10px;font-weight:600;opacity:.85}
  .cb-legend{font-size:10.5px;color:#888;margin-top:8px;line-height:1.6}
  .cb-go{width:100%;margin-top:10px;border:0;border-radius:8px;background:#4a90e2;color:#fff;font:inherit;font-size:13px;font-weight:700;padding:9px;cursor:pointer}
  .cb-go:hover{background:#3a7bc8}
  .cb-msg{font-size:12px;color:#aaa;padding:8px 0}
  .cb-pill{display:flex;align-items:center;gap:8px;background:#353535;border:1px solid #4a4a4a;border-radius:24px;padding:8px 14px;cursor:pointer;font-size:12.5px;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.3);color:#e8e8e8}
  .cb-pill:hover{border-color:#4a90e2}
  .cb-pill .dot{width:8px;height:8px;border-radius:50%;background:#27ae60}
  .cb-pill .dot.warn{background:#ff6b6b}
  .cb-pill .dot.wait{background:#4a90e2}
  @media (max-width:768px){
    #closing-board{top:auto;bottom:16px;left:12px}
    .cb-panel{max-height:70vh}
  }
  `;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toMin = hm => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + m; };

  let el, data, loadedAt = 0, isOpen;
  const nowMin = () => toMin(data.now) + Math.floor((Date.now() - loadedAt) / 60000);
  const fmt = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  function loadOpenState() {
    try {
      const v = localStorage.getItem(STATE_KEY);
      if (v === '1') return true;
      if (v === '0') return false;
    } catch (_) {}
    return window.innerWidth >= WIDE_SCREEN;
  }
  function setOpen(v) {
    isOpen = v;
    try { localStorage.setItem(STATE_KEY, v ? '1' : '0'); } catch (_) {}
    render();
  }

  function curRound() {
    const n = nowMin();
    const opened = data.rounds.filter(r => n >= toMin(r.open));
    return opened.length ? opened[opened.length - 1] : null;
  }
  function doneCount(no) {
    return data.names.filter(nm => data.records.some(x => x.name === nm && x.round === no)).length;
  }

  function cell(name, r) {
    const rec = data.records.find(x => x.name === name && x.round === r.no);
    if (rec) return rec.status === '지연'
      ? `<td class="late" title="${esc(rec.time)} 지연 완료">🟠<small>${esc(rec.time)}</small></td>`
      : `<td class="ok" title="${esc(rec.time)} 완료">✅<small>${esc(rec.time)}</small></td>`;
    const n = nowMin();
    if (n > toMin(r.deadline)) return '<td class="bad" title="미완료">❌</td>';
    if (n >= toMin(r.open)) return '<td class="now" title="진행 중">⏳</td>';
    return '<td class="none">·</td>';
  }

  function renderPill() {
    const cur = curRound();
    let dot = 'wait', text = '마감 셀프체크';
    if (cur) {
      const done = doneCount(cur.no), total = data.names.length;
      dot = done >= total ? '' : (nowMin() > toMin(cur.deadline) ? 'warn' : 'wait');
      text = `마감 ${esc(cur.label)} ${done}/${total}`;
    }
    el.innerHTML = `<div class="cb-pill" title="펼치기"><span class="dot ${dot}"></span>✅ ${text} ▸</div>`;
    el.querySelector('.cb-pill').onclick = () => setOpen(true);
  }

  function render() {
    if (!el) return;
    if (!data) { el.innerHTML = isOpen ? panelMsg('불러오는 중…') : ''; bindClose(); return; }
    if (!isOpen) { renderPill(); return; }

    const names = data.names || [];
    const n = nowMin();
    const cur = curRound();
    const d = new Date(data.date + 'T00:00:00');
    const wd = '일월화수목금토'[d.getDay()];

    const rounds = data.rounds.map(r => {
      const done = doneCount(r.no);
      const pct = names.length ? Math.round(done / names.length * 100) : 0;
      return `<div class="cb-r ${cur && r.no === cur.no ? 'cur' : ''}">
        <div class="cb-r-top"><b>${esc(r.label)} · ${esc(r.deadline)}</b><span class="n">${done}<small> / ${names.length}</small></span></div>
        <div class="cb-bar"><i style="width:${pct}%"></i></div></div>`;
    }).join('');

    let missLine = '';
    if (cur && names.length) {
      const miss = names.filter(nm => !data.records.some(x => x.name === nm && x.round === cur.no));
      missLine = miss.length
        ? `<div class="cb-miss">${n > toMin(cur.deadline) ? '❌' : '⏳'} <b>${esc(cur.label)} 미완료 ${miss.length}명</b><br>${miss.map(esc).join(', ')}</div>`
        : `<div class="cb-allok">🎉 ${esc(cur.label)} 전원 완료!</div>`;
    }

    const head = data.rounds.map(r => `<th class="${cur && r.no === cur.no ? 'cur' : ''}">${esc(r.label)}</th>`).join('');
    const rows = names.length
      ? names.map(nm => `<tr><td title="${esc(nm)}">${esc(nm)}</td>${data.rounds.map(r => cell(nm, r)).join('')}</tr>`).join('')
      : `<tr><td colspan="4" class="cb-msg">명단 탭에 테크니션을 등록해주세요.</td></tr>`;

    el.innerHTML = `<div class="cb-panel">
      <div class="cb-head">
        <div><h3 class="cb-title">◆ 마감 <span>셀프체크</span></h3>
          <div class="cb-sub">${esc(data.date.slice(5).replace('-', '/'))}(${wd}) ${fmt(n)} 기준</div></div>
        <button class="cb-x" type="button" title="접기">◂</button>
      </div>
      <div class="cb-rounds">${rounds}</div>
      ${missLine}
      <table class="cb-t"><thead><tr><th>이름</th>${head}</tr></thead><tbody>${rows}</tbody></table>
      <div class="cb-legend">✅ 완료 · 🟠 지연 · ❌ 미완료 · ⏳ 진행 중</div>
      <button class="cb-go" type="button">✍️ 셀프체크 하기</button>
    </div>`;
    el.querySelector('.cb-go').onclick = () => { location.href = SELF_CHECK_URL; };
    bindClose();
  }

  function panelMsg(t) {
    return `<div class="cb-panel"><div class="cb-head"><h3 class="cb-title">◆ 마감 <span>셀프체크</span></h3>
      <button class="cb-x" type="button" title="접기">◂</button></div><div class="cb-msg">${esc(t)}</div></div>`;
  }
  function bindClose() {
    const x = el.querySelector('.cb-x');
    if (x) x.onclick = () => setOpen(false);
  }

  async function load() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      if (isOpen) { el.innerHTML = panelMsg('APPS_SCRIPT_URL이 설정되지 않았습니다.'); bindClose(); }
      return;
    }
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?_cb=' + Date.now(), { cache: 'no-store' });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || '조회 실패');
      data = d; loadedAt = Date.now();
      render();
    } catch (e) {
      if (!data && isOpen) { el.innerHTML = panelMsg('현황을 불러오지 못했습니다. (' + e.message + ')'); bindClose(); }
    }
  }

  function mount() {
    el = document.getElementById('closing-board');
    if (!el) return;
    if (!document.getElementById('cb-style')) {
      const st = document.createElement('style');
      st.id = 'cb-style'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    isOpen = loadOpenState();
    render();
    load();
    setInterval(load, REFRESH_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
