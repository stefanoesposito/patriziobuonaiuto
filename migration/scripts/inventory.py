"""Read-only, repeatable extraction of the legacy templates and asset references."""
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
import re, json, hashlib
ROOT=Path(__file__).resolve().parents[2]
def text(html):
 return re.sub(r'\s+',' ',unescape(re.sub(r'<[^>]+>',' ',html))).strip()
def clean(s): return re.sub(r'<!--.*?-->','',s,flags=re.S)
def paragraphs(s): return [text(p) for p in re.findall(r'<p[^>]*>(.*?)</p>',s,re.S)]
def image_paths(s): return re.findall(r"filename=['\"](img/[^'\"]+)",s)
pages={}
for lang,about in [('it','su-di-me'),('en','about-me')]:
 for kind,file in [('home','index'),('about',about),('contact','contact')]:
  raw=(ROOT/f'templates/{lang}/{file}.html').read_text();s=clean(raw)
  if kind=='home': body=re.search(r'<div class="text-home">(.*?)</div>',s,re.S).group(1)
  elif kind=='about': body=re.search(r'<div class="about-content[^>]*>(.*?)</div>',s,re.S).group(1)
  else: body=re.search(r'<div class="contact-content">(.*?)</div>',s,re.S).group(1)
  heading=re.search(r'<h[23][^>]*>(.*?)</h[23]>',body,re.S)
  pages[f'{kind}-{lang}']={'key':f'{kind}-{lang}','kind':kind,'language':lang,'title':text(heading.group(1)),'paragraphs':paragraphs(body),'images':list(dict.fromkeys('/static/'+p for p in image_paths(s))) if kind=='about' else [],'legacyUrl':f'/{lang}/' if kind=='home' else f'/{lang}/{file}'}
raw=clean((ROOT/'templates/it/portfolio.html').read_text())
items=[]
for categories,body in re.findall(r'<div class="[^"]*column_single_gallery_item ([^"]+)"[^>]*>(.*?)</div>\s*</div>',raw,re.S):
 path=image_paths(body)[0]
 items.append({'sourceKey':path,'image':'/static/'+path,'categories':categories.split()})
known={
 'affresco':('Ritratto ad affresco','Fresco portrait','ritratto-affresco',''),
 'caravaggio-bacco':('Bacco','Bacchus','bacco-caravaggio','Caravaggio'),
 'salvator-mundi-leonardo-da-vinci':('Salvator Mundi','Salvator Mundi','salvator-mundi','Leonardo da Vinci'),
 'angelo-musicante-rosso-fiorentino':('Angelo musicante','Musician angel','angelo-musicante','Rosso Fiorentino'),
 'campo-di-papaveri-c-monet':('Campo di papaveri','Poppy field','campo-di-papaveri','Claude Monet'),
 'denittis':('Studio da De Nittis','Study after De Nittis','studio-de-nittis','Giuseppe De Nittis'),
 'gustav-klimt-personal-portrait':('Ritratto personalizzato ispirato a Klimt','Personalised portrait inspired by Klimt','ritratto-personalizzato-klimt','Gustav Klimt'),
 'klimt-bacio':('Il Bacio','The Kiss','il-bacio-klimt','Gustav Klimt'),
 'iris-van-gogh':('Iris','Irises','iris-van-gogh','Vincent van Gogh'),
 'leonardo-da-vinci-monnalisa':('Monna Lisa','Mona Lisa','monna-lisa','Leonardo da Vinci'),
 'woman-at-her-toilet-henri-de-toulouse-lautrec':('Donna alla toilette','Woman at her toilet','donna-alla-toilette','Henri de Toulouse-Lautrec'),
 'munch-urlo':("L’Urlo",'The Scream','urlo-munch','Edvard Munch'),
}
artworks=[];process={}
for item in items:
 name=Path(item['sourceKey']).stem
 if item['categories']==['process']:
  key='palazzo-donn-anna' if '/palazzo-donn-anna/' in item['image'] else 'lattaia-vermeer' if '/vermeer/' in item['image'] else 'preparazione-tela'
  process.setdefault(key,[]).append(item['image']);continue
 match=next((v for k,v in known.items() if name.endswith(k)),None)
 if not match:
  n=re.search(r'originals-(\d+)$',name)
  match=(f'Opera originale {n[1]}',f'Original artwork {n[1]}',f'opera-originale-{n[1]}','') if n else ("Trompe-l’œil","Trompe-l’œil",'trompe-l-oeil','')
 it,en,slug,master=match
 description={'it':f'{it}: '+('opera originale' if 'originals' in item['categories'] else 'lavoro pittorico')+' di Patrizio Buonaiuto.','en':f'{en}: '+('an original artwork' if 'originals' in item['categories'] else 'a painting')+' by Patrizio Buonaiuto.'}
 gallery=[]
 if slug in ('il-bacio-klimt','monna-lisa','urlo-munch'):
  original=item['image']; variant=original.replace('/patrizio-', '/portfolio-patrizio-').replace('.jpg','.jpeg')
  if (ROOT/variant.lstrip('/')).is_file(): item['image']=variant;gallery=[original]
 artworks.append({**item,'gallery':gallery,'slug':slug,'title':{'it':it,'en':en},'sourceArtist':master,'description':description,'needsEditorialReview':not bool(master) or 'denittis' in name or 'originals' in item['categories']})
featured=['bacco-caravaggio','il-bacio-klimt','monna-lisa','iris-van-gogh','urlo-munch']
processes=[]
for slug,images in process.items():
 title={'palazzo-donn-anna':{"it":"Palazzo Donn’Anna","en":"Palazzo Donn’Anna"},'lattaia-vermeer':{'it':'La Lattaia di Vermeer','en':'The Milkmaid after Vermeer'},'preparazione-tela':{'it':'Preparazione della tela','en':'Preparing the canvas'}}[slug]
 processes.append({'slug':slug,'title':title,'images':images,'sourceKey':'process/'+slug})
references=[]
for path in sorted((ROOT/'templates').rglob('*.html')):
 s=clean(path.read_text())
 for image in sorted(set(image_paths(s)+[p.removeprefix('/static/') for p in re.findall(r'/static/(img/[^\s\'\";)]+)',s)])):
  references.append({'template':str(path.relative_to(ROOT)),'path':'static/'+image,'exists':(ROOT/'static'/image).is_file()})
assets=[{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted((ROOT/'static/img').rglob('*')) if p.is_file()]
snapshot={'pages':pages,'artworks':artworks,'processes':processes,'featured':featured,'settings':{'name':'Patrizio Buonaiuto','email':'patriziobuonaiuto@gmail.com','mobile':'+39 338 9333 810','phone':'+39 081 587 4171','facebook':'https://www.facebook.com/profile.php?id=61577314981843'},'comparison':{'originalImage':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gustav_Klimt_-_Portr%C3%A4t_der_Adele_Bloch-Bauer_I_%281907%29.jpg','originalTitle':'Gustav Klimt, Ritratto di Adele Bloch-Bauer I, 1907','artworkSlug':'ritratto-personalizzato-klimt'}}
(ROOT/'web/src/lib/legacy-content.json').write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
report={'sourceCommit':'3fb43f986338aa266f25eac68d2fc557aac5c85e','pages':[p for p in pages.values()],'portfolioItems':items,'artworks':len(artworks),'processProjects':len(processes),'assets':assets,'references':references,'missingAssets':sorted({x['path'] for x in references if not x['exists']}),'scope':'Published repository content only. No hidden CMS, drafts or history exists in the legacy Flask source. CV means Su di me, confirmed by the owner.'}
(ROOT/'migration/reports/inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
assert len(items)==33 and len(artworks)==20 and sum(len(x['images']) for x in processes)==13
print(json.dumps({'pages':len(pages)+2,'artworks':len(artworks),'processProjects':len(processes),'processImages':13,'assets':len(assets),'missingReferences':report['missingAssets']},ensure_ascii=False,indent=2))
