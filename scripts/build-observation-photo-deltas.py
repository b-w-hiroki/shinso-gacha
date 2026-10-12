#!/usr/bin/env python3
"""Deterministic photo-native observation deltas. The four master photographs
remain untouched, so native scene coordinates and stored ids never change."""
import argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SITES = {
    "cctv": ("cctv-underground-native.webp", [[(.51,.34)],[(.66,.64)],[(.22,.65)]]),
    "photo": ("photo-classroom-native.webp", [[(.40,.36)],[(.70,.82)],[(.59,.065)]]),
    "vision": ("vision-crossing-native.webp", [[(.50,.28)],[(.28,.38),(.54,.36),(.76,.36)],[(.28,.44),(.77,.44)]]),
    "dash": ("dash-coast-road-native.webp", [[(.20,.29)],[(.43,.42)],[(.59,.54)]]),
}

def make_delta(original, mode, rarity, hotspots):
    w,h=original.size
    base=np.asarray(original.convert('RGB'),dtype=np.float32)
    modified=base.copy()
    alpha=np.zeros((h,w),dtype=np.float32)
    yy,xx=np.mgrid[:h,:w]
    rng=np.random.default_rng(1337+rarity*101+len(mode)*47)
    for i,(px,py) in enumerate(hotspots):
        cx,cy=px*w,py*h
        rx=w*([.071,.09,.112][rarity-1])
        ry=h*([.105,.128,.15][rarity-1])
        if rarity==3 and py<.12:cy=min(cy,h*.16)
        distance=((xx-cx)/rx)**2+((yy-cy)/ry)**2
        patch=np.exp(-distance*(2.2 if rarity==1 else 1.7)).astype(np.float32)
        shiftX=[9,18,28][rarity-1]*(1 if (i%2)==0 else -1)
        shiftY=[6,10,16][rarity-1]
        rolled=np.roll(base,shift=(shiftY,shiftX),axis=(0,1))
        sample_ratio=[.65,.83,1.0][rarity-1]
        source=rolled*sample_ratio+base*(1-sample_ratio)
        exposure=[.84,.74,.64][rarity-1] if (i%2==0) else [.95,1.04,1.12][rarity-1]
        source=np.clip(source*exposure+[4,7,9][rarity-1]*np.array([.64,.93,1.06],dtype=np.float32),0,255)
        influence=patch[:,:,None]*[.42,.59,.74][rarity-1]
        modified=modified*(1-influence)+source*influence
        alpha=np.maximum(alpha,patch*[.68,.76,.83][rarity-1])
        if rarity>=2:
            outline=(np.exp(-((xx-cx-shiftX*.7)/max(2,rx*.79))**2*4-((yy-cy)/max(2,ry*.79))**2*4)*
                     (1-np.exp(-distance*3.5))).astype(np.float32)
            alpha=np.maximum(alpha,outline*.34)
    # The source itself supplies texture; soft photographic negative
    # silhouettes make otherwise hard-to-see clues perceivable on a phone.
    for i,(px,py) in enumerate(hotspots):
        cx,cy=int(px*w),int(py*h)
        scale=[.65,.9,1.1][rarity-1]
        head=max(8,int(24*scale))
        stature=int(112*scale)
        torso=int(37*scale)
        mask=Image.new('L',(w,h),0)
        d=ImageDraw.Draw(mask)
        if mode=='cctv' and rarity==1:
            # Unnaturally regular damp footprints by the underpass.
            for k in range(5):
                x0=cx+(k-2)*22
                y0=cy+int((k-2)*11)
                d.ellipse((x0-12,y0-6,x0+12,y0+6),fill=255)
        elif mode=='dash':
            # A second headlight with no matching vehicle.
            rr=int(13*scale)
            d.ellipse((cx-rr*2,cy-rr,cx+rr*2,cy+rr),fill=255)
            d.ellipse((cx+rr*3,cy-rr//2,cx+rr*5,cy+rr//2),fill=210)
        else:
            # Human-shaped absence: a head and coat built from image luminance.
            d.ellipse((cx-head*.7,cy-stature*.53-head,cx+head*.7,cy-stature*.53+head),fill=225)
            d.polygon([(cx-torso*.58,cy-stature*.42),(cx+torso*.58,cy-stature*.42),
                       (cx+torso,cy+stature*.45),(cx-torso*.92,cy+stature*.45)],fill=228)
        shade=np.asarray(mask.filter(ImageFilter.GaussianBlur(4+rarity*2)),dtype=np.float32)/255.
        strength=[.64,.84,.94][rarity-1]
        luminance=np.mean(base,axis=2,keepdims=True)
        ghost=np.where(luminance<100,
                       np.clip(base*.35+np.array([91,111,114]),0,255),
                       np.clip(base*.14+np.array([1,7,12]),0,255))
        modified=modified*(1-shade[:,:,None])+ghost*shade[:,:,None]
        alpha=np.maximum(alpha,shade*strength)
    fine=rng.normal(0,1.0,(h,w)).astype(np.float32)
    modified=np.clip(modified+fine[:,:,None]*alpha[:,:,None]*1.2,0,255)
    rgba=np.zeros((h,w,4),dtype=np.uint8)
    rgba[:,:,:3]=modified.astype(np.uint8)
    rgba[:,:,3]=(np.clip(alpha,0,1)*255).astype(np.uint8)
    return Image.fromarray(rgba,'RGBA')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-dir',type=Path,default=Path('assets/observation'))
    parser.add_argument('--out-dir',type=Path,default=Path('assets/observation/photo-deltas'))
    args=parser.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    for mode,(file,sets) in SITES.items():
        master=Image.open(args.source_dir/file).convert('RGB')
        if master.size!=(1440,720):raise ValueError(f'{mode}: expected 1440x720, got {master.size}')
        for rarity,hotspots in enumerate(sets,1):
            img=make_delta(master,mode,rarity,hotspots)
            target=args.out_dir/f'{mode}-{rarity}.webp'
            img.save(target,'WEBP',quality=90,method=6,exact=True)
            result=Image.open(target)
            if result.size!=(1440,720) or result.mode!='RGBA':raise AssertionError(f'invalid WebP {target}')
            print(f'{target}: {target.stat().st_size} bytes; {len(hotspots)} authored spots')

if __name__=='__main__':main()
