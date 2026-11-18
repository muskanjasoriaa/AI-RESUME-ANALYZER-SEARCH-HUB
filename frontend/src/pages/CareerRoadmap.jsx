import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Award, 
  Code, 
  BookOpen, 
  CheckSquare, 
  ChevronDown,
  Layers,
  Zap,
  TrendingUp,
  Circle
} from 'lucide-react';

export default function CareerRoadmap() {
  const { user, updateUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(user?.target_role || 'Full-Stack Developer');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRolesAndRoadmap();
  }, []);

  const loadRolesAndRoadmap = async () => {
    setLoading(true);
    try {
      const rolesRes = await api.get('/roadmap/roles');
      setRoles(rolesRes.roles || []);

      const currentRes = await api.get('/roadmap/current');
      setRoadmap(currentRes.roadmap);
      if (currentRes.roadmap?.target_role) {
        setSelectedRole(currentRes.roadmap.target_role);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (roleName) => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post('/roadmap/generate', { target_role: roleName });
      setRoadmap(res.roadmap);
      setSelectedRole(roleName);
      if (user) {
        updateUser({ ...user, target_role: roleName });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (milestoneKey, newStatus) => {
    try {
      await api.post(`/roadmap/milestones/${milestoneKey}/status`, { status: newStatus });
      // Update local state smoothly
      if (roadmap && roadmap.phases) {
        let completed = 0;
        let total = 0;
        const updatedPhases = roadmap.phases.map((phase) => ({
          ...phase,
          milestones: phase.milestones.map((m) => {
            total++;
            if (m.key === milestoneKey) {
              m.status = newStatus;
            }
            if (m.status === 'completed') {
              completed++;
            }
            return m;
          }),
        }));
        const pct = Math.round((completed / Math.max(1, total)) * 100);
        setRoadmap({
          ...roadmap,
          phases: updatedPhases,
          completed_milestones: completed,
          total_milestones: total,
          progress_percentage: pct,
        });
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-base font-bold text-slate-800">Generating Career Roadmap...</p>
      </div>
    );
  }

  const progressPct = roadmap?.progress_percentage || 0;
  const readinessPct = roadmap?.readiness_percentage || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur border border-purple-400/20">
            <Compass className="w-3.5 h-3.5 text-purple-300" />
            Adaptive Learning Progression
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Personalized Career Roadmap: {selectedRole}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            A dynamic milestone path engineered to address your exact resume skill deficiencies, recommending high-quality free documentation, video tutorials, and verified portfolio projects.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Target Role Selector & Progress Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Switch Career Goal
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => handleGenerateRoadmap(e.target.value)}
                disabled={generating}
                className="p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 font-bold text-slate-800"
              >
                {roles.map((r) => (
                  <option key={r.title} value={r.title}>{r.title}</option>
                ))}
              </select>
              {generating && (
                <div className="text-xs text-purple-600 font-semibold flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Current Readiness</span>
              <span className="text-2xl font-extrabold text-purple-600">{readinessPct}%</span>
              <span className="text-[10px] text-slate-400 block">based on resume</span>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Roadmap Progress</span>
              <span className="text-2xl font-extrabold text-emerald-600">{progressPct}%</span>
              <span className="text-[10px] text-slate-400 block">
                {roadmap?.completed_milestones || 0}/{roadmap?.total_milestones || 0} milestones
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Overall Roadmap Completion</span>
            <span>{progressPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Recommended Certifications */}
      {roadmap?.recommended_certifications?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Recommended Industry Certifications for {selectedRole}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {roadmap.recommended_certifications.map((cert) => (
              <span key={cert} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                ★ {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4-Phase Roadmap Milestones */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Curated 12-Week Execution Roadmap
        </h2>

        {roadmap?.phases?.map((phase) => (
          <div key={phase.phase_number} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            
            {/* Phase Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                  {phase.duration}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{phase.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{phase.description}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold shrink-0 self-start sm:self-center">
                {phase.milestones.length} Milestones
              </span>
            </div>

            {/* Milestones in this phase */}
            <div className="space-y-4 pt-2">
              {phase.milestones.map((m) => (
                <div
                  key={m.key}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : m.status === 'in_progress'
                      ? 'border-purple-200 bg-purple-50/20'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          m.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {m.priority}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                      
                      {/* Action items checklist */}
                      {m.action_items?.length > 0 && (
                        <div className="pt-2 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Action Items:
                          </span>
                          {m.action_items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Learning resources */}
                      {m.resources?.length > 0 && (
                        <div className="pt-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Curated Learning Resources:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {m.resources.map((res, i) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-xs transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                {res.title}
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="shrink-0 flex items-center sm:flex-col items-end gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Est: {m.estimated_weeks}</span>
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m.key, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer ${
                          m.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : m.status === 'in_progress'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed ✓</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
