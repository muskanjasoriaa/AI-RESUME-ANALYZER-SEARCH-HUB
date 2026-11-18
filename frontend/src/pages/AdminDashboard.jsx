import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  FileText,
  TrendingUp,
  Trash2,
  PlusCircle,
  Activity,
  BarChart3,
  Briefcase,
  Compass,
  Download,
  RefreshCw,
  Search,
  Edit3,
  UserPlus,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  X,
  Menu
} from 'lucide-react';

const TECH_ROLES = [
  "Full-Stack Developer",
  "AI / Machine Learning Engineer",
  "Data Scientist",
  "DevOps & Cloud Engineer",
  "Frontend Engineer",
  "Backend Software Engineer",
  "Cybersecurity Analyst",
  "Mobile Application Developer"
];

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview'); // overview, users, resumes, jobs, roles, logs
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [resumesList, setResumesList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [rolesCatalog, setRolesCatalog] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Search / filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [resumeSearch, setResumeSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  // Create User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserTargetRole, setNewUserTargetRole] = useState('Full-Stack Developer');

  // Create / Edit Job Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('Internship');
  const [jobExperience, setJobExperience] = useState('Entry Level');
  const [jobRemote, setJobRemote] = useState(true);
  const [jobSalary, setJobSalary] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobApply, setJobApply] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const showToast = (message, isError = false) => {
    if (isError) {
      setErr(message);
      setMsg('');
    } else {
      setMsg(message);
      setErr('');
    }
    setTimeout(() => {
      setMsg('');
      setErr('');
    }, 4500);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes, rRes, jRes, cRes, lRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
        api.get('/admin/resumes'),
        api.get('/admin/jobs'),
        api.get('/admin/roles-catalog'),
        api.get('/admin/audit-logs'),
      ]);
      setMetrics(mRes);
      setUsersList(uRes.users || []);
      setResumesList(rRes.resumes || []);
      setJobsList(jRes.jobs || []);
      setRolesCatalog(cRes.roles || []);
      setAuditLogs(lRes.logs || []);
    } catch (error) {
      showToast(error.message || 'Failed to load administrator data.', true);
    } finally {
      setLoading(false);
    }
  };

  // --- USER ACTIONS ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        full_name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        target_role: newUserTargetRole,
      });
      showToast(`Account '${newUserEmail}' (${newUserRole}) provisioned successfully.`);
      setShowUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to create user.', true);
    }
  };

  const handleChangeRole = async (targetUserId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change this user's role to '${newRole.toUpperCase()}'?`)) return;
    try {
      await api.put(`/admin/users/${targetUserId}/role`, { role: newRole });
      showToast(`User role updated to ${newRole}.`);
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Role update failed.', true);
    }
  };

  const handleDeleteUser = async (targetUserId, email) => {
    if (!window.confirm(`Permanently delete account '${email}' and all associated resumes/roadmaps?`)) return;
    try {
      await api.delete(`/admin/users/${targetUserId}`);
      showToast(`Account '${email}' deleted.`);
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Delete failed.', true);
    }
  };

  // --- RESUME ACTIONS ---
  const handleDeleteResume = async (resumeId, filename) => {
    if (!window.confirm(`Delete resume submission '${filename}'?`)) return;
    try {
      await api.delete(`/admin/resumes/${resumeId}`);
      showToast(`Resume '${filename}' removed.`);
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to delete resume.', true);
    }
  };

  // --- JOB ACTIONS ---
  const openCreateJobModal = () => {
    setEditingJobId(null);
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobType('Internship');
    setJobExperience('Entry Level');
    setJobRemote(true);
    setJobSalary('');
    setJobSkills('');
    setJobDesc('');
    setJobApply('');
    setShowJobModal(true);
  };

  const openEditJobModal = (job) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location);
    setJobType(job.job_type);
    setJobExperience(job.experience_level || 'Entry Level');
    setJobRemote(Boolean(job.is_remote));
    setJobSalary(job.salary_range);
    setJobSkills((job.required_skills || []).join(', '));
    setJobDesc(job.description);
    setJobApply(job.apply_url);
    setShowJobModal(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    const skillsArr = jobSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      title: jobTitle,
      company: jobCompany,
      location: jobLocation,
      is_remote: jobRemote,
      job_type: jobType,
      experience_level: jobExperience,
      description: jobDesc,
      required_skills: skillsArr,
      salary_range: jobSalary,
      apply_url: jobApply,
    };

    try {
      if (editingJobId) {
        await api.put(`/admin/jobs/${editingJobId}`, payload);
        showToast('Job listing updated successfully.');
      } else {
        await api.post('/jobs', payload);
        showToast('New job listing published successfully.');
      }
      setShowJobModal(false);
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to save job listing.', true);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Delete job posting '${title}'?`)) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      showToast(`Job '${title}' deleted.`);
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to delete job.', true);
    }
  };

  // --- CSV EXPORT ---
  const handleExportCsv = async () => {
    try {
      const blob = await api.get('/admin/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Cohort_ATS_Report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Cohort CSV report exported.');
    } catch (error) {
      showToast('Failed to export CSV: ' + error.message, true);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-500">
            This portal requires elevated administrator privileges. Normal users cannot access the Admin Panel.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & RBAC', icon: Users, badge: usersList.length },
    { id: 'resumes', label: 'Resume Submissions', icon: FileText, badge: resumesList.length },
    { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase, badge: jobsList.length },
    { id: 'roles', label: 'Career Roles Catalog', icon: Compass, badge: rolesCatalog.length },
    { id: 'logs', label: 'Security Audit Logs', icon: Activity },
  ];

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearch.toLowerCase();
    const matchesSearch = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.target_role || '').toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const filteredResumes = resumesList.filter((r) => {
    const q = resumeSearch.toLowerCase();
    return !q || r.original_filename.toLowerCase().includes(q) || r.user_name.toLowerCase().includes(q) || r.user_email.toLowerCase().includes(q) || (r.target_role || '').toLowerCase().includes(q);
  });

  const uniqueLogActions = ['ALL', ...Array.from(new Set(auditLogs.map((l) => l.action)))];
  const filteredLogs = auditLogs.filter((l) => logFilter === 'ALL' || l.action === logFilter);

  // Score distribution calculation
  const scoreDist = metrics?.score_distribution || { needs_improvement: 0, average: 0, competitive: 0, excellent: 0 };
  const totalScored = Math.max(1, scoreDist.needs_improvement + scoreDist.average + scoreDist.competitive + scoreDist.excellent);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white block leading-tight">
                  ResumeAI <span className="text-purple-400">Admin</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Control Panel
                </span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-purple-300 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> User View
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                {navItems.find((n) => n.id === activeSection)?.label}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Resume Analyzer & Career Roadmap — Administrative Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Add User</span>
            </button>
            <button
              onClick={openCreateJobModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Post Job</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Status Toasts */}
          {msg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {msg}
            </div>
          )}
          {err && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {err}
            </div>
          )}

          {loading && !metrics ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Loading Admin Dashboard Telemetry...</p>
            </div>
          ) : (
            <>
              {/* ==================== 1. OVERVIEW SECTION ==================== */}
              {activeSection === 'overview' && metrics && (
                <div className="space-y-6">
                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
                        <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><Users className="w-4 h-4" /></span>
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900">{metrics.total_users}</div>
                      <p className="text-xs text-slate-500">
                        <b className="text-slate-700">{metrics.total_students}</b> Students · <b className="text-purple-700">{metrics.total_admins}</b> Admins
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumes Analyzed</span>
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><FileText className="w-4 h-4" /></span>
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900">{metrics.total_resumes_analyzed}</div>
                      <p className="text-xs text-slate-500">
                        Active Roadmaps: <b className="text-slate-700">{metrics.total_roadmaps}</b>
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cohort Avg ATS</span>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><TrendingUp className="w-4 h-4" /></span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{metrics.average_ats_score}</span>
                        <span className="text-xs font-semibold text-slate-400">/ 100</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Top Score: <b className="text-emerald-600">{metrics.highest_ats_score}</b>
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Opportunities</span>
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Briefcase className="w-4 h-4" /></span>
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900">{metrics.total_jobs}</div>
                      <p className="text-xs text-slate-500">
                        Ready Resumes (85+): <b className="text-emerald-600">{scoreDist.excellent}</b>
                      </p>
                    </div>
                  </div>

                  {/* Charts Grid: Score Distribution & Target Roles */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ATS Score Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            ATS Score Tier Distribution
                          </h3>
                          <p className="text-xs text-slate-500">Breakdown of evaluated student resumes</p>
                        </div>
                      </div>
                      <div className="space-y-3.5 pt-2">
                        {[
                          { label: 'Optimal / ATS Ready (85 - 100)', count: scoreDist.excellent, color: 'bg-emerald-500', text: 'text-emerald-700' },
                          { label: 'Competitive (70 - 84)', count: scoreDist.competitive, color: 'bg-blue-500', text: 'text-blue-700' },
                          { label: 'Average / Needs Polish (50 - 69)', count: scoreDist.average, color: 'bg-amber-500', text: 'text-amber-700' },
                          { label: 'Needs Major Improvement (< 50)', count: scoreDist.needs_improvement, color: 'bg-rose-500', text: 'text-rose-700' },
                        ].map((tier) => {
                          const pct = Math.round((tier.count / totalScored) * 100);
                          return (
                            <div key={tier.label} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-700">{tier.label}</span>
                                <span className={`font-bold ${tier.text}`}>{tier.count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className={`${tier.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Career Role Popularity */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-indigo-600" />
                          Target Career Role Distribution
                        </h3>
                        <p className="text-xs text-slate-500">Most selected career pathways among registered users</p>
                      </div>
                      <div className="space-y-3 pt-2">
                        {(metrics.role_distribution || []).length === 0 ? (
                          <p className="text-xs text-slate-400">No role preferences recorded yet.</p>
                        ) : (
                          metrics.role_distribution.map((r) => {
                            const pct = Math.round((r.count / Math.max(1, metrics.total_users)) * 100);
                            return (
                              <div key={r.target_role} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-700">{r.target_role}</span>
                                  <span className="font-bold text-indigo-700">{r.count} users ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Missing Skills Cohort Insight */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Top 10 Most Frequently Missing Skills Across Cohort
                      </h3>
                      <p className="text-xs text-slate-500">
                        Actionable academic curriculum insight showing highest-frequency technical skill gaps.
                      </p>
                    </div>
                    {(metrics.top_missing_skills || []).length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No skill gap data recorded yet. Upload resumes to populate analytics.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {metrics.top_missing_skills.map((item, idx) => (
                          <div key={item.skill} className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-center space-y-1">
                            <span className="text-[10px] font-bold text-rose-600 uppercase">Gap #{idx + 1}</span>
                            <span className="text-xs font-extrabold text-slate-900 block truncate">{item.skill}</span>
                            <span className="text-[11px] text-slate-500 block">Missing in {item.count} resume(s)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Resume Submissions Preview */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Latest Resume Evaluations</h3>
                      <button
                        onClick={() => setActiveSection('resumes')}
                        className="text-xs font-semibold text-purple-600 hover:underline"
                      >
                        View All Submissions →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                            <th className="pb-2.5">Candidate</th>
                            <th className="pb-2.5">File</th>
                            <th className="pb-2.5">Target Role</th>
                            <th className="pb-2.5">ATS Score</th>
                            <th className="pb-2.5">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(metrics.recent_resumes || []).map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="py-2.5">
                                <span className="font-bold text-slate-800 block">{r.user_name}</span>
                                <span className="text-[10px] text-slate-400">{r.user_email}</span>
                              </td>
                              <td className="py-2.5 font-medium text-slate-700">{r.original_filename}</td>
                              <td className="py-2.5 text-slate-600">{r.target_role}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  r.ats_score >= 85 ? 'bg-emerald-50 text-emerald-700' : r.ats_score >= 70 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {Math.round(r.ats_score)} / 100
                                </span>
                              </td>
                              <td className="py-2.5 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 2. USERS & RBAC SECTION ==================== */}
              {activeSection === 'users' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">User Accounts & Role-Based Access Control</h2>
                      <p className="text-xs text-slate-500">Manage student accounts, provision administrators, and monitor activity.</p>
                    </div>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create User / Admin
                    </button>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, email, or career goal..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {['all', 'user', 'admin'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setUserRoleFilter(r)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize ${
                            userRoleFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {r === 'all' ? 'All Roles' : r === 'user' ? 'Students' : 'Admins'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="pb-3">Account</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Target Career</th>
                          <th className="pb-3">Resumes</th>
                          <th className="pb-3">Best ATS</th>
                          <th className="pb-3">Joined</th>
                          <th className="pb-3 text-right">RBAC Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">{u.full_name}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-slate-600">{u.target_role}</td>
                            <td className="py-3 font-semibold text-slate-800">{u.resumes_count}</td>
                            <td className="py-3 font-bold text-emerald-600">{u.highest_score}</td>
                            <td className="py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                onClick={() => handleChangeRole(u.id, u.role)}
                                disabled={u.id === user.id}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 text-[11px] font-semibold disabled:opacity-30 transition-colors"
                              >
                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                disabled={u.id === user.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== 3. RESUME SUBMISSIONS SECTION ==================== */}
              {activeSection === 'resumes' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">All Uploaded Resumes ({resumesList.length})</h2>
                      <p className="text-xs text-slate-500">Platform-wide repository of parsed PDF & DOCX candidate submissions.</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={resumeSearch}
                        onChange={(e) => setResumeSearch(e.target.value)}
                        placeholder="Search file, student, or role..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {filteredResumes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No resume submissions found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                            <th className="pb-3">Student</th>
                            <th className="pb-3">Document</th>
                            <th className="pb-3">Target Role</th>
                            <th className="pb-3">ATS Score</th>
                            <th className="pb-3">Skills (Match / Gap)</th>
                            <th className="pb-3">Uploaded</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredResumes.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="py-3">
                                <div className="font-bold text-slate-800">{r.user_name}</div>
                                <div className="text-[10px] text-slate-400">{r.user_email}</div>
                              </td>
                              <td className="py-3">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase text-slate-600">{r.file_type}</span>
                                  <span className="truncate max-w-[180px]">{r.original_filename}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{(r.file_size / 1024).toFixed(1)} KB</span>
                              </td>
                              <td className="py-3 text-slate-600">{r.target_role}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  r.ats_score >= 85 ? 'bg-emerald-50 text-emerald-700' : r.ats_score >= 70 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {r.ats_score} / 100
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="text-emerald-600 font-bold">{r.matched_count} matched</span>
                                <span className="text-slate-300 mx-1">/</span>
                                <span className="text-rose-500 font-bold">{r.missing_count} missing</span>
                              </td>
                              <td className="py-3 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeleteResume(r.id, r.original_filename)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete Resume"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== 4. JOBS & INTERNSHIPS CRUD SECTION ==================== */}
              {activeSection === 'jobs' && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Jobs & Internships Management ({jobsList.length})</h2>
                      <p className="text-xs text-slate-500">Add, edit, or remove opportunities matched against student profiles.</p>
                    </div>
                    <button
                      onClick={openCreateJobModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post New Opportunity
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobsList.map((job) => (
                      <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-bold text-purple-600 uppercase">{job.company}</span>
                              <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                              <p className="text-xs text-slate-500">{job.location} · {job.salary_range}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase shrink-0">
                              {job.job_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {(job.required_skills || []).map((sk) => (
                              <span key={sk} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditJobModal(job)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== 5. CAREER ROLES CATALOG ==================== */}
              {activeSection === 'roles' && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900">Configured Career Roles & AI Skill Benchmarks</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      These role specifications drive the NLP skill-gap analysis and 12-week career roadmap engine.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesCatalog.map((role) => (
                      <div key={role.title} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-indigo-600">{role.category}</span>
                            <h3 className="text-sm font-extrabold text-slate-900">{role.title}</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Demand: {role.demand}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{role.description}</p>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Core Skills ({role.core_skills.length})</span>
                          <div className="flex flex-wrap gap-1">
                            {role.core_skills.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Preferred Skills ({role.preferred_skills.length})</span>
                          <div className="flex flex-wrap gap-1">
                            {role.preferred_skills.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== 6. AUDIT LOGS SECTION ==================== */}
              {activeSection === 'logs' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">System Security & Action Audit Trail</h2>
                      <p className="text-xs text-slate-500">Immutable log of authentications, resume analyses, and administrative actions.</p>
                    </div>
                    <select
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    >
                      {uniqueLogActions.map((act) => (
                        <option key={act} value={act}>{act === 'ALL' ? 'All Event Types' : act}</option>
                      ))}
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                          <th className="pb-2.5">Event Action</th>
                          <th className="pb-2.5">Actor Email</th>
                          <th className="pb-2.5">Details</th>
                          <th className="pb-2.5">IP Address</th>
                          <th className="pb-2.5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-purple-700">{log.action}</td>
                            <td className="py-2.5 text-slate-700">{log.user_email || 'System'}</td>
                            <td className="py-2.5 text-slate-800">{log.details}</td>
                            <td className="py-2.5 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                            <td className="py-2.5 text-slate-400">{log.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ==================== MODAL: CREATE USER / ADMIN ==================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Provision New Account</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Dr. Faculty Supervisor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="faculty@resumeai.edu"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="user">Student (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Role</label>
                  <select
                    value={newUserTargetRole}
                    onChange={(e) => setNewUserTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    {TECH_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT JOB ==================== */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingJobId ? 'Edit Job Listing' : 'Post New Job / Internship'}
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Engineering Intern"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    placeholder="e.g. Google Cloud"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="e.g. Remote / Seattle, WA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience</label>
                  <select
                    value={jobExperience}
                    onChange={(e) => setJobExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary / Stipend</label>
                  <input
                    type="text"
                    required
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="$45 / hour"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={jobRemote}
                  onChange={(e) => setJobRemote(e.target.checked)}
                  className="rounded text-purple-600"
                />
                Remote-friendly position
              </label>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, Docker, SQL"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Role mission, responsibilities, and engineering stack..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Apply URL</label>
                <input
                  type="url"
                  required
                  value={jobApply}
                  onChange={(e) => setJobApply(e.target.value)}
                  placeholder="https://company.com/careers"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  {editingJobId ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
