import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ObstacleType, FishType } from './types';
import { 
    GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, CAT_WIDTH, CAT_HEIGHT, CAT_INITIAL_X, CAT_INITIAL_Y,
    GRAVITY, JUMP_STRENGTH, MAX_GAME_SPEED, OBSTACLE_WIDTH, OBSTACLE_HEIGHT,
    FISH_WIDTH, FISH_HEIGHT, FISH_SPAWN_CHANCE, FISH_Y_POSITIONS, INITIAL_LIVES, POINTS_PER_SECOND, POINTS_PER_FISH,
    INVINCIBILITY_DURATION, Difficulty, DIFFICULTY_SETTINGS, DifficultySettings
} from './constants';
import { CatIcon, BushIcon, FishIcon, HeartIcon } from './components/icons';

// --- SUB-COMPONENTS ---

const Background: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[60px] bg-[#f4a261]"></div>
        <div 
            className="absolute bottom-0 left-0 w-[200%] h-[40px] bg-repeat-x"
            style={{
                backgroundImage: `linear-gradient(90deg, #e76f51 50%, #f4a261 50%)`,
                backgroundSize: '20px 20px',
                animation: 'scroll 1s linear infinite'
            }}
        ></div>
    </div>
);

type CatAnimationState = 'default' | 'hit' | 'collect' | 'gameover';

const Cat: React.FC<{ y: number; isJumping: boolean; isInvincible: boolean; animationState: CatAnimationState }> = ({ y, isJumping, isInvincible, animationState }) => {
    const getAnimation = () => {
        switch(animationState) {
            case 'hit': return 'shake 0.5s';
            case 'collect': return 'collect-bounce 0.5s';
            case 'gameover': return 'gameover-fall 1s ease-in forwards';
            default: 
                return isInvincible ? 'blink 0.2s linear infinite' : 'none';
        }
    };

    return (
        <div
            className="absolute"
            style={{
                left: `${CAT_INITIAL_X}px`,
                bottom: `${y + GROUND_HEIGHT}px`,
                width: `${CAT_WIDTH}px`,
                height: `${CAT_HEIGHT}px`,
                animation: getAnimation(),
            }}
        >
            <CatIcon isJumping={isJumping} className="w-full h-full" />
        </div>
    );
};

const Obstacle: React.FC<{ obstacle: ObstacleType }> = ({ obstacle }) => (
    <div
        className="absolute bottom-0"
        style={{
            left: `${obstacle.x}px`,
            width: `${obstacle.width}px`,
            height: `${obstacle.height}px`,
            bottom: `${GROUND_HEIGHT}px`,
        }}
    >
        <BushIcon className="w-full h-full" />
    </div>
);

const Fish: React.FC<{ fish: FishType }> = ({ fish }) => (
    <div
        className="absolute animate-pulse"
        style={{
            left: `${fish.x}px`,
            bottom: `${fish.y + GROUND_HEIGHT}px`,
            width: `${fish.width}px`,
            height: `${fish.height}px`,
        }}
    >
        <FishIcon className="w-full h-full" />
    </div>
);

const HUD: React.FC<{ score: number; lives: number }> = ({ score, lives }) => (
    <div className="absolute top-4 left-4 right-4 flex justify-between text-2xl font-bold text-white z-10 p-2 bg-black/20 rounded-lg">
        <div className="flex items-center space-x-2">
            {[...Array(lives)].map((_, i) => (
                <HeartIcon key={i} className="w-8 h-8"/>
            ))}
        </div>
        <span>Score: {Math.floor(score)}</span>
    </div>
);

const StartScreen: React.FC<{ onStart: (difficulty: Difficulty) => void }> = ({ onStart }) => (
    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white z-20">
        <h1 className="text-6xl font-bold mb-4 text-shadow">Cat Jump!</h1>
        <p className="text-2xl mb-8">Select a Difficulty</p>
        <div className="flex space-x-4">
            <button
                onClick={() => onStart(Difficulty.Easy)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg transition-transform transform hover:scale-105"
            >
                Easy
            </button>
            <button
                onClick={() => onStart(Difficulty.Medium)}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl rounded-lg transition-transform transform hover:scale-105"
            >
                Medium
            </button>
            <button
                onClick={() => onStart(Difficulty.Hard)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-lg transition-transform transform hover:scale-105"
            >
                Hard
            </button>
        </div>
    </div>
);

const GameOverScreen: React.FC<{ score: number; onReplay: () => void }> = ({ score, onReplay }) => (
    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white z-20">
        <h2 className="text-5xl font-bold mb-2">Game Over</h2>
        <p className="text-3xl mb-6">Final Score: {Math.floor(score)}</p>
        <button
            onClick={onReplay}
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-2xl rounded-lg transition-transform transform hover:scale-105"
        >
            Replay
        </button>
    </div>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Start);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [frameCount, setFrameCount] = useState(0);

    const gameLoopRef = useRef<number>();
    const catY = useRef(CAT_INITIAL_Y);
    const catVelocityY = useRef(0);
    const isJumping = useRef(false);
    const isSpacePressed = useRef(false);
    const obstacles = useRef<ObstacleType[]>([]);
    const fishes = useRef<FishType[]>([]);
    const gameSpeed = useRef(DIFFICULTY_SETTINGS.Medium.initialSpeed);
    const difficultySettings = useRef<DifficultySettings>(DIFFICULTY_SETTINGS.Medium);
    const lastDifficulty = useRef<Difficulty>(Difficulty.Medium);
    const lastTime = useRef<number | null>(null);
    const isInvincible = useRef(false);
    const invincibilityEndTime = useRef(0);
    const catAnimationState = useRef<CatAnimationState>('default');
    const catAnimationEndTime = useRef(0);

    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const resetGame = useCallback((selectedDifficulty: Difficulty) => {
        const settings = DIFFICULTY_SETTINGS[selectedDifficulty];
        difficultySettings.current = settings;
        lastDifficulty.current = selectedDifficulty;
        
        setScore(0);
        setLives(INITIAL_LIVES);
        catY.current = CAT_INITIAL_Y;
        catVelocityY.current = 0;
        isJumping.current = false;
        obstacles.current = [];
        fishes.current = [];
        gameSpeed.current = settings.initialSpeed;
        isInvincible.current = false;
        invincibilityEndTime.current = 0;
        catAnimationState.current = 'default';
        catAnimationEndTime.current = 0;
        setGameState(GameState.Playing);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameState === GameState.Playing) {
                isSpacePressed.current = true;
            } else if (gameState === GameState.GameOver) {
                // Allow space to replay
                const replayButton = document.querySelector('button');
                if (replayButton) replayButton.click();
            }
        }
    }, [gameState]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            isSpacePressed.current = false;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const scale = Math.min(clientWidth / GAME_WIDTH, clientHeight / GAME_HEIGHT) * 0.95;
                setScale(scale);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (lives <= 0) {
            setGameState(GameState.GameOver);
            catAnimationState.current = 'gameover';
        }
    }, [lives]);
    
    const gameLoop = useCallback((time: number) => {
        if (lastTime.current === null) {
            lastTime.current = time;
            gameLoopRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const deltaTime = time - lastTime.current;
        lastTime.current = time;

        if (isInvincible.current && time > invincibilityEndTime.current) {
            isInvincible.current = false;
        }

        if (catAnimationState.current !== 'default' && catAnimationState.current !== 'gameover' && time > catAnimationEndTime.current) {
            catAnimationState.current = 'default';
        }

        // --- Cat Physics ---
        if (isSpacePressed.current && !isJumping.current) {
            isJumping.current = true;
            catVelocityY.current = JUMP_STRENGTH;
        }

        catVelocityY.current += GRAVITY;
        catY.current += catVelocityY.current;

        if (catY.current < 0) {
            catY.current = 0;
            catVelocityY.current = 0;
            isJumping.current = false;
        }
        
        // --- Move & Spawn Objects ---
        const { minSpawnGap, maxSpawnGap, speedIncreaseRate } = difficultySettings.current;
        
        obstacles.current = obstacles.current.filter(o => o.x + o.width > 0);
        fishes.current = fishes.current.filter(f => f.x + f.width > 0);
        
        obstacles.current.forEach(o => o.x -= gameSpeed.current);
        fishes.current.forEach(f => f.x -= gameSpeed.current);
        
        if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < GAME_WIDTH - minSpawnGap) {
             const lastObstacleX = obstacles.current.length > 0 ? obstacles.current[obstacles.current.length-1].x : 0;
             const newX = Math.max(GAME_WIDTH, lastObstacleX + minSpawnGap + Math.random() * (maxSpawnGap - minSpawnGap));

             obstacles.current.push({ id: Date.now(), x: newX, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT });

             if (Math.random() < FISH_SPAWN_CHANCE) {
                 const fishY = FISH_Y_POSITIONS[Math.floor(Math.random() * FISH_Y_POSITIONS.length)];
                 fishes.current.push({ id: Date.now() + 1, x: newX + OBSTACLE_WIDTH + 50, y: fishY, width: FISH_WIDTH, height: FISH_HEIGHT });
             }
        }
        
        // --- Collision Detection ---
        const catRect = { x: CAT_INITIAL_X, y: GAME_HEIGHT - GROUND_HEIGHT - catY.current - CAT_HEIGHT, width: CAT_WIDTH - 10, height: CAT_HEIGHT - 10 };
        
        // Obstacles
        if (!isInvincible.current) {
            for (const obstacle of obstacles.current) {
                const obstacleRect = { x: obstacle.x, y: GAME_HEIGHT - GROUND_HEIGHT - obstacle.height, width: obstacle.width - 10, height: obstacle.height - 10 };
                if (catRect.x < obstacleRect.x + obstacleRect.width &&
                    catRect.x + catRect.width > obstacleRect.x &&
                    catRect.y < obstacleRect.y + obstacleRect.height &&
                    catRect.y + catRect.height > obstacleRect.y) {
                    
                    isInvincible.current = true;
                    invincibilityEndTime.current = time + INVINCIBILITY_DURATION;
                    catAnimationState.current = 'hit';
                    catAnimationEndTime.current = time + 500;
                    setLives(l => l - 1);
                    obstacles.current = obstacles.current.filter(o => o.id !== obstacle.id); // Remove collided obstacle
                    break;
                }
            }
        }

        // Fish
        const newFishes = fishes.current.filter(fish => {
            const fishRect = { x: fish.x, y: GAME_HEIGHT - GROUND_HEIGHT - fish.y - fish.height, width: fish.width, height: fish.height };
             if (catRect.x < fishRect.x + fishRect.width &&
                catRect.x + catRect.width > fishRect.x &&
                catRect.y < fishRect.y + fishRect.height &&
                catRect.y + catRect.height > fishRect.y) {
                    setScore(s => s + POINTS_PER_FISH);
                    catAnimationState.current = 'collect';
                    catAnimationEndTime.current = time + 500;
                    return false; // remove fish
                }
            return true;
        });
        fishes.current = newFishes;
        
        // --- Update Score & Speed ---
        setScore(s => s + (POINTS_PER_SECOND * deltaTime / 1000));
        gameSpeed.current = Math.min(MAX_GAME_SPEED, gameSpeed.current + speedIncreaseRate);
        
        setFrameCount(c => c + 1);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, []);

    useEffect(() => {
        if (gameState === GameState.Playing) {
            lastTime.current = null;
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    return (
        <div ref={containerRef} className="flex justify-center items-center h-screen bg-gray-900 overflow-hidden">
            <div
                className="relative overflow-hidden bg-[#87ceeb] border-4 border-black rounded-lg"
                style={{
                    width: `${GAME_WIDTH}px`,
                    height: `${GAME_HEIGHT}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                }}
            >
                <style>{`
                    @keyframes scroll {
                        from { background-position-x: 0; }
                        to { background-position-x: -20px; }
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                    @keyframes shake {
                        10%, 90% { transform: translateX(-2px); }
                        20%, 80% { transform: translateX(4px); }
                        30%, 50%, 70% { transform: translateX(-6px); }
                        40%, 60% { transform: translateX(6px); }
                    }
                    @keyframes collect-bounce {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.15) rotate(5deg); }
                    }
                    @keyframes gameover-fall {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(200px) rotate(90deg); opacity: 0; }
                    }
                `}</style>
                <Background />
                {gameState === GameState.Start && <StartScreen onStart={resetGame} />}
                {gameState === GameState.GameOver && <GameOverScreen score={score} onReplay={() => resetGame(lastDifficulty.current)} />}
                
                {(gameState === GameState.Playing || gameState === GameState.GameOver) && (
                    <>
                        <HUD score={score} lives={lives} />
                        <Cat y={catY.current} isJumping={isJumping.current} isInvincible={isInvincible.current} animationState={catAnimationState.current} />
                        {obstacles.current.map(obs => (
                            <Obstacle key={obs.id} obstacle={obs} />
                        ))}
                         {fishes.current.map(fish => (
                            <Fish key={fish.id} fish={fish} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default App;