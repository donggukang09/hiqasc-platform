/**
 * 마감 셀프체크 현황판 위젯 — index.html 등 어느 페이지에나 삽입 가능
 *
 * 사용법 (index.html):
 *   1) 현황판을 보여줄 위치에   <div id="closing-board"></div>
 *   2) </body> 바로 위에        <script src="closing-board.js"></script>
 *
 * DEVELOPED BY DONGGU KANG
 */
(function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH2PVmFBVK-m17gJN5waBhOBHIZSAy0i-d34101gub4hc0PR7gkYQNYFoSsDM_goXX/exec';
  const SELF_CHECK_URL = 'closing-check.html';
  const REFRESH_MS = 60 * 1000;

  const CSS = `
  .cb-card{background:#353535;border:1px solid #444;border-radius:14px;padding:18px;color:#e8e8e8;font-family:'Manrope','Pretendard','Malgun Gothic',sans-serif;margin:16px 0}
  .cb-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
  .cb-title{font-size:16px;font-weight:800;margin:0}
  .cb-title span{color:#4a90e2}
  .cb-sub{font-size:12px;color:#9a9a9a;margin-top:2px}
  .cb-go{border:0;border-radius:8px;background:#4a90e2;color:#fff;font:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer}
  .cb-go:hover{background:#3a7bc8}
  .cb-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
  .cb-s{background:#2a2a2a;border:1px solid #444;border-radius:10px;padding:10px;text-align:center}
  .cb-s.cur{border-color:#4a90e2;box-shadow:0 0 0 1px #4a90e2 inset}
  .cb-s b{display:block;font-size:13px}
  .cb-s .n{font-size:20px;font-weight:800;margin-top:2px}
  .cb-s .n small{font-size:12px;color:#9a9a9a;font-weight:600}
  .cb-s .bar{height:5px;border-radius:5px;background:#444;margin-top:6px;overflow:hidden}
  .cb-s .bar i{display:block;height:100%;background:#27ae60}
  .cb-miss{font-size:12.5px;background:rgba(214,69,69,.12);border:1px solid rgba(214,69,69,.35);color:#ff9b9b;border-radius:8px;padding:8px 10px;margin-bottom:12px}
  .cb-allok{font-size:12.5px;background:rgba(39,174,96,.12);border:1px solid rgba(39,174,96,.35);color:#7ddba3;border-radius:8px;padding:8px 10px;margin-bottom:12px}
  .cb-tw{overflow-x:auto}
  .cb-t{width:100%;border-collapse:collapse;font-size:13px;min-width:340px}
  .cb-t th,.cb-t td{padding:7px 8px;border-bottom:1px solid #444;text-align:center;white-space:nowrap}
  .cb-t th{font-size:12px;color:#aaa;font-weight:700}
  .cb-t th.cur{color:#4a90e2}
  .cb-t td:first-child,.cb-t th:first-child{text-align:left;font-weight:700}
  .cb-c{display:inline-block;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:700}
  .cb-ok{background:rgba(39,174,96,.18);color:#5fd08f}
  .cb-late{background:rgba(230,126,34,.2);color:#f0a35e}
  .cb-bad{background:rgba(214,69,69,.2);color:#ff8585}
  .cb-now{background:rgba(74,144,226,.18);color:#8cbcf2}
  .cb-none{color:#666}
  .cb-msg{font-size:13px;color:#aaa;padding:10px 0}
  @media (max-width:480px){.cb-s .n{font-size:17px}.cb-t{font-size:12px}}
  `;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toMin = hm => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + m; };

  let el, data, loadedAt = 0;
  const nowMin = () => toMin(data.now) + Math.floor((Date.now() - loadedAt) / 60000);
  const fmt = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  function cell(name, r) {
    const rec = data.records.find(x => x.name === name && x.round === r.no);
    if (rec) return rec.status === '지연'
      ? `<span class="cb-c cb-late">🟠 ${esc(rec.time)} 지연</span>`
      : `<span class="cb-c cb-ok">✅ ${esc(rec.time)}</span>`;
    const n = nowMin();
    if (n > toMin(r.deadline)) return '<span class="cb-c cb-bad">❌ 미완료</span>';
    if (n >= toMin(r.open)) return '<span class="cb-c cb-now">⏳ 진행 중</span>';
    return '<span class="cb-none">—</span>';
  }

  function render() {
    const names = data.names || [];
    const n = nowMin();
    const opened = data.rounds.filter(r => n >= toMin(r.open));
    const cur = opened.length ? opened[opened.length - 1].no : 0;
    const d = new Date(data.date + 'T00:00:00');
    const wd = '일월화수목금토'[d.getDay()];

    const sum = data.rounds.map(r => {
      const done = names.filter(nm => data.records.some(x => x.name === nm && x.round === r.no)).length;
      const pct = names.length ? Math.round(done / names.length * 100) : 0;
      return `<div class="cb-s ${r.no === cur ? 'cur' : ''}"><b>${esc(r.label)} · ${esc(r.deadline)}</b>
        <div class="n">${done}<small> / ${names.length}명</small></div>
        <div class="bar"><i style="width:${pct}%"></i></div></div>`;
    }).join('');

    // 현재(가장 최근 열린) 회차의 미완료자
    let missLine = '';
    if (cur) {
      const r = data.rounds.find(x => x.no === cur);
      const miss = names.filter(nm => !data.records.some(x => x.name === nm && x.round === cur));
      missLine = miss.length
        ? `<div class="cb-miss">${n > toMin(r.deadline) ? '❌' : '⏳'} <b>${esc(r.label)} 미완료 ${miss.length}명</b> — ${miss.map(esc).join(', ')}</div>`
        : `<div class="cb-allok">🎉 ${esc(r.label)} 마감 셀프체크 전원 완료!</div>`;
    }

    const head = data.rounds.map(r => `<th class="${r.no === cur ? 'cur' : ''}">${esc(r.label)} ${esc(r.deadline)}</th>`).join('');
    const rows = names.length
      ? names.map(nm => `<tr><td>${esc(nm)}</td>${data.rounds.map(r => `<td>${cell(nm, r)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="4" class="cb-msg">명단 탭에 테크니션을 등록해주세요.</td></tr>`;

    el.innerHTML = `<div class="cb-card">
      <div class="cb-head">
        <div><h3 class="cb-title">◆ 마감 <span>셀프체크</span> 현황</h3>
          <div class="cb-sub">${esc(data.date.slice(5).replace('-', '/'))}(${wd}) · ${fmt(n)} 기준 · 1분마다 자동 갱신</div></div>
        <button class="cb-go" type="button">✍️ 셀프체크 하기</button>
      </div>
      <div class="cb-sum">${sum}</div>
      ${missLine}
      <div class="cb-tw"><table class="cb-t"><thead><tr><th>테크니션</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
    el.querySelector('.cb-go').onclick = () => { location.href = SELF_CHECK_URL; };
  }

  function msg(t) {
    el.innerHTML = `<div class="cb-card"><h3 class="cb-title">◆ 마감 <span>셀프체크</span> 현황</h3><div class="cb-msg">${esc(t)}</div></div>`;
  }

  async function load() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') { msg('APPS_SCRIPT_URL이 설정되지 않았습니다.'); return; }
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?_cb=' + Date.now(), { cache: 'no-store' });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || '조회 실패');
      data = d; loadedAt = Date.now();
      render();
    } catch (e) {
      if (!data) msg('현황을 불러오지 못했습니다. (' + e.message + ')');
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
    msg('불러오는 중…');
    load();
    setInterval(load, REFRESH_MS);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
