import json, pathops
from fontTools.pens.svgPathPen import SVGPathPen
import os
P=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'r-mark-fit-params.json')))
for _i in (4,5,6,7,21,22,23,24,26): P[_i]=min(max(P[_i],0.0),1.0)
(y0,xa,bx,ym,k1,k2,k3,k4,lrx,lry,lbr,lbl,ltl,yb,sw,tt,xc0,cxr,cym,xc1,cb,k5,k6,k7,k8,yB,k9)=P
S=700/(yB-y0)
def T(x,y): return ((x)*S,(y-y0)*S)
REF_SCALE=S; REF_Y0=y0
def r_path(ox=0,oy=0,scale=1.0):
    pp=pathops.Path(); pen=pp.getPen()
    def t(x,y):
        a,b=T(x,y); return (ox+a*scale, oy+b*scale)
    pen.moveTo(t(0,y0)); pen.lineTo(t(xa,y0))
    pen.curveTo(t(xa+k1*(bx-xa),y0),t(bx,ym-k2*(ym-y0)),t(bx,ym))
    pen.curveTo(t(bx,ym+k3*(lry-ym)),t(lrx+k4*(bx-lrx),lry-k9*(lry-ym)),t(lrx,lry))
    for p in [(lbr,yB),(lbl,yB),(ltl,yb),(sw,yb),(sw,yB),(0,yB)]: pen.lineTo(t(*p))
    pen.closePath()
    from fontTools.pens.reverseContourPen import ReverseContourPen
    pen=ReverseContourPen(pp.getPen())
    pen.moveTo(t(sw,tt)); pen.lineTo(t(xc0,tt))
    pen.curveTo(t(xc0+k5*(cxr-xc0),tt),t(cxr,cym-k6*(cym-tt)),t(cxr,cym))
    pen.curveTo(t(cxr,cym+k7*(cb-cym)),t(xc1+k8*(cxr-xc1),cb),t(xc1,cb))
    pen.lineTo(t(sw,cb)); pen.closePath()
    pp.simplify(fix_winding=True, clockwise=False)
    return pp
# dot from reference centroid
DOT=dict(cx=527.156*S, cy=(426.761-y0)*S, r=71.585*S)
RIGHT=lbr*S
if __name__=='__main__':
    print('scale',S,'R width',RIGHT,'dot',DOT,'gap',DOT['cx']-DOT['r']-RIGHT, 'dot bottom', DOT['cy']+DOT['r'])
