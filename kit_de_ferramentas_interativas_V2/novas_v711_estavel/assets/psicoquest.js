const PQ = (() => {
  const SUPPORT = 'https://wa.link/ydbdpl';
  function setupCommon(storageKey, buildSummary){
    const support = document.querySelectorAll('[data-support]');
    support.forEach(a => a.setAttribute('href', SUPPORT));
    document.querySelectorAll('[data-instructions]').forEach(btn => btn.addEventListener('click',()=>openModal('modal-instrucoes')));
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click',()=>btn.closest('.modal').classList.remove('open')));
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); }));
    const saved = localStorage.getItem(storageKey);
    if(saved){ try{ loadState(JSON.parse(saved)); }catch(e){} }
    document.querySelectorAll('[data-save]').forEach(btn=>btn.addEventListener('click',()=>{ localStorage.setItem(storageKey, JSON.stringify(collectState())); toast('Salvo neste aparelho.'); }));
    document.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>{ if(confirm('Limpar esta atividade?')){ localStorage.removeItem(storageKey); location.reload(); }}));
    document.querySelectorAll('[data-copy-summary]').forEach(btn=>btn.addEventListener('click',()=>copyText(buildSummary())));
    document.querySelectorAll('[data-download-txt]').forEach(btn=>btn.addEventListener('click',()=>downloadText(slug(document.title||'psicoquest')+'.txt', buildSummary())));
    document.querySelectorAll('[data-print]').forEach(btn=>btn.addEventListener('click',()=>window.print()));
    document.querySelectorAll('[data-copy-task]').forEach(btn=>btn.addEventListener('click',()=>copyText('Atividade PsicoQuest\n\nAbra a atividade, responda com calma e envie o resumo ao final. Se preferir, responda por mensagem ou mande uma foto/print das respostas.')));
  }
  function collectState(){
    const data={};
    document.querySelectorAll('textarea,input,select').forEach(el=>{ if(el.id) data[el.id]=el.type==='checkbox'?el.checked:el.value; });
    document.querySelectorAll('[data-choice].selected').forEach(el=>{ const group=el.getAttribute('data-choice'); data['choice_'+group]=el.getAttribute('data-value')||el.textContent.trim(); });
    return data;
  }
  function loadState(data){
    Object.entries(data).forEach(([k,v])=>{
      if(k.startsWith('choice_')){ const g=k.replace('choice_',''); const el=[...document.querySelectorAll(`[data-choice="${g}"]`)].find(x=>(x.getAttribute('data-value')||x.textContent.trim())===v); if(el) el.classList.add('selected'); return; }
      const el=document.getElementById(k); if(el) el.type==='checkbox'?el.checked=!!v:el.value=v;
    });
  }
  function choose(el){ const group=el.getAttribute('data-choice'); document.querySelectorAll(`[data-choice="${group}"]`).forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); }
  function chosen(group){ const el=document.querySelector(`[data-choice="${group}"].selected`); return el ? (el.getAttribute('data-value')||el.textContent.trim()) : ''; }
  function openModal(id){ document.getElementById(id)?.classList.add('open'); }
  function copyText(txt){ navigator.clipboard?.writeText(txt).then(()=>toast('Copiado.')).catch(()=>{ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copiado.'); }); }
  function downloadText(name, text){ const blob=new Blob([text],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
  function slug(s){ return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').toLowerCase(); }
  function toast(msg){ const t=document.createElement('div'); t.textContent=msg; t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#20384f;color:white;padding:12px 16px;border-radius:999px;z-index:200;box-shadow:0 12px 30px rgba(0,0,0,.25);font-weight:800'; document.body.appendChild(t); setTimeout(()=>t.remove(),1800); }
  return {setupCommon,choose,chosen,copyText,downloadText,toast,openModal};
})();
