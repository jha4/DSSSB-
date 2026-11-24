import React, { useEffect, useMemo, useState } from 'react';

type Row = {
  exam: string | null; Paper: string | null; Section: string | null; Topic: string | null;
  Question: string | null; "Option A": string | null; "Option B": string | null;
  "Option C": string | null; "Option D": string | null; Answer: string | null;
  Explanation: string | null; Passage: string | null; Notes: string | null;
  "Image-based?": string | null; sourceRow: number;
};

const optionKeys = ["Option A", "Option B", "Option C", "Option D"] as const;

export const TeachingMethodologyPYQBank: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [showAnswers, setShowAnswers] = useState(false);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}notes/teaching-methodology-pyq-data.json.gz.b64`);
        if (!response.ok) throw new Error(`Dataset request failed: ${response.status}`);
        const encoded = (await response.text()).trim();
        const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
        const parsed = JSON.parse(await new Response(stream).text()) as Row[];
        if (parsed.length !== 150) throw new Error(`Expected 150 source records; received ${parsed.length}`);
        if (active) setRows(parsed);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load the complete question bank.");
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const topics = useMemo(() => ["All topics", ...Array.from(new Set(rows.map((r) => r.Topic || "Unlabelled")))], [rows]);
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesTopic = topic === "All topics" || (row.Topic || "Unlabelled") === topic;
    const haystack = [row.Question, row.Explanation, row.Topic, row.exam, row.Paper, row.Notes, row.Passage, ...optionKeys.map((k) => row[k])]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return matchesTopic && haystack.includes(query.trim().toLocaleLowerCase());
  }), [rows, topic, query]);

  const answerLetter = (value: string | null) => {
    const v = (value || "").trim().toUpperCase();
    if (/^[A-D]$/.test(v)) return v;
    if (/^[1-4]$/.test(v)) return String.fromCharCode(64 + Number(v));
    return "";
  };
  const score = filtered.reduce((total, row) => total + (choices[row.sourceRow] && choices[row.sourceRow] === answerLetter(row.Answer) ? 1 : 0), 0);
  const attempted = filtered.filter((row) => Boolean(choices[row.sourceRow])).length;

  return (
    <section className="mt-8 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm sm:p-6 dark:border-indigo-900 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Teaching Methodology PYQ Bank</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">All 150 source records from the Part A workbook. Duplicate records are retained; 110 records contain four option texts and 40 have no option text in the source.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{rows.length || "…"} / 150 records loaded</span>
      </div>
      {loadError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">Could not load the complete workbook dataset: {loadError}</p>}
      {!rows.length && !loadError && <p className="mt-4 text-sm text-slate-500">Loading all workbook records…</p>}
      {rows.length > 0 && <>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <input aria-label="Search questions" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions, options, explanations…" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          <select aria-label="Filter by source topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setShowAnswers((v) => !v); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{showAnswers ? "Hide all answers" : "Reveal all answers"}</button>
          <button type="button" onClick={() => { setChoices({}); setChecked(false); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Reset quiz</button>
          <button type="button" onClick={() => setChecked(true)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Check score</button>
          <span className="ml-auto text-xs text-slate-500">{filtered.length} matching records · {attempted} attempted{checked ? ` · Score: ${score}/${filtered.length}` : ""}</span>
        </div>
        <ol className="mt-5 space-y-4">
          {filtered.map((row) => {
            const key = answerLetter(row.Answer);
            const hasOptions = optionKeys.some((k) => Boolean(row[k]?.trim()));
            return <li key={row.sourceRow} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Source row {row.sourceRow}</span><span>·</span><span>{row.Topic || "Topic not labelled"}</span>
                {row.exam && <><span>·</span><span>{row.exam}</span></>}
                {row.Paper && <><span>·</span><span>{row.Paper}</span></>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-900 dark:text-white">{row.Question || "Question text missing in source workbook."}</p>
              {hasOptions ? <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Answer options</legend>
                {optionKeys.map((optionKey, index) => {
                  const value = row[optionKey];
                  if (!value?.trim()) return null;
                  const letter = String.fromCharCode(65 + index);
                  const isCorrect = checked && key === letter;
                  const isWrong = checked && choices[row.sourceRow] === letter && key !== letter;
                  return <label key={optionKey} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/40" : isWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" : "border-slate-200 dark:border-slate-700"}`}>
                    <input type="radio" name={`q-${row.sourceRow}`} value={letter} checked={choices[row.sourceRow] === letter} onChange={() => { setChoices((old) => ({ ...old, [row.sourceRow]: letter })); setChecked(false); }} className="mt-1" />
                    <span><strong>{letter}.</strong> {value}</span>
                  </label>;
                })}
              </fieldset> : <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">No option text is present for this record in the source workbook; options have not been reconstructed.</p>}
              {(showAnswers || checked) && <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-950/40">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Workbook answer key: {row.Answer || "Not supplied"}{key ? ` (interpreted as ${key})` : ""}</p>
                {row.Explanation && <p className="mt-1 whitespace-pre-wrap text-emerald-900 dark:text-emerald-100"><strong>Explanation:</strong> {row.Explanation}</p>}
              </div>}
              {row.Passage && <details className="mt-2 text-xs"><summary className="cursor-pointer font-semibold">Source passage</summary><p className="mt-1 whitespace-pre-wrap">{row.Passage}</p></details>}
              {row.Notes && <p className="mt-2 text-xs text-slate-500">Source notes: {row.Notes}</p>}
            </li>;
          })}
        </ol>
        {!filtered.length && <p className="mt-6 text-center text-sm text-slate-500">No records match the current search and topic filter.</p>}
      </>}
      <p className="mt-5 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-700">Source: uploaded DSSSB Part A workbook, “part A” sheet. Answer keys are displayed as supplied; numeric keys 1–4 are additionally mapped to A–D for quiz checking. Missing source fields are left missing. This bank contains 150 records, including repeated question texts.</p>
    </section>
  );
};
