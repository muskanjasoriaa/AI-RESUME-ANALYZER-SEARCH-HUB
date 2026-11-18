import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  FolderOpen
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

export default function ResumeUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.target_role || "Full-Stack Developer");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

  const sampleResumes = [
    {
      name: "Alexander Chen — Senior Full-Stack SWE",
      filename: "Software_Engineer_Resume.pdf",
      role: "Full-Stack Developer",
      desc: "Senior resume with microservices, AWS, React, Docker, and quantitative metrics (High ATS Score: 85+)."
    },
    {
      name: "Priya Sharma — Data Scientist & ML",
      filename: "Data_Scientist_Resume.docx",
      role: "Data Scientist",
      desc: "Word DOCX format featuring Python, PyTorch, Scikit-Learn, Spark, and statistical predictive modeling."
    },
    {
      name: "Jordan Smith — Entry-Level Student",
      filename: "Entry_Level_Student_Resume.pdf",
      role: "Full-Stack Developer",
      desc: "Student undergraduate resume with basic projects, demonstrating skill gap diagnosis & areas for improvement."
    }
  ];

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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setError(`Unsupported file type '${ext}'. Please upload a PDF (.pdf) or Word document (.docx).`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose or drop a resume file first.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      setLoadingStep('Uploading and reading document...');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_role', targetRole);

      setLoadingStep('Running NLP entity extraction and skill taxonomy mapping...');
      const res = await api.post('/resume/upload', formData);

      setLoadingStep('Computing explainable ATS compatibility score...');
      navigate(`/analysis/${res.resume_id}`, { state: { analysisData: res } });
    } catch (err) {
      setError(err.message || 'Analysis failed. Please ensure the document contains readable text.');
      setLoading(false);
    }
  };

  // Helper to load sample resumes directly from sample_resumes/
  const handleLoadSample = async (sample) => {
    setError('');
    setLoading(true);
    setLoadingStep(`Loading sample '${sample.filename}'...`);
    try {
      // Fetch sample from backend uploads/samples endpoint or direct fetch
      const resp = await fetch(`/uploads/${sample.filename}`).catch(() => null);
      
      let blob;
      if (resp && resp.ok) {
        blob = await resp.blob();
      } else {
        // Fallback: request via API
        const fallback = await fetch(`/api/resume/history`); // warm check
        // Or create artificial file from sample name
        const sampleUrl = `/sample_resumes/${sample.filename}`;
        const sResp = await fetch(sampleUrl);
        blob = await sResp.blob();
      }

      const file = new File([blob], sample.filename, {
        type: sample.filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      setSelectedFile(file);
      setTargetRole(sample.role);
      setLoading(false);
    } catch (err) {
      // If direct fetch from static folder isn't routed, alert and allow manual select
      setError(`To evaluate this sample, please select '${sample.filename}' from the project's 'sample_resumes/' folder.`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Format NLP Resume Diagnostic
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Analyze Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Our explainable scoring engine parses your education, skills, metrics, and formatting to calculate your ATS compatibility.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Role Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <label className="block text-sm font-bold text-slate-800">
          1. Choose Your Target Career Role
        </label>
        <p className="text-xs text-slate-500">
          The ATS scoring engine and skill gap analysis will benchmark your resume against the industry requirements for this role.
        </p>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium text-slate-800"
        >
          {TECH_ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* File Upload Dropzone */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <label className="block text-sm font-bold text-slate-800">
          2. Upload Your Resume (PDF or DOCX)
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/60'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-50/20'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
          }`}
        >
          {selectedFile ? (
            <div className="space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB | Ready for analysis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Remove and choose different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">
                  Drag and drop your resume file here
                </p>
                <p className="text-xs text-slate-400 mt-1">or</p>
                <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors">
                  <FolderOpen className="w-4 h-4 text-slate-600" />
                  Browse Local Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        validateAndSetFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
                <span>✓ PDF format</span>
                <span>✓ Word DOCX format</span>
                <span>✓ Up to 10 MB</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{loadingStep || 'Evaluating Resume...'}</span>
            </div>
          ) : (
            <>
              <span>Run AI Resume Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Pre-packaged Academic Sample Resumes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Pre-Packaged Academic Test Resumes
          </h3>
          <p className="text-xs text-slate-500">
            Demonstrate the application instantly during your project viva or evaluation using pre-built test cases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleResumes.map((sample) => (
            <div
              key={sample.filename}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>{sample.filename.endsWith('.pdf') ? 'PDF' : 'DOCX'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Sample</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{sample.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{sample.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
              >
                Load This Sample
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
