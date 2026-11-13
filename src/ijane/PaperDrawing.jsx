// Traced to the doorway and arches in facade-paper-v4, in artwork coordinates.
// These are drawing strokes, not an extra raster or a second rendered scene.
const strokes=[
  [0,24,'M555 870 V433 H975 V870 M571 862 V446 H960 V862 M767 862 V446'],
  [12,42,'M468 870 C470 535 505 263 766 0 C1025 263 1070 535 1075 870'],
  [18,48,'M402 870 C418 475 492 196 766 35 C1042 196 1113 475 1130 870'],
  [24,54,'M358 870 C384 430 470 172 766 0 C1075 172 1158 430 1206 870'],
  [34,63,'M570 356 L766 118 L961 356 Z M570 356 L766 256 L961 356 M766 118 V356'],
  [42,70,'M766 118 L813 190 L766 233 L719 190 Z M620 256 L676 225 L718 256 L676 290 Z M915 256 L856 225 L814 256 L856 290 Z M766 356 L813 324 L766 279 L719 324 Z M676 225 V190 H719 M813 190 H856 V225 M676 290 V356 H719 M813 356 H856 V290 M676 190 L766 256 L856 190 M676 356 L766 256 L856 356 M718 256 H814'],
  [52,78,'M358 870 H555 M975 870 H1206 M0 928 H567 M968 928 H1320 M0 979 H516 M1014 979 H1536 M390 1024 L570 870 M1072 1024 L906 870'],
  [30,58,'M0 214 L430 0 L358 870 L122 794 Z M0 214 L264 272 L430 0 M264 272 L122 794 M1118 0 L1536 214 L1403 794 L1206 870 Z M1536 214 L1283 272 L1118 0 M1283 272 L1403 794'],
  [46,72,'M43 755 Q152 783 278 755 L250 819 H71 Z M1264 755 Q1380 785 1499 755 L1477 819 H1293 Z M90 753 Q60 634 34 594 Q121 640 132 749 M157 752 Q141 579 181 520 Q207 629 178 749 M210 752 Q226 643 284 612 Q266 697 231 755 M1322 749 Q1295 643 1260 607 Q1342 643 1352 750 M1387 754 Q1370 581 1410 535 Q1438 641 1409 752 M1450 753 Q1474 650 1522 622 Q1513 703 1470 755'],
];

export default function PaperDrawing(){
  return <svg className="paper-loading__drawing" viewBox="0 0 1536 1024" preserveAspectRatio="none" aria-hidden="true">
    <g className="paper-loading__fill" data-from="28" data-to="66">
      <path d="M571 446 H960 V862 H571 Z" fill="#bccfd9"/>
      <path d="M570 356 L766 118 L961 356 Z" fill="#d6e1e5"/>
    </g>
    <g className="paper-loading__fill" data-from="48" data-to="78" fill="#ecc395">
      <path d="M766 118 L813 190 L766 233 L719 190 Z M620 256 L676 225 L718 256 L676 290 Z M915 256 L856 225 L814 256 L856 290 Z"/>
      <path d="M570 870 H906 L1072 1024 H390 Z" fill="#f0e1d4"/>
    </g>
    <g className="paper-loading__ink" fill="none" stroke="#617784" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {strokes.map(([from,to,d])=><path key={from} d={d} pathLength="1" strokeDasharray="1" strokeDashoffset="1" data-from={from} data-to={to}/>)}
    </g>
    <image className="paper-loading__art" href="/ijane/chapel/facade-paper-v4.webp" x="0" y="0" width="1536" height="1024"/>
    <g className="paper-loading__pencil" opacity="0" fill="#d8a67c" stroke="#617784" strokeWidth="1">
      <path d="M0 0 L-4 -13 L-4 -62 H4 V-13 Z"/><path d="M0 0 L-4 -13 H4 Z" fill="#ead9c2"/><path d="M0 0 L-1.5 -5 H1.5 Z" fill="#617784"/>
    </g>
  </svg>;
}
