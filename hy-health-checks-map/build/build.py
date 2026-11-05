import base64,json,os,glob,sys
B=os.path.dirname(os.path.abspath(__file__)); S=os.path.dirname(B)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{B}/template.html').read()
f=f'{B}/node_modules/@fontsource/arimo/files/arimo-latin-%s-normal.woff2'
h=h.replace('__ARIMO400__',b64(f%400)).replace('__ARIMO700__',b64(f%700))
h=h.replace('__LOGO__',b64(f'{B}/hy-logotype-yellow.png'))
ph={}
for p in glob.glob(f'{S}/photos/*'):
  ext=p.rsplit('.',1)[-1].lower(); mt={'jpg':'jpeg','jpeg':'jpeg','png':'png','webp':'webp'}.get(ext)
  if mt: ph[os.path.basename(p).rsplit('.',1)[0]]=f'data:image/{mt};base64,'+b64(p)
h=h.replace('__PHOTOS__',json.dumps(ph)).replace('__DATA__',open(f'{S}/data.js').read())
open(f'{S}/hy-health-checks-map.html','w').write(h); print('photos:',list(ph), 'size',len(h)//1024,'KB')
