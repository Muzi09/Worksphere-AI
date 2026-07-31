import React, { useContext, useRef, useState } from 'react';
import { Sparkles, LogOut, FileBadge, Loader2 } from 'lucide-react';
import { AuthContext } from 'context/AuthContext';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import api from 'lib/api';

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/file-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        'Document Uploaded',
        response.data?.message || `Successfully uploaded "${selectedFile.name}"`
      );
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error(
        'Upload Failed',
        error.response?.data?.detail || `Failed to upload "${selectedFile.name}"`
      );
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 absolute top-0 w-full z-10">
      <div className="font-semibold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Worksphere AI
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">AI Assistant Powered</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="*/*"
        />

        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all disabled:opacity-50"
          variant="outline"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-400" />
          ) : (
            <FileBadge className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload new document'}
        </Button>

        {user && (
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


