const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('file://'+process.argv[2]+'?render=1');await p.waitForTimeout(300);
const T=await p.evaluate(()=>TOTAL);console.log('TOTAL',T,errs);
for(const t of process.argv.slice(3).map(Number)){await p.evaluate(t=>renderAt(t),t);await p.screenshot({path:`shots/t${t}.png`});}
await b.close();})();
