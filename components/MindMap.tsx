
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MindMapEdge } from '../types';
import { RefreshCw, Sparkles, Share2 } from 'lucide-react';
import { analyzeDoubtsConnections } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

interface Node {
    id: string;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
}

interface MindMapProps {
    messages: ChatMessage[];
}

const MindMap: React.FC<MindMapProps> = ({ messages }) => {
    const { mindMapEdges, setMindMapEdges } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const nodesRef = useRef<Node[]>([]);
    const edgesRef = useRef<MindMapEdge[]>(mindMapEdges);
    const animationRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);
    const draggedNodeRef = useRef<Node | null>(null);
    
    // Track previous message count to detect new additions
    const prevMsgCountRef = useRef(0);

    // Filter only user messages for the graph
    const userMessages = messages.filter(m => m.role === 'user');

    // Sync edges ref with state
    useEffect(() => {
        edgesRef.current = mindMapEdges;
    }, [mindMapEdges]);

    // Auto-analyze when new messages are added
    useEffect(() => {
        const currentCount = userMessages.length;
        const prevCount = prevMsgCountRef.current;

        // Check if a NEW message was added (count increased)
        if (currentCount > prevCount && currentCount >= 2) {
            console.log("New doubt detected, updating graph...");
            // Debounce slightly to allow UI to settle
            const timer = setTimeout(() => {
                updateGraph();
            }, 1000);
            prevMsgCountRef.current = currentCount;
            return () => clearTimeout(timer);
        }
        
        // Initial load check (if we have messages but no edges yet)
        if (currentCount >= 2 && mindMapEdges.length === 0 && !isAnalyzing && prevCount === 0) {
             const timer = setTimeout(() => {
                updateGraph();
            }, 1000);
            prevMsgCountRef.current = currentCount;
            return () => clearTimeout(timer);
        }

        prevMsgCountRef.current = currentCount;
    }, [userMessages.length, mindMapEdges.length]);

    // Initialize Nodes (create nodes immediately for new messages)
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 600;

        // Colors for nodes (Nature inspired palette)
        const colors = ['#74C69D', '#52B788', '#40916C', '#2D6A4F', '#95D5B2', '#D8F3DC'];

        // Create nodes for new messages, preserving existing positions
        const currentNodes = nodesRef.current;
        const newNodes: Node[] = userMessages.map((msg, i) => {
            const existing = currentNodes.find(n => n.id === msg.id);
            if (existing) return existing;

            // Spiral initialization for better distribution
            const angle = i * 0.5;
            const radius = 50 + i * 5;

            return {
                id: msg.id,
                text: msg.text,
                x: (width / 2) + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
                y: (height / 2) + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
                vx: 0,
                vy: 0,
                radius: Math.min(25, Math.max(10, msg.text.length / 2.5)), // Dynamic size based on text length
                color: colors[i % colors.length]
            };
        });
        nodesRef.current = newNodes;
    }, [userMessages]);

    const updateGraph = async () => {
        if (userMessages.length < 2) return;
        
        setIsAnalyzing(true);
        try {
            const edges = await analyzeDoubtsConnections(messages);
            setMindMapEdges(edges);
            // Note: edgesRef is updated via the useEffect above
        } catch (e) {
            console.error("Failed to update graph", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Physics Simulation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            // DPI Handling
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }
            
            ctx.resetTransform();
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            const isDark = document.documentElement.classList.contains('dark');

            // Clear with trail effect (optional, disabled for cleanliness)
            ctx.clearRect(0, 0, width, height);

            const nodes = nodesRef.current;
            const edges = edgesRef.current;

            // --- Physics Constants ---
            const repulsion = 600; // Repel nodes
            const springLength = 120; // Ideal distance for connected nodes
            const springStrength = 0.05; // Pull strength
            const friction = 0.90; // Damping
            const centeringForce = 0.001; // Keep graph in center

            // 1. Apply Forces
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node === draggedNodeRef.current) continue;

                // Center Attraction (Gravity)
                node.vx += (width/2 - node.x) * centeringForce;
                node.vy += (height/2 - node.y) * centeringForce;

                // Node Repulsion (Coulomb's Law)
                for (let j = 0; j < nodes.length; j++) {
                    if (i === j) continue;
                    const other = nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist === 0) dist = 1;

                    const force = repulsion / (dist * dist);
                    node.vx += (dx / dist) * force;
                    node.vy += (dy / dist) * force;
                }
            }

            // Spring Attraction (Hooke's Law)
            edges.forEach(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    const displacement = dist - springLength;
                    const force = displacement * springStrength;

                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (source !== draggedNodeRef.current) {
                        source.vx += fx;
                        source.vy += fy;
                    }
                    if (target !== draggedNodeRef.current) {
                        target.vx -= fx;
                        target.vy -= fy;
                    }
                }
            });

            // 2. Draw Links (Edges)
            ctx.strokeStyle = isDark ? 'rgba(116, 198, 157, 0.2)' : 'rgba(52, 78, 65, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            edges.forEach(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (source && target) {
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                }
            });
            ctx.stroke();

            // 3. Update Positions & Draw Nodes
            nodes.forEach(node => {
                // Physics integration
                if (node !== draggedNodeRef.current) {
                    node.x += node.vx;
                    node.y += node.vy;
                    node.vx *= friction;
                    node.vy *= friction;
                }

                // Wall Bounce / Boundary
                const padding = node.radius + 10;
                if (node.x < padding) { node.x = padding; node.vx *= -1; }
                if (node.x > width - padding) { node.x = width - padding; node.vx *= -1; }
                if (node.y < padding) { node.y = padding; node.vy *= -1; }
                if (node.y > height - padding) { node.y = height - padding; node.vy *= -1; }

                const isHovered = hoveredNode?.id === node.id;
                
                // Draw Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Node Glow/Stroke
                ctx.strokeStyle = isDark ? '#fff' : '#fff';
                ctx.lineWidth = isHovered ? 3 : 1.5;
                ctx.stroke();

                if (isHovered) {
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 15;
                } else {
                    ctx.shadowBlur = 0;
                }

                // Text Label (Only close ones or hovered)
                // Always show if node is large enough
                if (isHovered || node.radius > 15) {
                    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';
                    ctx.font = isHovered ? '700 12px "Nunito Sans"' : '600 10px "Nunito Sans"';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const label = node.text.length > 15 ? node.text.substring(0, 12) + '...' : node.text;
                    ctx.fillText(label, node.x, node.y + node.radius + 12);
                }
            });

            animationRef.current = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationRef.current);
    }, [hoveredNode]); 

    // --- Interaction Handlers ---
    const getMousePos = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);
        setMousePos({ x: e.clientX, y: e.clientY });

        if (isDraggingRef.current && draggedNodeRef.current) {
            draggedNodeRef.current.x = x;
            draggedNodeRef.current.y = y;
            draggedNodeRef.current.vx = 0;
            draggedNodeRef.current.vy = 0;
            return;
        }

        const hit = nodesRef.current.find(node => {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            return dist < node.radius + 5;
        });

        if (hit !== hoveredNode) {
            setHoveredNode(hit || null);
        }
        canvasRef.current!.style.cursor = hit ? 'grab' : 'default';
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);
        const hit = nodesRef.current.find(node => {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            return dist < node.radius + 5;
        });
        
        if (hit) {
            isDraggingRef.current = true;
            draggedNodeRef.current = hit;
            canvasRef.current!.style.cursor = 'grabbing';
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        draggedNodeRef.current = null;
        canvasRef.current!.style.cursor = hoveredNode ? 'grab' : 'default';
    };

    if (userMessages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fadeIn">
                <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-full mb-4">
                    <Share2 size={40} className="text-accent opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">Your Mind Map is Empty</h3>
                <p className="text-sm text-gray-500 max-w-xs text-center">Ask Lumyn questions in the Chat to automatically generate your knowledge graph.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col bg-white/30 dark:bg-black/20">
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-gray-500 flex items-center gap-2 shadow-sm">
                   <span className="w-2 h-2 rounded-full bg-accent"></span>
                   {nodesRef.current.length} Concepts
                </div>
                <button 
                    onClick={updateGraph}
                    disabled={isAnalyzing || userMessages.length < 2}
                    className="bg-accent hover:bg-green-600 text-white backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={14} className={isAnalyzing ? "animate-spin" : ""} />
                    {isAnalyzing ? "Analyzing..." : "Update Graph"}
                </button>
            </div>

            <canvas 
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Custom Tooltip Overlay */}
            {hoveredNode && (
                <div 
                    className="fixed pointer-events-none z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-accent/20 max-w-xs animate-fadeIn ring-1 ring-black/5"
                    style={{ 
                        top: mousePos.y + 20, 
                        left: mousePos.x + 20,
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{background: hoveredNode.color}}></div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Concept Node</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">"{hoveredNode.text}"</p>
                </div>
            )}
        </div>
    );
};

export default MindMap;
