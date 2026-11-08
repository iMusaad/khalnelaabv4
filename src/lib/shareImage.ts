import QRCode from "qrcode";
import { SITE } from "@/data/site";
import { getRoundsLabel } from "@/lib/matchLabels";
import type { WinnerType } from "@/types/game";

type ShareRoundStat = {
  winner: WinnerType;
};

export type ShareResultData = {
  isDraw: boolean;
  finalWinnerName: string;
  side1: string;
  side2: string;
  side1Score: number;
  side2Score: number;
  roundStats: ShareRoundStat[];
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.lineTo(x + width - r, y);

  ctx.quadraticCurveTo(x + width, y, x + width, y + r);

  ctx.lineTo(x + width, y + height - r);

  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);

  ctx.lineTo(x + r, y + height);

  ctx.quadraticCurveTo(x, y + height, x, y + height - r);

  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(x, y, x + r, y);

  ctx.closePath();
}

function getVisibleBounds(image: HTMLImageElement) {
  const full = {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) return full;

  ctx.drawImage(image, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return full;

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export async function createResultShareImage({
  isDraw,
  finalWinnerName,
  side1,
  side2,
  side1Score,
  side2Score,
  roundStats,
}: ShareResultData) {
  const canvas = document.createElement("canvas");

  canvas.width = 1080;
  canvas.height = 1350;

  const logo = await new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/logo.png";
  });

  const fontFamily =
    getComputedStyle(document.body).fontFamily || "Arial, sans-serif";

  try {
    await Promise.all([
      document.fonts.load(`700 40px ${fontFamily}`, "خل نلعب"),
      document.fonts.load(`500 28px ${fontFamily}`, "خل نلعب"),
    ]);
  } catch {}

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas غير مدعوم");
  }

  const { width, height } = canvas;

  const YELLOW = "#ffb21e";
  const INK = "#241339";
  const BG = "#130e28";
  const SURFACE = "#221a3f";
  const SURFACE_EDGE = "#140f29";
  const TEAM1 = "#ff5a5f";
  const TEAM1_EDGE = "#c2343a";
  const TEAM2 = "#2f9bff";
  const TEAM2_EDGE = "#1662b8";

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  const heroBottom = 560;

  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, 0, width, heroBottom);

  const steps = [1, 2, 1, 0, 1, 2, 3, 2, 1, 1, 0, 1, 2, 1, 0, 1, 2, 2];
  const stepWidth = width / steps.length;

  ctx.fillStyle = BG;
  steps.forEach((step, index) => {
    const stepHeight = 26 + step * 22;
    ctx.fillRect(
      Math.floor(index * stepWidth),
      heroBottom - stepHeight,
      Math.ceil(stepWidth) + 1,
      stepHeight,
    );
  });

  ctx.textAlign = "center";
  ctx.direction = "rtl";

  if (logo) {
    const bounds = getVisibleBounds(logo);
    const logoHeight = 190;
    const logoWidth = (bounds.width / bounds.height) * logoHeight;
    const logoX = (width - logoWidth) / 2;
    const logoY = 50;

    const outline = document.createElement("canvas");
    outline.width = Math.ceil(logoWidth) + 24;
    outline.height = Math.ceil(logoHeight) + 30;
    const outlineCtx = outline.getContext("2d");

    if (outlineCtx) {
      const offsets = [
        [-5, 0],
        [5, 0],
        [0, -5],
        [0, 5],
        [-4, -4],
        [4, -4],
        [-4, 4],
        [4, 4],
        [0, 10],
        [-4, 9],
        [4, 9],
      ];

      offsets.forEach(([dx, dy]) => {
        outlineCtx.drawImage(
          logo,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          12 + dx,
          12 + dy,
          logoWidth,
          logoHeight,
        );
      });

      outlineCtx.globalCompositeOperation = "source-in";
      outlineCtx.fillStyle = INK;
      outlineCtx.fillRect(0, 0, outline.width, outline.height);

      ctx.drawImage(outline, logoX - 12, logoY - 12);
    }

    ctx.drawImage(
      logo,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      logoX,
      logoY,
      logoWidth,
      logoHeight,
    );
  } else {
    ctx.fillStyle = INK;
    ctx.font = `900 64px ${fontFamily}`;
    ctx.fillText("خل نلعب", width / 2, 170);
  }

  ctx.fillStyle = INK;
  ctx.font = `900 84px ${fontFamily}`;
  ctx.fillText(isDraw ? "تعادل!" : "كفووو!", width / 2, 350);

  ctx.font = `900 42px ${fontFamily}`;
  ctx.fillStyle = "rgba(36,19,57,0.78)";
  ctx.fillText(
    isDraw ? "الفريقين قدّها" : `الفائز: ${finalWinnerName}`,
    width / 2,
    425,
    900,
  );

  const side1Leads = isDraw || side1Score > side2Score;
  const side2Leads = isDraw || side2Score > side1Score;

  function teamPanel(
    x: number,
    name: string,
    score: number,
    leads: boolean,
    fill: string,
    edge: string,
  ) {
    const y = 620;
    const panelWidth = 410;
    const panelHeight = 290;

    drawRoundedRect(ctx!, x, y + 12, panelWidth, panelHeight, 40);
    ctx!.fillStyle = leads ? edge : SURFACE_EDGE;
    ctx!.fill();

    drawRoundedRect(ctx!, x, y, panelWidth, panelHeight, 40);
    ctx!.fillStyle = leads ? fill : SURFACE;
    ctx!.fill();

    ctx!.fillStyle = leads ? "#ffffff" : fill;
    ctx!.font = `900 36px ${fontFamily}`;
    ctx!.fillText(name, x + panelWidth / 2, y + 78, panelWidth - 50);

    ctx!.fillStyle = leads ? "#ffffff" : "rgba(255,255,255,0.75)";
    ctx!.font = `900 130px ${fontFamily}`;
    ctx!.fillText(String(score), x + panelWidth / 2, y + 225);
  }

  teamPanel(570, side1 || "فريق 1", side1Score, side1Leads, TEAM1, TEAM1_EDGE);
  teamPanel(100, side2 || "فريق 2", side2Score, side2Leads, TEAM2, TEAM2_EDGE);

  const draws = roundStats.filter((stat) => stat.winner === "none").length;
  const roundText = getRoundsLabel(roundStats.length);
  const drawText =
    draws === 0 ? "بدون تعادل" : draws === 1 ? "تعادل واحد" : `${draws} تعادل`;

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `700 32px ${fontFamily}`;
  ctx.fillText(`${roundText}  ·  ${drawText}`, width / 2, 1000);

  const panelX = 170;
  const panelY = 1040;
  const panelWidth = 740;
  const panelHeight = 240;

  drawRoundedRect(ctx, panelX, panelY + 12, panelWidth, panelHeight, 36);
  ctx.fillStyle = "#c27700";
  ctx.fill();

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 36);
  ctx.fillStyle = "#ffc23d";
  ctx.fill();

  const qrBox = 196;
  const qrBoxX = panelX + 22;
  const qrBoxY = panelY + 22;

  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBox, qrBox, 20);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const qr = QRCode.create(SITE.url, {
    errorCorrectionLevel: "M",
  });
  const moduleCount = qr.modules.size;
  const qrPadding = 14;
  const cell = Math.floor((qrBox - qrPadding * 2) / moduleCount);
  const qrSize = cell * moduleCount;
  const qrX = qrBoxX + (qrBox - qrSize) / 2;
  const qrY = qrBoxY + (qrBox - qrSize) / 2;

  ctx.fillStyle = INK;

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.modules.get(row, col)) {
        ctx.fillRect(qrX + col * cell, qrY + row * cell, cell, cell);
      }
    }
  }

  const textCenter = (panelX + panelWidth + qrBoxX + qrBox) / 2;

  ctx.fillStyle = INK;
  ctx.font = `900 64px ${fontFamily}`;
  ctx.fillText("العبها الآن", textCenter, panelY + 118);

  ctx.font = `800 30px ${fontFamily}`;
  ctx.fillStyle = "rgba(36,19,57,0.7)";
  ctx.fillText(new URL(SITE.url).host, textCenter, panelY + 172);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", 1);
  });

  if (!blob) {
    throw new Error("فشل إنشاء صورة النتيجة");
  }

  return new File([blob], "khal-nelab-result.png", {
    type: "image/png",
  });
}
