#!/usr/bin/env python3
"""Build review-only, source-resolution observation backgrounds from CC0 photography."""
import hashlib, io, json, math, pathlib, time
from urllib.request import Request, urlopen
from urllib.parse import quote
from PIL import Image, ImageOps, ImageEnhance

ROOT=pathlib.Path(__file__).resolve().parents[1]
sources=json.loads((ROOT/"docs/observation-native-sources.json").read_text(encoding="utf-8"))["sources"]
OUT=ROOT/"assets/observation"
SIZE=(1440,720)

def retrieve(filename):
    url="https://commons.wikimedia.org/wiki/Special:FilePath/"+quote(filename,safe="()")+"?width=2048"
    last=None
    for attempt in range(3):
        try:
            req=Request(url,headers={"User-Agent":"ShinsoGachaAssetReview/1.0 (https://github.com/b-w-hiroki/shinso-gacha)","Accept":"image/*"})
            with urlopen(req,timeout=55) as response:
                payload=response.read(20_000_001)
            if len(payload)>20_000_000:raise ValueError("source exceeded size limit")
            image=Image.open(io.BytesIO(payload))
            image.load()
            image=ImageOps.exif_transpose(image).convert("RGB")
            if image.width<1440 or image.height<720:
                raise ValueError("source too small: "+str(image.size))
            return image
        except Exception as e:
            last=e
            time.sleep(2+attempt*3)
    raise RuntimeError("Download failed for "+filename+": "+str(last))

def process(image,style):
    photo=ImageOps.fit(image,SIZE,method=Image.Resampling.LANCZOS,centering=(.5,.5))
    photo=ImageEnhance.Color(photo).enhance(.62)
    photo=ImageEnhance.Contrast(photo).enhance(1.12)
    photo=ImageEnhance.Brightness(photo).enhance(style["brightness"])
    photo=Image.blend(photo,Image.new("RGB",SIZE,(20,35,37)),style["teal"])
    # Gentle low-light vignette, not digital lettering or a fabricated overlay.
    mask=Image.new("L",SIZE);pixels=mask.load()
    for y in range(SIZE[1]):
        cy=(y-SIZE[1]/2)/(SIZE[1]/2)
        for x in range(SIZE[0]):
            cx=(x-SIZE[0]/2)/(SIZE[0]/2)
            pixels[x,y]=round(255*(1-.22*min(1,(cx*cx+cy*cy)/1.85)))
    return Image.composite(photo,Image.new("RGB",SIZE,(1,6,8)),mask)

def main():
    assert {x["mode"] for x in sources}=={"cctv","photo","vision","dash"}
    OUT.mkdir(parents=True,exist_ok=True)
    qa=ROOT/"docs/qa-incursions";qa.mkdir(parents=True,exist_ok=True)
    board=Image.new("RGB",(1440,1440),(13,17,17))
    report=[]
    for i,source in enumerate(sources):
        if source["license"]!="CC0-1.0":raise ValueError("unlicensed source")
        original=retrieve(source["name"])
        art=process(original,source)
        target=OUT/source["file"]
        art.save(target,format="WEBP",quality=85,method=6)
        size=target.stat().st_size
        if not 30_000<size<2_000_000:raise ValueError("unexpected output size: "+str(size))
        board.paste(art.resize((720,360),Image.Resampling.LANCZOS),((i%2)*720,(i//2)*720))
        report.append({"mode":source["mode"],"source":source["source"],"license":source["license"],"author":source["author"],"native_original":original.size,"output":source["file"],"size":SIZE,"bytes":size,"sha256":hashlib.sha256(target.read_bytes()).hexdigest()})
    (qa/"native-photo-source-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    board.save(qa/"native-photo-board.jpg",quality=89)
    print(json.dumps(report,ensure_ascii=False))

if __name__=="__main__":
    main()
