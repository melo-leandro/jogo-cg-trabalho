import * as THREE from "three";

const TAM = 256;

function novoCanvas(tamanho = TAM) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = tamanho;
  return { canvas, ctx: canvas.getContext("2d") };
}

function textura(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------- símbolos dos pedestais ----------
const desenhos = {
  sol(ctx) {
    ctx.beginPath();
    ctx.arc(128, 128, 34, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 50, 128 + Math.sin(a) * 50);
      ctx.lineTo(128 + Math.cos(a) * 78, 128 + Math.sin(a) * 78);
      ctx.stroke();
    }
  },
  gota(ctx) {
    ctx.beginPath();
    ctx.moveTo(128, 46);
    ctx.bezierCurveTo(150, 92, 184, 120, 184, 158);
    ctx.arc(128, 158, 56, 0, Math.PI);
    ctx.bezierCurveTo(72, 120, 106, 92, 128, 46);
    ctx.stroke();
  },
  montanha(ctx) {
    ctx.beginPath();
    ctx.moveTo(40, 190);
    ctx.lineTo(104, 74);
    ctx.lineTo(150, 156);
    ctx.lineTo(170, 120);
    ctx.lineTo(216, 190);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(86, 108);
    ctx.lineTo(104, 122);
    ctx.lineTo(120, 104);
    ctx.stroke();
  },
  espiral(ctx) {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5.5; a += 0.05) {
      const r = 6 + a * 5.2;
      const x = 128 + Math.cos(a) * r;
      const y = 128 + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

export const SIMBOLOS = Object.keys(desenhos);

export function texturaSimbolo(nome) {
  const pedra = novoCanvas();
  pedra.ctx.fillStyle = "#5e5a53";
  pedra.ctx.fillRect(0, 0, TAM, TAM);
  pedra.ctx.strokeStyle = "#3a3631";
  pedra.ctx.lineWidth = 6;
  pedra.ctx.strokeRect(10, 10, TAM - 20, TAM - 20);
  pedra.ctx.strokeStyle = "#2c2925";
  pedra.ctx.lineWidth = 12;
  pedra.ctx.lineCap = "round";
  pedra.ctx.lineJoin = "round";
  desenhos[nome](pedra.ctx);

  const luz = novoCanvas();
  luz.ctx.fillStyle = "black";
  luz.ctx.fillRect(0, 0, TAM, TAM);
  luz.ctx.strokeStyle = "white";
  luz.ctx.lineWidth = 12;
  luz.ctx.lineCap = "round";
  luz.ctx.lineJoin = "round";
  desenhos[nome](luz.ctx);

  return { mapa: textura(pedra.canvas), brilho: textura(luz.canvas) };
}

// ---------- rosa dos ventos ----------
export function texturaTampa() {
  const { canvas, ctx } = novoCanvas(512);
  const c = 256;
  ctx.fillStyle = "#6b6156";
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#3b342d";
  ctx.lineWidth = 6;
  for (const r of [240, 200, 60, 26]) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // estrela de 8 pontas
  ctx.fillStyle = "#8a7a62";
  ctx.strokeStyle = "#3b342d";
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const comprimento = i % 2 === 0 ? 196 : 120;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * comprimento, c + Math.sin(a) * comprimento);
    ctx.lineTo(c + Math.cos(a + 0.22) * 34, c + Math.sin(a + 0.22) * 34);
    ctx.lineTo(c, c);
    ctx.lineTo(c + Math.cos(a - 0.22) * 34, c + Math.sin(a - 0.22) * 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // junta entre as duas folhas da tampa
  ctx.strokeStyle = "#2a251f";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(c, 0);
  ctx.lineTo(c, 512);
  ctx.stroke();

  return textura(canvas);
}

// ---------- anel de runas em volta da escotilha ----------
export function texturaRunas(raioInterno, raioExterno) {
  const tamanho = 1024;
  const c = tamanho / 2;
  const escala = c / raioExterno;
  const rMeio = ((raioInterno + raioExterno) / 2) * escala;
  // runas desenhadas com traços (não dependem de fonte instalada no sistema)
  let semente = 11;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  const glifos = Array.from({ length: 12 }, () => {
    const pontos = () => [Math.round(aleatorio() * 2) - 1, Math.round(aleatorio() * 2) - 1];
    return [[0, -1], [0, 1], ...Array.from({ length: 2 }, () => [pontos(), pontos()])];
  });

  function desenhar(ctx, fundo, traco) {
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, tamanho, tamanho);
    ctx.strokeStyle = traco;
    ctx.fillStyle = traco;
    ctx.lineWidth = 5;
    for (const r of [raioInterno * escala + 10, raioExterno * escala - 10]) {
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineCap = "round";
    const quantidade = 36;
    const meia = 14;
    for (let i = 0; i < quantidade; i++) {
      const a = (i / quantidade) * Math.PI * 2;
      const [haste1, haste2, ...tracos] = glifos[i % glifos.length];
      ctx.save();
      ctx.translate(c + Math.cos(a) * rMeio, c + Math.sin(a) * rMeio);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(haste1[0] * meia, haste1[1] * meia);
      ctx.lineTo(haste2[0] * meia, haste2[1] * meia);
      for (const [p, q] of tracos) {
        ctx.moveTo(p[0] * meia * 0.8, p[1] * meia);
        ctx.lineTo(q[0] * meia * 0.8, q[1] * meia);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  const pedra = novoCanvas(tamanho);
  desenhar(pedra.ctx, "#4c4842", "#2c2925");
  const luz = novoCanvas(tamanho);
  desenhar(luz.ctx, "black", "white");
  return { mapa: textura(pedra.canvas), brilho: textura(luz.canvas) };
}

// ---------- redemoinho do portal ----------
export function texturaRedemoinho() {
  const { canvas, ctx } = novoCanvas(512);
  const c = 256;

  const fundo = ctx.createRadialGradient(c, c, 0, c, c, 256);
  fundo.addColorStop(0, "#ffffff");
  fundo.addColorStop(0.12, "#9fd4ff");
  fundo.addColorStop(0.45, "#2d5cff");
  fundo.addColorStop(0.85, "#120a5c");
  fundo.addColorStop(1, "#05031c");
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, 512, 512);

  // braços do redemoinho
  ctx.lineCap = "round";
  for (let braco = 0; braco < 5; braco++) {
    const fase = (braco / 5) * Math.PI * 2;
    ctx.strokeStyle = braco % 2 ? "rgba(140, 220, 255, 0.55)" : "rgba(200, 160, 255, 0.45)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    for (let t = 0; t < 1; t += 0.01) {
      const a = fase + t * Math.PI * 3;
      const r = 12 + t * 236;
      const x = c + Math.cos(a) * r;
      const y = c + Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // "estrelas"
  let semente = 3;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  ctx.fillStyle = "white";
  for (let i = 0; i < 160; i++) {
    const a = aleatorio() * Math.PI * 2;
    const r = Math.sqrt(aleatorio()) * 240;
    ctx.globalAlpha = 0.4 + aleatorio() * 0.6;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 1 + aleatorio() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const t = textura(canvas);
  t.center.set(0.5, 0.5); // para girar em torno do centro
  return t;
}

// gradiente vertical para a coluna de luz (opaco embaixo, some em cima)
export function texturaDegrade() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "black");
  g.addColorStop(0.7, "rgb(90, 90, 90)");
  g.addColorStop(1, "white");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return new THREE.CanvasTexture(canvas);
}
