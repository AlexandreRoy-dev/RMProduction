import os, glob, io, cairosvg
from PIL import Image
OUT='/workspace/roymarketing-site-v2/assets/brand/logo'
for svg in sorted(glob.glob(OUT+'/*/*.svg')):
    sub=os.path.basename(os.path.dirname(svg)); base=os.path.basename(svg)[:-4]
    pd=os.path.join(OUT,'png',sub); os.makedirs(pd,exist_ok=True)
    src=open(svg).read()
    import re
    vb=[float(v) for v in re.search(r'viewBox="([^"]+)"',src).group(1).split()]
    for long,tag in [(512,'512'),(2048,'2048')]:
        if vb[2]>=vb[3]: kw={'output_width':long}
        else: kw={'output_height':long}
        png=cairosvg.svg2png(bytestring=src.encode(),**kw)
        im=Image.open(io.BytesIO(png)).convert('RGBA')
        im.save(os.path.join(pd,f'{base}-{tag}.png'),optimize=True)
        print(base,tag,im.size)
