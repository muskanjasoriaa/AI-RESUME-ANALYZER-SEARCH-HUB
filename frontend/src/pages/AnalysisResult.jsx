import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../api/client';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import { 
  FileText, 
  Download, 
  CheckSquare, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  Sparkles,
  Zap,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Link as LinkIcon,
  Phone,
  Mail,
  User
} from 'lucide-react';

export default function AnalysisResult() {
  const { resumeId } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!location.state?.analysisData);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'skills', 'entities', 'recommendations'

  useEffect(() => {
    if (!data && resumeId) {
      loadAnalysis();
    }
  }, [resumeId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resume/${resumeId}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const id = data?.resume_id || resumeId;
      const blob = await api.get(`/resume/${id}/export-report`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Evaluation_Report_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-base font-bold text-slate-800">Loading Diagnostic Report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Could not locate the requested resume analysis record.'}</p>
        <Link to="/upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Upload a Resume
        </Link>
      </div>
    );
  }

  const generalScore = data.general_score ?? 0;
  const categoryScores = data.category_scores || {};
  const strengths = data.strengths || [];
  const weaknesses = data.weaknesses || [];
  const recommendations = data.recommendations || [];
  const skillGap = data.skill_gap || {};
  const entities = data.parsed_entities || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/compare-jd"
            state={{ resumeId: data.resume_id || resumeId }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            Compare with Specific JD
          </Link>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            View Role Roadmap
          </Link>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Main Score & Diagnostic Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Circular Score Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-100">
            <ScoreGauge score={generalScore} size={180} strokeWidth={14} label="General ATS Score" />
            <div className="mt-4 text-center">
              <span className="text-xs font-semibold text-slate-400">Target Role Benchmark</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{data.target_role}</p>
            </div>
          </div>

          {/* Quick Metrics & Document Properties */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 uppercase">
                  Diagnostic Complete
                </span>
                <span className="text-xs text-slate-400">
                  File: <b className="text-slate-700">{data.filename}</b>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                ATS Compatibility & Parsability Evaluation
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Evaluated using an explainable mathematical algorithm measuring section completeness, keyword density, action verbs, quantifiable metrics, and readability.
              </p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Total Words</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {entities.readability?.word_count || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">350 - 900 optimal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Skills Detected</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {entities.skills?.total_count || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Tech & soft skills</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Action Verbs</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {entities.action_verbs?.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">Dynamic impact verbs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Metrics Found</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {entities.quantifiable_metrics?.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">%, $, speed metrics</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Score Breakdown & Feedback' },
            { id: 'skills', label: 'Skill Gap & Ontology' },
            { id: 'entities', label: 'Extracted Sections & Entities' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Category Progress Bars */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Dimension Breakdown (Max 100 Points)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categoryScores).map(([key, item]) => {
                const pct = Math.round((item.score / item.max) * 100);
                return (
                  <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.label}</span>
                      <span className="text-slate-900">{item.score} / {item.max} pts</span>
                    </div>
                    <div className="w-full bg-slate-200/70 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{pct}% benchmark achieved</span>
                      <span>{pct >= 80 ? 'Optimal' : pct >= 50 ? 'Satisfactory' : 'Needs Action'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Key Resume Strengths</h3>
              </div>
              <ul className="space-y-2.5">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Identified Bottlenecks & Weaknesses</h3>
              </div>
              <ul className="space-y-2.5">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Prioritized Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Actionable Optimization Steps
              </h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {idx + 1}. {rec.issue}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                        {rec.potential_gain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SKILLS & GAP BREAKDOWN */}
      {activeTab === 'skills' && (
        <div className="space-y-8">
          
          {/* Target Role Alignment */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Role Competency Alignment ({data.target_role})
            </h3>
            
            {/* Matched Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verified Matched Skills ({skillGap.matched_skills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-2">
                {(skillGap.matched_skills || []).map((s) => (
                  <SkillBadge key={s} name={s} type="matched" />
                ))}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Missing Critical Skills ({skillGap.missing_skills?.length || 0})
              </span>
              <p className="text-xs text-slate-500">
                Acquiring these competencies will directly improve ATS match rates and hiring manager appeal.
              </p>
              <div className="flex flex-wrap gap-2">
                {(skillGap.missing_skills || []).map((s) => (
                  <SkillBadge key={s} name={s} type="missing" />
                ))}
              </div>
            </div>

            {/* Weak Skills */}
            {skillGap.weak_skills?.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Weakly Proven Skills ({skillGap.weak_skills.length})
                </span>
                <p className="text-xs text-slate-500">
                  These skills only appear once or lack project bullet points demonstrating practical production use.
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillGap.weak_skills.map((s) => (
                    <SkillBadge key={s} name={s} type="weak" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Extracted Skills by Taxonomy Category */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              All Identified Skills by Technical Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(entities.skills?.categorized || {}).map(([cat, skillsList]) => {
                if (!skillsList || skillsList.length === 0) return null;
                const formatLabel = cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div key={cat} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      {formatLabel} ({skillsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((s) => (
                        <SkillBadge key={s} name={s} type="default" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EXTRACTED ENTITIES */}
      {activeTab === 'entities' && (
        <div className="space-y-8">
          
          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Extracted Contact & Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">Candidate Name</span>
                <span className="font-bold text-slate-900">{entities.contact_info?.name || 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">Email</span>
                <span className="font-bold text-slate-900">{entities.contact_info?.email || 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-900">{entities.contact_info?.phone || 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">LinkedIn URL</span>
                <span className="font-bold text-blue-600 truncate block">{entities.contact_info?.linkedin || 'None'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">GitHub Profile</span>
                <span className="font-bold text-blue-600 truncate block">{entities.contact_info?.github || 'None'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-400 block">Portfolio / Site</span>
                <span className="font-bold text-blue-600 truncate block">{entities.contact_info?.portfolio || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Extracted Education
            </h3>
            {entities.education?.length > 0 ? (
              <div className="space-y-3">
                {entities.education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-xs text-slate-600">{edu.institution} | {edu.field_of_study}</p>
                      <span className="text-[11px] text-slate-400">Graduation: {edu.year}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {edu.grade}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No education block parsed.</p>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Experience & Detected Accomplishments
            </h3>
            {entities.experience?.length > 0 ? (
              <div className="space-y-3">
                {entities.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                    <p className="text-xs text-slate-600">{exp.summary}</p>
                    {exp.action_verbs?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-semibold text-slate-400">Verbs detected:</span>
                        {exp.action_verbs.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No formal experience blocks extracted.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
