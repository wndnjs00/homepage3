/* =========================================================
   MRINT Renewal — interaction layer
   ========================================================= */
(function(){
  'use strict';
  /* NEWS, PROJECTS, BL : js/data.js */

  /* ---------- helpers ---------- */
  var $ = function(s,r){return (r||document).querySelector(s);};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19L19 5M19 5H8M19 5v11"/></svg>';
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  /* ---------- HEADER / NAV ---------- */
  var hd = $('#hd');
  function onScroll(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    hd.classList.toggle('is-solid', y > 12);
    var tt = $('#totop');
    if(tt) tt.classList.toggle('is-on', y > 700);
    var hb = $('.hero__bg img');
    if(hb && y < window.innerHeight*1.2){ hb.style.transform = 'translateY('+(y*0.16)+'px) scale(1.02)'; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var burger = $('#burger');
  burger.addEventListener('click', function(){
    document.body.classList.toggle('mnav-open');
    burger.setAttribute('aria-label', document.body.classList.contains('mnav-open') ? '메뉴 닫기' : '메뉴 열기');
  });
  function closeMnav(){ document.body.classList.remove('mnav-open'); }
  var srch = $('#srch');
  $$('[data-open-search]').forEach(function(b){ b.addEventListener('click', function(){
    srch.style.transform='translateY(0)'; var i=$('#srchIn'); if(i) i.focus();
  });});
  $$('[data-close-search]').forEach(function(b){ b.addEventListener('click', function(){ srch.style.transform='translateY(-100%)'; });});
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ srch.style.transform='translateY(-100%)'; closeMnav(); }});
  $('#totop').addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });

  /* ---------- SEARCH ---------- */
  var srchOut = $('#srchOut'), srchIn = $('#srchIn');
  function doSearch(){
    var q = (srchIn.value||'').trim().toLowerCase();
    if(!q){ srchOut.innerHTML=''; return; }
    var hits = [];
    NEWS.forEach(function(n,i){ if((n.ttl+' '+n.tag).toLowerCase().indexOf(q)>-1) hits.push({t:n.ttl,d:n.date,u:'#/company/news/'+n.id,k:'NEWS'}); });
    PROJECTS.forEach(function(p,i){ if((p.t+' '+p.cl+' '+p.c+' '+p.k).toLowerCase().indexOf(q)>-1) hits.push({t:p.t,d:p.d,u:'#/business/projects/'+i,k:p.k}); });
    BL.forEach(function(b){ if((b.ttl+' '+b.desc+' '+b.pts.join(' ')).toLowerCase().indexOf(q)>-1) hits.push({t:b.ttl+' — '+b.desc,d:b.k.toUpperCase(),u:'#/business/business-line/'+b.k,k:'BUSINESS'}); });
    srchOut.innerHTML = hits.length ? hits.slice(0,12).map(function(h){
      return '<li><a href="'+h.u+'" data-nav style="display:grid;grid-template-columns:78px 92px minmax(0,1fr);gap:16px;padding:14px 0;border-bottom:1px solid var(--hair-l);color:rgba(255,255,255,.85);font-size:14.5px;font-weight:600;align-items:center">'
        +'<span class="mono" style="color:rgba(255,255,255,.4);font-size:11px">'+esc(h.k)+'</span>'
        +'<span class="mono" style="color:rgba(255,255,255,.4);font-size:11px">'+esc(h.d)+'</span>'
        +'<span>'+esc(h.t)+'</span></a></li>';
    }).join('') : '<li style="padding:22px 0;color:rgba(255,255,255,.5);font-size:14px">검색 결과가 없습니다.</li>';
  }
  srchIn.addEventListener('input', doSearch);

  /* ---------- REVEAL + COUNTERS ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target);} });
  },{rootMargin:'0px 0px -12% 0px',threshold:0.06}) : null;
  function observeReveals(){
    $$('.reveal:not(.is-in), .cap:not(.is-in), .techvis').forEach(function(el){ if(io) io.observe(el); else el.classList.add('is-in'); });
  }
  function counters(){
    $$('.nums b[data-count]').forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'),10);
      var plain = el.getAttribute('data-plain')==='1';
      var suffix = el.innerHTML.replace(/^(?:[\d,]+)/,'');
      var start = null, dur = 1500;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/dur,1);
        var eased = 1-Math.pow(1-p,3);
        var v = Math.round(target*eased);
        el.innerHTML = (plain? v : (v<10? '0'+v : v)) + suffix;
        if(p<1) requestAnimationFrame(step);
      }
      var cio = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
        es.forEach(function(e){ if(e.isIntersecting){ requestAnimationFrame(step); cio.unobserve(e.target);} });
      },{threshold:0.5}) : null;
      if(cio) cio.observe(el); else el.innerHTML = target + suffix;
    });
  }

  /* ---------- renderers ---------- */
  function newsRow(n){
    return '<a class="row" href="#/company/news/'+n.id+'" data-nav>'
      +'<span class="row__date">'+n.date+'</span>'
      +'<span class="row__tag">'+esc(n.tag)+'</span>'
      +'<span class="row__ttl">'+esc(n.ttl)+'</span>'
      +'<span class="row__arw">'+ARROW.replace('<svg','<svg width="22" height="22"')+'</span></a>';
  }
  function renderHomeNews(){
    var h = $('#homeNews'); if(!h) return;
    h.innerHTML = NEWS.slice(0,4).map(newsRow).join('');
  }
  var newsYear = 'ALL';
  function renderNews(){
    var f = $('#newsFilters'), l = $('#newsList'); if(!l) return;
    var years = ['ALL'].concat(NEWS.map(function(n){return n.date.slice(0,4);}).filter(function(v,i,a){return a.indexOf(v)===i;}));
    f.innerHTML = years.map(function(y){
      return '<button class="fbtn'+(y===newsYear?' is-on':'')+'" type="button" data-ny="'+y+'">'+(y==='ALL'?'전체':y+'년')
        +'<b>'+(y==='ALL'?NEWS.length:NEWS.filter(function(n){return n.date.indexOf(y)===0;}).length)+'</b></button>';
    }).join('');
    $$('[data-ny]',f).forEach(function(b){ b.addEventListener('click', function(){ newsYear=b.getAttribute('data-ny'); renderNews(); }); });
    var rows = NEWS.filter(function(n){ return newsYear==='ALL' || n.date.indexOf(newsYear)===0; });
    l.innerHTML = rows.map(newsRow).join('');
  }
  // 프로젝트 필터 카테고리 (고정 목록) — 키는 PROJECTS 의 필드명
  var PROJ_FILTERS = [
    {f:'k', lbl:'Type',     opts:['SI','ITO','Solution','기타','인프라']},
    {f:'c', lbl:'Industry', opts:['공공','기타','기타 금융','미디어/ENT','보험','서비스','은행','저축은행','증권']},
    {f:'s', lbl:'Status',   opts:['진행중','완료']}
  ];
  var projSel={k:'ALL', c:'ALL', s:'ALL'}, projPage=1, PROJ_PER=9;
  function renderProjects(){
    var f=$('#projFilters'), g=$('#projGrid'), pg=$('#projPager'); if(!g) return;
    f.innerHTML = PROJ_FILTERS.map(function(grp){
      return '<div class="fgrp"><em>'+grp.lbl+'</em><div class="fgrp__opts">'+['ALL'].concat(grp.opts).map(function(v){
        var n = v==='ALL'? PROJECTS.length : PROJECTS.filter(function(p){return p[grp.f]===v;}).length;
        return '<button class="fbtn'+(v===projSel[grp.f]?' is-on':'')+'" type="button" data-pf="'+grp.f+'" data-pv="'+esc(v)+'">'+(v==='ALL'?'전체':esc(v))+'<b>'+n+'</b></button>';
      }).join('')+'</div></div>';
    }).join('');
    $$('[data-pf]',f).forEach(function(b){ b.addEventListener('click',function(){ projSel[b.getAttribute('data-pf')]=b.getAttribute('data-pv'); projPage=1; renderProjects(); }); });
    var rows = PROJECTS.map(function(p,i){ p._i=i; return p; }).filter(function(p){
      return PROJ_FILTERS.every(function(grp){ var v=projSel[grp.f]; return v==='ALL' || p[grp.f]===v; });
    });
    var pages = Math.max(1, Math.ceil(rows.length/PROJ_PER));
    if(projPage>pages) projPage=pages;
    var cnt=$('#projCount'); if(cnt) cnt.textContent = rows.length + ' Projects';
    $('#projEmpty').style.display = rows.length? 'none':'block';
    var nums=''; for(var n=1;n<=pages;n++) nums+='<button type="button" data-pg="'+n+'"'+(n===projPage?' class="is-on" aria-current="page"':'')+'>'+n+'</button>';
    pg.innerHTML = pages>1
      ? '<button type="button" data-pg="'+(projPage-1)+'" aria-label="이전 페이지"'+(projPage===1?' disabled':'')+'>&lsaquo;</button>'+nums
        +'<button type="button" data-pg="'+(projPage+1)+'" aria-label="다음 페이지"'+(projPage===pages?' disabled':'')+'>&rsaquo;</button>'
      : '';
    $$('[data-pg]',pg).forEach(function(b){ b.addEventListener('click',function(){
      projPage=parseInt(b.getAttribute('data-pg'),10); renderProjects();
      window.scrollTo({top: f.getBoundingClientRect().top + window.pageYOffset - 120, behavior:'smooth'});
    }); });
    g.innerHTML = rows.slice((projPage-1)*PROJ_PER, projPage*PROJ_PER).map(function(p){
      return '<a class="proj" href="#/business/projects/'+p._i+'" data-nav>'
        +'<div class="proj__meta"><span>'+esc(p.k)+'</span><span>'+esc(p.c)+'</span><span>'+p.y+'</span><span'+(p.s==='진행중'?' class="on"':'')+'>'+esc(p.s)+'</span></div>'
        +'<h3>'+esc(p.t)+'</h3>'
        +'<span class="proj__cl">'+esc(p.cl)+'</span>'
        +'<div class="proj__foot"><time>'+esc(p.d)+'</time>'+ARROW+'</div></a>';
    }).join('');
  }
  function renderBL(){
    var g=$('#blGrid'); if(!g) return;
    g.innerHTML = BL.map(function(b){
      return '<a class="blc" href="#/business/business-line/'+b.k+'" data-nav>'
        +'<img src="'+b.img+'" alt="'+esc(b.ttl)+' 관련 이미지">'
        +'<div class="blc__in"><em>'+b.no+' / '+esc(b.en).toUpperCase()+'</em>'
        +'<h3>'+esc(b.ttl)+'</h3><p>'+esc(b.desc)+'</p>'
        +'<ul>'+b.pts.slice(0,4).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'
        +'<span class="mod__foot" style="color:var(--white)">자세히 보기 '+ARROW.replace('<svg','<svg width="14" height="14"')+'</span></div></a>';
    }).join('');
  }

  /* ---------- detail renderers ---------- */
  // 뉴스 상세 기본 이미지 (NEWS 항목에 img 가 없을 때 순서대로 배정되는 임시 이미지)
  var NEWS_IMG = [
    'https://sspark.genspark.ai/i/LQUexAFNNy5Sb1S4?width=2560',
    'https://sspark.genspark.ai/i/3PI5h8miWB31PKm5?width=2560',
    'https://sspark.genspark.ai/i/hh772FOUwVOPvuJM?width=2560',
    'https://sspark.genspark.ai/i/fH7KyLyOjilFM6U8?width=2560',
    'https://sspark.genspark.ai/i/DwACFArSqNNVmRDL?width=2560',
    'https://sspark.genspark.ai/i/B9Z7d9ONrrV2J2IP?width=2560'
  ];
  function renderNewsDetail(id){
    var n = null; NEWS.forEach(function(x){ if(x.id===id) n=x; });
    if(!n){ location.hash='#/company/news'; return; }
    $('#ndCrumb').innerHTML = '<a href="#/" data-nav>Home</a><i>/</i><a href="#/company/news" data-nav>News&amp;Notices</a><i>/</i><span>'+esc(n.tag)+'</span>';
    $('#ndHead').innerHTML = '<h1 class="h-lg" style="font-size:clamp(26px,3.4vw,44px);max-width:30ch">'+esc(n.ttl)+'</h1>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+esc(n.tag)+'</span><span class="chip">'+n.date+'</span><span class="chip">미래아이엔텍</span></div>';
    var img = n.img || NEWS_IMG[NEWS.indexOf(n) % NEWS_IMG.length];
    $('#ndBody').innerHTML = '<div class="dtl__body reveal is-in">'
      + '<figure class="dtl__fig" style="margin-top:0"><img src="'+esc(img)+'" alt="'+esc(n.ttl)+' 관련 이미지"></figure>'
      + '<h2>게시 내용</h2>'
      + n.body.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')
      + '</div>';
    var i = NEWS.indexOf(n);
    $('#ndNav').textContent = '게시물 '+(i+1)+' / '+NEWS.length;
    document.title = n.ttl+' | 미래아이엔텍 MRINT';
  }
  function renderProjDetail(i){
    var p = PROJECTS[i];
    if(!p){ location.hash='#/business/projects'; return; }
    $('#pdCrumb').innerHTML = '<a href="#/" data-nav>Home</a><i>/</i><a href="#/business/projects" data-nav>Projects</a><i>/</i><span>'+esc(p.k)+'</span>';
    $('#pdHead').innerHTML = projHead(p);
    $('#pdBody').innerHTML = projBody(p);
    return p.t+' | 미래아이엔텍 MRINT';
  }
  /* 프로젝트 상세 공통 (Projects 탭 · Team > Related Projects 가 같은 형식을 사용) */
  var PH = '설명이 들어갈 내용입니다.';
  function projIdx(t){ for(var i=0;i<PROJECTS.length;i++){ if(PROJECTS[i].t===t) return i; } return -1; }
  function projTxt(v){ return v ? esc(v) : '<span style="color:var(--ink-40)">'+PH+'</span>'; }
  function projHead(p){
    return '<h1 class="h-lg" style="font-size:clamp(26px,3.4vw,44px);max-width:30ch">'+esc(p.t)+'</h1>'
      +'<div class="phero__meta">'+(p.k?'<span class="chip chip--blue">'+esc(p.k)+'</span>':'')
      +(p.s?'<span class="chip">'+esc(p.s)+'</span>':'')+'<span class="chip">'+p.y+'</span></div>';
  }
  function projBody(p){
    var img = p.img || (p.k==='SI'?'https://sspark.genspark.ai/i/3PI5h8miWB31PKm5?width=2560':(p.k==='ITO'?'https://sspark.genspark.ai/i/LQUexAFNNy5Sb1S4?width=2560':'https://sspark.genspark.ai/i/hh772FOUwVOPvuJM?width=2560'));
    return '<div class="dtl__body reveal is-in">'
      +'<figure class="dtl__fig" style="margin-top:0"><img src="'+esc(img)+'" alt="'+esc(p.t)+' 관련 이미지"><figcaption>'+esc(p.t)+(p.cl?' — '+esc(p.cl):'')+'</figcaption></figure>'
      +'<h2>Project Overview</h2><p>'+projTxt(p.ov)+'</p>'
      +'<h2>Description</h2><p>'+projTxt(p.desc)+'</p>'
      +'</div><aside class="dtl__side reveal is-in"><dl>'
      +'<div><dt>Type</dt><dd>'+projTxt(p.k)+'</dd></div>'
      +'<div><dt>Status</dt><dd>'+projTxt(p.s)+'</dd></div>'
      +'<div><dt>Name</dt><dd>'+esc(p.t)+'</dd></div>'
      +'<div><dt>Period</dt><dd>'+projTxt(p.p)+'</dd></div>'
      +'<div><dt>Client</dt><dd>'+projTxt(p.cl)+'</dd></div>'
      +'</dl></aside>';
  }
  function renderBLDetail(k){
    var b=null; BL.forEach(function(x){ if(x.k===k) b=x; });
    if(!b){ location.hash='#/business/business-line'; return; }
    $('#blDCrumb').innerHTML='<a href="#/" data-nav>Home</a><i>/</i><a href="#/business/business-line" data-nav>Business Line</a><i>/</i><span>'+esc(b.en)+'</span>';
    $('#blDHead').innerHTML='<h1 class="h-xl">'+esc(b.ttl)+'</h1><p class="lead">'+esc(b.desc)+'</p>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+b.no+'</span>'+b.pts.slice(0,4).map(function(x){return '<span class="chip">'+esc(x)+'</span>';}).join('')+'</div>';
    function paras(v){ return [].concat(v).map(function(x){ return '<p>'+esc(x)+'</p>'; }).join(''); }
    function list(arr){ return '<ul>'+arr.map(function(x){ return '<li>'+esc(x).replace(/\n/g,'<br>')+'</li>'; }).join('')+'</ul>'; }
    var ph = '<p style="color:var(--ink-40)">'+PH+'</p>';
    var feats = b.feats, clients = b.clients;
    $('#blDBody').innerHTML='<div class="dtl__body bld--ink reveal is-in">'
      +'<h2>'+esc(b.en)+' 개요</h2>'+paras(b.sum)
      + b.secs.map(function(s){
          return '<h2>'+esc(s.h)+'</h2>'+paras(s.p) + (s.li && s.li.length? list(s.li) : '');
        }).join('')
      +'<figure class="dtl__fig"><img src="'+b.img+'" alt="'+esc(b.ttl)+' 관련 이미지"><figcaption>'+esc(b.ttl)+' — '+esc(b.en)+'</figcaption></figure>'
      + (!feats ? '' : '<h2>Service Features</h2>'
      + (feats.length
        ? '<div class="filters">'
          + feats.map(function(f,i){ return '<button class="fbtn'+(i?'':' is-on')+'" type="button" data-sf="'+i+'">'+esc(f.h)+'</button>'; }).join('')
          +'</div>'
          + feats.map(function(f,i){
              return '<div class="sfeat" data-sfp="'+i+'"'+(i?' hidden':'')+'>'
                +(f.img ? '<figure class="dtl__fig" style="margin-top:0"><img src="'+esc(f.img)+'" alt="'+esc(f.h)+' 관련 이미지"><figcaption>'+esc(f.h)+'</figcaption></figure>' : '')
                +(f.p ? paras(f.p) : '')
                +(f.li && f.li.length ? list(f.li) : (f.p ? '' : ph))
                +'</div>';
            }).join('')
        : ph))
      + (!clients ? '' : '<h2>Main clients</h2>'
      + (clients.length
        ? '<div class="logos">'+clients.map(function(c){
            return '<div title="'+esc(c.n)+'">'+(c.img ? '<img src="'+esc(c.img)+'" alt="'+esc(c.n)+' 로고" onerror="this.remove()">' : '')+'</div>';
          }).join('')+'</div>'
        : ph))
      +'</div>';
    $$('[data-sf]',$('#blDBody')).forEach(function(btn){ btn.addEventListener('click', function(){
      var n=btn.getAttribute('data-sf');
      $$('[data-sf]',$('#blDBody')).forEach(function(x){ x.classList.toggle('is-on', x===btn); });
      $$('[data-sfp]',$('#blDBody')).forEach(function(p){ p.hidden = p.getAttribute('data-sfp')!==n; });
    }); });
    document.title = b.ttl+' | 미래아이엔텍 MRINT';
  }
  var RP_LIMIT = 5;
  function renderTeamDetail(k){
    var t=null; TEAMS.forEach(function(x){ if(x.k===k) t=x; });
    if(!t){ location.hash='#/company/team'; return; }
    var name = t.name ? t.name+' '+t.ttl : t.ttl;
    function list(arr){ return '<ul>'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'; }
    $('#tmDCrumb').innerHTML='<a href="#/" data-nav>Home</a><i>/</i><a href="#/company/team" data-nav>Team</a><i>/</i><span>'+esc(t.ttl)+'</span>';
    $('#tmDHead').innerHTML='<h1 class="h-xl">'+esc(name)+'</h1><p class="lead">'+esc(t.en)+'</p>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+(t.k==='ceo'?'CEO':'Team')+'</span><span class="chip">미래아이엔텍</span></div>';
    var intro = t.k==='ceo'
      ? '<div class="ceo"><figure class="ceo__ph reveal is-in" style="margin:0"><img src="'+t.img+'" alt="미래아이엔텍 '+esc(name)+' 사진"><figcaption>'+esc(t.name)+' · 대표이사 (CEO)</figcaption></figure>'
        +'<div class="dtl__body reveal is-in">'+t.bio.map(function(s){ return '<h2>'+esc(s.h)+'</h2>'+list(s.li); }).join('')+'</div></div>'
      : '<div class="dtl__body tmd__body reveal is-in">'
        +'<h2>Team Introduction</h2>'+t.intro.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')
        +'<h2>Main Functions</h2>'+list(t.funcs)
        +'<h2>Key Capabilities</h2>'+list(t.caps)+'</div>';
    var rows = t.prj.map(function(p,i){
      var pi = projIdx(p.t), href = pi>=0 ? '#/business/projects/'+pi : '#/company/team/'+t.k+'/'+i;
      return '<a class="rp'+(i>=RP_LIMIT?' is-hidden':'')+'" href="'+href+'" data-nav><b>'+esc(p.t)+'</b><span>'+p.y+'</span></a>';
    }).join('');
    var rp = t.prj.length
      ? '<h2 class="h-md">Related Projects <span class="rp-cnt">'+t.prj.length+'</span></h2>'
        +'<div class="rp-list">'+rows+'</div>'
        +(t.prj.length>RP_LIMIT? '<button class="btn btn--line btn--sm rp-more" type="button"><span>더보기</span></button>' : '')
      : '<h2 class="h-md">Related Projects</h2>'
        +'<div class="rp-empty"><b>프로젝트 소개를 준비하고 있습니다.</b>'
        +'<p>'+esc(t.ttl)+'의 다양한 연구 활동과 프로젝트를 소개할 예정입니다. 앞으로 이곳에서 연구소의 새로운 소식과 활동을 만나보실 수 있습니다.</p></div>';
    $('#tmDBody').innerHTML = intro+'<div class="rp-wrap reveal is-in">'+rp+'</div>';
    var more = $('#tmDBody .rp-more');
    if(more) more.addEventListener('click', function(){
      $$('#tmDBody .rp.is-hidden').forEach(function(r){ r.classList.remove('is-hidden'); });
      more.parentNode.removeChild(more);
    });
    document.title = name+' | 미래아이엔텍 MRINT';
  }
  // PROJECTS 에 없는 팀 전용 프로젝트만 이 경로를 사용 (PROJECTS 에 있으면 #/business/projects/:index 로 연결)
  function renderTeamProj(k, i){
    var t=null; TEAMS.forEach(function(x){ if(x.k===k) t=x; });
    var p = t && t.prj[i];
    if(!p){ location.hash = t ? '#/company/team/'+t.k : '#/company/team'; return; }
    $('#tpCrumb').innerHTML='<a href="#/" data-nav>Home</a><i>/</i><a href="#/company/team" data-nav>Team</a><i>/</i><span>'+esc(t.ttl)+'</span><i>/</i><span>Related Projects</span>';
    $('#tpHead').innerHTML = projHead(p);
    $('#tpBody').innerHTML = projBody(p);
    return p.t+' | 미래아이엔텍 MRINT';
  }

  /* ---------- ROUTER ---------- */
  function show(id){
    $$('.page').forEach(function(p){ p.classList.toggle('is-on', p.id===id); });
    window.scrollTo(0,0);
    observeReveals();
  }
  function route(){
    var h = location.hash || '#/';
    var parts = h.replace(/^#\//,'').split('/').filter(Boolean);
    var base = 'page-home', title = '미래아이엔텍 MRINT | 금융 IT Total Service Provider';
    if(parts.length===0){ base='page-home'; }
    else if(parts[0]==='company' && parts[1]==='mirae'){ base='page-mirae'; title='Mirae I&Tec | 미래아이엔텍 MRINT'; }
    else if(parts[0]==='company' && parts[1]==='team' && parts[2] && parts[3]!==undefined){ base='page-teamProj'; title=renderTeamProj(parts[2], parseInt(parts[3],10)) || title; }
    else if(parts[0]==='company' && parts[1]==='team' && parts[2]){ base='page-teamDetail'; renderTeamDetail(parts[2]); }
    else if(parts[0]==='company' && parts[1]==='team'){ base='page-team'; title='Team | 미래아이엔텍 MRINT'; }
    else if(parts[0]==='company' && parts[1]==='news' && parts[2]){ base='page-newsDetail'; renderNewsDetail(parts[2]); }
    else if(parts[0]==='company' && parts[1]==='news'){ base='page-news'; title='News&Notices | 미래아이엔텍 MRINT'; renderNews(); }
    else if(parts[0]==='business' && parts[1]==='projects' && parts[2]!==undefined && parts[2]!==''){ base='page-projDetail'; title=renderProjDetail(parseInt(parts[2],10)) || title; }
    else if(parts[0]==='business' && parts[1]==='projects'){ base='page-projects'; title='Projects | 미래아이엔텍 MRINT'; renderProjects(); }
    else if(parts[0]==='business' && parts[1]==='business-line' && parts[2]){ base='page-blDetail'; renderBLDetail(parts[2]); }
    else if(parts[0]==='business' && parts[1]==='business-line'){ base='page-businessLine'; title='Business Line | 미래아이엔텍 MRINT'; renderBL(); }
    else if(parts[0]==='contact'){ base='page-contact'; title='Contact | 미래아이엔텍 MRINT'; }
    document.title = title;
    if(base==='page-newsDetail') document.title = document.title; else document.title = title;
    show(base);
    closeMnav();
    srch.style.transform='translateY(-100%)';
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[data-nav]') : null;
    if(a){ closeMnav(); }
  });

  /* ---------- boot ---------- */
  renderHomeNews();
  renderNews();
  renderProjects();
  renderBL();
  counters();
  observeReveals();
  route();
})();
