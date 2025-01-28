import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

interface CreatePostProps {
  disabled?: boolean;
}

export default function CreatePost({ disabled = false }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreas, setCroppedAreas] = useState<Area[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    ).slice(0, 10);

    if (validFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...validFiles]);
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      if (validFiles[0].type.startsWith('image/')) {
        setCurrentFileIndex(mediaFiles.length);
        setShowCropper(true);
      }
    }
  }, [mediaFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxSize: 10485760,
  });

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    const newCroppedAreas = [...croppedAreas];
    newCroppedAreas[currentFileIndex] = croppedAreaPixels;
    setCroppedAreas(newCroppedAreas);
  }, [croppedAreas, currentFileIndex]);

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setCroppedAreas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user.id,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${post.id}/${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          await supabase.from('media_files').insert({
            post_id: post.id,
            file_path: filePath,
            file_type: file.type.startsWith('image/') ? 'image' : 'video',
            width: croppedAreas[i]?.width || null,
            height: croppedAreas[i]?.height || null
          });
        }
      }

      setContent('');
      setIsAnonymous(false);
      setMediaFiles([]);
      setPreviewUrls([]);
      setCroppedAreas([]);
      toast.success('Post created successfully!');
      
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-amoled rounded-xl shadow-md p-4 sm:p-6 mb-6 mt-4 animate-fade-in"
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={disabled ? "Log in to create posts" : "What's on your mind?"}
          className="w-full p-4 rounded-lg bg-gray-50 dark:bg-amoled-light border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:text-white dark:placeholder-gray-400"
          rows={2}
          disabled={disabled}
        />
        
        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 animate-scale-in">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative aspect-square max-h-48">
                {mediaFiles[index].type.startsWith('image/') ? (
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 animate-pulse-light"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div {...getRootProps()}>
              <input {...getInputProps()} disabled={disabled} />
              <button
                type="button"
                disabled={disabled}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Media</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              disabled={disabled}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isAnonymous 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Anonymous</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={disabled || isLoading || (!content.trim() && mediaFiles.length === 0)}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center animate-pulse-light"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {showCropper && mediaFiles[currentFileIndex]?.type.startsWith('image/') && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-amoled rounded-lg w-full max-w-xl animate-scale-in">
            <div className="relative h-80">
              <Cropper
                image={previewUrls[currentFileIndex]}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 flex justify-between">
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-amoled-light text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Done
              </button>
              {currentFileIndex < mediaFiles.length - 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentFileIndex(prev => prev + 1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Next Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}