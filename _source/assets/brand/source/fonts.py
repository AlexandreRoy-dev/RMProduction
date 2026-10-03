from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
FD='/workspace/roymarketing-site-v2/assets/brand/fonts/'
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
def uni(spec):
    out=[]
    for part in spec.split(','):
        p=part.replace('U+','')
        if '-' in p: a,b=p.split('-'); out+=range(int(a,16),int(b,16)+1)
        else: out.append(int(p,16))
    return out
jobs=[('/usr/share/fonts/truetype/sand-box/google/Montserrat/Montserrat-VariableFont_wght.ttf','montserrat-latin-var.woff2',{'wght':(400,800)}),
      ('/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf','inter-latin-var.woff2',{'wght':(300,700)})]
for src,out,axes in jobs:
    f=TTFont(src); print(out, [ (a.axisTag,a.minValue,a.maxValue) for a in f['fvar'].axes], f['name'].getDebugName(5))
    import io
    b=io.BytesIO(); instantiateVariableFont(f,axes).save(b); b.seek(0); f=TTFont(b)
    opts=subset.Options(); opts.flavor='woff2'; opts.layout_features=['*']; opts.name_IDs=['*']; opts.notdef_outline=True; opts.drop_tables+=['DSIG']
    s=subset.Subsetter(opts); s.populate(unicodes=uni(U)); s.subset(f)
    subset.save_font(f,FD+out,opts)
import os
for n in os.listdir(FD): print(n, os.path.getsize(FD+n))
