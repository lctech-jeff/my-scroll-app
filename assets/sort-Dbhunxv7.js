(function(){"use strict";const a=r=>{const e=JSON.parse(r.data),s=e.payload;Array.isArray(s)?(performance.mark("worker 排序-started"),s.sort((o,n)=>o.updatedAt>n.updatedAt?-1:1),self.postMessage({payload:s,flag:e.flag}),performance.mark("worker 排序-ended"),performance.measure("worker 排序","worker 排序-started","worker 排序-ended")):self.postMessage(r.data)};self.addEventListener("message",a);const t=r=>{r.getEntries().forEach(e=>{e.entryType==="measure"&&self.postMessage({log:`${e.name} 花費時間: ${e.duration} ms`})})};new PerformanceObserver(t).observe({entryTypes:["measure"]})})();
