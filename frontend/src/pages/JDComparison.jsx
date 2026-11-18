import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import { 
  CheckSquare, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Briefcase,
  Layers,
  Copy
} from 'lucide-react';

const SAMPLE_JDS = [
  {
    title: "Full-Stack Software Engineer — Stripe Ecosystem",
    text: `We are looking for a Full-Stack Software Engineer to build resilient payment checkout experiences.
Requirements:
- 2+ years of experience with React, TypeScript, and modern JavaScript.
- Strong backend experience with Node.js, Express, and PostgreSQL databases.
- Familiarity with Docker containerization and AWS cloud infrastructure.
- Solid understanding of REST APIs, Git version control, and CI/CD pipelines.
- Excellent communication and team collaboration skills.`
  },
  {
    title: "Machine Learning & AI Engineer — Autonomous Lab",
    text: `Seeking an innovative Machine Learning Engineer to deploy state-of-the-art predictive pipelines.
Key Responsibilities:
- Design, train, and benchmark deep learning models using Python, PyTorch, and TensorFlow.
- Leverage Scikit-Learn, Pandas, and NumPy for feature engineering and statistical validation.
- Experience with Natural Language Processing (NLP), Large Language Models (LLMs), and Hugging Face.
- Deploy models via FastAPI or Docker microservices.`
  },
  {
    title: "DevOps & Cloud Infrastructure Engineer — Cloudflare Systems",
    text: `Join our Site Reliability & Cloud Infrastructure team.
Requirements:
- Hands-on mastery of Linux operating systems, Shell/Bash scripting, and system administration.
- Proven experience with Docker, Kubernetes (K8s), and infrastructure as code using Terraform.
- Working knowledge of AWS or Google Cloud Platform (GCP).
- Experience setting up GitHub Actions CI/CD pipelines and Prometheus/Grafana monitoring.`
  }
];

export default function JDComparison() {
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.resumeId || '');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await api.get('/resume/history');
      setResumes(res.resumes || []);
      if (!selectedResumeId && res.resumes && res.resumes.length > 0) {
        setSelectedResumeId(res.resumes[0].id);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a resume to compare.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste or load a target job description.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/resume/compare-jd', {
        resume_id: parseInt(selectedResumeId),
        job_description: jobDescription,
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Job description comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJD = (sample) => {
    setJobDescription(sample.text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Job Description Tailoring & Match Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Compare Resume with Job Description
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Compute semantic TF-IDF cosine similarity, keyword coverage, and role-specific skill alignment.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Resume Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            1. Select Resume
          </label>
          {resumes.length === 0 ? (
            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              No resumes uploaded yet. Please upload a resume first before running JD comparison.
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename} (ATS Score: {Math.round(r.ats_score)}/100) — {new Date(r.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Paste Target Job Description
            </label>
            <span className="text-[11px] text-slate-400">
              Paste requirements, responsibilities & tech stack
            </span>
          </div>
          <textarea
            rows={7}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste complete job description or requirements here..."
            className="w-full p-3.5 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-y"
          ></textarea>
        </div>

        {/* Quick Sample JD Buttons */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Pre-Filled Sample Job Descriptions:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_JDS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSampleJD(s)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                + {s.title.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCompare}
          disabled={loading || !selectedResumeId || !jobDescription.trim()}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Comparing Resume Against Job Description...</span>
            </div>
          ) : (
            <>
              <span>Calculate Job-Specific ATS Match</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-100 pb-8">
            <div className="md:col-span-4 flex justify-center">
              <ScoreGauge score={result.match_score} size={170} label="JD Match Score" />
            </div>

            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Target Role Match Result
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {result.match_tier}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Based on exact skill requirements, keyword density, and semantic cosine similarity.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Skill Coverage
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {result.skill_overlap_percent}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Cosine Similarity
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {result.cosine_similarity}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Total JD Skills
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {result.total_jd_skills_found}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matched Skills ({result.matched_skills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((s) => (
                    <SkillBadge key={s} name={s} type="matched" />
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None matched</span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Missing Required Skills ({result.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((s) => (
                    <SkillBadge key={s} name={s} type="missing" />
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold">100% skill match!</span>
                )}
              </div>
            </div>

          </div>

          {/* Weak Skills */}
          {result.weak_skills?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Weakly Proven Skills ({result.weak_skills.length})
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                These skills match the job description but are only mentioned once in passing:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.weak_skills.map((s) => (
                  <SkillBadge key={s} name={s} type="weak" />
                ))}
              </div>
            </div>
          )}

          {/* Tailoring Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Specific Resume Tailoring Recommendations
            </h4>
            <div className="space-y-2">
              {result.tailoring_tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
