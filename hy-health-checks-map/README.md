# HY Project Health Checks 2026 – animated map

Animated map video of the 10 projects that had project health checks in 2026, in Hansen Yuncken branding.

- `hy-health-checks-2026.mp4`: the current render (1080p, 30 fps, about 66 s).
- `hy-health-checks-map.html`: an interactive version. Open it in a browser. Click a pin or a progress square to jump to that project.

## Status
**Photos are still missing.** The cloud session that built this couldn't download images because its network settings blocked the sites. Each card shows a drawn icon until a photo is added.

## Adding photos
Save one landscape image per project into `photos/`, named by project id (`.jpg`, `.png` or `.webp`):

| id | Project | Likely source |
|---|---|---|
| cairns | Cairns Hospital Expansion Project | hansenyuncken.com.au/project/cairns-hospital-expansion-project-2/ |
| uq | UQ Health and Recreation Precinct (HARP) | hansenyuncken.com.au/project/university-queensland-health-recreation-precinct/ |
| medowie | Medowie High School | schoolinfrastructure.nsw.gov.au (new high school for Medowie) |
| uon | UoN Student Accommodation | hansenyuncken.com.au/project/university-newcastle-city-campus-student-accommodation/ |
| cessnock | Cessnock Hospital Redevelopment | nsw.gov.au Health Infrastructure project page |
| liverpool | Liverpool Boys and Girls High School | hansenyuncken.com.au/project/liverpool-boys-and-girls-high-school/ |
| firmus | Firmus Southgate Project | firmus.co |
| warrnambool | Warrnambool Base Hospital Redevelopment | vhba.vic.gov.au/health/hospitals/warrnambool-base-hospital-redevelopment |
| anipdf | ANI Production Demonstration Facilities | ani.com.au / asa.gov.au (Osborne yard) |
| anistack | ANI STAC Project | ani.com.au (Osborne) |

Photos get the HY treatment automatically: black and white, multiplied over HY yellow.

Copyright: HY's own photos are fine to use. Government and news images may need permission if the video is shown outside HY.

## Rebuild
```bash
cd build
npm i world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1 @fontsource/arimo@5.1.0 playwright
node geo.mjs          # map geometry -> ../data.js (already committed)
python3 build.py      # -> ../hy-health-checks-map.html (embeds photos/)
node video.js "$PWD/../hy-health-checks-map.html" "$PWD/../hy-health-checks-2026.mp4"   # needs ffmpeg
```
Timing, zoom levels and the tour order are set in `build/template.html` (`CAMZ`, `DWELL`, `T_FIN`). Project names and coordinates are in `build/geo.mjs`.
