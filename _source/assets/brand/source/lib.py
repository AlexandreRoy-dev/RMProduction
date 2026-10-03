import io, copy, numpy as np, cairosvg
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
VF='/usr/share/fonts/truetype/sand-box/google/Montserrat/Montserrat-VariableFont_wght.ttf'
_base=TTFont(VF); _cache={}
def font(w):
    if w not in _cache:
        from fontTools.ttLib.removeOverlaps import removeOverlaps
        ff=instantiateVariableFont(copy.deepcopy(_base),{'wght':w}); removeOverlaps(ff); _cache[w]=ff
    return _cache[w]
def glyph(w,ch='R'):
    f=font(w); gs=f.getGlyphSet(); name=f.getBestCmap()[ord(ch)]; g=gs[name]
    bp=BoundsPen(gs); g.draw(bp); sp=SVGPathPen(gs, ntos=lambda v: ('%.2f'%v).rstrip('0').rstrip('.')); g.draw(sp)
    return sp.getCommands(), bp.bounds, g.width
def render(svg, w=None):
    kw={} if w is None else {'output_width':w}
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(),**kw))).convert('RGBA')
REF='/workspace/roymarketing-site-v2/assets/from-ads/roy-marketing-logo.png'
def refmasks():
    a=np.array(Image.open(REF).convert('RGBA')).astype(float)
    al=a[...,3]/255; g=(a[...,1]>a[...,0]+20)
    return al*(~g), al*g
