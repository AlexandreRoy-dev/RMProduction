import numpy as np, json
from PIL import Image, ImageDraw
from scipy.optimize import minimize
from lib import refmasks
dark,g=refmasks()
H,W=dark.shape
SS=3
def cub(p0,p1,p2,p3,n=24):
    t=np.linspace(0,1,n)[:,None]
    return ((1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t**2*p2+t**3*p3)
def shape(P):
    P=list(P)
    for i in (4,5,6,7,21,22,23,24,26): P[i]=min(max(P[i],0.0),1.0)
    (y0,xa,bx,ym,k1,k2,k3,k4,lrx,lry,lbr,lbl,ltl,yb,sw,tt,xc0,cxr,cym,xc1,cb,k5,k6,k7,k8,yB,k9)=P
    A=np.array
    outer=[A([0,y0]),A([xa,y0])]
    outer+=list(cub(A([xa,y0]),A([xa+k1*(bx-xa),y0]),A([bx,ym-k2*(ym-y0)]),A([bx,ym])))
    outer+=list(cub(A([bx,ym]),A([bx,ym+k3*(lry-ym)]),A([lrx+k4*(bx-lrx),lry-k9*(lry-ym)]),A([lrx,lry])))
    # (lower bowl ends at lrx,lry with horizontal tangent approx)
    outer+=[A([lbr,yB]),A([lbl,yB]),A([ltl,yb]),A([sw,yb]),A([sw,yB]),A([0,yB])]
    hole=[A([sw,tt]),A([xc0,tt])]
    hole+=list(cub(A([xc0,tt]),A([xc0+k5*(cxr-xc0),tt]),A([cxr,cym-k6*(cym-tt)]),A([cxr,cym])))
    hole+=list(cub(A([cxr,cym]),A([cxr,cym+k7*(cb-cym)]),A([xc1+k8*(cxr-xc1),cb]),A([xc1,cb])))
    hole+=[A([sw,cb])]
    return outer,hole
def raster(P):
    o,h=shape(P)
    im=Image.new('L',(W*SS,H*SS),0); d=ImageDraw.Draw(im)
    d.polygon([tuple(p*SS) for p in o],fill=255); d.polygon([tuple(p*SS) for p in h],fill=0)
    return np.array(im.resize((W,H),Image.BOX)).astype(float)/255
def convpen(P):
    o,h=shape(P); o=np.array(o)
    pen=0
    for seg in (o[2:26],o[26:50]):
        d=np.diff(seg,axis=0); cr=d[:-1,0]*d[1:,1]-d[:-1,1]*d[1:,0]
        pen+=np.clip(-cr,0,None).sum()
    return pen
def loss(P):
    m=raster(P); return 1-np.minimum(m,dark).sum()/np.maximum(m,dark).sum()+convpen(P)*1e-3
P0=json.load(open('r-mark-fit-params.json'))
print('init',loss(P0),convpen(P0))
r=minimize(loss,P0,method='Powell',options={'maxiter':20000,'xtol':0.01,'ftol':1e-7})
print('fit',r.fun,convpen(r.x)); P=list(map(float,r.x)); print([round(v,2) for v in P])
json.dump(P,open('r-mark-fit-params.json','w'))
