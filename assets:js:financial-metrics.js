// Plotly dashboard v2: clear mock data to show Target vs Actual vs Projection (current month)
(function(){
  function daysInMonth(y,m){ return new Date(y, m+1, 0).getDate(); }
  function monthLabel(y,m){ return `${y}-${String(m+1).padStart(2,'0')}`; }

  // UI helpers
  function hookUI(update){
    const selIds = ['f_country','f_partnerCat','f_agreement','f_industry','f_cpm','f_product','f_lead','f_mkt','f_age'];
    selIds.forEach(id=> document.getElementById(id).addEventListener('change', update));

    const fb = document.getElementById('filtersBlock'); fb.open = false;
    document.getElementById('toggleFilters').addEventListener('click', ()=>{
      fb.open = !fb.open;
      document.getElementById('toggleFilters').textContent = fb.open ? 'Hide filters' : 'Show filters';
    });

    document.getElementById('resetBtn').addEventListener('click', ()=>{
      selIds.forEach(id=> document.getElementById(id).selectedIndex = 0);
      update();
    });
  }

  // Deterministic mock data with visible separation
  function buildMockSeries(){
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const dim = daysInMonth(y,m);
    const dayN = now.getDate();

    // Set a fixed monthly target and an actual performance factor that is intentionally below target
    const monthlyTarget = 600_000;         // Target: S$600k
    const actualFactor  = 0.78;            // Actual is tracking at 78% of target pace
    const perDayTarget  = monthlyTarget / dim;
    const perDayActual  = perDayTarget * actualFactor;

    // Build x (days)
    const xFull = Array.from({length: dim}, (_,i)=> i+1);

    // Actual line (MTD only)
    const actualY = xFull.map(d => d <= dayN ? perDayActual * d : null);

    // Target (full month) and Projection (full month using run-rate)
    const targetY = xFull.map(d => perDayTarget * d);
    const projY   = xFull.map(d => perDayActual * d);

    return {
      label: monthLabel(y,m),
      x: xFull, actualY, targetY, projY
    };
  }

  function draw(){
    const el = document.getElementById('chart');
    const now = new Date();
    document.getElementById('asOf').textContent = `As of ${now.toLocaleDateString('en-SG',{year:'numeric',month:'long',day:'numeric'})}`;

    const cur = buildMockSeries();

    // Build traces: Actual (solid), Target (dash), Projection (dot)
    const traces = [
      { type:'scatter', mode:'lines+markers', name:'Actual (MTD)', x:cur.x, y:cur.actualY,
        line:{width:3}, marker:{size:4}, hovertemplate:`Day %{x}<br>Actual<br>S$ %{y:,.0f}<extra></extra>` },
      { type:'scatter', mode:'lines', name:'Target (Month)', x:cur.x, y:cur.targetY,
        line:{dash:'dash', width:2}, hovertemplate:`Day %{x}<br>Target<br>S$ %{y:,.0f}<extra></extra>` },
      { type:'scatter', mode:'lines', name:'Projection (Run-rate)', x:cur.x, y:cur.projY,
        line:{dash:'dot', width:2}, hovertemplate:`Day %{x}<br>Projection<br>S$ %{y:,.0f}<extra></extra>` },
    ];

    const layout = {
      title:{text:'', font:{color:'#e6eaf2'}},
      paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
      margin:{l:60,r:20,t:10,b:40},
      xaxis:{ title:'Created Day of Month', gridcolor:'rgba(255,255,255,.07)', tickfont:{color:'#b9c6dd'}, titlefont:{color:'#b9c6dd'} },
      yaxis:{ title:'Cumulative Net Revenue', gridcolor:'rgba(255,255,255,.07)', tickprefix:'S$ ', separatethousands:true, tickfont:{color:'#b9c6dd'}, titlefont:{color:'#b9c6dd'} },
      legend:{ orientation:'h', y:1.12, x:0, font:{color:'#e6eaf2'} },
      height: 420
    };

    Plotly.newPlot(el, traces, layout, {displayModeBar:false, responsive:true});
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    hookUI(draw);
    draw();
  });
})();