import React, { useState, useEffect } from 'react';

// 고려대 상징색
const KU_CRIMSON = '#820024';

const SUBJECTS = [
  { id: 'korean', name: '국어', type: 'relative' },
  { id: 'math', name: '수학', type: 'relative' },
  { id: 'english', name: '영어', type: 'absolute' },
  { id: 'history', name: '한국사', type: 'absolute' },
  { id: 'science', name: '과학', type: 'relative' },
  { id: 'society', name: '사회', type: 'relative' }
];

export default function App() {
  const [phase, setPhase] = useState('intro'); // intro, playing, result
  const [day, setDay] = useState(1);
  const [stats, setStats] = useState({
    korean: 0, math: 0, english: 0, history: 0, science: 0, society: 0
  });
  const [todayOptions, setTodayOptions] = useState([]);
  const [log, setLog] = useState([]);

  // 게임 초기화 및 시작
  const startGame = () => {
    setPhase('playing');
    setDay(1);
    setStats({ korean: 0, math: 0, english: 0, history: 0, science: 0, society: 0 });
    setLog([]);
    generateOptions();
  };

  // 3개의 랜덤 과목 선택
  const generateOptions = () => {
    const shuffled = [...SUBJECTS].sort(() => 0.5 - Math.random());
    setTodayOptions(shuffled.slice(0, 3));
  };

  // 공부하기 클릭 시 처리
  const handleStudy = (subjectId, subjectName) => {
    // 성장량 계산: 기본 5~12 + (진행일수에 비례한 추가 성장)
    // 30일 안에 100을 찍을 수 있도록 밸런스 조정
    const baseIncrease = Math.floor(Math.random() * 8) + 5; 
    const dayBonus = Math.floor(day * 0.8);
    const increaseAmount = baseIncrease + dayBonus;

    setStats(prev => {
      const currentStat = prev[subjectId];
      const nextStat = Math.min(100, currentStat + increaseAmount);
      
      setLog(prevLog => [`[Day ${day}] ${subjectName} 공부! 실력이 ${nextStat - currentStat} 올랐다.`, ...prevLog].slice(0, 5));
      
      return { ...prev, [subjectId]: nextStat };
    });

    if (day >= 30) {
      setPhase('result');
    } else {
      setDay(prev => prev + 1);
      generateOptions();
    }
  };

  // 상대평가 과목 점수 계산 로직 (수능 기반 추정치)
  const calculateRelative = (raw) => {
    const mean = 50;
    const stdDev = 16;
    let z = (raw - mean) / stdDev;
    let stdScore = Math.round(z * 20 + 100);

    // 백분위 및 등급 산출 (실제 수능 누적 비율 기반 선형 보간)
    let percentile;
    if (raw >= 92) percentile = 96 + Math.floor((raw-92)/8 * 4);
    else if (raw >= 84) percentile = 89 + Math.floor((raw-84)/8 * 6);
    else if (raw >= 74) percentile = 77 + Math.floor((raw-74)/10 * 11);
    else if (raw >= 60) percentile = 60 + Math.floor((raw-60)/14 * 16);
    else if (raw >= 40) percentile = 40 + Math.floor((raw-40)/20 * 19);
    else if (raw >= 23) percentile = 23 + Math.floor((raw-23)/17 * 16);
    else if (raw >= 11) percentile = 11 + Math.floor((raw-11)/12 * 11);
    else if (raw >= 4) percentile = 4 + Math.floor((raw-4)/7 * 6);
    else percentile = Math.floor(raw/4 * 3);

    percentile = Math.max(0, Math.min(100, percentile));

    let grade = 9;
    if (percentile >= 96) grade = 1;
    else if (percentile >= 89) grade = 2;
    else if (percentile >= 77) grade = 3;
    else if (percentile >= 60) grade = 4;
    else if (percentile >= 40) grade = 5;
    else if (percentile >= 23) grade = 6;
    else if (percentile >= 11) grade = 7;
    else if (percentile >= 4) grade = 8;

    return { raw, stdScore, percentile, grade };
  };

  // 절대평가 과목 점수 계산 로직
  const calculateAbsolute = (raw) => {
    let grade = 10 - Math.floor(raw / 10);
    if (raw === 100) grade = 1;
    if (grade > 9) grade = 9;
    return { raw, grade };
  };

  const getFinalResults = () => {
    return SUBJECTS.map(subj => {
      const rawScore = stats[subj.id];
      if (subj.type === 'absolute') {
        return { name: subj.name, type: subj.type, ...calculateAbsolute(rawScore) };
      } else {
        return { name: subj.name, type: subj.type, ...calculateRelative(rawScore) };
      }
    });
  };

  // 렌더링 파트: 인트로 화면
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 text-stone-800 p-4 font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center border-t-8" style={{ borderColor: KU_CRIMSON }}>
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: KU_CRIMSON }}>
            🐯 고려대 합격 시뮬레이터
          </h1>
          <p className="text-lg mb-6 text-stone-600 leading-relaxed">
            수능까지 남은 시간은 단 30일!<br/>
            매일 주어지는 3과목 중 하나를 선택해 공부하세요.<br/>
            모든 과목 평균 2등급 이내를 달성해야 합격할 수 있습니다.
          </p>
          <button 
            onClick={startGame}
            className="w-full text-white font-bold py-4 px-6 rounded-xl text-xl hover:opacity-90 transition-transform transform hover:scale-105 active:scale-95 shadow-lg"
            style={{ backgroundColor: KU_CRIMSON }}
          >
            수험 생활 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 렌더링 파트: 게임 화면
  if (phase === 'playing') {
    return (
      <div className="min-h-screen flex flex-col items-center py-10 bg-stone-100 text-stone-800 p-4 font-sans">
        <div className="max-w-3xl w-full">
          {/* 헤더 */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex justify-between items-center border-l-8" style={{ borderColor: KU_CRIMSON }}>
            <h2 className="text-3xl font-bold">D - {31 - day}</h2>
            <div className="text-lg font-semibold text-stone-500">Day {day} / 30</div>
          </div>

          {/* 능력치 현황 */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6 grid grid-cols-2 gap-4">
            {SUBJECTS.map(subj => (
              <div key={subj.id} className="flex flex-col">
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span>{subj.name}</span>
                  <span>{stats[subj.id]} / 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${stats[subj.id]}%`, backgroundColor: KU_CRIMSON }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 오늘의 선택지 */}
          <h3 className="text-xl font-bold mb-4 text-center">📚 오늘 집중할 과목을 선택하세요</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {todayOptions.map(subj => (
              <button
                key={subj.id}
                onClick={() => handleStudy(subj.id, subj.name)}
                className="bg-white hover:bg-stone-50 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform transform hover:-translate-y-1 active:scale-95 border-2 border-transparent hover:border-red-800"
              >
                <span className="text-2xl font-bold" style={{ color: KU_CRIMSON }}>{subj.name}</span>
                <span className="text-sm text-stone-500 mt-2">공부하기</span>
              </button>
            ))}
          </div>

          {/* 학습 로그 */}
          <div className="bg-white p-4 rounded-xl shadow-inner text-sm text-stone-600 border border-stone-200">
            <h4 className="font-bold mb-2 text-stone-800">기록</h4>
            {log.length === 0 ? <p className="text-stone-400">아직 공부한 기록이 없습니다.</p> : 
              log.map((entry, idx) => (
                <div key={idx} className={`py-1 ${idx === 0 ? 'text-black font-semibold' : 'opacity-70'}`}>
                  {entry}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  // 렌더링 파트: 결과 화면
  const results = getFinalResults();
  const averageGrade = (results.reduce((acc, cur) => acc + cur.grade, 0) / results.length).toFixed(1);
  const isAdmitted = parseFloat(averageGrade) <= 2.0;

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-stone-100 text-stone-800 p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: KU_CRIMSON }}>
        
        {/* 결과 성적표 헤더 */}
        <div className="text-white p-8 text-center" style={{ backgroundColor: KU_CRIMSON }}>
          <h1 className="text-4xl font-extrabold mb-2">대학수학능력시험 성적통지표</h1>
          <p className="opacity-90">제 2027 학년도</p>
        </div>

        {/* 성적 테이블 */}
        <div className="p-8 overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-stone-100 border-y-2 border-stone-300 text-stone-700">
                <th className="p-3 font-bold">영역 (과목)</th>
                <th className="p-3 font-bold">원점수</th>
                <th className="p-3 font-bold">표준점수</th>
                <th className="p-3 font-bold">백분위</th>
                <th className="p-3 font-bold">등급</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, idx) => (
                <tr key={idx} className="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold text-lg">{res.name}</td>
                  <td className="p-4">{res.raw}</td>
                  <td className="p-4 text-stone-500">{res.type === 'absolute' ? '-' : res.stdScore}</td>
                  <td className="p-4 text-stone-500">{res.type === 'absolute' ? '-' : res.percentile}</td>
                  <td className="p-4 font-bold text-xl" style={{ color: res.grade <= 2 ? KU_CRIMSON : 'inherit' }}>
                    {res.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 최종 합격 여부 */}
        <div className="p-8 bg-stone-50 text-center border-t border-stone-200">
          <div className="mb-6">
            <span className="text-lg text-stone-600 font-semibold">전 과목 평균 등급: </span>
            <span className="text-3xl font-bold ml-2">{averageGrade}</span>
          </div>
          
          {isAdmitted ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200 shadow-sm">
              <h2 className="text-3xl font-bold text-green-700 mb-2">🎉 고려대학교 합격!</h2>
              <p className="text-green-600">축하합니다! 호랑이의 기운이 당신과 함께합니다.</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
              <h2 className="text-3xl font-bold text-red-700 mb-2">💧 불합격</h2>
              <p className="text-red-600">평균 2.0 등급 이내를 달성하지 못했습니다. 재도전하시겠습니까?</p>
            </div>
          )}

          <button 
            onClick={() => setPhase('intro')}
            className="mt-8 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 shadow-md"
            style={{ backgroundColor: KU_CRIMSON }}
          >
            다시 도전하기
          </button>
        </div>
      </div>
    </div>
  );
}