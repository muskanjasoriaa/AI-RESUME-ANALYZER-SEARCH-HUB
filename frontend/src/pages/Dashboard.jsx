import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import { 
  FileText, 
  Upload, 
  Compass, 
  Briefcase, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck,
  CheckSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch resume history
      const histRes = await api.get('/resume/history');
      setResumes(histRes.resumes || []);

      // If user has a resume, load latest full analysis
      if (histRes.resumes && histRes.resumes.length > 0) {
        const latestId = histRes.resumes[0].id;
        const analysisRes = await api.get(`/resume/${latestId}`);
        setLatestAnalysis(analysisRes);
      }

      // 2. Fetch current roadmap
      const rmRes = await api.get('/roadmap/current');
      setRoadmap(rmRes.roadmap);

      // 3. Fetch recommended jobs
      const jobsRes = await api.get('/jobs/recommendations');
      setRecommendedJobs((jobsRes.recommendations || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', user?.target_role || 'Full-Stack Developer');

    try {
      const res = await api.post('/resume/upload', formData);
      navigate(`/analysis/${res.resume_id}`, { state: { analysisData: res } });
    } catch (err) {
      setUploadError(err.message || 'Failed to upload and analyze resume.');
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadReport = async (resumeId, e) => {
    e.stopPropagation();
    try {
      const blob = await api.get(`/resume/${resumeId}/export-report`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Report_Resume_${resumeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Could not download report: ' + err.message);
    }
  };

  const latestScore = latestAnalysis ? latestAnalysis.general_score : 0;
  const matchedSkills = latestAnalysis?.skill_gap?.matched_skills || [];
  const missingSkills = latestAnalysis?.skill_gap?.missing_skills || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Software Engineering Laboratory | Academic Project
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your centralized AI workspace for ATS optimization, real-time skill-gap diagnosis, and milestone-guided career preparation.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload & Analyze Resume
            </Link>
            <Link
              to="/compare-jd"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur border border-white/10 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              Compare with Job Description
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur border border-white/10 transition-all"
            >
              <Compass className="w-4 h-4" />
              View Career Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Latest ATS Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest ATS Score</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{latestScore}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="text-xs text-slate-500">
            {latestScore >= 75 ? (
              <span className="text-emerald-600 font-semibold">● ATS Optimized</span>
            ) : latestScore > 0 ? (
              <span className="text-amber-600 font-semibold">● Optimization Recommended</span>
            ) : (
              <span>No resume uploaded yet</span>
            )}
          </div>
        </div>

        {/* Selected Career Goal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Career Goal</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <h3 className="text-base font-bold text-slate-800 line-clamp-1">
              {user?.target_role || 'Full-Stack Developer'}
            </h3>
            <span className="text-xs text-slate-400">High Industry Demand</span>
          </div>
          <Link to="/roadmap" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            Change or view requirements <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Skill Gap Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skill Gap Overview</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-center gap-4">
            <div>
              <span className="text-2xl font-extrabold text-emerald-600">{matchedSkills.length}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Verified Skills</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-2xl font-extrabold text-rose-500">{missingSkills.length}</span>
              <span className="block text-[11px] text-slate-500 font-medium">Missing Skills</span>
            </div>
          </div>
          <Link to="/upload" className="text-xs font-semibold text-blue-600 hover:underline">
            Analyze new skill updates →
          </Link>
        </div>

        {/* Roadmap Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {roadmap?.progress_percentage || 0}%
              </span>
              <span className="text-xs text-slate-500">
                {roadmap?.completed_milestones || 0} / {roadmap?.total_milestones || 0} done
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${roadmap?.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>
          <Link to="/roadmap" className="text-xs font-semibold text-purple-600 hover:underline">
            Continue learning plan →
          </Link>
        </div>

      </div>

      {/* 3. Drag-and-Drop Resume Upload Quick Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Instant Resume Upload & NLP Analysis</h2>
            <p className="text-xs text-slate-500">
              Upload PDF or DOCX format (Max 10MB). Scored using explainable multi-factor ATS algorithm.
            </p>
          </div>
          <Link
            to="/upload"
            className="text-xs font-semibold text-blue-600 hover:underline hidden sm:block"
          >
            Or test pre-loaded sample resumes →
          </Link>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {uploadError}
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-800">Parsing Resume & Calculating ATS Score...</p>
              <p className="text-xs text-slate-500">Extracting entities, education, skills, and quantifiable metrics</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop your resume file here, or{' '}
                  <label className="text-blue-600 font-bold hover:underline cursor-pointer">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports Adobe PDF (.pdf) & Microsoft Word (.docx)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Latest Diagnosis & Analysis History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Latest Diagnosis Spotlight */}
          {latestAnalysis ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Active Resume Diagnostic
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {latestAnalysis.filename}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Evaluated against: <b className="text-slate-700">{latestAnalysis.target_role}</b>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDownloadReport(latestAnalysis.resume_id, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    Download PDF Report
                  </button>
                  <Link
                    to={`/analysis/${latestAnalysis.resume_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Full Analysis <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Gauge and Category Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center sm:border-r border-slate-100 pr-4">
                  <ScoreGauge score={latestAnalysis.general_score} size={150} />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Scoring Breakdown
                  </h4>
                  {Object.entries(latestAnalysis.category_scores || {}).map(([key, item]) => {
                    const pct = Math.round((item.score / item.max) * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{item.label}</span>
                          <span className="font-bold text-slate-900">{item.score} / {item.max} pts</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skill Gap Snapshot */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role Skill Alignment ({latestAnalysis.target_role})
                  </h4>
                  <Link to="/roadmap" className="text-xs font-semibold text-blue-600 hover:underline">
                    Roadmap to fill missing skills →
                  </Link>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Matched Skills ({matchedSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.slice(0, 10).map((s) => (
                        <SkillBadge key={s} name={s} type="matched" />
                      ))}
                      {matchedSkills.length > 10 && (
                        <span className="text-xs text-slate-400 self-center">+{matchedSkills.length - 10} more</span>
                      )}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        High Priority Missing Skills ({missingSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.slice(0, 8).map((s) => (
                          <SkillBadge key={s} name={s} type="missing" />
                        ))}
                        {missingSkills.length > 8 && (
                          <span className="text-xs text-slate-400 self-center">+{missingSkills.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Resume Analyzed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your resume above or choose from our pre-seeded sample resumes to see your full ATS score and skill gaps.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Choose Sample or Upload
              </Link>
            </div>
          )}

          {/* Recent Resume History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Resume Analysis History</h3>
            {resumes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No past uploads recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">File Name</th>
                      <th className="pb-3">Role Target</th>
                      <th className="pb-3">ATS Score</th>
                      <th className="pb-3">Uploaded</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumes.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="truncate max-w-[180px]">{res.original_filename}</span>
                        </td>
                        <td className="py-3 text-slate-600">{res.target_role || 'General'}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            res.ats_score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {Math.round(res.ats_score)}/100
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(res.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={(e) => handleDownloadReport(res.id, e)}
                            className="text-slate-400 hover:text-blue-600 font-medium"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                          <Link
                            to={`/analysis/${res.id}`}
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col): Recommended Opportunities & Active Milestones */}
        <div className="space-y-8">
          
          {/* Recommended Jobs & Internships */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Roles</h3>
                <p className="text-[11px] text-slate-400">Matched to your extracted skills</p>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedJobs.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No recommended jobs found.</p>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                          {job.title}
                        </h4>
                        <span className="text-[11px] text-slate-500">{job.company}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                        {Math.round(job.match_percentage)}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                      <span>{job.job_type}</span>
                      <span className="font-semibold text-slate-700">{job.salary_range}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/jobs"
              className="block w-full py-2 text-center text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Explore All Jobs & Internships →
            </Link>
          </div>

          {/* Quick Active Roadmap Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Roadmap Milestones</h3>
              <span className="text-xs font-semibold text-purple-600">
                {roadmap?.completed_milestones || 0}/{roadmap?.total_milestones || 0}
              </span>
            </div>

            {roadmap?.phases ? (
              <div className="space-y-3">
                {roadmap.phases[0]?.milestones.slice(0, 3).map((m) => (
                  <div key={m.key} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="mt-0.5">
                      {m.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                      )}
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800 line-clamp-1">{m.title}</p>
                      <span className="text-[10px] text-slate-400">Estimate: {m.estimated_weeks}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">Roadmap not yet generated.</p>
            )}

            <Link
              to="/roadmap"
              className="block w-full py-2 text-center text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              Open Interactive Roadmap Tracker →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
