import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  DollarSign, 
  ExternalLink, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function JobRecommendations() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // 'All', 'Internship', 'Full-time'
  const [filterRemote, setFilterRemote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/recommendations');
      setJobs(res.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommended jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filterType !== 'All' && job.job_type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (filterRemote && !job.is_remote) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = (job.matched_skills || []).some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Skill-Matched Career Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recommended Jobs & Internships
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmic matchmaking based on your uploaded resume's verified technical competencies.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role, company, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Internship', 'Full-time'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}

          <button
            onClick={() => setFilterRemote(!filterRemote)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterRemote
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Remote Only {filterRemote && '✓'}
          </button>
        </div>

      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">Matching Candidate Skills to Opportunities...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Positions Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      {job.company}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {job.job_type}
                    </span>
                    {job.is_remote && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Remote
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {job.salary_range}
                    </span>
                  </div>
                </div>

                {/* Match percentage badge */}
                <div className="shrink-0 flex items-center sm:flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    job.match_percentage >= 75
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {Math.round(job.match_percentage)}% Skill Match
                  </span>
                </div>

              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {job.description}
              </p>

              {/* Skills overlap */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Matched Skills:</span>
                  {(job.matched_skills || []).map((s) => (
                    <SkillBadge key={s} name={s} type="matched" />
                  ))}
                  {(!job.matched_skills || job.matched_skills.length === 0) && (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </div>

                {(job.missing_skills || []).length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">Skills to Add:</span>
                    {job.missing_skills.map((s) => (
                      <SkillBadge key={s} name={s} type="missing" />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Apply on Career Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
