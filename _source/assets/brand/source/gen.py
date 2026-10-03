import os, json, numpy as np, uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from lib import *
OUT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
W=700  # Montserrat Bold
INK='#111111'; GREEN='#0F4B3A'; WHITE='#FFFFFF'
DOT_DARK=os.environ.get('DOT_DARK','#3DA37F')
ntos=lambda v: ('%.2f'%v).rstrip('0').rstrip('.') if abs(v-round(v))>1e-6 else str(int(round(v)))

f=font(W); gs=f.getGlyphSet(); cmap=f.getBestCmap()
import io
buf=io.BytesIO(); f.save(buf); FONTBYTES=buf.getvalue()

def glyph_path(name, dx, dy, s=1.0):
    """font units -> svg coords: x'=dx+s*x, y'=dy-s*y"""
    import pathops
    pp=pathops.Path(); tp=TransformPen(pp.getPen(glyphSet=gs),(s,0,0,-s,dx,dy)); gs[name].draw(tp)
    pp.simplify(fix_winding=True, clockwise=False)
    sp=SVGPathPen(gs, ntos=ntos); pp.draw(sp)
    bp=BoundsPen(gs); tb=TransformPen(bp,(s,0,0,-s,dx,dy)); gs[name].draw(tb)
    return sp.getCommands(), bp.bounds

def circle_path(cx,cy,r):
    # true circle as path (two arcs) for icon pipelines that prefer paths
    return f'M{ntos(cx-r)} {ntos(cy)}a{ntos(r)} {ntos(r)} 0 1 0 {ntos(2*r)} 0a{ntos(r)} {ntos(r)} 0 1 0 {ntos(-2*r)} 0Z'

# ---- R. mark geometry (cap height 700 units) ----
CAP=700
Rb=None
GEOM=os.environ.get('GEOM','fit')
def mark_parts(ox=0, oy=0, scale=1.0):
    """returns (R path d, circle (cx,cy,r), bbox) with mark top-left at (ox,oy), cap height = 700*scale"""
    if GEOM=='fit':
        import rfit_path
        pp=rfit_path.r_path(ox,oy,scale)
        sp=SVGPathPen(None, ntos=ntos); pp.draw(sp); d=sp.getCommands()
        rw=rfit_path.RIGHT*scale
    else:
        name=cmap[ord('R')]
        bp=BoundsPen(gs); gs[name].draw(bp); x0,y0,x1,y1=bp.bounds
        d,b=glyph_path(name, ox - x0*scale, oy + CAP*scale, scale)
        rw=(x1-x0)*scale
    r=101*scale; gap=36*scale; over=0.5*scale
    cx=ox+rw+gap+r; cy=oy+CAP*scale-r+over
    return d,(cx,cy,r),(ox, oy, cx+r, oy+CAP*scale+over)

def shape_text(text, size, tracking_em=0.1):
    face=hb.Face(FONTBYTES); hf=hb.Font(face)
    b=hb.Buffer(); b.add_str(text); b.guess_segment_properties()
    hb.shape(hf,b,{"kern":True,"liga":False})
    s=size/1000.0; x=0; out=[]
    infos=b.glyph_infos; poss=b.glyph_positions
    for i,(gi,gp) in enumerate(zip(infos,poss)):
        name=f.getGlyphOrder()[gi.codepoint]
        ch=text[gi.cluster]
        out.append((name, x+gp.x_offset*s, ch))
        x+=gp.x_advance*s
        if i<len(infos)-1: x+=tracking_em*size
    return out

def wordmark_parts(ox, oy, cap_px, text='ROY MARKETING.'):
    """top-left at ox,oy (cap top), returns list of (d, is_period), bounds"""
    size=cap_px/0.7
    items=shape_text(text,size)
    parts=[]; xs=[]; 
    for name,x,ch in items:
        if ch==' ': continue
        d,b=glyph_path(name, ox+x, oy+cap_px, size/1000)
        if d: parts.append((d, ch=='.')); xs.append(b)
    minx=min(b[0] for b in xs); maxx=max(b[2] for b in xs)
    # shift so left ink edge sits exactly at ox
    shift=ox-minx
    if abs(shift)>1e-3:
        parts=[]; xs=[]
        for name,x,ch in items:
            if ch==' ': continue
            d,b=glyph_path(name, ox+x+shift, oy+cap_px, size/1000)
            if d: parts.append((d, ch=='.')); xs.append(b)
        maxx=max(b[2] for b in xs)
    miny=min(b[1] for b in xs); maxy=max(b[3] for b in xs)
    return parts,(ox,miny,maxx,maxy)

def svg_doc(vb, body, title):
    x0,y0,x1,y1=vb
    w=x1-x0; h=y1-y0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ntos(x0)} {ntos(y0)} {ntos(w)} {ntos(h)}" '
            f'width="{ntos(w)}" height="{ntos(h)}" role="img" aria-labelledby="t">\n'
            f'<title id="t">{title}</title>\n{body}</svg>\n')

def mark_svg(rc, dc, title='Roy Marketing'):
    d,(cx,cy,r),bb=mark_parts()
    body=f'<path fill="{rc}" d="{d}"/>\n<circle fill="{dc}" cx="{ntos(cx)}" cy="{ntos(cy)}" r="{ntos(r)}"/>\n'
    return svg_doc((0,0,bb[2],bb[3]), body, title)

def lockup_h(rc, dc, title='Roy Marketing'):
    d,(cx,cy,r),bb=mark_parts()
    mh=bb[3]; capw=0.30*CAP; gap=0.36*CAP
    oy=(CAP-capw)/2
    parts,wb=wordmark_parts(bb[2]+gap, oy, capw)
    body=f'<path fill="{rc}" d="{d}"/>\n<circle fill="{dc}" cx="{ntos(cx)}" cy="{ntos(cy)}" r="{ntos(r)}"/>\n'
    body+=f'<path fill="{rc}" d="{" ".join(p for p,isp in parts if not isp)}"/>\n'
    body+=f'<path fill="{dc}" d="{" ".join(p for p,isp in parts if isp)}"/>\n'
    return svg_doc((0,0,wb[2],max(bb[3],wb[3])), body, title)

def lockup_v(rc, dc, title='Roy Marketing'):
    capw=0.17*CAP
    parts,wb=wordmark_parts(0, 0, capw)
    ww=wb[2]
    d0,c0,bb0=mark_parts()
    mw=bb0[2]
    ox=(ww-mw)/2
    d,(cx,cy,r),bb=mark_parts(ox,0)
    gap=0.30*CAP
    parts,wb=wordmark_parts(0, bb[3]+gap, capw)
    body=f'<path fill="{rc}" d="{d}"/>\n<circle fill="{dc}" cx="{ntos(cx)}" cy="{ntos(cy)}" r="{ntos(r)}"/>\n'
    body+=f'<path fill="{rc}" d="{" ".join(p for p,isp in parts if not isp)}"/>\n'
    body+=f'<path fill="{dc}" d="{" ".join(p for p,isp in parts if isp)}"/>\n'
    return svg_doc((0,0,ww,wb[3]), body, title)

def wordmark_svg(rc, dc, title='Roy Marketing'):
    parts,wb=wordmark_parts(0,0,CAP*0.3)
    body=f'<path fill="{rc}" d="{" ".join(p for p,isp in parts if not isp)}"/>\n'
    body+=f'<path fill="{dc}" d="{" ".join(p for p,isp in parts if isp)}"/>\n'
    return svg_doc((0,0,wb[2],wb[3]), body, title)

if __name__=='__main__':
  if GEOM=='montserrat':
    files={
     'logo/alt-montserrat-bold/mark-montserrat-dark-on-light.svg': mark_svg(INK,GREEN),
     'logo/alt-montserrat-bold/mark-montserrat-light-on-dark.svg': mark_svg(WHITE,DOT_DARK),
    }
  else:
    files={
     'logo/mark/mark-dark-on-light.svg': mark_svg(INK,GREEN),
     'logo/mark/mark-light-on-dark.svg': mark_svg(WHITE,DOT_DARK),
     'logo/mark/mark-mono-black.svg': mark_svg('#000000','#000000'),
     'logo/mark/mark-mono-white.svg': mark_svg(WHITE,WHITE),
     'logo/lockup/lockup-horizontal-dark-on-light.svg': lockup_h(INK,GREEN),
     'logo/lockup/lockup-horizontal-light-on-dark.svg': lockup_h(WHITE,DOT_DARK),
     'logo/lockup/lockup-stacked-dark-on-light.svg': lockup_v(INK,GREEN),
     'logo/lockup/lockup-stacked-light-on-dark.svg': lockup_v(WHITE,DOT_DARK),
     'logo/wordmark/wordmark-dark-on-light.svg': wordmark_svg(INK,GREEN),
     'logo/wordmark/wordmark-light-on-dark.svg': wordmark_svg(WHITE,DOT_DARK),
    }
  for p,s in files.items():
      fp=os.path.join(OUT,p); os.makedirs(os.path.dirname(fp),exist_ok=True)
      open(fp,'w').write(s)
  print('\n'.join(files))
