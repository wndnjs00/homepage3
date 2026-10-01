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
  var projCat='ALL', projKind='ALL';
  function renderProjects(){
    var f=$('#projFilters'), g=$('#projGrid'); if(!g) return;
    var cats=['ALL'].concat(PROJECTS.map(function(p){return p.c;}).filter(function(v,i,a){return a.indexOf(v)===i;}));
    var kinds=['ALL'].concat(PROJECTS.map(function(p){return p.k;}).filter(function(v,i,a){return a.indexOf(v)===i;}));
    function grp(lbl,arr,cur,attr){
      return '<div class="fgrp"><em>'+lbl+'</em>'+arr.map(function(v){
        var n = v==='ALL'? PROJECTS.length : PROJECTS.filter(function(p){return attr==='data-c'? p.c===v : p.k===v;}).length;
        return '<button class="fbtn'+(v===cur?' is-on':'')+'" type="button" '+attr+'-filter="'+v+'">'+(v==='ALL'?'전체':v)+'<b>'+n+'</b></button>';
      }).join('')+'</div>';
    }
    f.innerHTML = grp('업권',cats,projCat,'data-c')+'<div style="height:10px;width:100%"></div>'+grp('구분',kinds,projKind,'data-k');
    $$('[data-c]',f).forEach(function(b){ b.addEventListener('click',function(){ projCat=b.getAttribute('data-c'); renderProjects(); }); });
    $$('[data-k]',f).forEach(function(b){ b.addEventListener('click',function(){ projKind=b.getAttribute('data-k'); renderProjects(); }); });
    var rows = PROJECTS.map(function(p,i){ p._i=i; return p; }).filter(function(p){
      return (projCat==='ALL'||p.c===projCat) && (projKind==='ALL'||p.k===projKind);
    });
    var cnt=$('#projCount'); if(cnt) cnt.textContent = rows.length + ' Projects';
    $('#projEmpty').style.display = rows.length? 'none':'block';
    g.innerHTML = rows.map(function(p){
      return '<a class="proj" href="#/business/projects/'+p._i+'" data-nav>'
        +'<div class="proj__meta"><span class="on">'+esc(p.k)+'</span><span>'+esc(p.c)+'</span><span>'+p.y+'</span><span>'+esc(p.s)+'</span></div>'
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
  function renderNewsDetail(id){
    var n = null; NEWS.forEach(function(x){ if(x.id===id) n=x; });
    if(!n){ location.hash='#/company/news'; return; }
    $('#ndCrumb').innerHTML = '<a href="#/" data-nav>Home</a><i>/</i><a href="#/company/news" data-nav>News&amp;Notices</a><i>/</i><span>'+esc(n.tag)+'</span>';
    $('#ndHead').innerHTML = '<h1 class="h-lg" style="font-size:clamp(26px,3.4vw,44px);max-width:30ch">'+esc(n.ttl)+'</h1>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+esc(n.tag)+'</span><span class="chip">'+n.date+'</span><span class="chip">미래아이엔텍</span></div>';
    $('#ndBody').innerHTML = '<div class="dtl__body reveal is-in"><h2>게시 내용</h2>'
      + n.body.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')
      + '<p class="note"><b>※ 안내</b> — 위 본문은 게시물 제목에 담긴 사실을 바탕으로 정리한 요약입니다. 실제 게시물의 전체 본문(이미지·첨부 포함)을 입력하는 영역이며, 임의의 내용을 추가하지 않았습니다.</p>'
      + '<h2>문의</h2><p>관련 사업 및 협력 문의는 대표번호 02-557-5267 또는 mrint01@mrint.co.kr 로 연락해 주세요.</p>'
      + '<p style="margin-top:26px"><a class="btn btn--blue" href="#/contact" data-nav><span>문의하기</span></a></p>'
      + '</div><aside class="dtl__side reveal is-in"><dl>'
      + '<div><dt>Category</dt><dd>'+esc(n.tag)+'</dd></div>'
      + '<div><dt>Date</dt><dd>'+n.date+'</dd></div>'
      + '<div><dt>Author</dt><dd>미래아이엔텍</dd></div>'
      + '<div><dt>Contact</dt><dd>02-557-5267<br>mrint01@mrint.co.kr</dd></div>'
      + '</dl></aside>';
    var i = NEWS.indexOf(n);
    $('#ndNav').textContent = '게시물 '+(i+1)+' / '+NEWS.length;
    document.title = n.ttl+' | 미래아이엔텍 MRINT';
  }
  function renderProjDetail(i){
    var p = PROJECTS[i];
    if(!p){ location.hash='#/business/projects'; return; }
    $('#pdCrumb').innerHTML = '<a href="#/" data-nav>Home</a><i>/</i><a href="#/business/projects" data-nav>Projects</a><i>/</i><span>'+esc(p.k)+'</span>';
    $('#pdHead').innerHTML = '<h1 class="h-lg" style="font-size:clamp(26px,3.4vw,44px);max-width:30ch">'+esc(p.t)+'</h1>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+esc(p.k)+'</span><span class="chip">'+esc(p.c)+'</span><span class="chip">'+p.y+'</span><span class="chip">'+esc(p.s)+'</span></div>';
    var ov = p.ov ? '<p>'+esc(p.ov)+'</p>'
      : '<p class="note"><b>※ 안내</b> — 본 프로젝트의 상세 개요는 자사 홈페이지에 공개되지 않아 임의로 작성하지 않았습니다. 실제 프로젝트 개요·수행 범위를 입력하는 영역입니다.</p>';
    $('#pdBody').innerHTML = '<div class="dtl__body reveal is-in"><h2>프로젝트 개요</h2>'+ov
      + '<h2>수행 정보</h2><ul>'
      + '<li>구분 : '+esc(p.k)+'</li><li>업권 : '+esc(p.c)+'</li><li>연도 : '+p.y+'</li>'
      + '<li>상태 : '+esc(p.s)+'</li><li>고객사 : '+esc(p.cl)+'</li>'
      + (p.p? '<li>수행 기간 : '+esc(p.p)+'</li>' : '')
      + '</ul>'
      + '<figure class="dtl__fig"><img src="'+(p.k==='SI'?'https://sspark.genspark.ai/i/3PI5h8miWB31PKm5?width=2560':(p.k==='ITO'?'https://sspark.genspark.ai/i/LQUexAFNNy5Sb1S4?width=2560':'https://sspark.genspark.ai/i/hh772FOUwVOPvuJM?width=2560'))+'" alt="'+esc(p.t)+' 관련 이미지"><figcaption>'+esc(p.t)+' — '+esc(p.cl)+'</figcaption></figure>'
      + '<h2>관련 사업 영역</h2><p>본 프로젝트는 미래아이엔텍의 '+esc(p.k)+' 사업 영역에 해당합니다. 유사한 시스템 구축·운영 프로젝트에 대한 상담은 아래 문의 채널을 이용해 주세요.</p>'
      + '<p style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--line btn--sm" href="#/business/business-line/'+(p.k==='SI'?'si':(p.k==='ITO'?'ito':'solution'))+'" data-nav><span>사업 영역 보기</span></a><a class="btn btn--blue btn--sm" href="#/contact" data-nav><span>문의하기</span></a></p>'
      + '</div><aside class="dtl__side reveal is-in"><dl>'
      + '<div><dt>Type</dt><dd>'+esc(p.k)+'</dd></div>'
      + '<div><dt>Client</dt><dd>'+esc(p.cl)+'</dd></div>'
      + '<div><dt>Sector</dt><dd>'+esc(p.c)+'</dd></div>'
      + '<div><dt>Year</dt><dd>'+p.y+'</dd></div>'
      + (p.p? '<div><dt>Period</dt><dd>'+esc(p.p)+'</dd></div>':'')
      + '<div><dt>Status</dt><dd>'+esc(p.s)+'</dd></div>'
      + '</dl></aside>';
    document.title = p.t+' | 미래아이엔텍 MRINT';
  }
  function renderBLDetail(k){
    var b=null; BL.forEach(function(x){ if(x.k===k) b=x; });
    if(!b){ location.hash='#/business/business-line'; return; }
    $('#blDCrumb').innerHTML='<a href="#/" data-nav>Home</a><i>/</i><a href="#/business/business-line" data-nav>Business Line</a><i>/</i><span>'+esc(b.en)+'</span>';
    $('#blDHead').innerHTML='<h1 class="h-xl">'+esc(b.ttl)+'</h1><p class="lead">'+esc(b.desc)+'</p>'
      +'<div class="phero__meta"><span class="chip chip--blue">'+b.no+'</span>'+b.pts.slice(0,4).map(function(x){return '<span class="chip">'+esc(x)+'</span>';}).join('')+'</div>';
    $('#blDBody').innerHTML='<div class="dtl"><div class="dtl__body reveal is-in">'
      +'<h2>'+esc(b.en)+' 개요</h2><p>'+esc(b.sum)+'</p>'
      + b.secs.map(function(s){
          return '<h2>'+esc(s.h)+'</h2><p>'+esc(s.p)+'</p>'
            + (s.li && s.li.length? '<ul>'+s.li.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>' : '');
        }).join('')
      +'<figure class="dtl__fig"><img src="'+b.img+'" alt="'+esc(b.ttl)+' 관련 이미지"><figcaption>'+esc(b.ttl)+' — '+esc(b.en)+'</figcaption></figure>'
      +'<p style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--blue btn--sm" href="#/contact" data-nav><span>상담 문의하기</span></a><a class="btn btn--line btn--sm" href="#/business/projects" data-nav><span>관련 프로젝트 보기</span></a></p>'
      +'</div><aside class="dtl__side reveal is-in"><dl>'
      +'<div><dt>Business Line</dt><dd>'+esc(b.ttl)+'</dd></div>'
      +'<div><dt>Scope</dt><dd>'+b.pts.map(esc).join(' · ')+'</dd></div>'
      +'<div><dt>Contact</dt><dd>02-557-5267<br>mrint01@mrint.co.kr</dd></div>'
      +'</dl><dl style="border-top:1px solid var(--hair)"><a class="btn btn--line btn--sm" href="#/business/projects" data-nav><span>프로젝트 보기</span></a></dl></aside></div>';
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
      return '<a class="rp'+(i>=RP_LIMIT?' is-hidden':'')+'" href="#/company/team/'+t.k+'/'+i+'" data-nav><b>'+esc(p.t)+'</b><span>'+p.y+'</span></a>';
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
  var PH = '설명이 들어갈 내용입니다.';
  function renderTeamProj(k, i){
    var t=null; TEAMS.forEach(function(x){ if(x.k===k) t=x; });
    var p = t && t.prj[i];
    if(!p){ location.hash = t ? '#/company/team/'+t.k : '#/company/team'; return; }
    var src=null; PROJECTS.forEach(function(x){ if(x.t===p.t) src=x; });
    function v(f){ return p[f] || (src && src[f]) || ''; }
    function txt(f){ return v(f) ? esc(v(f)) : '<span style="color:var(--ink-40)">'+PH+'</span>'; }
    var type = v('k');
    var img = p.img || (type==='SI'?'https://sspark.genspark.ai/i/3PI5h8miWB31PKm5?width=2560':(type==='ITO'?'https://sspark.genspark.ai/i/LQUexAFNNy5Sb1S4?width=2560':'https://sspark.genspark.ai/i/hh772FOUwVOPvuJM?width=2560'));
    $('#tpCrumb').innerHTML='<a href="#/" data-nav>Home</a><i>/</i><a href="#/company/team" data-nav>Team</a><i>/</i><span>'+esc(t.ttl)+'</span><i>/</i><span>Related Projects</span>';
    $('#tpHead').innerHTML='<h1 class="h-lg" style="font-size:clamp(26px,3.4vw,44px);max-width:30ch">'+esc(p.t)+'</h1>'
      +'<div class="phero__meta">'+(type?'<span class="chip chip--blue">'+esc(type)+'</span>':'')
      +(v('s')?'<span class="chip">'+esc(v('s'))+'</span>':'')+'<span class="chip">'+p.y+'</span><span class="chip">'+esc(t.ttl)+'</span></div>';
    $('#tpBody').innerHTML='<div class="dtl__body reveal is-in">'
      +'<figure class="dtl__fig" style="margin-top:0"><img src="'+esc(img)+'" alt="'+esc(p.t)+' 관련 이미지"><figcaption>'+esc(p.t)+(v('cl')?' — '+esc(v('cl')):'')+'</figcaption></figure>'
      +'<h2>Project Overview</h2><p>'+txt('ov')+'</p>'
      +'<h2>Description</h2><p>'+txt('desc')+'</p>'
      +'</div><aside class="dtl__side reveal is-in"><dl>'
      +'<div><dt>Type</dt><dd>'+txt('k')+'</dd></div>'
      +'<div><dt>Status</dt><dd>'+txt('s')+'</dd></div>'
      +'<div><dt>Name</dt><dd>'+esc(p.t)+'</dd></div>'
      +'<div><dt>Period</dt><dd>'+txt('p')+'</dd></div>'
      +'<div><dt>Client</dt><dd>'+txt('cl')+'</dd></div>'
      +'</dl></aside>';
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
    else if(parts[0]==='business' && parts[1]==='projects' && parts[2]!==undefined && parts[2]!==''){ base='page-projDetail'; renderProjDetail(parseInt(parts[2],10)); }
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
