'use strict';
const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CUR={IDR:{d:0,s:'Rp',n:'Rupiah'},USD:{d:2,s:'$',n:'Dolar AS'},EUR:{d:2,s:'€',n:'Euro'},SGD:{d:2,s:'S$',n:'Dolar Singapura'},MYR:{d:2,s:'RM',n:'Ringgit Malaysia'},JPY:{d:0,s:'¥',n:'Yen Jepang'},GBP:{d:2,s:'£',n:'Poundsterling'},AUD:{d:2,s:'A$',n:'Dolar Australia'}};
const CD=c=>(CUR[c]||CUR.IDR).d;
const fm=(n,c='IDR')=>{const u=CUR[c]||CUR.IDR;return(n<0?'-':'')+u.s+(Math.abs(n)/10**u.d).toLocaleString('id-ID',{minimumFractionDigits:u.d,maximumFractionDigits:u.d})};
const rp=n=>fm(n,'IDR');
const pm=(v,c)=>{const d=CD(c),x=String(v).trim();if(!d)return parseInt(x.replace(/\D/g,''),10)||0;const q=x.replace(',','.').replace(/[^\d.]/g,'').split('.'),f=q.length>1?q.pop():'';return(parseInt(q.join('')||'0',10)||0)*10**d+(parseInt((f+'0'.repeat(d)).slice(0,d),10)||0)};
const hv=(n,c)=>{const d=CD(c);return d?Math.floor(n/10**d)+'.'+String(n%10**d).padStart(d,'0'):String(n)};
const pr=v=>{v=String(v).trim();if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');else if(/^[1-9]\d{0,2}(\.\d{3})+$/.test(v))v=v.replace(/\./g,'');return parseFloat(v)},fk=n=>String(n).replace('.',',');
const fo=o=>Object.entries(o).map(([c,v])=>fm(v,c)).join(' + ')||'-',add=(o,k,v)=>{o[k]=(o[k]||0)+v;return o};
const GR=[['cash','Uang tunai','💵',['Cash']],['bank','Bank','🏦',['BCA','BRI','BNI','Bank Mandiri','BSI','blu by BCA Digital','SeaBank','Bank Jago','Jenius','Bank lainnya']],['ewallet','E-wallet','📱',['GoPay','DANA','OVO','ShopeePay','LinkAja','i.saku','Sakuku','AstraPay','E-wallet lainnya']],['intl','Pembayaran internasional','🌐',['PayPal','Wise','Skrill','Payoneer','Pembayaran internasional lainnya']],['invest','Investasi & aset','📈',['Rekening investasi','Saham','Reksa dana','Emas digital','Aset lainnya']]];
const PAL=['#0f766e','#2563eb','#f59e0b','#dc2626','#7c3aed','#db2777','#65a30d','#0891b2','#ea580c','#64748b'],DT=['cash','ewallet','ewallet','bank'];
const ic=a=>GR.find(g=>g[0]===a.type)?.[2]||'💳';
const aopt=(l,v)=>l.map(a=>`<option value="${a.id}"${a.id===v?' selected':''}>${ic(a)} ${E(a.name)}${a.cur!=='IDR'?' ('+a.cur+')':''}</option>`).join('');
const ops=p=>Object.entries(p.opening||{}).reduce((o,[k,v])=>add(o,acur(k),v),{});
const tot=l=>fo(l.reduce((o,t)=>add(o,acur(t.accId),t.amount),{}));
const fd=d=>new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,10);
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const num=v=>parseInt(String(v).replace(/\D/g,''),10)||0;
const TL={in:'Pemasukan',out:'Pengeluaran',tf:'Transfer'},DEF=['Cash','GoPay','ShopeePay','SeaBank'];
const CO=['Makanan dan minuman','Transportasi','Kebutuhan pribadi','Pendidikan','Tagihan','Hiburan','Tabungan atau investasi','Lainnya'],CI=['Gaji','Uang saku','Bonus','Lainnya'];
let S={accounts:[],periods:[],categories:[],tx:[],cfg:{id:'cfg'}},tab='in',edit=null,pend=null,F={in:{},out:{},tf:{}},rkP,rkA='',rkC,rkD1='',rkD2='',rkSel=null;
const acur=id=>S.accounts.find(x=>x.id===id)?.cur||'IDR',conv=(x,c)=>c==='IDR'?x:Math.round(x/10**CD(c)*S.cfg.rates[c]),an=id=>S.accounts.find(x=>x.id===id)?.name||'?',pn=id=>S.periods.find(x=>x.id===id)?.name||'?';
const byDate=(a,b)=>a.date<b.date?1:a.date>b.date?-1:a.id<b.id?1:-1;
const bal=(id,ex)=>{const a=S.accounts.find(x=>x.id===id);let b=a?a.initial:0;for(const t of S.tx){if(t.id===ex)continue;if(t.type==='in'&&t.accId===id)b+=t.amount;else if(t.type==='out'&&t.accId===id)b-=t.amount;else if(t.type==='tf'){if(t.accId===id)b-=t.amount;if(t.toAccId===id)b+=(t.toAmount??t.amount)}}return b};
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className=bad?'bad show':'show';clearTimeout(toast.h);toast.h=setTimeout(()=>t.className='',4000)}
async function load(){const[a,p,c,t,m]=await Promise.all(['accounts','periods','categories','tx','meta'].map(s=>DB.all(s)));
 const guess=n=>/cash|tunai/i.test(n)?'cash':/gopay|dana|ovo|shopee|linkaja|saku|astrapay/i.test(n)?'ewallet':/paypal|wise|skrill|payoneer/i.test(n)?'intl':'bank';
 a.forEach(x=>{x.cur=x.cur||'IDR';x.type=GR.some(g=>g[0]===x.type)?x.type:guess(x.name)});
 S={accounts:a,periods:p.sort((x,y)=>x.start<y.start?-1:1),categories:c,tx:t,cfg:m.find(x=>x.id==='cfg')||{id:'cfg'}};S.cfg.rates=S.cfg.rates||{};
 if(!S.periods.find(x=>x.id===S.cfg.active))S.cfg.active=S.periods[0]?.id}
async function save(ops,msg){try{await DB.write(ops);await load();render();const neg=S.accounts.filter(a=>bal(a.id)<0);
 toast((msg||'Tersimpan')+(neg.length?' — ⚠ Saldo negatif: '+neg.map(a=>a.name).join(', '):''),neg.length>0);return true}catch(e){toast('Gagal menyimpan: '+(e.message||e),1);return false}}
const opt=(l,v)=>l.map(x=>`<option value="${x.id}"${x.id===v?' selected':''}>${E(x.name)}</option>`).join('');

function pgSetup(){const d=new Date(),y=d.getFullYear(),m=d.getMonth(),p=n=>String(n).padStart(2,'0');
 return `<form data-f="setup" class="card"><h3>Selamat datang di DompetKu</h3><small>Isi periode pertama dan saldo awal. Data hanya disimpan di HP ini.</small>
<label>Nama periode<input name="name" required value="${E(d.toLocaleDateString('id-ID',{month:'long',year:'numeric'}))}"></label>
<div class="row"><label>Mulai<input type="date" name="start" required value="${y}-${p(m+1)}-01"></label><label>Selesai<input type="date" name="end" required value="${y}-${p(m+1)}-${p(new Date(y,m+1,0).getDate())}"></label></div>
<label>Total uang awal (Rp)<input name="total" inputmode="numeric" required placeholder="0"></label><small>Bagi ke akun (jumlahnya harus sama dengan total):</small>
${DEF.map((n,i)=>`<label>${n}<input name="a${i}" inputmode="numeric" placeholder="0"></label>`).join('')}<p id="sd" class="m"></p><button class="p">Mulai</button></form>`}

function periodPanel(){const e=edit?.kind==='per'?edit:null;
 return `<details class="card"${e?' open':''}><summary>Periode: ${E(pn(S.cfg.active))}</summary>${S.periods.map(p=>`<div class="tx"><div><b>${E(p.name)}</b>${p.id===S.cfg.active?' ✓':''}<small>${fd(p.start)} – ${fd(p.end)}<br>Saldo awal: ${fo(ops(p))}</small></div><div><button class="s" data-a="pick" data-id="${p.id}">Pilih</button><button class="s" data-a="eper" data-id="${p.id}">✎</button><button class="s" data-a="dper" data-id="${p.id}">🗑</button></div></div>`).join('')}
<form data-f="per"><h4>${e?'Edit':'Tambah'} periode</h4><input name="name" required placeholder="Nama periode" value="${E(e?.name)}"><div class="row"><input type="date" name="start" required value="${e?.start||''}"><input type="date" name="end" required value="${e?.end||''}"></div>
<small>Saldo awal periode ini (hanya catatan laporan, TIDAK menambah saldo akun):</small>${S.accounts.map(a=>`<label>${E(a.name)} (${a.cur})<input name="o_${a.id}" inputmode="decimal" value="${e?.opening?.[a.id]?hv(e.opening[a.id],a.cur):''}"></label>`).join('')}
<div class="row"><button class="p">Simpan periode</button>${e?'<button type="button" data-a="cancel">Batal</button>':''}</div></form></details>`}

function accForm(){const e=edit?.kind==='acc'?edit:null;
 return `<form data-f="acc"><h4>${e?'Ubah':'Tambah'} akun</h4><label>Pilih layanan<select name="svc"><option value="${e?.type||'bank'}|">— pilih layanan / jenis —</option>${GR.map(g=>`<optgroup label="${g[2]} ${g[1]}">${g[3].map(n=>`<option value="${g[0]}|${n}">${n}</option>`).join('')}</optgroup>`).join('')}</select></label>
<label>Nama akun<input name="name" required placeholder="mis. BNI Tabungan" value="${E(e?.name)}"></label>
${e?`<small>Mata uang (${e.cur}) dan saldo awal tidak dapat diubah agar riwayat tetap konsisten. Mengubah nama tidak mengubah saldo.</small>`:`<label>Mata uang<select name="cur">${Object.entries(CUR).map(([c,u])=>`<option value="${c}">${c} — ${u.n}</option>`).join('')}</select></label><label>Saldo awal (bukan pemasukan)<input name="init" inputmode="decimal" placeholder="0"></label>`}
<div class="row"><button class="p">Simpan akun</button>${e?'<button type="button" data-a="cancel">Batal</button>':''}</div></form>`}
async function submitAcc(f){const e=edit?.kind==='acc'?edit:null,el=f.elements,nm=el.name.value.trim(),ty=el.svc.value.split('|')[0];
 if(!nm)return toast('Nama akun wajib diisi',1);
 if(S.accounts.some(x=>x.id!==e?.id&&x.name.toLowerCase()===nm.toLowerCase()))return toast('Nama akun sudah ada, gunakan nama lain',1);
 const a=e?{...S.accounts.find(x=>x.id===e.id),name:nm,type:ty}:{id:uid(),name:nm,type:ty,cur:el.cur.value,initial:pm(el.init.value,el.cur.value)};
 edit=null;await save([['put','accounts',a]],e?'Akun diperbarui':'Akun ditambahkan')}
async function submitRates(f){const r={};[...new Set(S.accounts.map(a=>a.cur))].forEach(c=>{const v=pr(f.elements['r_'+c]?.value||'');if(v>0)r[c]=v});await save([['put','meta',{...S.cfg,rates:r}]],'Kurs manual disimpan')}
function accPanel(){const ar=a=>`<div class="tx"><div><b>${ic(a)} ${E(a.name)}${a.archived?' (arsip)':''}</b><small>${a.cur}</small></div><div class="${bal(a.id)<0?'r':''}">${fm(bal(a.id),a.cur)}<br><button class="s" data-a="ren" data-id="${a.id}">Ubah</button><button class="s" data-a="dacc" data-id="${a.id}">${a.archived?'Aktifkan':'Arsip/Hapus'}</button></div></div>`;
 return `<div class="card"><h3>Akun & saldo</h3>${GR.map(g=>{const l=S.accounts.filter(a=>a.type===g[0]).sort((x,y)=>x.name.localeCompare(y.name));return l.length?`<small>${g[2]} ${g[1]}</small>`+l.map(ar).join(''):''}).join('')}${edit?.kind==='acc'?accForm():'<button data-a="nacc">+ Tambah akun</button>'}</div>`}
function syncF(f,ev){const el=f.elements,A=S.accounts.find(x=>x.id===el.acc.value),B=el.to&&S.accounts.find(x=>x.id===el.to.value);
 f.querySelector('.cl').textContent=A?A.cur:'';const x=f.querySelector('.xc');if(!x)return;
 const diff=!!(A&&B&&A.cur!==B.cur);x.style.display=diff?'':'none';if(!diff)return;
 f.querySelector('.il').textContent=`Nominal masuk (${B.cur})`;f.querySelector('.kl').textContent=`Kurs: 1 ${A.cur} = ? ${B.cur} (otomatis, boleh diubah)`;
 const n=ev&&ev.target.name,o=pm(el.amt.value,A.cur)/10**CD(A.cur),k=pr(el.kurs.value);
 if((n==='kurs'||n==='amt')&&k>0)el['in'].value=hv(Math.round(o*k*10**CD(B.cur)),B.cur);
 else if(n==='in'&&o>0)el.kurs.value=fk(+(pm(el['in'].value,B.cur)/10**CD(B.cur)/o).toPrecision(8)||'')}
function txForm(type){const e=edit&&edit.type===type?edit:{},accs=S.accounts.filter(a=>!a.archived||a.id===e.accId||a.id===e.toAccId),cats=S.categories.filter(c=>c.type===type);
 return `<form data-f="${type}" class="card"><h3>${e.id?'Edit ':'Tambah '}${TL[type]}</h3>
<label>Tanggal<input type="date" name="date" required value="${e.date||today()}"></label>
<label>Periode<select name="period">${opt(S.periods,e.periodId||S.cfg.active)}</select></label>
<label>${type==='in'?'Akun tujuan':type==='out'?'Akun sumber':'Akun asal'}<select name="acc">${aopt(accs,e.accId)}</select></label>
${type==='tf'?`<label>Akun tujuan<select name="to">${aopt(accs,e.toAccId||accs[1]?.id)}</select></label>`:`<label>Kategori<div class="row"><select name="cat">${cats.map(c=>`<option${c.name===e.cat?' selected':''}>${E(c.name)}</option>`).join('')}</select><button type="button" class="s" data-a="addcat" data-t="${type}">+</button></div></label>`}
<label>${type==='tf'?'Nominal keluar':'Nominal'} (<span class="cl"></span>)<input name="amt" inputmode="decimal" required placeholder="0" value="${e.amount?hv(e.amount,acur(e.accId)):''}"></label>
${type==='tf'?`<div class="xc" style="display:none"><label><span class="il"></span><input name="in" inputmode="decimal" value="${e.toAmount?hv(e.toAmount,acur(e.toAccId)):''}"></label><label><span class="kl"></span><input name="kurs" inputmode="decimal" value="${e.rate?fk(e.rate):''}"></label></div>${e.id?'':'<label>Biaya admin (opsional, dicatat sebagai pengeluaran dari akun asal)<input name="fee" inputmode="decimal" placeholder="0"></label>'}`:''}
<label>Catatan (opsional)<input name="note" value="${E(e.note)}"></label>
<div class="row"><button class="p">Simpan</button>${e.id?'<button type="button" data-a="cancel">Batal</button>':''}</div></form>`}
function filt(type){const f=F[type],fp=f.p===undefined?S.cfg.active:f.p,q=(f.q||'').toLowerCase();
 return S.tx.filter(t=>t.type===type&&(!fp||t.periodId===fp)&&(!f.a||t.accId===f.a||t.toAccId===f.a)&&(!f.c||t.cat===f.c)&&(!f.d1||t.date>=f.d1)&&(!f.d2||t.date<=f.d2)&&(!q||((t.note||'')+' '+(t.cat||'')).toLowerCase().includes(q))).sort(byDate)}
function row(t){const c=t.type==='in'?'g':t.type==='out'?'r':'',sg=t.type==='in'?'+':t.type==='out'?'-':'',sc=acur(t.accId),
 amt=t.type==='tf'?fm(t.amount,sc)+(t.toAmount?' → '+fm(t.toAmount,acur(t.toAccId)):''):sg+fm(t.amount,sc);
 return `<div class="tx"><div><b>${E(t.type==='tf'?'⇄ '+an(t.accId)+' → '+an(t.toAccId):t.cat)}</b><small>${fd(t.date)} · ${t.type==='tf'?'Transfer':an(t.accId)} · ${E(pn(t.periodId))}${t.note?'<br>'+E(t.note):''}${t.rate?'<br>Kurs '+fk(t.rate):''}</small></div><div class="${c}">${amt}<br><button class="s" data-a="ed" data-id="${t.id}">✎</button><button class="s" data-a="del" data-id="${t.id}">🗑</button></div></div>`}
const listHtml=type=>{const l=filt(type);return `<small>${l.length} transaksi · total ${tot(l)}</small>`+(l.map(row).join('')||'<p class="m">Belum ada data.</p>')};
function filterBar(type){const f=F[type],fp=f.p===undefined?S.cfg.active:f.p;
 return `<div class="card"><h3>Riwayat ${TL[type]}</h3><input data-k="q" placeholder="Cari catatan/kategori..." value="${E(f.q)}"><div class="row"><select data-k="p"><option value="">Semua periode</option>${opt(S.periods,fp)}</select><select data-k="a"><option value="">Semua akun</option>${aopt(S.accounts,f.a)}</select></div>
${type==='tf'?'':`<select data-k="c"><option value="">Semua kategori</option>${S.categories.filter(c=>c.type===type).map(c=>`<option${c.name===f.c?' selected':''}>${E(c.name)}</option>`).join('')}</select>`}
<div class="row"><input type="date" data-k="d1" value="${f.d1||''}"><input type="date" data-k="d2" value="${f.d2||''}"></div><div id="lst">${listHtml(type)}</div></div>`}

function pgRk(){if(rkP===undefined)rkP=S.cfg.active;
 const curs=[...new Set(S.accounts.map(a=>a.cur))],R=S.cfg.rates||{},ok=curs.every(c=>c==='IDR'||R[c]>0);
 if(rkC===undefined||(rkC==='*'&&!ok)||(rkC!=='*'&&!curs.includes(rkC)))rkC=curs.includes('IDR')?'IDR':curs[0];
 const all=rkC==='*',C=all?'IDR':rkC,v=t=>all?conv(t.amount,acur(t.accId)):t.amount,
 fx=(pid,nd)=>S.tx.filter(t=>(!pid||t.periodId===pid)&&(!rkA||t.accId===rkA||t.toAccId===rkA)&&(nd||((!rkD1||t.date>=rkD1)&&(!rkD2||t.date<=rkD2)))&&(all||acur(t.accId)===C)),
 sm=(l,ty)=>l.filter(t=>t.type===ty).reduce((s,t)=>s+v(t),0),cs=l=>{const o={};l.filter(t=>t.type==='out').forEach(t=>add(o,t.cat,v(t)));return o},
 pa=fx(rkP),inc=sm(pa,'in'),out=sm(pa,'out'),tfs=pa.filter(t=>t.type==='tf'),cat=cs(pa),pi=S.periods.findIndex(p=>p.id===rkP),pv=pi>0?S.periods[pi-1]:null,pc=pv?cs(fx(pv.id,1)):null,
 rk=Object.entries(cat).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),per=S.periods.find(p=>p.id===rkP),
 op=per?Object.entries(per.opening||{}).filter(([k])=>(!rkA||k===rkA)&&(all||acur(k)===C)).reduce((s,[k,x])=>s+(all?conv(x,acur(k)):x),0):0,
 neg=S.accounts.filter(a=>bal(a.id)<0),sb={};S.accounts.forEach(a=>add(sb,a.cur,bal(a.id)));
 const pp=(x,t)=>(Math.round(x*1000/t)/10).toLocaleString('id-ID')+'%',col=i=>PAL[i%PAL.length],mx=Math.max(inc,out,1);let off=0;
 const arcs=rk.map(([k,x],i)=>{const p=x*100/out,r=`<circle data-a="cat" data-id="${E(k)}" cx="21" cy="21" r="15.9155" fill="none" stroke="${col(i)}" stroke-width="${rkSel===k?7:5}" stroke-dasharray="${p} ${100-p}" stroke-dashoffset="${25-off}"/>`;off+=p;return r}).join('');
 return `${neg.length?`<div class="warn">⚠ Saldo negatif: ${neg.map(a=>E(a.name)+' ('+fm(bal(a.id),a.cur)+')').join(', ')}</div>`:''}
<div class="card"><small>Total saldo seluruh akun</small>${curs.length>1?Object.entries(sb).map(([c,x])=>`<h3 class="${x<0?'r':''}">${fm(x,c)}</h3>`).join('')+(ok?`<small>Estimasi total ≈ <b>${fm(Object.entries(sb).reduce((s,[c,x])=>s+conv(x,c),0),'IDR')}</b> (pakai kurs manual, bukan kurs real-time)</small>`:'<small>Total dalam IDR belum dihitung karena kurs belum diisi.</small>'):`<h2>${fo(sb)}</h2>`}
${S.accounts.map(a=>`<div class="tx"><span>${ic(a)} ${E(a.name)}${a.archived?' (arsip)':''}</span><b class="${bal(a.id)<0?'r':''}">${fm(bal(a.id),a.cur)}</b></div>`).join('')}
${curs.length>1?`<form data-f="rates"><small>Kurs manual — estimasi, BUKAN kurs real-time (IDR per 1 unit):</small>${curs.filter(c=>c!=='IDR').map(c=>`<label>1 ${c} = IDR<input name="r_${c}" inputmode="decimal" value="${R[c]?fk(R[c]):''}"></label>`).join('')}<button class="p">Simpan kurs</button></form>`:''}</div>
<div class="card"><h3>Statistik</h3><div class="row"><select data-k="rp"><option value="">Semua periode</option>${opt(S.periods,rkP)}</select><select data-k="ra"><option value="">Semua akun</option>${aopt(S.accounts,rkA)}</select></div>
<select data-k="rc">${curs.map(c=>`<option value="${c}"${c===rkC?' selected':''}>${c}</option>`).join('')}${ok&&curs.length>1?`<option value="*"${all?' selected':''}>Semua mata uang (estimasi IDR)</option>`:''}</select>
<div class="row"><input type="date" data-k="rd1" value="${rkD1}"><input type="date" data-k="rd2" value="${rkD2}"></div>
<div class="tx"><span>Saldo awal periode (catatan)</span><b>${per?fm(op,C):'-'}</b></div>
<div class="tx"><span>Total pemasukan</span><b class="g">${fm(inc,C)}</b></div><div class="bar"><i style="width:${inc*100/mx}%;background:#15803d"></i></div>
<div class="tx"><span>Total pengeluaran</span><b class="r">${fm(out,C)}</b></div><div class="bar"><i style="width:${out*100/mx}%;background:#b91c1c"></i></div>
<div class="tx"><span>Selisih (masuk − keluar)</span><b class="${inc-out<0?'r':'g'}">${fm(inc-out,C)}</b></div>
<div class="tx"><span>Pengeluaran terhadap pemasukan</span><b>${inc>0?pp(out,inc):'-'}</b></div>
<div class="tx"><span>Kategori pengeluaran tertinggi</span><b>${rk.length?E(rk.filter(x=>x[1]===rk[0][1]).map(x=>x[0]).join(', ')):'-'}</b></div>
<div class="tx"><span>Transfer (${tfs.length}x, bukan pemasukan/pengeluaran)</span><b>${fm(sm(tfs,'tf'),C)}</b></div></div>
<div class="card"><h3>Pengeluaran per kategori</h3>${rk.length?`<svg viewBox="0 0 42 42" style="width:100%;max-width:250px;display:block;margin:auto"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e5e7eb" stroke-width="5"/>${arcs}<text x="21" y="20" text-anchor="middle" font-size="2.6" fill="#64748b">Total keluar</text><text x="21" y="24.2" text-anchor="middle" font-size="3" font-weight="700">${fm(out,C)}</text></svg><div class="lgs">${rk.map(([k,x],i)=>`<button class="lg" data-a="cat" data-id="${E(k)}"><i style="background:${col(i)}"></i>${E(k)} ${pp(x,out)}</button>`).join('')}</div>`:'<p class="m">Belum ada data pengeluaran pada periode ini.</p>'}</div>
<div class="card"><h3>Peringkat kategori</h3>${rk.map(([k,x],i)=>{const r=rk.findIndex(y=>y[1]===x)+1,dl=pc?x-(pc[k]||0):null;return `<div class="tx"><span>${r}. ${E(k)}${r===1?' <span class="bd">Terbesar</span>':''}</span><b>${fm(x,C)} <small>${pp(x,out)}</small></b></div><div class="bar"><i style="width:${x*100/out}%;background:${col(i)}"></i></div>${dl===null?'':`<small class="${dl>0?'r':'g'}">${dl>0?'▲ naik ':dl<0?'▼ turun ':'= sama '}${dl?fm(Math.abs(dl),C):''} dibanding ${E(pv.name)}</small>`}`}).join('')||'<p class="m">Belum ada data pengeluaran pada periode ini.</p>'}</div>
${rkSel&&cat[rkSel]?`<div class="card"><h3>${E(rkSel)}</h3><small>${fm(cat[rkSel],C)} · ${pp(cat[rkSel],out)} dari pengeluaran</small>${pa.filter(t=>t.type==='out'&&t.cat===rkSel).sort(byDate).map(row).join('')}<button data-a="cat" data-id="${E(rkSel)}">Tutup</button></div>`:''}
<div class="card"><h3>Perbandingan periode</h3><table><tr><th>Periode</th><th>Masuk</th><th>Keluar</th><th>Selisih</th></tr>${S.periods.map(p=>{const l=fx(p.id,1),i=sm(l,'in'),o=sm(l,'out');return `<tr><td>${E(p.name)}</td><td class="g">${fm(i,C)}</td><td class="r">${fm(o,C)}</td><td>${fm(i-o,C)}</td></tr>`}).join('')}</table></div>
<div class="card"><h3>Transaksi terbaru</h3>${pa.slice().sort(byDate).slice(0,10).map(row).join('')||'<p class="m">Belum ada transaksi.</p>'}</div>
<div class="card"><h3>Backup</h3><button data-a="xjson">Ekspor backup JSON</button> <button data-a="xxlsx">Ekspor Excel (.xlsx)</button><label>Impor backup JSON<input type="file" id="imf" accept=".json,application/json"></label>
${pend?`<div class="warn">File valid: ${pend.accounts.length} akun, ${pend.periods.length} periode, ${pend.tx.length} transaksi.<div class="row"><button data-a="merge">Gabungkan (data baru saja)</button><button data-a="replace">Ganti semua data</button></div><button data-a="cimp">Batal</button></div>`:''}
<small>Cache offline: ${navigator.serviceWorker?.controller?'aktif':'belum aktif (buka ulang halaman saat online)'} · Library Excel: ${window.XLSX?'siap':'belum termuat (perlu internet sekali)'}</small></div>`}

function render(){const su=!S.cfg.setup;document.body.classList.toggle('su',su);
 $('#gp').innerHTML=opt(S.periods,S.cfg.active);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===tab));
 $('#v').innerHTML=su?pgSetup():tab==='in'?periodPanel()+txForm('in')+filterBar('in'):tab==='out'?txForm('out')+filterBar('out'):tab==='tf'?accPanel()+txForm('tf')+filterBar('tf'):pgRk();
 document.querySelectorAll('#v form').forEach(f=>['in','out','tf'].includes(f.dataset.f)&&syncF(f))}
async function submitTx(type,f){const g=n=>f.elements[n]?.value||'',A=S.accounts.find(x=>x.id===g('acc')),c=A?.cur||'IDR',amt=pm(g('amt'),c);
 if(!A)return toast('Pilih akun terlebih dahulu',1);
 if(amt<=0)return toast('Nominal harus lebih dari nol',1);
 const t={id:edit?.type===type?edit.id:uid(),type,date:g('date'),periodId:g('period'),accId:A.id,amount:amt,note:g('note').trim()};
 if(!t.date||!t.periodId)return toast('Data belum lengkap (cek tanggal/periode)',1);
 let fee=0;
 if(type==='tf'){const B=S.accounts.find(x=>x.id===g('to'));if(!B||B.id===A.id)return toast('Akun asal dan tujuan tidak boleh sama',1);t.toAccId=B.id;
  if(B.cur!==A.cur){const ti=pm(g('in'),B.cur);if(ti<=0)return toast('Isi nominal masuk (atau kurs) untuk transfer beda mata uang',1);t.toAmount=ti;t.rate=+((ti/10**CD(B.cur))/(amt/10**CD(A.cur))).toPrecision(8)}
  fee=pm(g('fee'),c)}
 else t.cat=g('cat')||'Lainnya';
 const p=S.periods.find(x=>x.id===t.periodId);
 if(p&&(t.date<p.start||t.date>p.end)&&!confirm(`Tanggal ${fd(t.date)} di luar rentang periode "${p.name}". Tetap lanjutkan?`))return;
 if(type!=='in'){const b=bal(t.accId,t.id)-amt-fee;if(b<0&&!confirm(`Saldo ${A.name} akan menjadi negatif (${fm(b,c)}). Tetap catat?`))return}
 const w=[['put','tx',t]];
 if(fee>0)w.push(['put','tx',{id:uid(),type:'out',date:t.date,periodId:t.periodId,accId:A.id,amount:fee,cat:'Lainnya',note:'Biaya admin transfer'+(t.note?' · '+t.note:''),feeOf:t.id}]);
 edit=null;await save(w,TL[type]+' tersimpan'+(fee>0?' (+ biaya admin)':''))}
async function submitPer(f){const name=f.elements.name.value.trim(),start=f.elements.start.value,end=f.elements.end.value;
 if(!name||!start||end<start)return toast('Nama wajib diisi dan tanggal selesai tidak boleh sebelum tanggal mulai',1);
 const o={};S.accounts.forEach(a=>{const v=pm(f.elements['o_'+a.id].value,a.cur);if(v)o[a.id]=v});
 const id=edit?.kind==='per'?edit.id:uid();edit=null;await save([['put','periods',{id,name,start,end,opening:o}]],'Periode tersimpan')}

async function submitSetup(f){const total=num(f.elements.total.value),o={},accs=[];let sum=0;
 DEF.forEach((n,i)=>{const v=num(f.elements['a'+i].value),id=uid();sum+=v;accs.push({id,name:n,initial:v,type:DT[i],cur:'IDR'});if(v)o[id]=v});
 if(sum!==total)return toast(`Total alokasi (${rp(sum)}) harus sama dengan total uang awal (${rp(total)})`,1);
 const name=f.elements.name.value.trim(),start=f.elements.start.value,end=f.elements.end.value;
 if(!name||end<start)return toast('Periksa nama dan tanggal periode',1);
 const pid=uid();
 await save([...accs.map(a=>['put','accounts',a]),...CO.map(n=>['put','categories',{id:uid(),name:n,type:'out'}]),...CI.map(n=>['put','categories',{id:uid(),name:n,type:'in'}]),['put','periods',{id:pid,name,start,end,opening:o}],['put','meta',{id:'cfg',setup:true,active:pid}]],'Siap digunakan!')}

function validate(d){const A=Array.isArray,s=x=>typeof x==='string'&&x,bad=m=>{throw Error(m)};
 if(!d||d.app!=='dompetku'||![d.accounts,d.periods,d.categories,d.tx].every(A))bad('Bukan file backup DompetKu');
 if(!d.accounts.length||!d.periods.length)bad('Backup tidak memiliki akun/periode');
 const ai=new Set,pi=new Set,ti=new Set;
 d.accounts.forEach(a=>{if(!s(a.id)||!s(a.name)||!Number.isInteger(a.initial))bad('Data akun tidak valid');ai.add(a.id)});
 d.periods.forEach(p=>{if(!s(p.id)||!s(p.name)||!s(p.start)||!s(p.end))bad('Data periode tidak valid');pi.add(p.id)});
 d.categories.forEach(c=>{if(!s(c.id)||!s(c.name)||!['in','out'].includes(c.type))bad('Data kategori tidak valid')});
 d.tx.forEach(t=>{if(!t||!s(t.id)||ti.has(t.id)||!['in','out','tf'].includes(t.type)||!s(t.date)||!Number.isInteger(t.amount)||t.amount<=0||!ai.has(t.accId)||!pi.has(t.periodId)||(t.type==='tf'&&(!ai.has(t.toAccId)||t.toAccId===t.accId))||(t.toAmount!==undefined&&(!Number.isInteger(t.toAmount)||t.toAmount<=0)))bad('Transaksi tidak valid atau ganda: '+(t&&t.id));ti.add(t.id)});
 return d}

function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5e3)}
const ST=['accounts','periods','categories','tx'];

document.addEventListener('click',async e=>{
 const n=e.target.closest('[data-nav]');if(n){tab=n.dataset.nav;edit=null;render();return scrollTo(0,0)}
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id,tx=S.tx.find(x=>x.id===id),ac=S.accounts.find(x=>x.id===id),p=S.periods.find(x=>x.id===id);
 if(a==='cancel'){edit=null;render()}
 else if(a==='ed'&&tx){edit=tx;tab=tx.type;render();scrollTo(0,0)}
 else if(a==='del'&&tx){if(confirm(`Hapus ${TL[tx.type].toLowerCase()} ${rp(tx.amount)} (${fd(tx.date)})? Saldo akan dihitung ulang.`))save([['delete','tx',id]],'Transaksi dihapus')}
 else if(a==='pick'){rkP=undefined;S.cfg.active=id;save([['put','meta',S.cfg]],'Periode dipilih')}
 else if(a==='eper'&&p){edit={kind:'per',...p};tab='in';render();scrollTo(0,0)}
 else if(a==='dper'&&p){if(S.tx.some(t=>t.periodId===id))return toast('Periode masih punya transaksi. Hapus/pindahkan transaksinya dulu.',1);
  if(S.periods.length<2)return toast('Minimal harus ada satu periode',1);if(confirm(`Hapus periode "${p.name}"?`))save([['delete','periods',id]],'Periode dihapus')}
 else if(a==='nacc'){edit={kind:'acc'};render();$('form[data-f=acc]')?.scrollIntoView()}
 else if(a==='ren'&&ac){edit={kind:'acc',...ac};render();$('form[data-f=acc]')?.scrollIntoView()}
 else if(a==='dacc'&&ac){if(ac.archived)return save([['put','accounts',{...ac,archived:false}]],'Akun diaktifkan');
  if(S.tx.some(t=>t.accId===id||t.toAccId===id)||ac.initial!==0){if(confirm(`Akun "${ac.name}" punya saldo/transaksi, jadi hanya akan DIARSIPKAN (data tetap aman, tidak muncul di form). Lanjutkan?`))save([['put','accounts',{...ac,archived:true}]],'Akun diarsipkan')}
  else if(confirm(`Hapus akun "${ac.name}"?`))save([['delete','accounts',id]],'Akun dihapus')}
 else if(a==='addcat'){const t=b.dataset.t,nm=(prompt('Nama kategori baru:')||'').trim();if(!nm)return;if(S.categories.some(c=>c.type===t&&c.name.toLowerCase()===nm.toLowerCase()))return toast('Kategori sudah ada',1);save([['put','categories',{id:uid(),name:nm,type:t}]],'Kategori ditambahkan')}
 else if(a==='xjson'){dl(`dompetku-backup-${today()}.json`,new Blob([JSON.stringify({app:'dompetku',version:1,exported:new Date().toISOString(),accounts:S.accounts,periods:S.periods,categories:S.categories,tx:S.tx,meta:S.cfg},null,1)],{type:'application/json'}));toast('Backup JSON diunduh — simpan file ini di tempat aman')}
 else if(a==='xxlsx'){if(!window.XLSX)return toast('Library Excel belum termuat. Buka sekali saat online, lalu coba lagi. Backup JSON tetap bisa dipakai.',1);
  try{const J={in:'Pemasukan',out:'Pengeluaran',tf:'Transfer'},wb=XLSX.utils.book_new(),mj=(n,c)=>n/10**CD(c);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(S.tx.slice().sort(byDate).map(t=>{const c=acur(t.accId);return{Tanggal:t.date,Jenis:J[t.type],Periode:pn(t.periodId),Akun:an(t.accId),'Mata Uang':c,'Akun Tujuan':t.toAccId?an(t.toAccId):'',Kategori:t.cat||'',Nominal:mj(t.amount,c),'Nominal Masuk':t.toAmount?mj(t.toAmount,acur(t.toAccId)):'',Kurs:t.rate||'',Catatan:t.note||''}})),'Transaksi');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(S.accounts.map(x=>({Akun:x.name,'Mata Uang':x.cur,Saldo:mj(bal(x.id),x.cur)}))),'Saldo');XLSX.writeFile(wb,`dompetku-transaksi-${today()}.xlsx`)}catch(x){toast('Gagal ekspor Excel: '+x.message,1)}}
 else if(a==='cimp'){pend=null;render()}
 else if(a==='merge'&&pend){const ops=[];ST.forEach(s=>{const have=new Set(S[s].map(x=>x.id));pend[s].forEach(r=>{if(!have.has(r.id))ops.push(['put',s,r])})});pend=null;
  await save(ops.length?ops:[['put','meta',S.cfg]],ops.length?`${ops.length} data baru digabungkan`:'Tidak ada data baru (semua sudah ada)')}
 else if(a==='replace'&&pend){if(!confirm('Semua data saat ini akan DIHAPUS dan diganti isi file backup. Lanjutkan?'))return;
  const ops=[...ST,'meta'].map(s=>['clear',s]);ST.forEach(s=>pend[s].forEach(r=>ops.push(['put',s,r])));ops.push(['put','meta',{id:'cfg',setup:true,active:pend.meta?.active,rates:pend.meta?.rates||{}}]);pend=null;rkP=undefined;await save(ops,'Data berhasil dipulihkan')}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,k=f.dataset.f;k==='setup'?submitSetup(f):k==='per'?submitPer(f):k==='acc'?submitAcc(f):k==='rates'?submitRates(f):submitTx(k,f)});
document.addEventListener('input',e=>{const t=e.target,k=t.dataset.k;
 if(t.id==='gp'){rkP=undefined;S.cfg.active=t.value;return save([['put','meta',S.cfg]],'Periode dipilih')}
 if(t.form?.dataset.f==='setup'){const f=t.form,tot=num(f.elements.total.value),sum=DEF.reduce((s,_,i)=>s+num(f.elements['a'+i].value),0);$('#sd').textContent=`Teralokasi ${rp(sum)} dari ${rp(tot)}${sum===tot?' ✓':' — selisih '+rp(tot-sum)}`;return}
 const fk_=t.form?.dataset.f;if(t.name==='svc'&&fk_==='acc'){const nm=t.value.split('|')[1];if(nm)t.form.elements.name.value=nm;return}
 if(['in','out','tf'].includes(fk_))return syncF(t.form,e);
 if(k==='rp'){rkP=t.value;rkSel=null;render()}else if(k==='ra'){rkA=t.value;render()}else if(k==='rc'){rkC=t.value;render()}else if(k==='rd1'){rkD1=t.value;render()}else if(k==='rd2'){rkD2=t.value;render()}else if(k){F[tab][k]=t.value;$('#lst').innerHTML=listHtml(tab)}});
document.addEventListener('change',async e=>{if(e.target.id!=='imf'||!e.target.files[0])return;
 try{pend=validate(JSON.parse(await e.target.files[0].text()))}catch(x){pend=null;toast('File ditolak, data tidak diubah: '+x.message,1)}render()});
(async()=>{try{await DB.open();await load();render();navigator.storage?.persist?.();if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{})}
 catch(e){$('#v').innerHTML='<div class="card r">Penyimpanan lokal (IndexedDB) tidak tersedia: '+E(e.message||e)+'. Jangan pakai mode penyamaran/incognito.</div>'}})();
