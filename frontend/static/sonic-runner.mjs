// Personagem vetorial articulado, visto de costas. Sem imagens externas.
export function drawSonicRunner(ctx, {x, ground, time, lean = 0, reduced = false}) {
  const cycle = reduced ? 0 : time * 14;
  const stride = Math.sin(cycle);
  const bounce = reduced ? 0 : Math.abs(Math.cos(cycle)) * 4;
  const oval = (cx, cy, rx, ry, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  };
  const path = (d, fill, stroke) => {
    const shape = new Path2D(d);
    ctx.fillStyle = fill; ctx.fill(shape);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(shape); }
  };
  const limb = (points, color, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => ctx.lineTo(...p)); ctx.stroke();
  };

  ctx.save();
  ctx.translate(x, ground);
  oval(0, 2, 43 - bounce, 9 - bounce * .4, '#25465d33');
  // Pequenos rastros dos passos, sem piscar ou efeitos de velocidade intensos.
  if (!reduced && time > 0) {
    for (let i = 0; i < 3; i++) {
      const age = (time * 3 + i / 3) % 1;
      ctx.globalAlpha = (1 - age) * .22;
      oval((i % 2 ? -1 : 1) * (21 + age * 10), 7 + age * 22, 6 + age * 5, 3, '#fff6dc');
    }
    ctx.globalAlpha = 1;
  }
  ctx.translate(0, -bounce);
  ctx.rotate(reduced ? 0 : lean + Math.sin(cycle) * .025);

  // Pernas alternadas: um pé apoia, o outro sobe mostrando a sola.
  for (const side of [-1, 1]) {
    const swing = stride * side;
    const lift = Math.max(0, swing) * 28;
    const footX = side * (21 + Math.max(0, -swing) * 5);
    const footY = -5 - lift;
    limb([[side * 14, -58], [side * 20, -31 - lift * .45], [footX, footY - 10]], '#1554cf', 13);
    ctx.save(); ctx.translate(footX, footY); ctx.rotate(side * (.10 + swing * .10));
    oval(0, -6, 16, 22 - lift * .12, '#be253f');
    path('M-16 -12 Q0 -20 16 -12 L17 4 Q0 13 -17 4 Z', '#f34750', '#aa2639');
    path('M-17 3 Q0 10 17 3 L16 10 Q0 17 -16 10 Z', '#f5f7ff');
    path('M-5 -19 L5 -19 L6 7 L-6 7 Z', '#fff');
    oval(0, -22, 13, 6, '#f6f9ff');
    if (lift > 5) {
      oval(0, 2, 13, 8 + lift * .12, '#34476b');
      limb([[-8, 2], [8, 2]], '#8290a7', 2);
      limb([[-6, 7], [6, 7]], '#8290a7', 2);
    }
    ctx.restore();
  }

  // Costas, espinhos inferiores e cauda: nenhuma face voltada à câmera.
  oval(0, -80, 30, 39, '#1553ce');
  path('M-24 -91 Q0 -108 24 -91 L33 -57 L12 -65 L0 -43 L-12 -65 L-33 -57 Z', '#2069ed', '#1547b6');
  path('M-8 -58 Q0 -68 8 -58 L0 -39 Z', '#4187fa');

  // Braços em oposição às pernas, com luvas brancas visíveis dos dois lados.
  for (const side of [-1, 1]) {
    const pump = -stride * side;
    const handY = -68 + pump * 15;
    const handX = side * (44 + pump * 3);
    limb([[side * 24, -98], [side * 40, -83 + pump * 6], [handX, handY]], '#b9805b', 11);
    limb([[side * 25, -99], [side * 40, -85 + pump * 6], [handX, handY - 2]], '#f0c69d', 8);
    ctx.save(); ctx.translate(handX, handY); ctx.rotate(side * -.24);
    oval(0, -6, 13, 7, '#dce8f7');
    oval(0, 3, 14, 17, '#fff');
    oval(-side * 10, 2, 6, 9, '#edf4fc');
    limb([[-5, 8], [-5, 12]], '#ccdaee', 2);
    limb([[1, 9], [1, 13]], '#ccdaee', 2);
    ctx.restore();
  }

  // Silhueta de Sonic por trás: orelhas e três pares de espinhos, simétricos.
  const lookPhase = time % 7;
  const glance = !reduced && lookPhase > 3.8 && lookPhase < 5.8
    ? Math.sin((lookPhase - 3.8) * Math.PI / 2) * (Math.floor(time / 7) % 2 ? -1 : 1) : 0;
  ctx.save();
  ctx.translate(glance * 8, -126);
  ctx.rotate(glance * .10);
  ctx.scale(1 - Math.abs(glance) * .08, 1);
  ctx.translate(0, 126);
  path('M-37 -137 L-39 -173 L-16 -154 M16 -154 L39 -173 L37 -137 Z', '#1754d6', '#123fa9');
  path('M-32 -151 L-33 -165 L-22 -154 M22 -154 L33 -165 L32 -151 Z', '#4c8afa');
  path('M0 -160 C-33 -164 -47 -145 -45 -126 L-66 -119 L-43 -102 L-57 -85 L-25 -88 L-29 -63 L0 -80 L29 -63 L25 -88 L57 -85 L43 -102 L66 -119 L45 -126 C47 -145 33 -164 0 -160 Z', '#1554d6', '#123fa9');
  path('M0 -156 C-29 -158 -41 -142 -39 -124 L-53 -119 L-28 -109 L-38 -92 L-10 -100 L0 -79 L10 -100 L38 -92 L28 -109 L53 -119 L39 -124 C41 -142 29 -158 0 -156 Z', '#2475f2');
  path('M-27 -143 Q0 -162 27 -143 Q7 -150 -7 -137 Z', '#5297ff');
  path('M-28 -117 L0 -126 L28 -117 L0 -100 Z', '#1b61df');
  // Um perfil aparece só durante a olhada; o corpo continua voltado à pista.
  if (Math.abs(glance) > .15) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (Math.abs(glance) - .15) * 2.5);
    ctx.scale(Math.sign(glance), 1);
    oval(38, -117, 17, 23, '#f0c69d');
    oval(38, -130, 12, 20, '#fff');
    oval(43, -129, 5, 13, '#199d65');
    oval(45, -129, 2.5, 10, '#173550');
    oval(54, -115, 8, 5, '#172b49');
    limb([[36, -104], [45, -102], [50, -106]], '#88513c', 2);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

// Comemoração frontal: Sonic olha para a criança, sorri e levanta o polegar.
export function drawSonicCheer(ctx, time, reduced = false) {
  ctx.clearRect(0, 0, 360, 240);
  const pulse = reduced ? 0 : Math.sin(time * 4);
  const oval = (x, y, rx, ry, fill) => {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
  };
  const shape = (d, fill, outline) => {
    const p = new Path2D(d); ctx.fillStyle = fill; ctx.fill(p);
    if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.stroke(p); }
  };
  ctx.save(); ctx.translate(162, 220);
  oval(0, 0, 60, 9, '#dbe6e9');
  ctx.translate(0, -3 - pulse * 3);
  ctx.rotate(pulse * .025);
  ctx.strokeStyle = '#205fe0'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14,-51); ctx.lineTo(-26,-12); ctx.moveTo(14,-51); ctx.lineTo(30,-12); ctx.stroke();
  oval(-29,-8,24,13,'#ec3e50'); oval(34,-8,24,13,'#ec3e50');
  shape('M-51 -4 L-7 -4 L-7 3 L-51 3 Z M12 -4 L57 -4 L57 3 L12 3 Z','#fff');
  shape('M-33 -20 L-23 -20 L-23 -2 L-33 -2 Z M27 -20 L37 -20 L37 -2 L27 -2 Z','#fff');
  oval(0,-69,34,44,'#2169eb'); oval(0,-67,20,29,'#f2c89f');
  ctx.strokeStyle = '#efc196'; ctx.lineWidth = 11;
  ctx.beginPath(); ctx.moveTo(-26,-88); ctx.lineTo(-47,-60); ctx.lineTo(-51,-43); ctx.stroke();
  oval(-51,-42,14,16,'#fff');
  // Espinhos e orelhas atrás do rosto.
  shape('M-33 -153 L-45 -193 L-12 -173 L18 -176 L44 -195 L42 -155 L62 -142 L42 -126 L52 -105 L25 -110 L0 -92 L-30 -109 L-58 -105 L-45 -132 L-64 -147 Z','#1556d6','#1444a5');
  oval(0,-144,48,43,'#2876ed');
  shape('M-33 -170 L-35 -182 L-22 -173 Z M28 -173 L37 -184 L35 -166 Z','#f0c69d');
  oval(-13,-143,18,26,'#fff'); oval(15,-143,18,26,'#fff');
  oval(-7,-139,6,17,'#189b62'); oval(20,-139,6,17,'#189b62');
  oval(-5,-138,3,13,'#17304d'); oval(22,-138,3,13,'#17304d');
  oval(0,-120,37,20,'#f3cba3'); oval(6,-129,10,7,'#172b47');
  shape('M-14 -115 Q5 -103 24 -117 Q7 -92 -14 -115 Z','#754338');
  shape('M-10 -114 Q6 -106 19 -115 L15 -108 Q2 -104 -10 -114 Z','#fff');
  // Braço e mão à frente: polegar claramente apontado para cima.
  ctx.save(); ctx.translate(35,-82); ctx.rotate(reduced ? -.08 : -.08 + pulse * .07);
  ctx.strokeStyle = '#efc196'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(22,3); ctx.lineTo(38,-26); ctx.stroke();
  oval(38,-26,15,8,'#dfeafb');
  shape('M25 -29 L25 -52 Q18 -57 18 -65 L18 -82 Q19 -90 26 -90 Q34 -89 34 -79 L35 -64 Q37 -60 44 -60 L59 -60 Q70 -60 70 -49 L66 -27 Q64 -19 53 -19 L36 -20 Z','#fff','#b9cce7');
  ctx.strokeStyle = '#c7d6eb'; ctx.lineWidth = 2;
  for (const y of [-49,-40,-31]) {ctx.beginPath();ctx.moveTo(53,y);ctx.lineTo(66,y);ctx.stroke();}
  ctx.restore();
  for (const [x,y] of [[-96,-147 + pulse*3],[110,-175 - pulse*3]]) {
    ctx.save(); ctx.translate(x,y);
    shape('M0 -13 L4 -4 L13 0 L4 4 L0 13 L-4 4 L-13 0 L-4 -4 Z','#d6a622');
    ctx.restore();
  }
  ctx.restore();
}
