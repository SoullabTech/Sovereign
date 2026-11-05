import swisseph as swe, json
cases = [
 ('J2000 Greenwich','2000-01-01T12:00:00Z',0,0),
 ('New York ordinary spring 1985','1985-03-15T19:30:00Z',40.7128,-74.006),
 ('Connecticut autumn 2026','2026-10-12T18:00:00Z',41.383,-72.9),
 ('Sydney southern hemisphere 2026','2026-10-15T22:30:00Z',-33.8688,151.2093),
 ('Quito equatorial 2026','2026-05-24T11:12:00Z',-0.1807,-78.4678),
 ('Reykjavik high latitude 1990','1990-06-15T18:30:00Z',64.1466,-21.9426),
]
out=[]
for label,iso,lat,lng in cases:
    y,mo,d=int(iso[0:4]),int(iso[5:7]),int(iso[8:10]); h=int(iso[11:13])+int(iso[14:16])/60
    jd=swe.julday(y,mo,d,h)
    res={}
    for code,name in ((b'P','placidus'),(b'K','koch'),(b'O','porphyry')):
        cusps,ascmc=swe.houses_ex(jd,lat,lng,code,swe.FLG_MOSEPH)
        res[name]=[round(c,5) for c in cusps[:12]]
    out.append({'label':label,'utc':iso,'lat':lat,'lng':lng,'houses':res})
print(json.dumps(out,indent=1))
