import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
  flicker: number;
  flickerSpeed: number;
  phase: number;
}

const FIRE_COLORS = [
  "#e8522a",
  "#f06a1a",
  "#f5901a",
  "#f5ab18",
  "#f7c020",
  "#d43d1a",
];

export function FireBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createParticle = (yStart?: number): Particle => ({
      x: Math.random() * window.innerWidth,
      y: yStart !== undefined ? yStart : Math.random() * window.innerHeight,
      size: 1.5 + Math.random() * 3.5,
      speedY: 0.8 + Math.random() * 2.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: 0.3 + Math.random() * 0.5,
      color: FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)],
      flicker: Math.random(),
      flickerSpeed: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    });

    for (let i = 0; i < 100; i++) {
      particles.push(createParticle());
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y += p.speedY;
        p.phase += 0.02;
        p.x += p.speedX + Math.sin(p.phase) * 0.3;
        p.flicker += p.flickerSpeed;

        const currentOpacity =
          p.opacity * (0.7 + 0.3 * Math.sin(p.flicker * 5));

        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = currentOpacity * 0.3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
