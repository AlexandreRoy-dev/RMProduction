import cairosvg, io, re, os
from PIL import Image
B='/workspace/roymarketing-site-v2/assets/brand/'
F=B+'favicon/'; os.makedirs(F,exist_ok=True)
src=open(B+'logo/mark/mark-dark-on-light.svg').read()
d=re.search(r'<path fill="#111111" d="([^"]+)"',src).group(1)
c=re.search(r'<circle[^>]+>',src).group(0)
cx=float(re.search(r'cx="([^"]+)"',c).group(1)); cy=float(re.search(r'cy="([^"]+)"',c).group(1)); r=float(re.search(r' r="([^"]+)"',c).group(1))
W,H=842.88,700.5  # mark bbox
W=cx+r; H=cy+r
S=max(W,H); pad=S*0.04; side=S+2*pad
ox=(side-W)/2; oy=(side-H)/2
def ff(v): return ('%.2f'%v).rstrip('0').rstrip('.')
fav=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ff(side)} {ff(side)}">
<style>.r{{fill:#111111}}.d{{fill:#0F4B3A}}@media (prefers-color-scheme:dark){{.r{{fill:#FFFFFF}}.d{{fill:#3DA37F}}}}</style>
<g transform="translate({ff(ox)} {ff(oy)})"><path class="r" d="{d}"/><circle class="d" cx="{ff(cx)}" cy="{ff(cy)}" r="{ff(r)}"/></g>
</svg>
'''
open(F+'favicon.svg','w').write(fav)
# transparent small sizes (light-mode colours, like the current favicon)
plain=fav.replace(re.search(r'<style>.*</style>\n',fav).group(0),'').replace('class="r"','fill="#111111"').replace('class="d"','fill="#0F4B3A"')
def rend(svg,size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(),output_width=size,output_height=size))).convert('RGBA')
# opaque tiles: apple-touch 180 and 512 (mark 58% of tile width, off-white bg, maskable safe)
def tile(size,bg='#F9F9F7',frac=0.58):
    mw=size*frac; sc=mw/W; mh=H*sc
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}"><rect width="{size}" height="{size}" fill="{bg}"/>
<g transform="translate({ff((size-mw)/2)} {ff((size-mh)/2)}) scale({sc:.6f})"><path fill="#111111" d="{d}"/><circle fill="#0F4B3A" cx="{ff(cx)}" cy="{ff(cy)}" r="{ff(r)}"/></g></svg>'''
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode()))).convert('RGB')
# small sizes: render at 8x and downsample for better coverage
for s in (16,32,48):
    im=tile(s*8,frac=0.84).resize((s,s),Image.LANCZOS)
    im.save(F+f'favicon-{s}.png' if s!=48 else F+'_tmp48.png',optimize=True)
ims=[Image.open(F+'favicon-16.png'),Image.open(F+'favicon-32.png'),Image.open(F+'_tmp48.png')]
ims[2].save(F+'favicon.ico',sizes=[(16,16),(32,32),(48,48)],append_images=ims[:2])
os.remove(F+'_tmp48.png')
tile(180).save(F+'apple-touch-icon-180.png',optimize=True)
tile(512).save(F+'icon-512.png',optimize=True)
tile(192).save(F+'icon-192.png',optimize=True)
# transparent 512 too
rend(plain,512).save(F+'favicon-512-transparent.png',optimize=True)
print(os.listdir(F))
