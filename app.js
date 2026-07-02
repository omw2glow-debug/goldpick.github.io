(() => {
  'use strict';

  const KRW = new Intl.NumberFormat('ko-KR');
  const PRICE_PER_DON = { '24K': 778000, '18K': 571800, '14K': 443400 };
  const BASE_PRODUCT_PRICE = {
    '목걸이·팔찌': 1,
    '반지·귀걸이': 0.995,
    '금니·치금': 0.92,
    '골드바': 1.01
  };

  const stores = [
    {
      id: 'wirye', name: '스마일금거래소 위례점', distance: 1.2, travel: '차량 6분', wait: '약 10분',
      rating: 4.9, reviews: 328, verified: true, priceFactor: 1.005, match: 96,
      tags: ['공개 감정', '치금 매입', '예약 가능', '당일 지급'],
      address: '경기 성남시 수정구 위례광장로 300', hours: '오늘 19:00까지', parking: '주차 2시간',
      summary: '정밀 계량과 순도 분석을 고객 앞에서 진행하는 공식 가맹점입니다.'
    },
    {
      id: 'gangnam', name: '골드랩 강남점', distance: 8.4, travel: '차량 24분', wait: '약 5분',
      rating: 4.8, reviews: 214, verified: true, priceFactor: 1.009, match: 91,
      tags: ['XRF 분석', '골드바 전문', '예약 가능'],
      address: '서울 강남구 테헤란로 152', hours: '오늘 20:00까지', parking: '유료 주차',
      summary: '투자용 골드바와 고중량 귀금속 거래에 특화된 전문 매장입니다.'
    },
    {
      id: 'songpa', name: '스마일금거래소 송파점', distance: 5.7, travel: '차량 18분', wait: '약 20분',
      rating: 4.7, reviews: 189, verified: true, priceFactor: 0.999, match: 89,
      tags: ['공개 감정', '주말 영업', '치금 매입'],
      address: '서울 송파구 올림픽로 96', hours: '오늘 18:30까지', parking: '건물 주차',
      summary: '주말 방문 고객과 소량 귀금속 매입 고객이 많이 찾는 매장입니다.'
    },
    {
      id: 'bundang', name: '분당프리미엄금거래소', distance: 12.3, travel: '차량 29분', wait: '바로 가능',
      rating: 4.6, reviews: 121, verified: false, priceFactor: 1.012, match: 84,
      tags: ['고가 매입', '예약 가능', '골드바 재고'],
      address: '경기 성남시 분당구 황새울로 360', hours: '오늘 19:30까지', parking: '무료 주차',
      summary: '예상 수령액 경쟁력이 높고 골드바 재고를 함께 확인할 수 있습니다.'
    }
  ];

  const products = [
    {id:'bar1', category:'골드바', name:'순금 골드바 1g', sub:'999.9 · 인증서 포함', price:238000, stock:12, weight:'1g'},
    {id:'bar375', category:'골드바', name:'순금 골드바 3.75g', sub:'999.9 · 1돈', price:865000, stock:7, weight:'3.75g'},
    {id:'bar10', category:'골드바', name:'순금 골드바 10g', sub:'999.9 · 시리얼 각인', price:2270000, stock:3, weight:'10g'},
    {id:'ring', category:'돌반지', name:'순금 돌반지 1돈', sub:'아기 이름 각인 가능', price:914000, stock:5, weight:'3.75g'},
    {id:'card', category:'순금카드', name:'순금 행운 카드 1g', sub:'기념일 메시지 패키지', price:274000, stock:9, weight:'1g'},
    {id:'silver', category:'실버바', name:'실버바 100g', sub:'999 · 투자용 실버', price:214000, stock:16, weight:'100g'}
  ];

  const defaultPosts = [
    {id:1, type:'후기', user:'위례골드', time:'2시간 전', title:'끊어진 목걸이도 바로 감정받았어요', body:'보증서가 없어서 걱정했는데 중량과 순도를 바로 보여주고 설명해줘서 편했습니다.', likes:24, comments:6},
    {id:2, type:'질문', user:'금알못', time:'5시간 전', title:'반지 안쪽 750 각인이면 18K가 맞나요?', body:'오래된 반지라 색이 조금 어두운데 각인은 750으로 보입니다. 방문 전에 대략 알고 싶어요.', likes:11, comments:12},
    {id:3, type:'시황', user:'골드리포트', time:'어제', title:'이번 주 금값 변동 체크 포인트', body:'달러와 금리 기대 변화가 큰 주간입니다. 매도 계획이 있다면 목표 가격 알림을 활용해 보세요.', likes:38, comments:4}
  ];

  const state = {
    route: 'home',
    selectedStore: 'wirye',
    selectedProduct: 'bar375',
    sell: {
      product: '목걸이·팔찌',
      purity: '18K',
      weight: 7.5,
      image: null
    },
    storeFilter: '추천순',
    shopCategory: '전체',
    communityTab: '전체',
    priceLock: 300,
    timer: null,
    installPrompt: null
  };

  const saved = {
    get(key, fallback=null){
      try { const v = localStorage.getItem('goldpick_'+key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value){ localStorage.setItem('goldpick_'+key, JSON.stringify(value)); }
  };

  const icons = {
    home:'<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    chat:'<svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>',
    store:'<svg viewBox="0 0 24 24"><path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-6h6v6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
    coin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 8h4a3 3 0 0 1 0 6H9V8Zm0 6v3M12 5v3M12 17v2"/></svg>',
    user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    camera:'<svg viewBox="0 0 24 24"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg>',
    bar:'<svg viewBox="0 0 24 24"><path d="m5 7 2-3h10l2 3 2 12H3z"/><path d="M8 10h8M9 14h6"/></svg>',
    chevron:'<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    back:'<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    upload:'<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v6h14v-6"/></svg>',
    calendar:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    location:'<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  const page = document.getElementById('page');
  const modalRoot = document.getElementById('modalRoot');
  const toast = document.getElementById('toast');

  function icon(name){ return icons[name] || ''; }
  function fmt(n){ return KRW.format(Math.round(n)); }
  function todayText(){
    const d = new Date();
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return `${y}.${m}.${day}`;
  }
  function calcQuote(){
    const {product,purity,weight} = state.sell;
    const perGram = PRICE_PER_DON[purity] / 3.75;
    const base = perGram * Math.max(Number(weight)||0,0) * (BASE_PRODUCT_PRICE[product] || 1);
    return {
      low: Math.round(base*0.972/1000)*1000,
      high: Math.round(base*1.012/1000)*1000,
      base,
      perGram
    };
  }
  function currentQuote(){ return saved.get('quote', calcQuote()); }
  function setRoute(route, options={}){
    if(route==='store-detail' && options.storeId) state.selectedStore=options.storeId;
    if(route==='product-detail' && options.productId) state.selectedProduct=options.productId;
    state.route=route;
    history.replaceState({},'',`#${route}`);
    render();
    page.scrollTop=0;
  }
  function showToast(message){
    toast.textContent=message;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t=setTimeout(()=>toast.classList.remove('show'),2200);
  }
  function openModal(html){
    modalRoot.className='modal-root open';
    modalRoot.innerHTML=`<div class="modal-backdrop" data-action="close-modal"></div><div class="modal-sheet">${html}</div>`;
  }
  function closeModal(){ modalRoot.className='modal-root'; modalRoot.innerHTML=''; }

  function renderNav(){
    const routeMap = {home:'home',sell:'home',community:'community',stores:'stores','store-detail':'stores',shop:'shop','product-detail':'shop',my:'my',admin:'my'};
    document.querySelectorAll('.nav-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.route===routeMap[state.route]));
  }

  function homeTemplate(){
    const q = currentQuote();
    const reservation=saved.get('reservation');
    return `
      <div class="hero-card">
        <div class="hero-meta"><span>${todayText()} 기준 · 1돈 3.75g</span><span>14:30 업데이트</span></div>
        <h2 class="hero-title">오늘 금 팔 때<br>예상 기준가</h2>
        <div class="gold-price-row primary"><b>24K</b><strong>${fmt(PRICE_PER_DON['24K'])}<small>원</small></strong></div>
        <div class="gold-price-row"><b>18K</b><strong>${fmt(PRICE_PER_DON['18K'])}<small>원</small></strong></div>
        <div class="gold-price-row"><b>14K</b><strong>${fmt(PRICE_PER_DON['14K'])}<small>원</small></strong></div>
      </div>
      <div class="quick-grid">
        <button class="quick-card" data-route="sell"><span class="quick-icon">${icon('camera')}</span><b>내 금 팔기</b><small>사진·중량 입력 후 예상가 확인</small></button>
        <button class="quick-card" data-route="shop"><span class="quick-icon">${icon('bar')}</span><b>금 구매하기</b><small>골드바·순금제품 재고 확인</small></button>
      </div>
      ${saved.get('quote') ? `
      <div class="card gold">
        <div class="card-head"><div><div class="section-label">최근 저장 견적</div><h3 class="section-title">${state.sell.purity} · ${state.sell.weight}g</h3></div><span class="badge light">견적 저장됨</span></div>
        <div class="big-value">${fmt(q.low)}~${fmt(q.high)}원</div>
        <button class="primary-button" style="margin-top:13px" data-route="stores">추천 금거래소 비교하기</button>
      </div>`:''}
      ${reservation ? `
      <div class="card">
        <div class="card-head"><div><div class="section-label">다가오는 예약</div><h3 class="section-title">${reservation.store}</h3><p class="section-sub">${reservation.date} · ${reservation.time}</p></div><span class="badge green">예약 완료</span></div>
      </div>`:''}
      <div class="card">
        <div class="card-head"><div><div class="section-label">내 주변 추천</div><h3 class="section-title">스마일금거래소 위례점</h3></div><span class="badge">공식 인증</span></div>
        <div style="display:flex;align-items:end;justify-content:space-between;gap:10px"><span class="section-sub">예상 수령액</span><div class="big-value">${fmt(q.low*1.005)}~${fmt(q.high*1.005)}원</div></div>
        <div class="tag-row"><span class="tag">공개 감정</span><span class="tag">치금 매입</span><span class="tag">예약 가능</span></div>
        <button class="primary-button" style="margin-top:13px" data-route="stores">추천 매장 보기</button>
      </div>
      <div class="card flat">
        <div class="card-head"><h3 class="section-title">거래 전 체크</h3><button class="text-button" data-route="community">더보기</button></div>
        <div class="check-list">
          <button class="check-row" data-action="info" data-title="보증서 없이도 매입 가능한가요?">보증서 없이도 매입 가능한가요? ${icon('chevron')}</button>
          <button class="check-row" data-action="info" data-title="인터넷 시세와 실제 매입가 차이">인터넷 시세와 실제 매입가 차이 ${icon('chevron')}</button>
          <button class="check-row" data-action="info" data-title="치금도 판매할 수 있나요?">치금도 판매할 수 있나요? ${icon('chevron')}</button>
        </div>
      </div>`;
  }

  function sellTemplate(){
    const q=calcQuote();
    return `
      <div class="page-heading"><button class="back-button" data-route="home">${icon('back')}</button><div><h2>예상 견적 신청</h2><p>입력값을 바꾸면 금액이 바로 계산됩니다.</p></div></div>
      <div class="progress-track"><div class="progress-fill" style="width:74%"></div></div>
      <div class="card">
        <div class="section-label">1단계</div><h3 class="section-title">무엇을 판매하시나요?</h3>
        <div class="choice-grid">
          ${['목걸이·팔찌','반지·귀걸이','금니·치금','골드바'].map((v,i)=>`<button class="choice ${state.sell.product===v?'active':''}" data-sell-product="${v}"><span class="choice-icon">${['⌁','◌','🦷','▰'][i]}</span>${v}</button>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-label">2단계</div><h3 class="section-title">각인과 중량을 입력해 주세요</h3>
        <div class="choice-grid">
          ${['24K','18K','14K'].map(v=>`<button class="choice ${state.sell.purity===v?'active':''}" data-sell-purity="${v}">${v==='24K'?'999 / 999.9':v==='18K'?'750 / 18K':'585 / 14K'}</button>`).join('')}
          <button class="choice" data-action="unknown-purity">각인을 모르겠어요</button>
        </div>
        <div class="field"><label for="weight">예상 중량</label><div class="input-wrap"><input id="weight" type="number" min="0.1" step="0.1" value="${state.sell.weight}" inputmode="decimal"><span>g</span></div></div>
      </div>
      <label class="upload-box">
        <input id="photoUpload" type="file" accept="image/*">
        ${state.sell.image ? `<img class="upload-preview" src="${state.sell.image}" alt="등록한 제품 사진">` : `<div>${icon('upload')}<b style="display:block;font-size:13px">제품 사진 등록</b><small style="display:block;margin-top:5px">제품 전체와 각인이 보이도록 촬영해 주세요.</small></div>`}
      </label>
      <div class="quote-panel">
        <small>현재 예상 매입가</small>
        <div class="quote-number">${fmt(q.low)}~${fmt(q.high)}원</div>
        <div class="quote-breakdown">
          <div><small>선택 순도</small><b>${state.sell.purity}</b></div>
          <div><small>입력 중량</small><b>${state.sell.weight}g</b></div>
          <div><small>기준 단가</small><b>${fmt(q.perGram)}원/g</b></div>
          <div><small>예상 공제</small><b>${state.sell.product==='금니·치금'?'이물질 확인':'0~2.8%'}</b></div>
        </div>
        <button class="primary-button" data-action="save-quote">견적 저장하고 추천 매장 보기</button>
      </div>
      <p class="section-sub" style="text-align:center;margin:13px 18px 4px">사진과 입력값을 기반으로 한 참고 금액이며 최종 금액은 매장 감정 후 확정됩니다.</p>`;
  }

  function storeCard(s){
    const q=currentQuote();
    return `<article class="store-card" data-store-card="${s.id}">
      <div class="store-top"><div><div class="store-title">${s.name}</div><div class="store-meta">${s.distance}km · ${s.travel} · 대기 ${s.wait}</div></div><div class="store-score"><strong>${s.match}</strong><small>추천 점수</small></div></div>
      <div class="store-price"><span>예상 수령액</span><b>${fmt(q.low*s.priceFactor)}~${fmt(q.high*s.priceFactor)}원</b></div>
      <div class="tag-row">${s.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="store-actions"><button class="outline" data-route-store="${s.id}">상세 보기</button><button class="fill" data-reserve="${s.id}">방문 예약</button></div>
    </article>`;
  }

  function storesTemplate(){
    let list=[...stores];
    if(state.storeFilter==='가까운순') list.sort((a,b)=>a.distance-b.distance);
    if(state.storeFilter==='수령액순') list.sort((a,b)=>b.priceFactor-a.priceFactor);
    if(state.storeFilter==='평점순') list.sort((a,b)=>b.rating-a.rating);
    return `
      <div class="page-heading"><div><h2>금거래소 추천</h2><p>거리보다 거래 가능성과 투명성을 함께 비교합니다.</p></div></div>
      <div class="search-box">${icon('search')}<input id="storeSearch" placeholder="매장명·지역 검색"></div>
      <div class="filter-row">${['추천순','가까운순','수령액순','평점순','지금 방문'].map(v=>`<button class="filter-chip ${state.storeFilter===v?'active':''}" data-store-filter="${v}">${v}</button>`).join('')}</div>
      <div class="map-preview"><div class="road"></div><div class="road two"></div><i class="map-pin p1"></i><i class="map-pin p2"></i><i class="map-pin p3"></i></div>
      <div id="storeList">${list.map(storeCard).join('')}</div>`;
  }

  function storeDetailTemplate(){
    const s=stores.find(x=>x.id===state.selectedStore)||stores[0];
    const q=currentQuote();
    return `
      <div class="page-heading"><button class="back-button" data-route="stores">${icon('back')}</button><div><h2>매장 상세</h2><p>감정 방식과 최근 거래 품질을 확인하세요.</p></div></div>
      <div class="store-hero">
        <span class="badge">${s.verified?'공식 인증':'제휴 매장'}</span>
        <h2>${s.name}</h2><p>${s.address}</p>
        <div class="store-kpis"><div><b>${s.rating}</b><small>고객 평점</small></div><div><b>${s.wait}</b><small>현재 대기</small></div><div><b>${s.match}%</b><small>추천 적합도</small></div></div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="section-label">내 견적 기준</div><h3 class="section-title">예상 수령액</h3></div><span class="badge green">최근 10분 내 갱신</span></div>
        <div class="big-value">${fmt(q.low*s.priceFactor)}~${fmt(q.high*s.priceFactor)}원</div>
        <p class="section-sub">최근 30일 예상 견적 대비 최종 지급액 평균 차이 -1.8%</p>
        <div class="inline-buttons" style="margin-top:13px"><button class="ghost-button" data-action="chat">채팅 상담</button><button class="primary-button" data-reserve="${s.id}">방문 예약</button></div>
      </div>
      <div class="card">
        <div class="card-head"><h3 class="section-title">오늘의 매입 기준</h3><span class="section-sub">1돈</span></div>
        <div class="rate-table">
          ${Object.entries(PRICE_PER_DON).map(([k,v])=>`<div class="rate-row"><strong>${k}</strong><span>제품 상태에 따라 변동</span><b>${fmt(v*s.priceFactor)}원</b></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="section-label">투명성 평가</div><h3 class="section-title">감정 품질 지표</h3></div></div>
        ${[['중량 공개',98],['순도 분석 공개',96],['공제 사전 안내',94],['예약 시간 준수',91]].map(([n,v])=>`<div class="score-bar-row"><span>${n}</span><div class="score-bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')}
      </div>
      <div class="card flat">
        <div class="card-head"><h3 class="section-title">거래 인증 후기</h3><span class="section-sub">${s.reviews}개</span></div>
        <div class="review"><div class="review-top"><b>실제 거래 고객</b><span class="stars">★★★★★</span></div><p>저울 화면과 분석 결과를 바로 보여주고 공제되는 부분을 먼저 설명해줘서 신뢰가 갔어요.</p></div>
        <div class="review"><div class="review-top"><b>골드바 구매 고객</b><span class="stars">★★★★★</span></div><p>앱에서 재고 확인 후 방문해서 대기 없이 수령했습니다.</p></div>
      </div>`;
  }

  function productCard(p){
    return `<button class="product-card" data-product-id="${p.id}"><div class="product-visual"><div class="goldbar">GOLD<br>${p.weight}</div></div><h3>${p.name}</h3><p>${p.sub}</p><strong>${fmt(p.price)}원</strong><div class="stock">재고 ${p.stock}개 · 픽업 가능</div></button>`;
  }

  function shopTemplate(){
    const cats=['전체','골드바','돌반지','순금카드','실버바'];
    const list=state.shopCategory==='전체'?products:products.filter(p=>p.category===state.shopCategory);
    return `
      <div class="page-heading"><div><h2>골드샵</h2><p>현재 가격과 매장 재고를 확인하고 예약하세요.</p></div></div>
      <div class="category-row">${cats.map((c,i)=>`<button class="category-chip ${state.shopCategory===c?'active':''}" data-shop-category="${c}"><span style="font-size:21px">${['✦','▰','◯','▤','▱'][i]}</span>${c}</button>`).join('')}</div>
      <div class="card dark" style="padding:16px"><div class="section-label" style="color:#d8c89e">오늘의 추천</div><div style="display:flex;justify-content:space-between;align-items:end"><div><h3 class="section-title">골드바 3.75g</h3><p class="section-sub" style="color:#c9c0a9">위례점 재고 7개 · 매장 픽업</p></div><div style="text-align:right"><div class="big-value" style="color:#f5cf6f">865,000원</div></div></div></div>
      <div class="product-grid">${list.map(productCard).join('')}</div>`;
  }

  function productDetailTemplate(){
    const p=products.find(x=>x.id===state.selectedProduct)||products[0];
    const material=Math.round(p.price*0.89/1000)*1000;
    const vat=Math.round(material*.1/100)*100;
    const fee=p.price-material-vat;
    const min=String(Math.floor(state.priceLock/60)).padStart(2,'0'), sec=String(state.priceLock%60).padStart(2,'0');
    return `
      <div class="page-heading"><button class="back-button" data-route="shop">${icon('back')}</button><div><h2>상품 상세</h2><p>가격 구성과 픽업 가능 매장을 확인하세요.</p></div></div>
      <div class="product-visual" style="height:210px;border-radius:27px"><div class="goldbar" style="width:150px;height:96px;font-size:17px">GOLD PICK<br>${p.weight}<br><small>FINE GOLD 999.9</small></div></div>
      <div class="card">
        <div class="section-label">${p.category}</div><h3 class="section-title">${p.name}</h3><p class="section-sub">${p.sub} · 스마일금거래소 공식 상품</p>
        <div class="big-value" style="margin-top:13px">${fmt(p.price)}원</div>
        <div class="lock-timer"><span>현재 가격 유지</span><b id="lockTimer">${min}:${sec}</b></div>
        <div class="price-detail">
          <div class="price-line"><span>금 원재료 기준가</span><b>${fmt(material)}원</b></div>
          <div class="price-line"><span>부가세</span><b>${fmt(vat)}원</b></div>
          <div class="price-line"><span>제조·유통 비용</span><b>${fmt(fee)}원</b></div>
          <div class="price-line total"><span>최종 판매가</span><b>${fmt(p.price)}원</b></div>
        </div>
      </div>
      <div class="card"><div class="card-head"><div><div class="section-label">픽업 매장</div><h3 class="section-title">스마일금거래소 위례점</h3><p class="section-sub">재고 ${p.stock}개 · 오늘 수령 가능</p></div><span class="badge green">재고 있음</span></div></div>
      <div class="inline-buttons"><button class="ghost-button" data-action="wishlist">찜하기</button><button class="primary-button" data-buy="${p.id}">구매 예약</button></div>`;
  }

  function communityTemplate(){
    const userPosts=saved.get('posts',[]);
    const posts=[...userPosts,...defaultPosts];
    const filtered=state.communityTab==='전체'?posts:posts.filter(p=>p.type===state.communityTab);
    return `
      <div class="page-heading"><div><h2>골드톡</h2><p>거래 인증 후기와 전문가 답변을 확인하세요.</p></div></div>
      <div class="community-tabs">${['전체','후기','질문'].map(t=>`<button class="${state.communityTab===t?'active':''}" data-community-tab="${t}">${t}</button>`).join('')}</div>
      ${filtered.map(p=>`<article class="post-card"><div class="post-head"><div class="mini-avatar">${p.user.slice(0,1)}</div><div><b>${p.user}</b><small>${p.type} · ${p.time}</small></div></div><h3>${p.title}</h3><p>${p.body}</p><div class="post-actions"><span>♡ ${p.likes||0}</span><span>댓글 ${p.comments||0}</span><span>공유</span></div></article>`).join('')}
      <button class="floating-button" data-action="new-post" aria-label="새 글 작성">＋</button>`;
  }

  function myTemplate(){
    const quote=saved.get('quote');
    const reservation=saved.get('reservation');
    const orders=saved.get('orders',[]);
    const notify=saved.get('notify',true);
    return `
      <div class="profile-card"><div class="profile-row"><div class="avatar">GP</div><div><h2>골드픽 고객님</h2><p>투명한 금거래를 위한 나의 기록</p></div></div><div class="profile-stats"><div><b>${quote?1:0}</b><small>저장 견적</small></div><div><b>${reservation?1:0}</b><small>방문 예약</small></div><div><b>${orders.length}</b><small>구매 예약</small></div></div></div>
      ${quote?`<div class="card"><div class="card-head"><div><div class="section-label">최근 예상 견적</div><h3 class="section-title">${quote.product} · ${quote.purity}</h3><p class="section-sub">${quote.weight}g 입력 기준</p></div><span class="badge light">저장됨</span></div><div class="big-value">${fmt(quote.low)}~${fmt(quote.high)}원</div></div>`:''}
      ${reservation?`<div class="card"><div class="card-head"><div><div class="section-label">방문 예약</div><h3 class="section-title">${reservation.store}</h3><p class="section-sub">${reservation.date} · ${reservation.time}</p></div><span class="badge green">예약 완료</span></div><button class="ghost-button" data-action="cancel-reservation">예약 취소</button></div>`:''}
      ${orders.length?`<div class="card"><div class="card-head"><h3 class="section-title">구매 예약</h3><span class="section-sub">${orders.length}건</span></div>${orders.map(o=>`<div class="check-row"><span>${o.name}<small style="display:block;color:#888;margin-top:3px">${o.pickup}</small></span><b>${fmt(o.price)}원</b></div>`).join('')}</div>`:''}
      <div class="menu-list">
        <button class="menu-item" data-action="toggle-notify"><span class="left"><span class="menu-icon">🔔</span><span>시세·입고 알림<small style="display:block">목표 가격과 상품 재고 알림</small></span></span><span class="switch ${notify?'on':''}"></span></button>
        <button class="menu-item" data-action="documents"><span class="left"><span class="menu-icon">▤</span><span>전자 거래확인서<small style="display:block">감정 결과와 지급 기록</small></span></span>${icon('chevron')}</button>
        <button class="menu-item" data-route="admin"><span class="left"><span class="menu-icon">▦</span><span>가맹점 관리자 체험<small style="display:block">예약·견적·재고 관리 화면</small></span></span>${icon('chevron')}</button>
        <button class="menu-item" data-action="reset-demo"><span class="left"><span class="menu-icon">↻</span><span>데모 데이터 초기화</span></span>${icon('chevron')}</button>
      </div>`;
  }

  function adminTemplate(){
    return `
      <div class="page-heading"><button class="back-button" data-route="my">${icon('back')}</button><div><h2>가맹점 관리자</h2><p>소비자 앱과 연동되는 운영 대시보드 예시입니다.</p></div></div>
      <div class="admin-grid">
        <div class="admin-kpi"><small>오늘 견적 요청</small><b>28건</b></div>
        <div class="admin-kpi"><small>방문 예약</small><b>11건</b></div>
        <div class="admin-kpi"><small>예상 거래액</small><b>2,840만</b></div>
        <div class="admin-kpi"><small>골드바 재고</small><b>27개</b></div>
      </div>
      <div class="card" style="margin-top:12px"><div class="card-head"><div><div class="section-label">최근 7일</div><h3 class="section-title">견적 요청 추이</h3></div><span class="badge green">+18%</span></div><div class="admin-chart"><svg viewBox="0 0 300 120" preserveAspectRatio="none"><path d="M0 94 C35 82 52 92 78 70 S125 78 150 45 S200 58 225 28 S270 42 300 12" fill="none" stroke="#d5a136" stroke-width="5" stroke-linecap="round"/><path d="M0 94 C35 82 52 92 78 70 S125 78 150 45 S200 58 225 28 S270 42 300 12 L300 120 L0 120Z" fill="#d5a13622"/></svg></div></div>
      <div class="menu-list"><button class="menu-item" data-action="admin-message"><span class="left"><span class="menu-icon">28</span><span>신규 견적 요청<small style="display:block">응답 대기 5건</small></span></span>${icon('chevron')}</button><button class="menu-item" data-action="admin-message"><span class="left"><span class="menu-icon">11</span><span>오늘 방문 예약<small style="display:block">다음 예약 14:30</small></span></span>${icon('chevron')}</button><button class="menu-item" data-action="admin-message"><span class="left"><span class="menu-icon">▰</span><span>골드바 재고 관리<small style="display:block">3.75g 재고 7개</small></span></span>${icon('chevron')}</button></div>`;
  }

  function render(){
    clearInterval(state.timer);
    const templates={home:homeTemplate,sell:sellTemplate,stores:storesTemplate,'store-detail':storeDetailTemplate,shop:shopTemplate,'product-detail':productDetailTemplate,community:communityTemplate,my:myTemplate,admin:adminTemplate};
    page.innerHTML=(templates[state.route]||homeTemplate)();
    renderNav();
    if(state.route==='product-detail') startPriceTimer();
    hydrateIcons();
  }

  function hydrateIcons(){
    document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  }

  function startPriceTimer(){
    state.timer=setInterval(()=>{
      state.priceLock=Math.max(0,state.priceLock-1);
      const el=document.getElementById('lockTimer');
      if(el){ const m=String(Math.floor(state.priceLock/60)).padStart(2,'0'),s=String(state.priceLock%60).padStart(2,'0'); el.textContent=`${m}:${s}`; }
      if(state.priceLock===0){ clearInterval(state.timer); showToast('가격 유지 시간이 끝나 최신 가격으로 갱신됩니다.'); state.priceLock=300; }
    },1000);
  }

  function reservationModal(storeId){
    const s=stores.find(x=>x.id===storeId)||stores[0];
    const dates=[];
    for(let i=0;i<4;i++){ const d=new Date(); d.setDate(d.getDate()+i); dates.push(`${d.getMonth()+1}월 ${d.getDate()}일${i===0?' 오늘':''}`); }
    openModal(`<button class="modal-close" data-action="close-modal">×</button><h3>방문 예약</h3><p>${s.name}<br>${s.address}</p><div class="field"><label>방문 날짜</label><div class="choice-grid">${dates.map((d,i)=>`<button class="choice ${i===0?'active':''}" data-modal-date="${d}">${d}</button>`).join('')}</div></div><div class="field"><label>방문 시간</label><div class="choice-grid">${['11:00','13:30','15:00','17:30'].map((t,i)=>`<button class="choice ${i===1?'active':''}" data-modal-time="${t}">${t}</button>`).join('')}</div></div><div class="modal-actions"><button class="ghost-button" data-action="close-modal">취소</button><button class="primary-button" data-confirm-reservation="${storeId}">예약 확정</button></div>`);
  }

  function buyModal(productId){
    const p=products.find(x=>x.id===productId);
    openModal(`<button class="modal-close" data-action="close-modal">×</button><h3>구매 예약</h3><p>${p.name}을 현재 가격으로 예약합니다.</p><div class="card gold" style="box-shadow:none"><div class="section-label">결제 예정 금액</div><div class="big-value">${fmt(p.price)}원</div><div class="tag-row"><span class="tag">매장 픽업</span><span class="tag">신분증 확인</span><span class="tag">인증서 포함</span></div></div><div class="field"><label>수령 매장</label><div class="input-wrap"><select id="pickupStore"><option>스마일금거래소 위례점</option><option>골드랩 강남점</option><option>스마일금거래소 송파점</option></select></div></div><div class="modal-actions"><button class="ghost-button" data-action="close-modal">취소</button><button class="primary-button" data-confirm-buy="${productId}">예약 완료</button></div>`);
  }

  function infoModal(title){
    const text={
      '보증서 없이도 매입 가능한가요?':'보증서나 영수증이 없어도 매입할 수 있습니다. 매장에서 중량과 순도를 직접 분석한 뒤 최종 금액을 안내합니다.',
      '인터넷 시세와 실제 매입가 차이':'인터넷 시세는 순금 기준 원재료 가격인 경우가 많습니다. 실제 매입가는 순도, 중량, 비금속 부품, 정련 기준과 매장 정책에 따라 달라질 수 있습니다.',
      '치금도 판매할 수 있나요?':'금니와 치금도 매입할 수 있습니다. 치아나 비금속이 붙어 있으면 이를 제외한 금속 중량과 분석 순도를 기준으로 계산합니다.'
    };
    openModal(`<button class="modal-close" data-action="close-modal">×</button><h3>${title}</h3><p>${text[title]||'정확한 내용은 매장 상담을 통해 확인할 수 있습니다.'}</p><button class="primary-button" data-route="stores" data-action="close-and-route">상담 가능한 매장 보기</button>`);
  }

  function newPostModal(){
    openModal(`<button class="modal-close" data-action="close-modal">×</button><h3>골드톡 글쓰기</h3><p>거래 경험이나 궁금한 점을 공유해 보세요.</p><div class="field"><label>분류</label><div class="input-wrap"><select id="postType"><option>후기</option><option>질문</option><option>시황</option></select></div></div><div class="field"><label>제목</label><div class="input-wrap"><input id="postTitle" placeholder="제목을 입력해 주세요"></div></div><div class="field"><label>내용</label><textarea id="postBody" style="width:100%;height:110px;border:1px solid var(--line);border-radius:16px;background:#f7f7f8;padding:13px;resize:none;outline:none" placeholder="내용을 입력해 주세요"></textarea></div><div class="modal-actions"><button class="ghost-button" data-action="close-modal">취소</button><button class="primary-button" data-action="save-post">등록</button></div>`);
  }

  document.addEventListener('click',e=>{
    const routeBtn=e.target.closest('[data-route]');
    if(routeBtn && !routeBtn.dataset.action){ setRoute(routeBtn.dataset.route); return; }

    const productChoice=e.target.closest('[data-sell-product]');
    if(productChoice){ state.sell.product=productChoice.dataset.sellProduct; render(); return; }
    const purityChoice=e.target.closest('[data-sell-purity]');
    if(purityChoice){ state.sell.purity=purityChoice.dataset.sellPurity; render(); return; }
    const filter=e.target.closest('[data-store-filter]');
    if(filter){ state.storeFilter=filter.dataset.storeFilter; render(); return; }
    const routeStore=e.target.closest('[data-route-store]');
    if(routeStore){ setRoute('store-detail',{storeId:routeStore.dataset.routeStore}); return; }
    const reserve=e.target.closest('[data-reserve]');
    if(reserve){ reservationModal(reserve.dataset.reserve); return; }
    const product=e.target.closest('[data-product-id]');
    if(product){ state.priceLock=300; setRoute('product-detail',{productId:product.dataset.productId}); return; }
    const category=e.target.closest('[data-shop-category]');
    if(category){ state.shopCategory=category.dataset.shopCategory; render(); return; }
    const ctab=e.target.closest('[data-community-tab]');
    if(ctab){ state.communityTab=ctab.dataset.communityTab; render(); return; }
    const buy=e.target.closest('[data-buy]');
    if(buy){ buyModal(buy.dataset.buy); return; }

    const action=e.target.closest('[data-action]')?.dataset.action;
    if(!action) return;
    if(action==='close-modal') closeModal();
    if(action==='close-and-route'){ const r=e.target.closest('[data-route]')?.dataset.route; closeModal(); if(r)setRoute(r); }
    if(action==='notifications') showToast('새로운 시세 알림 2건이 있습니다.');
    if(action==='unknown-purity') showToast('사진을 등록하면 매장에서 순도를 확인해 드립니다.');
    if(action==='save-quote'){
      const q=calcQuote();
      saved.set('quote',{...state.sell,...q,createdAt:new Date().toISOString()});
      showToast('견적이 저장되었습니다.'); setTimeout(()=>setRoute('stores'),450);
    }
    if(action==='info') infoModal(e.target.closest('[data-title]').dataset.title);
    if(action==='chat') showToast('상담 채팅이 연결되었습니다.');
    if(action==='wishlist'){ saved.set('wishlist',state.selectedProduct); showToast('찜한 상품에 저장했습니다.'); }
    if(action==='new-post') newPostModal();
    if(action==='save-post'){
      const title=document.getElementById('postTitle')?.value.trim();
      const body=document.getElementById('postBody')?.value.trim();
      if(!title||!body){ showToast('제목과 내용을 입력해 주세요.'); return; }
      const posts=saved.get('posts',[]);
      posts.unshift({id:Date.now(),type:document.getElementById('postType').value,user:'골드픽 고객',time:'방금',title,body,likes:0,comments:0});
      saved.set('posts',posts); closeModal(); render(); showToast('글이 등록되었습니다.');
    }
    if(action==='toggle-notify'){ saved.set('notify',!saved.get('notify',true)); render(); showToast('알림 설정이 변경되었습니다.'); }
    if(action==='documents') showToast('완료된 거래 후 감정 리포트가 표시됩니다.');
    if(action==='cancel-reservation'){ localStorage.removeItem('goldpick_reservation'); render(); showToast('예약이 취소되었습니다.'); }
    if(action==='reset-demo'){ if(confirm('저장된 견적·예약·게시글을 초기화할까요?')){ Object.keys(localStorage).filter(k=>k.startsWith('goldpick_')).forEach(k=>localStorage.removeItem(k)); render(); showToast('데모 데이터가 초기화되었습니다.'); } }
    if(action==='admin-message') showToast('운영 기능은 프로토타입 화면입니다.');
  });

  modalRoot.addEventListener('click',e=>{
    const date=e.target.closest('[data-modal-date]');
    if(date){ modalRoot.querySelectorAll('[data-modal-date]').forEach(x=>x.classList.remove('active')); date.classList.add('active'); }
    const time=e.target.closest('[data-modal-time]');
    if(time){ modalRoot.querySelectorAll('[data-modal-time]').forEach(x=>x.classList.remove('active')); time.classList.add('active'); }
    const confirmReservation=e.target.closest('[data-confirm-reservation]');
    if(confirmReservation){
      const s=stores.find(x=>x.id===confirmReservation.dataset.confirmReservation)||stores[0];
      const date=modalRoot.querySelector('[data-modal-date].active')?.dataset.modalDate;
      const time=modalRoot.querySelector('[data-modal-time].active')?.dataset.modalTime;
      saved.set('reservation',{store:s.name,date,time,storeId:s.id}); closeModal(); showToast('방문 예약이 완료되었습니다.'); if(state.route==='store-detail'||state.route==='stores')setRoute('my');
    }
    const confirmBuy=e.target.closest('[data-confirm-buy]');
    if(confirmBuy){
      const p=products.find(x=>x.id===confirmBuy.dataset.confirmBuy);
      const orders=saved.get('orders',[]);
      orders.push({id:Date.now(),name:p.name,price:p.price,pickup:document.getElementById('pickupStore').value});
      saved.set('orders',orders); closeModal(); showToast('구매 예약이 완료되었습니다.'); setRoute('my');
    }
  });

  document.addEventListener('input',e=>{
    if(e.target.id==='weight'){
      state.sell.weight=Math.max(Number(e.target.value)||0,0);
      const panel=document.querySelector('.quote-panel');
      if(panel){
        const q=calcQuote();
        panel.querySelector('.quote-number').textContent=`${fmt(q.low)}~${fmt(q.high)}원`;
        const values=panel.querySelectorAll('.quote-breakdown b');
        if(values[1]) values[1].textContent=`${state.sell.weight}g`;
        if(values[2]) values[2].textContent=`${fmt(q.perGram)}원/g`;
      }
    }
    if(e.target.id==='storeSearch'){
      const term=e.target.value.trim().toLowerCase();
      document.querySelectorAll('[data-store-card]').forEach(card=>{
        const s=stores.find(x=>x.id===card.dataset.storeCard);
        card.style.display=(!term||`${s.name} ${s.address} ${s.tags.join(' ')}`.toLowerCase().includes(term))?'':'none';
      });
    }
  });

  document.addEventListener('change',e=>{
    if(e.target.id==='photoUpload' && e.target.files?.[0]){
      const reader=new FileReader();
      reader.onload=()=>{ state.sell.image=reader.result; render(); showToast('제품 사진이 등록되었습니다.'); };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); state.installPrompt=e;
    const btn=document.getElementById('installButton'); btn.hidden=false;
    btn.onclick=async()=>{ await state.installPrompt.prompt(); state.installPrompt=null; btn.hidden=true; };
  });

  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});

  const hash=location.hash.replace('#','');
  if(['home','sell','community','stores','store-detail','shop','product-detail','my','admin'].includes(hash)) state.route=hash;
  hydrateIcons();
  render();
})();
