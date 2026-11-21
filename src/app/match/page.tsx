"use client";

import dynamic from "next/dynamic";
import HomeLogoLink from "@/components/HomeLogoLink";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import SetupGame from "@/components/SetupGame";
import { TeamPickModal } from "@/components/match/Overlays";
import SessionBattleBar from "@/components/match/SessionBattleBar";
import {
  CountdownOverlay,
  RoundResultOverlay,
  TransitionOverlay,
  WinnerOverlay,
} from "@/components/match/SessionOverlays";
import type { QuizCategoryKey } from "@/data/quiz/meta";
import GameIntroOverlay from "@/components/match/GameIntroOverlay";
import { hasSeenIntro, markIntroSeen } from "@/lib/introSeen";
import {
  cardKeyFor,
  newStatSessionId,
  reportSession,
  trackEvent,
} from "@/lib/analytics";
import {
  buildRoundQueue,
  getDefaultRounds,
  getTimerSeconds,
  isGameType,
  isQuizCategory,
  type GameType,
  type Round,
} from "@/lib/matchQueue";
import { clearRoundState } from "@/lib/roundState";
import {
  clearSavedMatch,
  readSavedMatch,
  saveMatch,
  type SavedMatch,
} from "@/lib/savedMatch";
import { createResultShareImage } from "@/lib/shareImage";
import type { ShareAction } from "@/components/match/SessionOverlays";
import type { RoundPoints, WinnerType } from "@/types/game";

const WIN_BONUS = 3;
import type { ModeType, RoundStat } from "@/types/match";

type PhaseType =
  "setup" | "countdown" | "intro" | "playing" | "transition" | "finished";

const GAME_LOADERS = {
  word: () => import("@/components/match/WordGame"),
  quiz: () => import("@/components/match/QuizGame"),
  scramble: () => import("@/components/match/ScrambleGame"),
  wheel: () => import("@/components/match/WheelGame"),
  categories: () => import("@/components/match/CategoriesGame"),
  draw: () => import("@/components/match/ProverbGame"),
  logo: () => import("@/components/match/LogoGame"),
  country: () => import("@/components/match/CountryGame"),
  club: () => import("@/components/match/ClubGame"),
  car: () => import("@/components/match/CarGame"),
  zoom: () => import("@/components/match/ZoomGame"),
  geo: () => import("@/components/match/GeoGame"),
  rebus: () => import("@/components/match/RebusGame"),
};

function GameLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl p-8 text-center">
      <p className="text-sm font-black text-white/50">لحظة نجهز اللعبة...</p>
    </div>
  );
}

const WordGame = dynamic(GAME_LOADERS.word, {
  ssr: false,
  loading: GameLoading,
});

const QuizGame = dynamic(GAME_LOADERS.quiz, {
  ssr: false,
  loading: GameLoading,
});

const ScrambleGame = dynamic(GAME_LOADERS.scramble, {
  ssr: false,
  loading: GameLoading,
});

const WheelGame = dynamic(GAME_LOADERS.wheel, {
  ssr: false,
  loading: GameLoading,
});

const CategoriesGame = dynamic(GAME_LOADERS.categories, {
  ssr: false,
  loading: GameLoading,
});

const ProverbGame = dynamic(GAME_LOADERS.draw, {
  ssr: false,
  loading: GameLoading,
});

const RebusGame = dynamic(GAME_LOADERS.rebus, {
  ssr: false,
  loading: GameLoading,
});

const LogoGame = dynamic(GAME_LOADERS.logo, {
  ssr: false,
  loading: GameLoading,
});

const CountryGame = dynamic(GAME_LOADERS.country, {
  ssr: false,
  loading: GameLoading,
});

const ClubGame = dynamic(GAME_LOADERS.club, {
  ssr: false,
  loading: GameLoading,
});

const CarGame = dynamic(GAME_LOADERS.car, {
  ssr: false,
  loading: GameLoading,
});

const ZoomGame = dynamic(GAME_LOADERS.zoom, {
  ssr: false,
  loading: GameLoading,
});

const GeoGame = dynamic(GAME_LOADERS.geo, {
  ssr: false,
  loading: GameLoading,
});

function preloadGames(games: GameType[]) {
  games.forEach((game) => {
    void GAME_LOADERS[game]().catch(() => {});
  });
}

export default function MatchPage() {
  const router = useRouter();

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roundResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endingRoundRef = useRef<number | null>(null);

  const resolvedRoundRef = useRef<number | null>(null);

  const sharingRef = useRef(false);

  const statSessionRef = useRef("");

  const [mode, setMode] = useState<ModeType>("session");

  const [trial, setTrial] = useState(false);

  useEffect(() => {
    fetch("/api/license/status")
      .then((response) => response.json())
      .then((data: { paid?: boolean }) => setTrial(data?.paid === false))
      .catch(() => {});
  }, []);

  const [phase, setPhase] = useState<PhaseType>("setup");

  const [countdown, setCountdown] = useState(3);

  const [side1, setSide1] = useState("");
  const [side2, setSide2] = useState("");

  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);

  const [pinnedGame, setPinnedGame] = useState<GameType | null>(null);

  const [gameRounds, setGameRounds] = useState<Record<string, number>>({});

  const [quizCategories, setQuizCategories] = useState<QuizCategoryKey[]>([]);

  const [timerEnabled, setTimerEnabled] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(30);

  const [queue, setQueue] = useState<Round[]>([]);

  const [started, setStarted] = useState(false);

  const [index, setIndex] = useState(0);

  const [side1Score, setSide1Score] = useState(0);

  const [side2Score, setSide2Score] = useState(0);

  const [roundStats, setRoundStats] = useState<RoundStat[]>([]);

  const [showWinner, setShowWinner] = useState(false);

  const [showRoundWinnerPicker, setShowRoundWinnerPicker] = useState(false);

  const [showRoundResult, setShowRoundResult] = useState(false);

  const [roundGained, setRoundGained] = useState<RoundPoints>({
    side1: 0,
    side2: 0,
  });

  const [roundResultWinner, setRoundResultWinner] =
    useState<WinnerType>("none");

  const [sharing, setSharing] = useState(false);

  const current = queue[index];

  const trackedRoundRef = useRef("");

  useEffect(() => {
    if (phase !== "playing" || !current) {
      return;
    }

    const roundKey = `${statSessionRef.current}:${index}`;

    if (trackedRoundRef.current === roundKey) {
      return;
    }

    trackedRoundRef.current = roundKey;
    trackEvent("game_play", {
      game: cardKeyFor(current),
      round_number: index + 1,
      match_mode: mode,
      trial,
    });
  }, [phase, current, index, mode, trial]);

  const nextRound = queue[index + 1];

  const nextDifferentGame = current
    ? queue.slice(index + 1).find((round) => round.game !== current.game)?.game
    : undefined;

  const totalScore = side1Score + side2Score;

  const side1Control =
    totalScore > 0
      ? Math.max(10, Math.min(90, (side1Score / totalScore) * 100))
      : 50;

  function snapshot(overrides: Partial<SavedMatch>): SavedMatch {
    return {
      search: window.location.search,
      mode,
      side1,
      side2,
      selectedGames,
      gameRounds,
      quizCategories,
      timerEnabled,
      timerSeconds,
      queue,
      index,
      side1Score,
      side2Score,
      roundStats,
      ...overrides,
    };
  }

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  function clearFlowTimers() {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    if (roundResultTimer.current) {
      clearTimeout(roundResultTimer.current);
      roundResultTimer.current = null;
    }
  }

  function resetRoundGuards() {
    endingRoundRef.current = null;
    resolvedRoundRef.current = null;
  }

  function resetRoundFlow() {
    clearFlowTimers();
    resetRoundGuards();
    clearSavedMatch();

    setStarted(false);
    setIndex(0);
    setQueue([]);

    setSide1Score(0);
    setSide2Score(0);

    setRoundStats([]);

    setShowWinner(false);
    setShowRoundWinnerPicker(false);
    setShowRoundResult(false);
    setRoundResultWinner("none");

    setCountdown(3);
    setPhase("setup");
  }

  function start() {
    if (phase !== "setup") {
      return;
    }

    beginMatch();
  }

  function beginMatch() {
    if (selectedGames.length === 0) {
      return;
    }

    if (selectedGames.includes("quiz") && quizCategories.length === 0) {
      return;
    }

    const builtQueue = buildRoundQueue(
      selectedGames,
      gameRounds,
      quizCategories,
    );

    if (builtQueue.length === 0) {
      return;
    }

    preloadGames(selectedGames);

    clearFlowTimers();
    resetRoundGuards();
    clearRoundState();

    setQueue(builtQueue);

    statSessionRef.current = newStatSessionId();
    reportSession("start", {
      sessionId: statSessionRef.current,
      mode,
      trial,
      rounds: builtQueue,
    });

    setStarted(false);
    setIndex(0);

    setSide1(side1.trim() || "فريق 1");
    setSide2(side2.trim() || "فريق 2");

    setSide1Score(0);
    setSide2Score(0);

    setRoundStats([]);

    setShowWinner(false);
    setShowRoundWinnerPicker(false);
    setShowRoundResult(false);
    setRoundResultWinner("none");

    setCountdown(3);
    setPhase("countdown");
  }

  function finishSession(finalSide1Score: number, finalSide2Score: number) {
    clearFlowTimers();

    if (statSessionRef.current) {
      reportSession("finish", {
        sessionId: statSessionRef.current,
        mode,
        trial,
        rounds: queue,
      });
      statSessionRef.current = "";
    }

    setSide1Score(finalSide1Score);
    setSide2Score(finalSide2Score);

    setShowRoundResult(false);
    setShowRoundWinnerPicker(false);

    setStarted(false);
    setPhase("finished");
    setShowWinner(true);
  }

  function goToNextRound(nextSide1Score: number, nextSide2Score: number) {
    if (index + 1 >= queue.length) {
      finishSession(nextSide1Score, nextSide2Score);

      return;
    }

    const upcomingRound = queue[index + 1];

    if (upcomingRound) {
      preloadGames([upcomingRound.game]);
    }

    setPhase("transition");

    transitionTimer.current = setTimeout(() => {
      setIndex((currentIndex) => currentIndex + 1);

      setPhase(
        upcomingRound && !hasSeenIntro(upcomingRound.game)
          ? "intro"
          : "playing",
      );

      transitionTimer.current = null;
    }, 1500);
  }

  function applyRoundWinner(winner?: WinnerType, points?: RoundPoints) {
    if (!current || phase !== "playing" || resolvedRoundRef.current === index) {
      return;
    }

    resolvedRoundRef.current = index;
    endingRoundRef.current = index;

    clearRoundState();

    const finalWinner = winner ?? "none";

    const gained: RoundPoints = points
      ? {
          side1: Math.max(0, Math.round(points.side1)),
          side2: Math.max(0, Math.round(points.side2)),
        }
      : {
          side1: finalWinner === "side1" ? WIN_BONUS : 0,
          side2: finalWinner === "side2" ? WIN_BONUS : 0,
        };

    const nextSide1Score = side1Score + gained.side1;

    const nextSide2Score = side2Score + gained.side2;

    const nextRoundStats: RoundStat[] = [
      ...roundStats,
      {
        game: current.game,
        round: index + 1,
        winner: finalWinner,
        side1Points: gained.side1,
        side2Points: gained.side2,
      },
    ];

    setRoundStats(nextRoundStats);

    setSide1Score(nextSide1Score);
    setSide2Score(nextSide2Score);

    setShowRoundWinnerPicker(false);

    if (index + 1 >= queue.length) {
      clearSavedMatch();

      finishSession(nextSide1Score, nextSide2Score);

      return;
    }

    saveMatch(
      snapshot({
        index: index + 1,
        side1Score: nextSide1Score,
        side2Score: nextSide2Score,
        roundStats: nextRoundStats,
      }),
    );

    setRoundResultWinner(finalWinner);
    setRoundGained(gained);
    setShowRoundResult(true);

    roundResultTimer.current = setTimeout(() => {
      setShowRoundResult(false);

      roundResultTimer.current = null;

      goToNextRound(nextSide1Score, nextSide2Score);
    }, 2500);
  }

  function endRound(winner?: WinnerType, points?: RoundPoints) {
    if (!current || phase !== "playing" || endingRoundRef.current === index) {
      return;
    }

    endingRoundRef.current = index;

    if (winner !== undefined) {
      applyRoundWinner(winner, points);
      return;
    }

    setShowRoundWinnerPicker(true);
  }

  function replay() {
    if (phase !== "finished") {
      return;
    }

    clearSavedMatch();
    beginMatch();
  }

  function changeGames() {
    resetRoundFlow();
  }

  function goHome() {
    clearFlowTimers();
    clearSavedMatch();
    router.push("/");
  }

  function confirmLeave(event: MouseEvent<HTMLAnchorElement>) {
    const inProgress =
      phase === "countdown" ||
      phase === "intro" ||
      phase === "playing" ||
      phase === "transition";

    if (inProgress && !window.confirm("متأكدين؟ بتضيع نتيجة الجلسة")) {
      event.preventDefault();
      return;
    }

    clearFlowTimers();
    clearSavedMatch();
  }

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((currentCountdown) => currentCountdown - 1);
      }, 800);

      return () => clearTimeout(timer);
    }

    const startTimer = setTimeout(() => {
      saveMatch(snapshotRef.current({ index: 0 }));
      setStarted(true);
      setPhase(queue[0] && !hasSeenIntro(queue[0].game) ? "intro" : "playing");
    }, 650);

    return () => clearTimeout(startTimer);
  }, [phase, countdown, queue]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlMode = params.get("mode");
    const gameParam = params.get("game");
    const categoryParam = params.get("category");

    const saved = readSavedMatch(window.location.search);

    if (saved) {
      setMode(saved.mode);
      setSide1(saved.side1);
      setSide2(saved.side2);
      setSelectedGames(saved.selectedGames);
      setGameRounds(saved.gameRounds);
      setQuizCategories(saved.quizCategories);
      setTimerEnabled(saved.timerEnabled);
      setTimerSeconds(saved.timerSeconds);
      setQueue(saved.queue);
      setIndex(saved.index);
      setSide1Score(saved.side1Score);
      setSide2Score(saved.side2Score);
      setRoundStats(saved.roundStats);
      setStarted(true);
      setPhase("playing");
      return;
    }

    if (urlMode === "session" || !isGameType(gameParam)) {
      setMode("session");

      const pickParam = params.get("pick");

      if (isGameType(pickParam)) {
        setPinnedGame(pickParam);
        setSelectedGames([pickParam]);

        setGameRounds({
          [pickParam]: getDefaultRounds(pickParam),
        });
      }

      return;
    }

    setMode("quick");

    setSelectedGames([gameParam]);

    setGameRounds({
      [gameParam]: getDefaultRounds(gameParam),
    });

    setQuizCategories(
      gameParam === "quiz" && isQuizCategory(categoryParam)
        ? [categoryParam]
        : [],
    );
  }, []);

  useEffect(() => {
    return () => clearFlowTimers();
  }, []);

  const finalWinnerName = useMemo(() => {
    if (side1Score > side2Score) {
      return side1 || "فريق 1";
    }

    if (side2Score > side1Score) {
      return side2 || "فريق 2";
    }

    return "تعادل";
  }, [side1Score, side2Score, side1, side2]);

  const isDraw = side1Score === side2Score;

  const roundWinnerName =
    roundResultWinner === "side1"
      ? side1 || "فريق 1"
      : roundResultWinner === "side2"
        ? side2 || "فريق 2"
        : "";

  const roundIsDraw = roundResultWinner === "none";

  async function handleShareResult(action: ShareAction) {
    if (sharingRef.current) {
      return;
    }

    sharingRef.current = true;
    setSharing(true);

    try {
      const imageFile = await createResultShareImage({
        isDraw,
        finalWinnerName,
        side1,
        side2,
        side1Score,
        side2Score,
        roundStats,
      });

      if (
        action !== "save" &&
        navigator.share &&
        navigator.canShare?.({
          files: [imageFile],
        })
      ) {
        await navigator.share({
          title: "نتيجتنا في خل نلعب",
          text: isDraw
            ? "تعادلنا في خل نلعب"
            : `${finalWinnerName} فاز في خل نلعب`,
          files: [imageFile],
        });

        return;
      }

      const imageUrl = URL.createObjectURL(imageFile);

      const link = document.createElement("a");

      link.href = imageUrl;
      link.download = imageFile.name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    } catch (error) {
      console.log("Share cancelled or failed", error);
    } finally {
      sharingRef.current = false;
      setSharing(false);
    }
  }

  const gameNumbers = queue.map(
    (round, position) =>
      queue
        .slice(0, position + 1)
        .filter(
          (item, itemIndex) =>
            itemIndex === 0 ||
            cardKeyFor(item) !== cardKeyFor(queue[itemIndex - 1]),
        ).length,
  );
  const gameNumber = gameNumbers[index] ?? 1;
  const totalGames = gameNumbers.at(-1) ?? 1;

  const commonGameProps = {
    onRoundEnd: endRound,
    roundKey: index,
    side1Name: side1,
    side2Name: side2,
    currentRound: mode === "session" ? gameNumber : 0,
    timerEnabled,
    timerSeconds: current
      ? getTimerSeconds(current.game, timerSeconds)
      : timerSeconds,
  };

  function renderCurrentGame() {
    if (!current) {
      return null;
    }

    switch (current.game) {
      case "word":
        return (
          <WordGame
            key={index}
            {...commonGameProps}
            trial={trial}
            side1Score={side1Score}
            side2Score={side2Score}
          />
        );

      case "quiz":
        return (
          <QuizGame
            key={index}
            {...commonGameProps}
            trial={trial}
            category={current.category}
          />
        );

      case "scramble":
        return (
          <ScrambleGame
            key={index}
            {...commonGameProps}
            gameRoundIndex={
              queue.slice(0, index).filter((round) => round.game === "scramble")
                .length
            }
          />
        );

      case "wheel":
        return (
          <WheelGame
            key={index}
            {...commonGameProps}
            gameRoundIndex={
              queue.slice(0, index).filter((round) => round.game === "wheel")
                .length
            }
          />
        );

      case "categories":
        return <CategoriesGame key={index} {...commonGameProps} />;

      case "draw":
        return <ProverbGame key={index} {...commonGameProps} />;

      case "rebus":
        return <RebusGame key={index} {...commonGameProps} />;

      case "logo":
        return <LogoGame key={index} {...commonGameProps} />;

      case "country":
        return <CountryGame key={index} {...commonGameProps} />;

      case "club":
        return <ClubGame key={index} {...commonGameProps} />;

      case "car":
        return <CarGame key={index} {...commonGameProps} />;

      case "zoom":
        return <ZoomGame key={index} {...commonGameProps} />;

      case "geo":
        return <GeoGame key={index} {...commonGameProps} trial={trial} />;
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-x-clip px-3 pb-6 pt-16 text-white sm:p-6">
      <HomeLogoLink onClick={confirmLeave} />

      {phase === "countdown" && <CountdownOverlay countdown={countdown} />}

      {phase === "intro" && current && (
        <GameIntroOverlay
          game={current.game}
          onStart={() => {
            markIntroSeen(current.game);
            trackEvent("intro_skip", { game: cardKeyFor(current) });
            setPhase("playing");
          }}
        />
      )}

      {phase === "transition" && nextRound && (
        <TransitionOverlay nextRound={nextRound} />
      )}

      <WinnerOverlay
        show={showWinner}
        winnerName={finalWinnerName}
        isDraw={isDraw}
        mode={mode}
        side1Name={side1}
        side2Name={side2}
        side1Score={side1Score}
        side2Score={side2Score}
        roundStats={roundStats}
        sharing={sharing}
        onReplay={replay}
        onChangeGames={changeGames}
        onGoHome={goHome}
        onShare={handleShareResult}
      />

      <TeamPickModal
        show={showRoundWinnerPicker}
        kicker="خلصت اللعبة"
        title="مين أخذها؟"
        side1Name={side1}
        side2Name={side2}
        noneLabel="ولا أحد"
        onPick={applyRoundWinner}
      />

      <RoundResultOverlay
        show={showRoundResult}
        winnerName={roundWinnerName}
        isDraw={roundIsDraw}
        side1Name={side1 || "فريق 1"}
        side2Name={side2 || "فريق 2"}
        gained={roundGained}
      />

      {!started ? (
        <SetupGame
          mode={mode}
          side1={side1}
          side2={side2}
          setSide1={setSide1}
          setSide2={setSide2}
          selectedGames={selectedGames}
          pinnedGame={pinnedGame}
          setSelectedGames={setSelectedGames}
          quizCategories={quizCategories}
          setQuizCategories={setQuizCategories}
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerSeconds={timerSeconds}
          setTimerSeconds={setTimerSeconds}
          trial={trial}
          onStart={start}
        />
      ) : (
        <div
          className={`mx-auto max-w-5xl pt-12 ${
            mode === "quick" ? "lg:pt-0" : ""
          }`}
        >
          {mode === "session" && current && (
            <SessionBattleBar
              side1Name={side1}
              side2Name={side2}
              side1Control={side1Control}
              nextGame={nextDifferentGame}
            />
          )}

          {phase !== "intro" && renderCurrentGame()}

          {mode === "session" && totalGames > 1 && (
            <p className="mt-4 text-center text-sm font-bold text-white/50">
              اللعبة {gameNumber} من {totalGames}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
