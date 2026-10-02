import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Trash2, 
  Plus, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  FilePlus, 
  LogOut, 
  Clock, 
  Send 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getAccessToken, getCurrentUser, initAuth } from '../services/authService';
import { listUAPDossierDocs, deleteDossierDoc, appendTacticalNoteToDoc, GoogleDocFile } from '../services/googleDocsService';
import GoogleSignInButton from './GoogleSignInButton';
import LoadingSpinner from './LoadingSpinner';

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc?: (doc: GoogleDocFile) => void;
}

export const GoogleDocsModal: React.FC<GoogleDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [token, setToken] = useState<string | null>(null);
  const [docs, setDocs] = useState<GoogleDocFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Note appending state
  const [selectedDocForNote, setSelectedDocForNote] = useState<GoogleDocFile | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isAppendingNote, setIsAppendingNote] = useState<boolean>(false);

  // Deletion Confirmation Dialog State (Mandatory requirement from Google Workspace skill)
  const [docToDelete, setDocToDelete] = useState<GoogleDocFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    // Initial check for already cached access token
    getAccessToken().then(tok => {
      if (tok) {
        setToken(tok);
        const u = getCurrentUser();
        if (u) setUser(u);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Fetch docs whenever token becomes available
  useEffect(() => {
    if (isOpen && token) {
      loadDocs(token);
    }
  }, [isOpen, token]);

  const loadDocs = async (accessToken: string) => {
    setIsLoadingDocs(true);
    setError(null);
    try {
      const files = await listUAPDossierDocs(accessToken);
      setDocs(files);
    } catch (err: any) {
      console.error('Failed to list Google Docs:', err);
      setError(err.message || 'Unable to retrieve Google Docs dossiers');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setSuccessMsg(`Authenticated as ${res.user.email}`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadDocs(res.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication with Google failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setDocs([]);
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete || !token) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDossierDoc(token, docToDelete.id);
      setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
      setSuccessMsg(`Successfully deleted "${docToDelete.name}" from Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setDocToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete Google Doc');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAppendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForNote || !token || !noteContent.trim()) return;

    setIsAppendingNote(true);
    setError(null);
    try {
      await appendTacticalNoteToDoc(token, selectedDocForNote.id, noteContent.trim());
      setSuccessMsg(`Tactical update appended to "${selectedDocForNote.name}"`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setNoteContent('');
      setSelectedDocForNote(null);
    } catch (err: any) {
      setError(err.message || 'Failed to append note to Google Doc');
    } finally {
      setIsAppendingNote(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-gray-950 border border-green-600/40 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-green-500 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900/90 px-6 py-4 border-b border-green-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/60 border border-blue-500/40 rounded-lg text-blue-400">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-100 uppercase tracking-tight">Google Docs Intelligence Archive</h2>
                <span className="text-[9px] bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded uppercase font-bold">
                  Workspace Live Link
                </span>
              </div>
              <p className="text-[11px] text-green-400/60">Direct export & classified briefing repository in Google Docs & Google Drive</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-green-700 hover:text-red-400 p-1.5 rounded hover:bg-black/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Auth Ribbon & Alerts */}
        <div className="bg-gray-900/50 px-6 py-3 border-b border-green-900/30 flex flex-wrap items-center justify-between gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Analyst'} className="w-8 h-8 rounded-full border border-green-500/50" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-900/40 border border-green-600/40 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase() || 'A'}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-gray-200">{user.displayName || user.email}</div>
                <div className="text-[10px] text-green-400/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Google Docs Connected ({user.email})
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-green-400/80">
              Authorize Google Workspace to export briefings directly to your Google Docs.
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-red-950 text-green-600 hover:text-red-400 border border-green-900/40 hover:border-red-800 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
              >
                <LogOut size={12} />
                Disconnect Account
              </button>
            ) : (
              <GoogleSignInButton onClick={handleSignIn} isLoading={isSigningIn} label="Connect Google Docs" />
            )}

            {token && (
              <button
                onClick={() => loadDocs(token)}
                disabled={isLoadingDocs}
                className="p-1.5 bg-green-950/40 text-green-400 hover:bg-green-900/50 border border-green-800/40 rounded transition-colors"
                title="Refresh Documents"
              >
                <RefreshCw size={14} className={isLoadingDocs ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Message banners */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-950/70 border border-green-700/60 rounded-lg text-xs text-green-300 flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!user ? (
            <div className="text-center py-14 px-4 bg-gray-900/30 rounded-xl border border-green-900/20 max-w-lg mx-auto">
              <FilePlus size={44} className="mx-auto text-green-600/40 mb-4" />
              <h3 className="text-base font-bold text-gray-200 uppercase mb-2">Google Docs Synchronized Briefings</h3>
              <p className="text-xs text-green-400/70 mb-6 leading-relaxed">
                Connect your Google Account to export intercepted UAP telemetry, generated visual forensics, and multi-persona reporter briefings directly to official Google Docs with persistent cloud backup in Google Drive.
              </p>
              <GoogleSignInButton onClick={handleSignIn} isLoading={isSigningIn} label="Sign in with Google to Connect" />
            </div>
          ) : isLoadingDocs ? (
            <div className="text-center py-16">
              <LoadingSpinner />
              <p className="mt-4 text-xs uppercase tracking-widest text-green-600 animate-pulse">
                Querying Google Drive Dossiers...
              </p>
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-900/20 rounded-xl border border-dashed border-green-900/40">
              <FileText size={36} className="mx-auto text-green-600/30 mb-3" />
              <h4 className="text-sm font-bold text-gray-300 uppercase mb-1">No Google Docs Found</h4>
              <p className="text-xs text-green-400/60 max-w-md mx-auto mb-4">
                Open any UAP intelligence report from the tactical grid or dossiers view and click "Export to Google Docs" to create your first classified brief.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-green-600/70 uppercase tracking-widest pb-1 border-b border-green-900/30">
                <span>Synchronized Google Documents ({docs.length})</span>
                <span>Actions</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3.5 bg-gray-900/70 hover:bg-gray-900 border border-green-900/40 hover:border-green-600/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded shrink-0 mt-0.5">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-200 truncate group-hover:text-green-400">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] text-green-600 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} />
                            {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : 'Recent'}
                          </span>
                          <span className="font-mono text-gray-500 truncate max-w-[180px]">
                            ID: {doc.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Append tactical note trigger */}
                      <button
                        onClick={() => setSelectedDocForNote(doc)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-950/50 hover:bg-green-800/60 text-green-400 border border-green-800/40 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                        title="Append tactical field debrief note"
                      >
                        <Plus size={11} />
                        Add Note
                      </button>

                      {/* Open in Google Docs */}
                      <a
                        href={doc.webViewLink || `https://docs.google.com/document/d/${doc.id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <ExternalLink size={12} />
                        Open Doc
                      </a>

                      {/* Delete with explicit confirmation requirement */}
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-1.5 text-green-800 hover:text-red-400 border border-transparent hover:border-red-900/40 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form to append note to selected doc */}
          {selectedDocForNote && (
            <div className="mt-6 p-4 bg-gray-900 border border-green-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-900/40">
                <div className="flex items-center gap-2">
                  <Send size={14} className="text-green-400" />
                  <span className="text-xs font-bold text-gray-200 uppercase">
                    Append Tactical Note to: <span className="text-green-400">{selectedDocForNote.name}</span>
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedDocForNote(null)}
                  className="text-green-800 hover:text-gray-300 text-xs"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAppendNote} className="space-y-3">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter classified field observation or declassified telemetry remark to append to the bottom of this Google Doc..."
                  rows={3}
                  className="w-full bg-black/60 border border-green-800/60 text-green-300 p-2.5 rounded text-xs font-mono focus:outline-none focus:border-green-500 placeholder-green-900/50"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForNote(null)}
                    className="px-3 py-1.5 bg-black/40 text-green-700 border border-green-900/30 rounded text-[10px] uppercase font-bold"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={isAppendingNote || !noteContent.trim()}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-black rounded text-[10px] uppercase font-bold tracking-wider transition-all disabled:opacity-50"
                  >
                    {isAppendingNote ? 'Writing to Doc...' : 'Append to Google Doc'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* User Confirmation Dialog for Destructive Operations (Mandatory Requirement from Workspace Integration Skill) */}
        {docToDelete && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
            <div className="bg-gray-900 border-2 border-red-600/70 p-6 rounded-xl max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.3)]">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <AlertTriangle size={24} />
                <h3 className="text-base font-black uppercase tracking-wide">Confirm File Deletion</h3>
              </div>

              <p className="text-xs text-gray-300 mb-2 leading-relaxed font-sans">
                Are you sure you want to permanently delete the document:
              </p>
              <p className="text-xs font-mono text-red-400 bg-black/50 p-2.5 rounded border border-red-900/40 mb-4 truncate font-bold">
                "{docToDelete.name}"
              </p>
              <p className="text-[11px] text-gray-400 mb-6 font-sans">
                This action will delete the file from your Google Drive account. This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDocToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-900/80 px-6 py-3 border-t border-green-900/30 flex flex-wrap items-center justify-between gap-2 text-[10px] text-green-700">
          <span>Google Docs API v1 & Drive API v3 Integrated</span>
          <span>Security Clearance Level 5 // End-to-End Google Workspace OAuth</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleDocsModal;
