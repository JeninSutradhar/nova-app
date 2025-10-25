'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { importSessions } from '@/lib/db/indexedDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { loadDefaultContent } from '@/lib/content/loadContent';
import type { ContentPack, Event, Choice } from '@/lib/types/game';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<ContentPack | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Friendly UI toggles
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [kThreshold, setKThreshold] = useState<number>(10);

  useEffect(() => {
    loadDefaultContent().then(setContent);
  }, []);

  // Derived filtered sessions
  const filteredSessions = useMemo(() => {
    if (!sessions?.length) return [] as any[];
    const fromTs = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : -Infinity;
    const toTs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;
    return sessions.filter((s: any) => {
      const t = s.startedAt || 0;
      return t >= fromTs && t <= toTs;
    });
  }, [sessions, dateFrom, dateTo]);

  useEffect(() => {
    if (filteredSessions.length) {
      calculateStats(filteredSessions);
    } else {
      setStats(null);
    }
  }, [filteredSessions, kThreshold, isDemo]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const count = await importSessions(text);
      const importedData = JSON.parse(text);
      setIsDemo(false);
      setSessions(importedData.sessions || []);
      calculateStats(importedData.sessions || []);
      alert(`Uploaded ${count} sessions`);
    } catch (error) {
      alert('Upload failed. Please check the file format.');
      console.error(error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function getEventLabel(eventId: string): string {
    if (!content) return eventId;
    const event = content.events.find((e: Event) => e.id === eventId);
    return event?.title || eventId;
  }

  function getChoiceLabel(eventId: string, choiceId: string): string {
    if (!content) return choiceId;
    const event = content.events.find((e: Event) => e.id === eventId);
    const choice = (event?.choices as any)?.find((c: Choice) => c.id === choiceId);
    return (choice as any)?.label || choiceId;
  }

  // Create friendly demo data so the dashboard always feels alive
  function createDemoSessions(count: number = 24): any[] {
    if (!content) return [];
    const demo: any[] = [];
    const eventIds = content.events.map((e) => e.id);
    const choiceIdx = (e: Event) => Math.floor(Math.random() * (e.choices as any[]).length);

    for (let i = 0; i < count; i++) {
      const startedAt = Date.now() - Math.floor(Math.random() * 14) * 24 * 3600 * 1000;
      const ageBands = ['13-14', '15-16', '17-18'] as const;
      const ageBand = ageBands[Math.floor(Math.random() * ageBands.length)] as any;
      const metrics = {
        Health: 40 + Math.floor(Math.random() * 50),
        MentalWellbeing: 40 + Math.floor(Math.random() * 50),
        Relationships: 40 + Math.floor(Math.random() * 50),
        Academics: 40 + Math.floor(Math.random() * 50),
        Reputation: 35 + Math.floor(Math.random() * 55),
        Stress: 30 + Math.floor(Math.random() * 60),
        RiskAwareness: 30 + Math.floor(Math.random() * 60),
        SupportNetwork: 30 + Math.floor(Math.random() * 60),
        Time: 0,
      } as any;

      const decisions: any[] = [];
      const steps = 6 + Math.floor(Math.random() * 4);
      for (let s = 0; s < steps; s++) {
        const ev = content.events[Math.floor(Math.random() * content.events.length)];
        const c = (ev.choices as any[])[choiceIdx(ev)];
        decisions.push({ eventId: ev.id, choiceId: c.id, at: startedAt + s * 600000, metricDeltas: {}, achievement: null });
      }

      const achievements = (content.achievements || [])
        .filter(() => Math.random() < 0.25)
        .slice(0, 2)
        .map((a) => a.name);

      demo.push({
        id: `demo-${i}`,
        startedAt,
        profile: { ageBand },
        metrics,
        achievements,
        decisions,
        seenEventIds: Array.from(new Set(decisions.map((d) => d.eventId))),
      });
    }
    return demo;
  }

  function handleUseDemo() {
    const demo = createDemoSessions(30);
    setIsDemo(true);
    setSessions(demo);
    calculateStats(demo);
  }

  function calculateStats(sessionData: any[]) {
    if (!sessionData || sessionData.length === 0) {
      setStats(null);
      return;
    }

    const totalSessions = sessionData.length;
    // k-anonymity threshold (hidden under Settings unless demo)
    if (!isDemo && totalSessions < kThreshold) {
      setStats({ error: `Need at least ${kThreshold} sessions for privacy protection` });
      return;
    }

    const avgMetrics: any = {};
    const choiceCounts: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const achievementsCounts: Record<string, number> = {};
    const ageDist: Record<string, number> = { '13-14': 0, '15-16': 0, '17-18': 0, Unknown: 0 };

    let lowHealth = 0, highStress = 0, lowSupport = 0, lowAcademics = 0;

    sessionData.forEach((session: any) => {
      // Metrics aggregates
      Object.keys(session.metrics || {}).forEach((key) => {
        if (!avgMetrics[key]) avgMetrics[key] = 0;
        avgMetrics[key] += session.metrics[key];
      });

      // Age band
      const band = session?.profile?.ageBand || 'Unknown';
      ageDist[band] = (ageDist[band] || 0) + 1;

      // Risk signals
      const m = session.metrics || {};
      if ((m.Health ?? 0) < 45) lowHealth += 1;
      if ((m.Stress ?? 0) > 60) highStress += 1;
      if ((m.SupportNetwork ?? 0) < 40) lowSupport += 1;
      if ((m.Academics ?? 0) < 45) lowAcademics += 1;

      // Decisions
      session.decisions?.forEach((d: any) => {
        const eventKey = `${d.eventId}`;
        eventCounts[eventKey] = (eventCounts[eventKey] || 0) + 1;

        const choiceKey = `${d.eventId}-${d.choiceId}`;
        choiceCounts[choiceKey] = (choiceCounts[choiceKey] || 0) + 1;

        // Tags by event
        const ev = content?.events.find((e) => e.id === d.eventId);
        ev?.tags?.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });

      // Achievements
      (session.achievements || []).forEach((a: string) => {
        achievementsCounts[a] = (achievementsCounts[a] || 0) + 1;
      });
    });

    Object.keys(avgMetrics).forEach((key) => {
      avgMetrics[key] = avgMetrics[key] / totalSessions;
    });

    const topEvents = Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([eventId, count]) => ({ 
        eventId, 
        name: getEventLabel(eventId),
        count 
      }));

    const topChoices = Object.entries(choiceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => {
        const [eventId, choiceId] = key.split('-');
        return {
          key,
          name: `${getEventLabel(eventId)}: ${getChoiceLabel(eventId, choiceId)}`,
          count
        };
      });

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 7)
      .map(([tag, count]) => ({ tag, count }));

    const achievementsTop = Object.entries(achievementsCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    setStats({
      totalSessions,
      avgMetrics,
      topEvents,
      topChoices,
      topTags,
      achievementsTop,
      ageDist,
      riskSignals: {
        lowHealth: Math.round((lowHealth / totalSessions) * 100),
        highStress: Math.round((highStress / totalSessions) * 100),
        lowSupport: Math.round((lowSupport / totalSessions) * 100),
        lowAcademics: Math.round((lowAcademics / totalSessions) * 100),
      },
      radarData: Object.entries(avgMetrics).filter(([k]) => k !== 'Time').map(([k, v]) => ({ metric: k, value: Math.round(v as number) })),
    });
  }

  function exportAggregatedCSV() {
    if (!stats) return;
    const lines: string[] = [];
    lines.push('Metric,Average');
    Object.entries(stats.avgMetrics).forEach(([k, v]: any) => lines.push(`${k},${Math.round(v as number)}`));
    lines.push('');
    lines.push('Risk Signal,Percent');
    Object.entries(stats.riskSignals).forEach(([k, v]: any) => lines.push(`${k},${v}%`));
    lines.push('');
    lines.push('Top Tags,Count');
    stats.topTags.forEach((t: any) => lines.push(`${t.tag},${t.count}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nova-aggregated.csv';
    a.click();
  }

  const discussionPrompts = [
    'What protective strategies were most common in your class?',
    'Where did students struggle the most (stress, support, health)?',
    'How can we increase help-seeking and refusal efficacy next week?',
    'Which scenarios triggered the most discussion? Why?',
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold">Teacher Dashboard</h1>
            <div className="flex items-center gap-3">
              <Link href="/" className="ui-btn ui-btn-secondary">Home</Link>
            </div>
          </div>
          <p className="text-lg text-[color:var(--muted)]">Upload class sessions or preview with demo data to explore cohort insights.</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ui-card p-6 mb-8"
        >
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="ui-btn ui-btn-primary cursor-pointer">{uploading ? 'Uploading…' : 'Upload Sessions'}</label>
              <button onClick={handleUseDemo} className="ui-btn ui-btn-secondary">Try Demo Data</button>
              <button onClick={exportAggregatedCSV} className="ui-btn ui-btn-secondary" disabled={!stats}>Download CSV</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="ui-btn ui-btn-secondary">Filters</button>
              <button onClick={() => setShowSettings(!showSettings)} className="ui-btn ui-btn-secondary">Settings</button>
            </div>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 items-end mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full ui-card-solid px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full ui-card-solid px-3 py-2" />
              </div>
              <div className="md:col-span-2 text-sm text-[color:var(--muted)]">Adjust the date range to focus on a specific time window.</div>
            </div>
          )}

          {showSettings && (
            <div className="grid md:grid-cols-3 gap-4 items-end mt-4">
              <div className="md:col-span-2">
                <div className="text-sm font-medium mb-1">Privacy (teacher-only)</div>
                <div className="text-sm text-[color:var(--muted)] mb-2">To protect students, results only show when at least k sessions exist.</div>
                <input type="range" min={5} max={30} value={kThreshold} onChange={(e) => setKThreshold(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="text-sm text-[color:var(--muted)]">k = {kThreshold}</div>
            </div>
          )}
        </motion.div>

        {/* Privacy guard or stats */}
        {stats && stats.error && !isDemo && (
          <div className="ui-card p-8 mb-8">
            <h3 className="text-2xl font-bold mb-2">We need a few more sessions</h3>
            <p className="mb-4">For privacy, results appear once there are at least {kThreshold} sessions.</p>
            <div className="flex gap-3">
              <label htmlFor="file-upload" className="ui-btn ui-btn-primary cursor-pointer">Upload Sessions</label>
              <button onClick={handleUseDemo} className="ui-btn ui-btn-secondary">Preview with Demo Data</button>
            </div>
          </div>
        )}

        {stats && (!stats.error || isDemo) && (
          <>
            {/* Summary tiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <div className="ui-card p-6">
                <div className="text-sm text-[color:var(--muted)]">Total Sessions</div>
                <div className="text-4xl font-extrabold">{stats.totalSessions}{isDemo ? ' (demo)' : ''}</div>
              </div>
              <div className="ui-card p-6">
                <div className="text-sm text-[color:var(--muted)]">High Stress ( {'>'} 60 )</div>
                <div className="text-3xl font-extrabold" style={{ color: 'var(--lime-700)' }}>{stats.riskSignals.highStress}%</div>
              </div>
              <div className="ui-card p-6">
                <div className="text-sm text-[color:var(--muted)]">Low Support ( {'<'} 40 )</div>
                <div className="text-3xl font-extrabold" style={{ color: 'var(--lime-700)' }}>{stats.riskSignals.lowSupport}%</div>
              </div>
            </motion.div>

            {/* Charts row: Top events + Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-8 mb-8"
            >
              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">📊 Top Events Encountered</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topEvents}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9DDA4B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">📈 Class Skills Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stats.radarData}>
                      <PolarGrid stroke="rgba(15,23,42,0.15)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(15,23,42,0.6)', fontSize: 8 }} />
                      <Radar name="Class Avg" dataKey="value" stroke="#9DDA4B" fill="#C6F36B" fillOpacity={0.35} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Second row: Age distribution + Top choices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-8 mb-8"
            >
              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">👥 Age Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(stats.ageDist).map(([age, count]: any) => ({ age, count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.1)" />
                      <XAxis dataKey="age" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">🎯 Most Common Choices</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topChoices} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.1)" />
                      <XAxis type="number" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 9 }} width={250} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9DDA4B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Third row: Tags + Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-8 mb-10"
            >
              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">🏷️ Top Themes (Tags)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topTags}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.1)" />
                      <XAxis dataKey="tag" tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(15,23,42,0.8)', fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="ui-card p-8">
                <h3 className="text-2xl font-bold mb-4">🏆 Achievements Leaderboard</h3>
                <div className="space-y-2">
                  {stats.achievementsTop.length === 0 ? (
                    <div className="text-[color:var(--muted)]">No achievements recorded in this cohort.</div>
                  ) : (
                    stats.achievementsTop.map((a: any) => (
                      <div key={a.name} className="ui-card-solid p-3 flex items-center justify-between">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-sm text-[color:var(--muted)]">{a.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Discussion Prompts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ui-card p-8 mb-8"
            >
              <h2 className="text-2xl font-bold mb-6">💬 Discussion Prompts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {discussionPrompts.map((prompt, i) => (
                  <div key={i} className="ui-card-solid p-4">
                    <p>{prompt}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="ui-btn ui-btn-secondary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
