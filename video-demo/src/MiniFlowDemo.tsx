import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
    Sequence,
    Audio,
} from 'remotion';
import {
    Zap, Globe, Terminal, GitBranch, Clock, Flag, LayoutGrid,
    CheckCircle2, PlayCircle, Loader2, Plus, Package, MousePointer2
} from 'lucide-react';

const COLORS = {
    bgApp: '#0b1020',
    bgCanvas: '#070b14',
    text: '#e6edf3',
    nodeBg: 'rgba(16, 22, 40, 0.95)',
    nodeBorder: 'rgba(255, 255, 255, 0.14)',
    edgeLine: 'rgba(230, 237, 243, 0.55)',
    handle: 'rgba(120, 180, 255, 0.95)',

    // Node Colors
    start: '#28b478',
    http: '#65e6c5',
    command: '#a78bfa',
    conditional: '#f5a623',
    timer: '#78b4ff',
    end: '#a3ffb0',
    success: '#10b981',
    error: '#ef4444',

    parallelBg: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
};

// ── Dashboard UI Components ──

const DashboardTopbar: React.FC<{ frame: number }> = ({ frame }) => {
    const yOffset = spring({ frame, fps: 30, config: { damping: 15 } });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '40px 60px', width: '100%',
            transform: `translateY(${interpolate(yOffset, [0, 1], [-50, 0])}px)`,
            opacity: interpolate(yOffset, [0, 1], [0, 1])
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#78b4ff', letterSpacing: '-0.5px' }}>MINIFLOW</span>
                <span style={{ opacity: 0.2, fontSize: 24 }}>/</span>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: COLORS.text }}>Tus Workflows</h1>
            </div>

            {/* Primary Gradient Button */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                fontSize: 16, fontWeight: 700, color: '#0b1020',
                background: 'linear-gradient(135deg, #78b4ff, #a78bfa)',
                borderRadius: 14, boxShadow: '0 8px 30px rgba(120, 180, 255, 0.3)',
                transform: `scale(${spring({ frame: frame - 20, fps: 30, config: { stiffness: 300 } })})`
            }}>
                <Plus size={20} /> Crear Nuevo
            </div>
        </div>
    );
};

const EmptyStateIcon: React.FC<{ frame: number }> = ({ frame }) => {
    const pop = spring({ frame, fps: 30, config: { damping: 12 } });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 100 }}>
            <div style={{ transform: `scale(${pop})`, opacity: 0.3, color: COLORS.text }}>
                <Package size={100} strokeWidth={1} />
            </div>
            <p style={{
                fontSize: 24, opacity: interpolate(pop, [0, 1], [0, 0.5]),
                color: COLORS.text, maxWidth: 400, textAlign: 'center', lineHeight: 1.5
            }}>
                Aún no tienes workflows. Empieza a automatizar con MINIFLOW.
            </p>
        </div>
    );
};

// ── Node & Editor UI Components ──

const StatusPill: React.FC<{ frame: number }> = ({ frame }) => {
    const isRunning = frame >= 300 && frame < 650;
    const isSuccess = frame >= 650;

    let bg = 'rgba(255, 255, 255, 0.04)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';
    let color = COLORS.text;
    let Icon = PlayCircle;
    let text = "IDLE";

    if (isRunning) {
        bg = 'rgba(120, 180, 255, 0.1)';
        borderColor = 'rgba(120, 180, 255, 0.3)';
        color = '#78b4ff';
        Icon = Loader2;
        text = "RUNNING...";
    } else if (isSuccess) {
        bg = 'rgba(16, 185, 129, 0.1)';
        borderColor = 'rgba(16, 185, 129, 0.3)';
        color = COLORS.success;
        Icon = CheckCircle2;
        text = "SUCCESS";
    }

    const pulse = isRunning ? Math.sin(frame / 5) * 0.2 + 0.8 : 1;
    const rotation = isRunning ? (frame * 10) % 360 : 0;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 20,
            background: bg, border: `1px solid ${borderColor}`,
            color: color, fontSize: 13, fontWeight: 700,
            transition: 'all 0.3s ease',
            boxShadow: isRunning ? `0 0 20px ${borderColor}` : isSuccess ? `0 0 30px ${borderColor}` : 'none',
            transform: `scale(${pulse})`
        }}>
            <Icon size={16} style={{ transform: `rotate(${rotation}deg)` }} />
            {text}
            {isSuccess && <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 11 }}>142ms</span>}
        </div>
    );
};

const StandardNode: React.FC<{
    title: string; label: string; hint: string;
    frame: number; delay: number; color: string;
    icon: React.ReactNode; active?: boolean; width?: number
}> = ({ title, label, hint, frame, delay, color, icon, active, width = 220 }) => {
    const yOffset = spring({ frame: frame - delay, fps: 30, config: { damping: 15 } });

    return (
        <div style={{
            opacity: interpolate(yOffset, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(yOffset, [0, 1], [40, 0])}px) scale(${active ? 1.05 : 1})`,
            padding: '14px 16px 12px',
            borderRadius: 14,
            border: `1px solid ${active ? color : COLORS.nodeBorder}`,
            borderLeft: `3px solid ${color}`,
            background: COLORS.nodeBg,
            boxShadow: active ? `0 0 30px ${color}44` : '0 10px 30px rgba(0, 0, 0, 0.35)',
            width: width,
            display: 'flex', flexDirection: 'column', position: 'relative',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ position: 'absolute', right: -6, top: '50%', marginTop: -5, width: 10, height: 10, background: COLORS.handle, border: '2px solid rgba(0,0,0,0.35)', borderRadius: '50%', boxShadow: active ? `0 0 10px ${COLORS.handle}` : 'none' }} />
            <div style={{ position: 'absolute', left: -6, top: '50%', marginTop: -5, width: 10, height: 10, background: '#1e293b', border: '2px solid #64748b', borderRadius: '50%' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: color, fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>
                {icon} {title}
            </div>
            <span style={{ marginTop: 6, fontSize: 14, lineHeight: 1.3, fontWeight: 600, color: COLORS.text }}>{label}</span>
            <span style={{ marginTop: 10, fontSize: 11, opacity: 0.55, fontFamily: 'monospace', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>{hint}</span>
        </div>
    );
};

const ConditionalNode: React.FC<{ frame: number; delay: number; active?: boolean }> = ({ frame, delay, active }) => {
    const pop = spring({ frame: frame - delay, fps: 30, config: { damping: 14 } });
    return (
        <div style={{
            opacity: interpolate(pop, [0, 1], [0, 1]),
            transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])}) scale(${active ? 1.05 : 1})`,
            padding: '14px 16px', borderRadius: 14,
            border: `1px solid ${active ? COLORS.conditional : COLORS.nodeBorder}`,
            borderLeft: `3px solid ${COLORS.conditional}`, background: COLORS.nodeBg,
            boxShadow: active ? `0 0 30px ${COLORS.conditional}44` : '0 10px 30px rgba(0, 0, 0, 0.35)',
            width: 220, position: 'relative'
        }}>
            <div style={{ position: 'absolute', right: -6, top: '38%', width: 10, height: 10, background: COLORS.start, border: `2px solid ${COLORS.start}`, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: -6, top: '75%', width: 10, height: 10, background: '#d23750', border: `2px solid #d23750`, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', left: -6, top: '50%', width: 10, height: 10, background: '#1e293b', border: '2px solid #64748b', borderRadius: '50%' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.conditional, fontSize: 10, fontWeight: 800 }}>
                <GitBranch size={13} /> CONDITIONAL
            </div>
            <span style={{ display: 'block', marginTop: 6, fontSize: 14, fontWeight: 600, color: COLORS.text }}>Evaluar Riesgo</span>
            <span style={{ display: 'block', marginTop: 10, fontSize: 11, opacity: 0.55, fontFamily: 'monospace', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                {"score > 0.85"}
            </span>
        </div>
    );
};

const TimerCircleNode: React.FC<{ frame: number; delay: number; active?: boolean }> = ({ frame, delay, active }) => {
    const pop = spring({ frame: frame - delay, fps: 30, config: { stiffness: 100, damping: 10 } });
    const progress = active ? spring({ frame: frame - delay - 200, fps: 30, config: { damping: 200 } }) : 0;

    return (
        <div style={{
            opacity: Math.min(1, Math.max(0, frame - delay)),
            transform: `scale(${pop}) scale(${active ? 1.1 : 1})`,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(14, 20, 36, 0.85)',
            border: `1px solid ${active ? COLORS.timer : 'rgba(255, 255, 255, 0.05)'}`,
            boxShadow: active ? `0 0 20px ${COLORS.timer}66` : '0 4px 6px -1px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', left: -4, top: '50%', marginTop: -5, width: 10, height: 10, background: COLORS.timer, border: '2px solid #0e1424', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: -4, top: '50%', marginTop: -5, width: 10, height: 10, background: COLORS.timer, border: '2px solid #0e1424', borderRadius: '50%' }} />

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" fill="none" stroke={COLORS.timer} strokeWidth="4"
                    strokeDasharray={300} strokeDashoffset={interpolate(progress, [0, 1], [300, 0])}
                />
            </svg>
            <Clock size={20} color={active ? COLORS.timer : '#8b949e'} />
            <span style={{ fontSize: 10, color: '#8b949e', marginTop: 4 }}>10s</span>
        </div>
    );
};

const ParallelDiamondNode: React.FC<{ frame: number; delay: number; status?: 'success' }> = ({ frame, delay, status }) => {
    const pop = spring({ frame: frame - delay, fps: 30, config: { stiffness: 120, damping: 12 } });

    return (
        <div style={{
            opacity: Math.min(1, Math.max(0, frame - delay)),
            transform: `scale(${pop}) rotate(45deg)`, width: 64, height: 64, borderRadius: 12,
            background: COLORS.parallelBg,
            border: `1px solid ${status === 'success' ? '#10b981' : 'rgba(148, 163, 184, 0.15)'}`,
            boxShadow: status === 'success' ? '0 0 40px rgba(16, 185, 129, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
            <div style={{ transform: 'rotate(-45deg)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(120, 180, 255, 0.1)', border: '1px solid rgba(120, 180, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutGrid size={16} color="#a5ceff" />
                </div>
            </div>
        </div>
    );
};

// ── Main Composition ──

export const MiniFlowDemo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Scene 1: Dashboard Intro & Click (0-150)
    // Cursor moves from bottom right to the "+ Crear Nuevo" button, clicks at frame 100
    const cursorX = spring({ frame: frame - 10, fps, config: { damping: 20 }, from: 1500, to: 1700 });
    const cursorY = spring({ frame: frame - 10, fps, config: { damping: 20 }, from: 800, to: 65 });
    const clickScale = spring({ frame: frame - 100, fps, config: { stiffness: 400, damping: 10 }, from: 1, to: 0.8 });
    const didClick = frame > 100 ? clickScale : 1;
    const diveZ = spring({ frame: frame - 110, fps, config: { mass: 2, damping: 20 }, from: 1, to: 15 });
    const introOpacity = interpolate(diveZ, [1, 5], [1, 0], { extrapolateRight: 'clamp' });

    // Scene 2: Camera Pan & Zoom (Canvas) (150-750)
    const canvasZoom = spring({ frame: frame - 160, fps, config: { mass: 1.5, damping: 20 }, from: 0.1, to: 1 });
    const cameraX = spring({ frame: frame - 300, fps, config: { damping: 30, stiffness: 20 }, from: 0, to: -800 });

    // Execution Playhead
    const t = Math.max(0, frame - 300);
    const playhead = interpolate(t, [0, 300], [0, 1], { extrapolateRight: 'clamp' });

    // Scene 5: Return to Dashboard (750-900)
    const returnZ = spring({ frame: frame - 750, fps, config: { mass: 1.5, damping: 20 }, from: 5, to: 1 });
    const canvasFadeOut = interpolate(returnZ, [2, 5], [0, 1], { extrapolateRight: 'clamp' });
    const outroOpacity = interpolate(returnZ, [1, 3], [1, 0], { extrapolateLeft: 'clamp' });

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgApp,
            color: COLORS.text,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
            overflow: 'hidden',
        }}>

            {/* SCENE 1: The Landing/Dashboard */}
            <Sequence durationInFrames={150}>
                <AbsoluteFill style={{ transform: `scale(${diveZ})`, opacity: introOpacity }}>
                    <DashboardTopbar frame={frame} />
                    <EmptyStateIcon frame={frame} />

                    {/* Stylized Cursor */}
                    <div style={{ position: 'absolute', left: cursorX, top: cursorY, zIndex: 100, transform: `scale(${didClick})` }}>
                        <MousePointer2 size={48} fill="#e6edf3" color="#0b1020" />
                        <div style={{
                            position: 'absolute', top: -10, left: -10, width: 40, height: 40,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
                            transform: `scale(${interpolate(spring({ frame: frame - 100, fps }), [0, 1], [0, 2])})`,
                            opacity: interpolate(spring({ frame: frame - 100, fps }), [0, 1], [1, 0])
                        }} />
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 2-4: The Matrix / Engine Ignites / Velocity */}
            <Sequence from={145} durationInFrames={620}>
                <AbsoluteFill style={{ background: COLORS.bgCanvas, borderTop: '1px solid rgba(255,255,255,0.05)', opacity: canvasFadeOut }}>
                    {/* Topbar */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '14px 24px',
                        background: 'rgba(10, 16, 30, 0.85)', backdropFilter: 'blur(10px)',
                        zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        transform: `translateY(${interpolate(spring({ frame: frame - 160, fps }), [0, 1], [-50, 0])}px)`
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: 16 }}>Apple_Event_Data_Pipeline.json</strong>
                            <span style={{ fontSize: 12, opacity: 0.6 }}>Updated Just Now</span>
                        </div>
                        <StatusPill frame={frame} />
                    </div>

                    {/* Canvas Wrapper for Camera Panning */}
                    <div style={{ flex: 1, position: 'relative', backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 0)', backgroundSize: '24px 24px', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 100, left: 150, width: 2500, height: 800,
                            transform: `scale(${canvasZoom}) translateX(${cameraX}px)`,
                            transformOrigin: '0 50%'
                        }}>

                            {/* SVG Edges */}
                            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                                <path d="M 220 160 C 270 160 270 160 320 160" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 220 160 C 270 160 270 160 320 160" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="120" strokeDashoffset={interpolate(playhead, [0, 0.1], [120, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />

                                <path d="M 580 160 C 630 160 630 160 680 160" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 580 160 C 630 160 630 160 680 160" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="120" strokeDashoffset={interpolate(playhead, [0.15, 0.3], [120, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />

                                <path d="M 900 160 C 950 160 950 160 1000 160" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 900 160 C 950 160 950 160 1000 160" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="120" strokeDashoffset={interpolate(playhead, [0.4, 0.55], [120, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />

                                <path d="M 1220 144 C 1280 144 1280 80 1340 80" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 1220 144 C 1280 144 1280 80 1340 80" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="150" strokeDashoffset={interpolate(playhead, [0.6, 0.75], [150, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />

                                <path d="M 1420 80 C 1480 80 1480 160 1550 160" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 1420 80 C 1480 80 1480 160 1550 160" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="180" strokeDashoffset={interpolate(playhead, [0.75, 0.85], [180, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />

                                <path d="M 1614 160 C 1660 160 1660 160 1710 160" fill="none" stroke={COLORS.edgeLine} strokeWidth={2} />
                                <path d="M 1614 160 C 1660 160 1660 160 1710 160" fill="none" stroke={COLORS.success} strokeWidth={4} strokeDasharray="120" strokeDashoffset={interpolate(playhead, [0.85, 1], [120, 0], { extrapolateRight: 'clamp' })} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />
                            </svg>

                            {/* Nodes */}
                            <div style={{ position: 'absolute', top: 110, left: 0, zIndex: 2 }}>
                                <StandardNode icon={<Zap size={14} />} title="START" color={COLORS.start} label="API Webhook" hint="POST /v1/apple/data" frame={frame} delay={160} active={playhead >= 0 && playhead < 0.15} />
                            </div>
                            <div style={{ position: 'absolute', top: 106, left: 320, zIndex: 2 }}>
                                <StandardNode icon={<Globe size={14} />} title="HTTP REQUEST" color={COLORS.http} label="Fetch Telemetry" hint="GET api.apple.com/..." frame={frame} delay={180} width={260} active={playhead >= 0.15 && playhead < 0.4} />
                            </div>
                            <div style={{ position: 'absolute', top: 110, left: 680, zIndex: 2 }}>
                                <StandardNode icon={<Terminal size={14} />} title="COMMAND" color={COLORS.command} label="Transform Data" hint="java -jar /opt/transform" frame={frame} delay={200} active={playhead >= 0.4 && playhead < 0.6} />
                            </div>
                            <div style={{ position: 'absolute', top: 110, left: 1000, zIndex: 2 }}>
                                <ConditionalNode frame={frame} delay={220} active={playhead >= 0.6 && playhead < 0.7} />
                            </div>
                            <div style={{ position: 'absolute', top: 40, left: 1340, zIndex: 2 }}>
                                <TimerCircleNode frame={frame} delay={240} active={playhead >= 0.7 && playhead < 0.85} />
                            </div>
                            <div style={{ position: 'absolute', top: 128, left: 1550, zIndex: 2 }}>
                                <ParallelDiamondNode frame={frame} delay={260} status={playhead > 0.85 ? 'success' : undefined} />
                            </div>
                            <div style={{ position: 'absolute', top: 110, left: 1710, zIndex: 2 }}>
                                <StandardNode icon={<Flag size={14} />} title="END" color={COLORS.end} label="Complete Sequence" hint="Status: 200 OK" frame={frame} delay={280} active={playhead >= 1} />
                            </div>
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 5: Dashboard Outro Return */}
            <Sequence from={750}>
                <AbsoluteFill style={{
                    background: COLORS.bgApp,
                    transform: `scale(${returnZ})`,
                    opacity: outroOpacity
                }}>
                    <DashboardTopbar frame={frame - 750 + 20} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 100 }}>
                        <h2 style={{ fontSize: 60, fontWeight: 900, marginBottom: 10 }}>Built with MiniFlow</h2>
                        <p style={{ fontSize: 24, color: COLORS.http }}>github.com/mightyssge/miniflow</p>
                    </div>
                </AbsoluteFill>
            </Sequence>

        </AbsoluteFill>
    );
};
