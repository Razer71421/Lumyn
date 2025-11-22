
import React, { useEffect, useRef } from 'react';

const InteractiveOrb: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.parentElement?.clientWidth || 300;
        let height = canvas.parentElement?.clientHeight || 300;
        
        // Set resolution
        canvas.width = width;
        canvas.height = height;

        // Particles
        const particles: { x: number; y: number; z: number; size: number }[] = [];
        const particleCount = 60;
        const radius = Math.min(width, height) / 3;

        // Initialize particles on a sphere
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            particles.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
                size: Math.random() * 2 + 1
            });
        }

        let angleX = 0;
        let angleY = 0;
        let targetAngleX = 0;
        let targetAngleY = 0;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left - width / 2;
            mouseY = e.clientY - rect.top - height / 2;
            
            targetAngleY = mouseX * 0.0001;
            targetAngleX = mouseY * 0.0001;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Smooth rotation
            angleX += (targetAngleX - angleX) * 0.05;
            angleY += (targetAngleY - angleY) * 0.05;
            
            // Auto rotation if idle
            if (Math.abs(targetAngleX) < 0.00001 && Math.abs(targetAngleY) < 0.00001) {
                angleY += 0.002;
                angleX += 0.001;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            // Get theme colors
            const isDark = document.documentElement.classList.contains('dark');
            const particleColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(52, 78, 65, 0.8)'; // text color
            const lineColor = isDark ? 'rgba(116, 198, 157, 0.15)' : 'rgba(116, 198, 157, 0.25)'; // accent with opacity

            // Project and draw particles
            const projectedParticles = particles.map(p => {
                // Rotate X
                let y = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
                let z = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
                let x = p.x;

                // Rotate Y
                let x2 = x * Math.cos(angleY) - z * Math.sin(angleY);
                let z2 = x * Math.sin(angleY) + z * Math.cos(angleY);
                
                // Perspective projection
                const scale = 300 / (300 + z2);
                const x2d = x2 * scale + centerX;
                const y2d = y * scale + centerY;

                return { x: x2d, y: y2d, z: z2, scale, size: p.size };
            });

            // Draw connections
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < projectedParticles.length; i++) {
                for (let j = i + 1; j < projectedParticles.length; j++) {
                    const p1 = projectedParticles[i];
                    const p2 = projectedParticles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 70) {
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
            ctx.stroke();

            // Draw particles
            projectedParticles.forEach(p => {
                const alpha = Math.max(0.1, (p.z + radius) / (2 * radius)); // Depth fog
                ctx.fillStyle = particleColor;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = canvas.parentElement?.clientWidth || 300;
            height = canvas.parentElement?.clientHeight || 300;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl cursor-pointer group">
            <canvas ref={canvasRef} className="transition-transform duration-500 group-hover:scale-105" />
        </div>
    );
};

export default InteractiveOrb;
