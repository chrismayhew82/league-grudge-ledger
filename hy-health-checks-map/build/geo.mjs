import fs from 'fs';
import {feature} from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
const W=1920,H=1080;
const t10=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const t50=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const c10=feature(t10,t10.objects.countries).features;
const c50=feature(t50,t50.objects.countries).features;
const aus=c10.find(f=>f.properties.name==='Australia');
// keep mainland + Tasmania + decent islands only
const proj=geoMercator().fitExtent([[760,70],[1860,1030]],{type:'MultiPoint',coordinates:[[113,-10.6],[153.7,-10.6],[113,-43.7],[153.7,-43.7]]});
const path=geoPath(proj).digits(1);
const polys=aus.geometry.coordinates.filter(p=>{const a=Math.abs(geoPath(proj).area({type:'Polygon',coordinates:p}));return a>40;});
const ausD=path({type:'MultiPolygon',coordinates:polys});
const others=c50.filter(f=>['Papua New Guinea','Indonesia','New Zealand','Timor-Leste','Solomon Is.','New Caledonia','Vanuatu'].includes(f.properties.name)).map(f=>path(f)).join('');
const borders=[
 [[129,-14.5],[129,-32]],
 [[129,-26],[138,-26],[141,-26],[141,-29]],
 [[138,-16.4],[138,-26]],
 [[141,-29],[148.95,-29],[149.5,-28.6],[150.5,-28.65],[151.0,-28.85],[151.6,-28.95],[152.0,-28.6],[152.5,-28.35],[153.6,-28.15]],
 [[141,-29],[141,-34.0],[140.97,-38.3]],
 [[141,-34.05],[142.4,-34.65],[143.3,-35.3],[144.5,-36.1],[145.3,-35.9],[146.4,-36.0],[147.2,-36.05],[148.2,-36.8],[150.1,-37.55]],
].map(l=>'M'+l.map(p=>proj(p).map(v=>v.toFixed(1)).join(',')).join('L')).join('');
const P=[
 {id:'cairns',name:'Cairns Hospital Expansion Project',city:'Cairns',state:'QLD',sector:'Health',client:'Queensland Health',icon:'health',ll:[145.770,-16.915]},
 {id:'uq',name:'UQ Health and Recreation Precinct (HARP)',city:'St Lucia, Brisbane',state:'QLD',sector:'Sport & Recreation',client:'The University of Queensland',icon:'sport',ll:[153.016,-27.502]},
 {id:'medowie',name:'Medowie High School',city:'Medowie',state:'NSW',sector:'Education',client:'School Infrastructure NSW',icon:'school',ll:[151.868,-32.742]},
 {id:'uon',name:'University of Newcastle Student Accommodation',city:'Newcastle',state:'NSW',sector:'Student Living',client:'University of Newcastle',icon:'living',ll:[151.772,-32.926]},
 {id:'cessnock',name:'Cessnock Hospital Redevelopment',city:'Cessnock',state:'NSW',sector:'Health',client:'Health Infrastructure NSW',icon:'health',ll:[151.358,-32.836]},
 {id:'liverpool',name:'Liverpool Boys and Girls High School',city:'Liverpool, Sydney',state:'NSW',sector:'Education',client:'School Infrastructure NSW',icon:'school',ll:[150.928,-33.917]},
 {id:'firmus',name:'Firmus Southgate Project',city:'Launceston',state:'TAS',sector:'Data Centre',client:'Firmus',icon:'data',ll:[147.180,-41.468]},
 {id:'warrnambool',name:'Warrnambool Base Hospital Redevelopment',city:'Warrnambool',state:'VIC',sector:'Health',client:'Victorian Health Building Authority',icon:'health',ll:[142.484,-38.379]},
 {id:'anipdf',name:'ANI Production Demonstration Facilities (PDF)',city:'Osborne, Adelaide',state:'SA',sector:'Defence',client:'Australian Naval Infrastructure',icon:'naval',ll:[138.497,-34.796]},
 {id:'anistack',name:'ANI Skills and Training Academy (STAC)',city:'Osborne, Adelaide',state:'SA',sector:'Defence',client:'Australian Naval Infrastructure',icon:'naval',ll:[138.535,-34.770]},
];
P.forEach(p=>{const [x,y]=proj(p.ll);p.x=+x.toFixed(2);p.y=+y.toFixed(2);});
const EB=[proj([128.6,-10.9]),proj([154.0,-43.7])];
fs.writeFileSync('../data.js','window.GEO='+JSON.stringify({aus:ausD,others,borders,P,EB})+';');
console.log(ausD.length, others.length, P.map(p=>p.id+':'+p.x+','+p.y).join(' '));
