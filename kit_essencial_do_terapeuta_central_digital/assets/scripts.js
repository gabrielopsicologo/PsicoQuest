(function(){
  const materials = window.KIT_MATERIALS || [];
  const filtersEl = document.getElementById('filters');
  const gridEl = document.getElementById('libraryGrid');
  const searchInput = document.getElementById('searchInput');
  const metaEl = document.getElementById('resultsMeta');
  const toTop = document.getElementById('toTop');
  let activeCat = 'Todos';

  const categoryIcons = {
    'Comece Aqui':'🚀','Primeiras Sessões':'🧭','Anamnese':'📋','Registros':'📝','Condução':'🎯','Comunicação':'💬','Organização':'📊','TCC':'🌿','Psicanálise':'🕯️','Documentos':'📑','Perguntas Clínicas':'❔','Biblioteca':'📚','Formulários Práticos':'🗂️','Materiais Psicoeducativos':'📘'
  };
  const categoryOrder = ['Todos','Comece Aqui','Primeiras Sessões','Anamnese','Registros','Condução','Comunicação','Organização','TCC','Psicanálise','Documentos','Formulários Práticos','Materiais Psicoeducativos','Perguntas Clínicas','Biblioteca'];

  function normalize(str){ return (str||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function nicePath(path){ return encodeURI(path).replace(/#/g,'%23'); }
  function escapeHtml(str){ return (str||'').replace(/[&<>"']/g, m=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m])); }
  function isEditavel(m){ return ['DOCX','XLSX','XLS'].includes((m.format||'').toUpperCase()); }
  function actionLabel(m){ if(m.format==='Online') return 'Usar online'; if(m.format==='PDF') return 'Abrir PDF'; if(isEditavel(m)) return 'Baixar editável'; return 'Abrir'; }

  function renderFilters(){
    if(!filtersEl) return;
    const cats = Array.from(new Set(materials.map(m => m.cat))).sort((a,b)=>categoryOrder.indexOf(a)-categoryOrder.indexOf(b));
    const allCats = ['Todos', ...cats];
    filtersEl.innerHTML = allCats.map(cat => `<button class="chip ${cat===activeCat?'active':''}" data-cat="${cat}">${cat}${cat!=='Todos' ? ` <span>(${materials.filter(m=>m.cat===cat).length})</span>` : ''}</button>`).join('');
    filtersEl.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat;
      renderFilters(); renderLibrary();
      document.getElementById('biblioteca')?.scrollIntoView({behavior:'smooth', block:'start'});
    }));
  }

  function card(m){
    const icon = categoryIcons[m.cat] || '📄';
    const tags = [m.subcat || m.cat, m.format, ...(m.tags||[]).filter(t=>!['pdf','docx','xlsx','online'].includes(normalize(t))).slice(0,2)];
    const actions = Array.isArray(m.actions) && m.actions.length ? m.actions.map(a=>{
      const href = nicePath(a.href || m.path || '#');
      const cls = a.kind === 'primary' ? 'action primary' : 'action';
      const target = a.target ? ` target="${a.target}" rel="noopener"` : '';
      const download = a.download ? ' download' : '';
      return `<a class="${cls}" href="${href}"${target}${download}>${escapeHtml(a.label||'Abrir')}</a>`;
    }).join('') : (()=>{
      const path = nicePath(m.path);
      const openTarget = m.format==='Online' ? '' : ' target="_blank" rel="noopener"';
      const downloadAction = (m.format==='PDF' || isEditavel(m)) ? `<a class="action" href="${path}" download>Baixar</a>` : '';
      return `<a class="action primary" href="${path}"${openTarget}>${actionLabel(m)}</a>${downloadAction}`;
    })();
    return `<article class="card" data-cat="${escapeHtml(m.cat)}">
      <div class="card-top"><span class="icon">${icon}</span><span class="badge">${escapeHtml(m.format)}</span></div>
      <div><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(m.desc||'Material pronto para uso.')}</p></div>
      <div class="tagrow">${Array.from(new Set(tags)).slice(0,4).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="card-actions">${actions}</div>
    </article>`;
  }

  function renderLibrary(){
    if(!gridEl || !searchInput || !metaEl) return;
    const q = normalize(searchInput.value);
    let list = materials.filter(m => activeCat==='Todos' || m.cat===activeCat);
    if(q){ list = list.filter(m => normalize([m.title,m.desc,m.cat,m.format,(m.tags||[]).join(' ')].join(' ')).includes(q)); }
    metaEl.textContent = `${list.length} material${list.length===1?'':'es'} encontrado${list.length===1?'':'s'}` + (activeCat!=='Todos'?` em ${activeCat}`:'');
    gridEl.innerHTML = list.length ? list.map(card).join('') : '<div class="empty">Nenhum material encontrado. Tente outro termo ou limpe os filtros.</div>';
  }

  if(filtersEl && gridEl && searchInput && metaEl){
    searchInput.addEventListener('input', () => { activeCat='Todos'; renderFilters(); renderLibrary(); });
    document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{ activeCat=btn.dataset.filter; searchInput.value=''; renderFilters(); renderLibrary(); document.getElementById('biblioteca')?.scrollIntoView({behavior:'smooth'}); }));
    document.querySelectorAll('[data-query]').forEach(btn=>btn.addEventListener('click',()=>{ activeCat='Todos'; searchInput.value=btn.dataset.query; renderFilters(); renderLibrary(); document.getElementById('biblioteca')?.scrollIntoView({behavior:'smooth'}); }));
    renderFilters(); renderLibrary();
  }
  if(toTop){
    window.addEventListener('scroll',()=>{ toTop.classList.toggle('show', window.scrollY>600); });
    toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  // Funções genéricas das ferramentas online: salvamento local, impressão e limpeza.
  function storageKey(){ return 'ket_central_' + location.pathname.split('/').pop().replace(/[^a-z0-9_\-.]/gi,'_'); }
  function getControls(){ return Array.from(document.querySelectorAll('input, textarea, select')).filter(el => el.type !== 'button' && el.type !== 'submit' && el.type !== 'reset'); }
  function showToast(msg){
    let toast = document.querySelector('.toast');
    if(!toast){ toast = document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 2100);
  }
  window.saveLocal = function(){
    const data = {};
    getControls().forEach((el,i)=>{ const k = el.id || el.name || ('field_'+i); data[k] = el.type === 'checkbox' ? el.checked : el.value; });
    localStorage.setItem(storageKey(), JSON.stringify(data));
    showToast('Rascunho salvo neste dispositivo.');
  };
  window.printPage = function(){ window.print(); };
  window.clearFields = function(){
    if(!confirm('Limpar os campos desta ferramenta?')) return;
    getControls().forEach(el=>{ if(el.type === 'checkbox' || el.type === 'radio') el.checked = false; else el.value = ''; });
    localStorage.removeItem(storageKey()); showToast('Campos limpos.');
  };
  window.copyText = async function(id){
    const el = document.getElementById(id);
    if(!el) return;
    const text = el.innerText || el.textContent || el.value || '';
    try{ await navigator.clipboard.writeText(text.trim()); showToast('Texto copiado.'); }
    catch(e){ showToast('Não foi possível copiar automaticamente.'); }
  };
  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      const raw = localStorage.getItem(storageKey()); if(!raw) return;
      const data = JSON.parse(raw);
      getControls().forEach((el,i)=>{ const k = el.id || el.name || ('field_'+i); if(k in data){ if(el.type === 'checkbox') el.checked = !!data[k]; else el.value = data[k]; } });
    }catch(e){}
  });
})();
