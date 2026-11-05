const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.argv[2]+'?render=1');await p.waitForTimeout(500);
const ts=await p.evaluate(()=>ST.map((s,i)=>s+FL[i].dur+1.5));
for(let i=0;i<ts.length;i++){await p.evaluate(t=>renderAt(t),ts[i]);await p.screenshot({path:`shots/c${i}.png`});}
await b.close();})();
