'use strict';
const DB={
 open(){return new Promise((ok,no)=>{const r=indexedDB.open('dompetku',1);r.onupgradeneeded=()=>{['accounts','periods','categories','tx','meta'].forEach(s=>{if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s,{keyPath:'id'})})};r.onsuccess=()=>{this.d=r.result;ok()};r.onerror=()=>no(r.error)})},
 all(s){return new Promise((ok,no)=>{const q=this.d.transaction(s).objectStore(s).getAll();q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})},
 // ops: [['put'|'delete'|'clear', store, value]] — semuanya dalam SATU transaksi (semua tersimpan atau tidak sama sekali)
 write(ops){return new Promise((ok,no)=>{const t=this.d.transaction([...new Set(ops.map(o=>o[1]))],'readwrite');ops.forEach(([a,s,v])=>t.objectStore(s)[a](v));t.oncomplete=ok;t.onerror=t.onabort=()=>no(t.error||Error('Transaksi dibatalkan'))})}
};
