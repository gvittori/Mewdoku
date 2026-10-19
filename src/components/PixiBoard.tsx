import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Level, CellState } from '../types';
import { REGION_COLORS, CAT_BREEDS } from '../utils/levels';

interface PixiBoardProps {
  level: Level;
  boardState: CellState[][];
  onCellClick: (r: number, c: number) => void;
  equippedBreed: string;
  conflicts: { rows: Set<number>; cols: Set<number>; regions: Set<number>; adjacencies: Set<string> };
  hintCell?: { r: number; c: number; timestamp: number } | null;
  wrongCatCell?: { r: number; c: number; timestamp: number } | null;
}

interface CellView {
  container: PIXI.Container;
  bgGraphics: PIXI.Graphics;
  hintGraphics: PIXI.Graphics;
  wrongGraphics: PIXI.Graphics;
  catContainer: PIXI.Container;
  catText: PIXI.Text;
  accText: PIXI.Text;
  crossGraphics: PIXI.Graphics;
  sparkleText: PIXI.Text;
  wrongXGraphics: PIXI.Graphics;
}

export const PixiBoard: React.FC<PixiBoardProps> = ({
  level,
  boardState,
  onCellClick,
  equippedBreed,
  conflicts,
  hintCell,
  wrongCatCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  // Animation metadata per cell
  const animMapRef = useRef<Map<string, { startTime: number; type: CellState }>>(new Map());
  const wiggleMapRef = useRef<Map<string, { nextWiggle: number; wiggleDuration: number }>>(new Map());

  const boardDataRef = useRef({
    boardState,
    conflicts,
    equippedBreed,
    level,
    onCellClick,
    hintCell,
    wrongCatCell,
  });

  useEffect(() => {
    boardDataRef.current = {
      boardState,
      conflicts,
      equippedBreed,
      level,
      onCellClick,
      hintCell,
      wrongCatCell,
    };
  }, [boardState, conflicts, equippedBreed, level, onCellClick, hintCell, wrongCatCell]);

  useEffect(() => {
    const now = performance.now();
    boardState.forEach((row, r) => {
      row.forEach((cell, c) => {
        const key = `${r},${c}`;
        const prev = animMapRef.current.get(key);
        if (!prev || prev.type !== cell) {
          if (cell !== 'empty') {
            animMapRef.current.set(key, { startTime: now, type: cell });
          } else {
            animMapRef.current.delete(key);
          }
        }
        if (cell === 'cat' && !wiggleMapRef.current.has(key)) {
          wiggleMapRef.current.set(key, {
            nextWiggle: now + 3000 + Math.random() * 2000,
            wiggleDuration: 0,
          });
        } else if (cell !== 'cat') {
          wiggleMapRef.current.delete(key);
        }
      });
    });
  }, [boardState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let app: PIXI.Application | null = null;
    let isMounted = true;

    async function initPixi() {
      app = new PIXI.Application();
      const containerWidth = container ? container.clientWidth || 360 : 360;
      const boardSize = Math.max(280, Math.min(containerWidth - 8, 380));

      await app.init({
        width: boardSize,
        height: boardSize,
        backgroundColor: 0xffffff,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!isMounted || !container) {
        app.destroy(true);
        return;
      }

      container.innerHTML = '';
      container.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      const n = level.size;
      const cellSize = boardSize / n;

      const boardContainer = new PIXI.Container();
      app.stage.addChild(boardContainer);

      // Pre-create cell views once to eliminate per-frame object allocation and GC overhead
      const cellViews: CellView[][] = [];

      for (let r = 0; r < n; r++) {
        cellViews[r] = [];
        for (let c = 0; c < n; c++) {
          const cellContainer = new PIXI.Container();
          cellContainer.x = c * cellSize;
          cellContainer.y = r * cellSize;

          const bgGraphics = new PIXI.Graphics();
          const hintGraphics = new PIXI.Graphics();
          const wrongGraphics = new PIXI.Graphics();

          const catContainer = new PIXI.Container();
          catContainer.x = cellSize / 2;
          catContainer.y = cellSize / 2;

          const catText = new PIXI.Text({
            text: '🐱',
            style: { fontSize: cellSize * 0.55, align: 'center' },
          });
          catText.anchor.set(0.5);
          catContainer.addChild(catText);

          const accText = new PIXI.Text({
            text: '',
            style: { fontSize: cellSize * 0.3 },
          });
          accText.anchor.set(0.5);
          accText.x = -cellSize * 0.2;
          accText.y = -cellSize * 0.25;
          catContainer.addChild(accText);

          const crossGraphics = new PIXI.Graphics();
          crossGraphics.x = cellSize / 2;
          crossGraphics.y = cellSize / 2;

          const sparkleText = new PIXI.Text({
            text: '✨',
            style: { fontSize: cellSize * 0.45, align: 'center' },
          });
          sparkleText.anchor.set(0.5);
          sparkleText.x = cellSize / 2;
          sparkleText.y = cellSize / 2;

          const wrongXGraphics = new PIXI.Graphics();
          wrongXGraphics.x = cellSize / 2;
          wrongXGraphics.y = cellSize / 2;

          cellContainer.addChild(bgGraphics);
          cellContainer.addChild(hintGraphics);
          cellContainer.addChild(wrongGraphics);
          cellContainer.addChild(catContainer);
          cellContainer.addChild(crossGraphics);
          cellContainer.addChild(sparkleText);
          cellContainer.addChild(wrongXGraphics);

          // Hit area for interaction
          const hitArea = new PIXI.Graphics();
          hitArea.rect(0, 0, cellSize, cellSize);
          hitArea.fill({ color: 0x000000, alpha: 0 });
          hitArea.eventMode = 'static';
          hitArea.cursor = 'pointer';

          const rowIdx = r;
          const colIdx = c;
          hitArea.on('pointerdown', () => {
            boardDataRef.current.onCellClick(rowIdx, colIdx);
          });
          cellContainer.addChild(hitArea);

          boardContainer.addChild(cellContainer);

          cellViews[r][c] = {
            container: cellContainer,
            bgGraphics,
            hintGraphics,
            wrongGraphics,
            catContainer,
            catText,
            accText,
            crossGraphics,
            sparkleText,
            wrongXGraphics,
          };
        }
      }

      app.ticker.add((ticker) => {
        if (!isMounted) return;
        const currentData = boardDataRef.current;
        const { boardState: state, conflicts: conf, equippedBreed: breedId, hintCell: activeHint, wrongCatCell: activeWrong, level: currentLevel } = currentData;
        const breed = CAT_BREEDS.find((b) => b.id === breedId) || CAT_BREEDS[0];
        const now = performance.now();
        const activeSize = currentLevel.size;

        for (let r = 0; r < activeSize; r++) {
          for (let c = 0; c < activeSize; c++) {
            const view = cellViews[r] && cellViews[r][c];
            if (!view) continue;

            const regionId = currentLevel.regions[r][c];
            const cellState = (state[r] && state[r][c]) || 'empty';
            const key = `${r},${c}`;

            // 1. Background & Border
            const baseColor = parseInt(REGION_COLORS[regionId % REGION_COLORS.length].replace('#', ''), 16);
            const hasConflict =
              (cellState === 'cat' &&
                (conf.rows.has(r) || conf.cols.has(c) || conf.regions.has(regionId) || conf.adjacencies.has(`${r},${c}`)));

            const fillColor = hasConflict ? 0xfecaca : baseColor;
            const alpha = hasConflict ? 0.9 : 0.75;

            view.bgGraphics.clear();
            view.bgGraphics.roundRect(1.5, 1.5, cellSize - 3, cellSize - 3, 7);
            view.bgGraphics.fill({ color: fillColor, alpha });
            view.bgGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });

            // 2. Hint Glow & Sparkle
            if (activeHint && activeHint.r === r && activeHint.c === c) {
              const hintElapsed = now - activeHint.timestamp;
              if (hintElapsed < 2600) {
                const hintProgress = hintElapsed / 2600;
                const alphaWave = (1 - hintProgress) * (0.7 + 0.3 * Math.sin(hintElapsed * 0.01));

                view.hintGraphics.clear();
                view.hintGraphics.roundRect(1.5, 1.5, cellSize - 3, cellSize - 3, 7);
                view.hintGraphics.fill({ color: 0xfef08a, alpha: alphaWave * 0.5 });
                view.hintGraphics.stroke({ width: 3, color: 0xf59e0b, alpha: alphaWave * 0.95 });
                view.hintGraphics.visible = true;

                if (cellState === 'empty') {
                  view.sparkleText.alpha = alphaWave;
                  view.sparkleText.visible = true;
                } else {
                  view.sparkleText.visible = false;
                }
              } else {
                view.hintGraphics.clear();
                view.hintGraphics.visible = false;
                view.sparkleText.visible = false;
              }
            } else {
              view.hintGraphics.clear();
              view.hintGraphics.visible = false;
              view.sparkleText.visible = false;
            }

            // 3. Wrong Cat Red X Animation
            if (activeWrong && activeWrong.r === r && activeWrong.c === c) {
              const wrongElapsed = now - activeWrong.timestamp;
              if (wrongElapsed < 1600) {
                const progress = wrongElapsed / 1600;
                const alphaX = Math.max(0, 1 - progress);
                const popScale = Math.min(1.25, 0.7 + 0.55 * Math.sin(Math.min(1, progress * 3) * Math.PI / 2));

                view.wrongGraphics.clear();
                view.wrongGraphics.roundRect(1.5, 1.5, cellSize - 3, cellSize - 3, 7);
                view.wrongGraphics.fill({ color: 0xfee2e2, alpha: alphaX * 0.75 });
                view.wrongGraphics.stroke({ width: 3, color: 0xef4444, alpha: alphaX });
                view.wrongGraphics.visible = true;

                view.wrongXGraphics.clear();
                const pad = cellSize * 0.22;
                view.wrongXGraphics.moveTo(-cellSize / 2 + pad, -cellSize / 2 + pad);
                view.wrongXGraphics.lineTo(cellSize / 2 - pad, cellSize / 2 - pad);
                view.wrongXGraphics.moveTo(cellSize / 2 - pad, -cellSize / 2 + pad);
                view.wrongXGraphics.lineTo(-cellSize / 2 + pad, cellSize / 2 - pad);
                view.wrongXGraphics.stroke({ width: 5, color: 0xdc2626, alpha: alphaX });
                view.wrongXGraphics.scale.set(popScale);
                view.wrongXGraphics.visible = true;
              } else {
                view.wrongGraphics.clear();
                view.wrongGraphics.visible = false;
                view.wrongXGraphics.clear();
                view.wrongXGraphics.visible = false;
              }
            } else {
              view.wrongGraphics.clear();
              view.wrongGraphics.visible = false;
              view.wrongXGraphics.clear();
              view.wrongXGraphics.visible = false;
            }

            // 4. Click Pop Animation & Wiggle
            const anim = animMapRef.current.get(key);
            let scaleMultiplier = 1;
            if (anim) {
              const elapsed = now - anim.startTime;
              const duration = 200;
              if (elapsed < duration) {
                const progress = elapsed / duration;
                scaleMultiplier = 0.4 + 0.6 * Math.sin(progress * Math.PI * 0.75) * 1.1;
                if (scaleMultiplier > 1.05) scaleMultiplier = 1.05;
              }
            }

            if (cellState === 'cat') {
              view.crossGraphics.clear();
              view.crossGraphics.visible = false;

              let wiggleAngle = 0;
              let wiggleScale = 1;
              const wiggleData = wiggleMapRef.current.get(key);
              if (wiggleData) {
                if (now >= wiggleData.nextWiggle) {
                  wiggleData.wiggleDuration = 500;
                  wiggleData.nextWiggle = now + 3000 + Math.random() * 2000;
                }
                if (wiggleData.wiggleDuration > 0) {
                  wiggleData.wiggleDuration -= ticker.deltaMS;
                  wiggleAngle = Math.sin(now * 0.03) * 0.15;
                  wiggleScale = 1 + Math.sin(now * 0.04) * 0.1;
                }
              }

              view.catText.text = breed.icon || '🐱';
              view.catText.style.fontSize = cellSize * 0.55;

              if (breed.accessory) {
                view.accText.text = breed.accessory;
                view.accText.style.fontSize = cellSize * 0.3;
                view.accText.visible = true;
              } else {
                view.accText.visible = false;
              }

              view.catContainer.scale.set(scaleMultiplier * wiggleScale);
              view.catContainer.rotation = wiggleAngle;
              view.catContainer.visible = true;
            } else if (cellState === 'cross') {
              view.catContainer.visible = false;

              view.crossGraphics.clear();
              const padding = cellSize * 0.25;
              view.crossGraphics.moveTo(-cellSize / 2 + padding, -cellSize / 2 + padding);
              view.crossGraphics.lineTo(cellSize / 2 - padding, cellSize / 2 - padding);
              view.crossGraphics.moveTo(cellSize / 2 - padding, -cellSize / 2 + padding);
              view.crossGraphics.lineTo(-cellSize / 2 + padding, cellSize / 2 - padding);
              view.crossGraphics.stroke({ width: 8, color: 0xffffff, alpha: 1.0, cap: 'round', join: 'round' });
              view.crossGraphics.scale.set(scaleMultiplier);
              view.crossGraphics.visible = true;
            } else {
              view.catContainer.visible = false;
              view.crossGraphics.clear();
              view.crossGraphics.visible = false;
            }
          }
        }
      });
    }

    initPixi();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [level]);

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow-lg bg-white p-1 border-2 border-orange-100" />
    </div>
  );
};
