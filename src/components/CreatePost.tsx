import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Image,
  Shield,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { moderateContent } from '../lib/moderation';

interface CreatePostProps {
  disabled?: boolean;
  onPostCreated?: (post: any) => void;
  currentUser?: any;
}

interface UploadProgress {
  loaded: number;
  total: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function CreatePost({
  disabled = false,
  onPostCreated,
  currentUser,
}: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [crops, setCrops] = useState<Record<number, Crop>>({});
  const [completedCrops, setCompletedCrops] = useState<
    Record<number, PixelCrop>
  >({});
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles
        .filter(
          (file) =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        )
        .slice(0, 10);

      if (validFiles.length > 0) {
        const newFiles = [...mediaFiles];
        const newPreviewUrls = [...previewUrls];
        let firstImageIndex = -1;

        validFiles.forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const fileIndex = mediaFiles.length + index;
              if (firstImageIndex === -1) {
                firstImageIndex = fileIndex;
                setCurrentFileIndex(fileIndex);
                setShowCropper(true);
              }
              newFiles.push(file);
              newPreviewUrls.push(reader.result as string);
              if (index === validFiles.length - 1) {
                setMediaFiles(newFiles);
                setPreviewUrls(newPreviewUrls);
              }
            };
            reader.onerror = () => {
              toast.error('Error reading file');
            };
            reader.readAsDataURL(file);
          } else {
            newFiles.push(file);
            const url = URL.createObjectURL(file);
            newPreviewUrls.push(url);
          }
        });

        if (!validFiles.some((file) => file.type.startsWith('image/'))) {
          setMediaFiles(newFiles);
          setPreviewUrls(newPreviewUrls);
        }
      }
    },
    [mediaFiles, previewUrls]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    maxSize: 10485760, // 10MB
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1);
    setCrops((prev) => ({ ...prev, [currentFileIndex]: crop }));
    setScale(1);
  };

  const getCroppedImg = useCallback(
    async (
      image: HTMLImageElement,
      crop: PixelCrop,
      scale: number = 1
    ): Promise<File> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2D context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const file = new File([blob], mediaFiles[currentFileIndex].name, {
              type: 'image/jpeg',
            });
            resolve(file);
          },
          'image/jpeg',
          0.9
        );
      });
    },
    [mediaFiles, currentFileIndex]
  );

  const handleCropComplete = useCallback(async () => {
    try {
      if (!imgRef.current || !completedCrops[currentFileIndex]) {
        throw new Error('Crop not complete');
      }

      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrops[currentFileIndex],
        scale
      );

      const newMediaFiles = [...mediaFiles];
      newMediaFiles[currentFileIndex] = croppedFile;
      setMediaFiles(newMediaFiles);

      // Update preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewUrls = [...previewUrls];
        newPreviewUrls[currentFileIndex] = reader.result as string;
        setPreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(croppedFile);

      // Find next image to crop
      const nextImageIndex = findNextImageIndex(currentFileIndex);
      if (nextImageIndex !== -1) {
        setCurrentFileIndex(nextImageIndex);
      } else {
        setShowCropper(false);
      }

      toast.success('Image cropped successfully');
    } catch (error) {
      console.error('Error completing crop:', error);
      toast.error('Failed to crop image');
    }
  }, [
    completedCrops,
    currentFileIndex,
    getCroppedImg,
    mediaFiles,
    previewUrls,
    scale,
  ]);

  const findNextImageIndex = (currentIndex: number): number => {
    for (let i = currentIndex + 1; i < mediaFiles.length; i++) {
      if (mediaFiles[i].type.startsWith('image/')) {
        return i;
      }
    }
    return -1;
  };

  const findPrevImageIndex = (currentIndex: number): number => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (mediaFiles[i].type.startsWith('image/')) {
        return i;
      }
    }
    return -1;
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const url = prev[index];
      if (url && !url.startsWith('data:')) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setCrops((prev) => {
      const newCrops = { ...prev };
      delete newCrops[index];
      return newCrops;
    });
    setCompletedCrops((prev) => {
      const newCompletedCrops = { ...prev };
      delete newCompletedCrops[index];
      return newCompletedCrops;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, verify content with AI moderation
      const moderationResult = await moderateContent(content, user.id);
      
      if (!moderationResult.isAcceptable) {
        toast.error(`Content rejected by Connect Assistant: ${moderationResult.reason}`);
        setIsLoading(false);
        return;
      }

      // Create the post
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

      // Handle media files if present
      if (mediaFiles.length > 0) {
        const totalFiles = mediaFiles.length;
        let uploadedFiles = 0;

        for (const file of mediaFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${post.id}/${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          await supabase.from('media_files').insert({
            post_id: post.id,
            file_path: fileName,
            file_type: file.type.startsWith('image/') ? 'image' : 'video',
          });

          uploadedFiles++;
          setUploadProgress(uploadedFiles / totalFiles);
        }
      }

      setContent('');
      setIsAnonymous(false);
      setMediaFiles([]);
      setPreviewUrls([]);
      setCrops({});
      setCompletedCrops({});
      toast.success('Post created successfully!');

      if (onPostCreated) {
        onPostCreated(post);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-amoled rounded-xl shadow-md p-4 sm:p-6 mb-6 mt-4 animate-fade-in"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={
              currentUser?.avatar_url ||
              `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${currentUser?.id}`
            }
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              disabled
                ? 'Log in to create posts'
                : `What's on your mind, ${currentUser?.username || 'friend'}?`
            }
            className="flex-1 p-4 rounded-lg bg-gray-50 dark:bg-amoled-light border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:text-white dark:placeholder-gray-400"
            rows={2}
            disabled={disabled}
          />
        </div>

        {mediaFiles.length > 0 && isUploading && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Uploading media...
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-amoled-light rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 animate-scale-in">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative aspect-square">
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
              <motion.button
                type="button"
                disabled={disabled}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Media</span>
              </motion.button>
            </div>
            <motion.button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              disabled={disabled}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isAnonymous
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Anonymous</span>
            </motion.button>
          </div>

          <motion.button
            type="submit"
            disabled={
              disabled ||
              isLoading ||
              (!content.trim() && mediaFiles.length === 0)
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Post</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {showCropper &&
        mediaFiles[currentFileIndex]?.type.startsWith('image/') && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-amoled rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col animate-scale-in">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold dark:text-white">
                  Crop Image {currentFileIndex + 1} of{' '}
                  {mediaFiles.filter((f) => f.type.startsWith('image/')).length}
                </h3>
              </div>

              <div className="flex-1 min-h-0 relative overflow-hidden">
                <ReactCrop
                  crop={crops[currentFileIndex]}
                  onChange={(_, percentCrop) =>
                    setCrops((prev) => ({
                      ...prev,
                      [currentFileIndex]: percentCrop,
                    }))
                  }
                  onComplete={(c) =>
                    setCompletedCrops((prev) => ({
                      ...prev,
                      [currentFileIndex]: c,
                    }))
                  }
                  aspect={1}
                  className="h-full flex items-center justify-center"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewUrls[currentFileIndex]}
                    onLoad={onImageLoad}
                    className="max-h-full max-w-full object-contain"
                    style={{ transform: `scale(${scale})` }}
                  />
                </ReactCrop>
              </div>

              <div className="p-4 border-t dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zoom: {Math.round(scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <motion.button
                      type="button"
                      onClick={() => {
                        const prevIndex = findPrevImageIndex(currentFileIndex);
                        if (prevIndex !== -1) setCurrentFileIndex(prevIndex);
                      }}
                      disabled={findPrevImageIndex(currentFileIndex) === -1}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        const nextIndex = findNextImageIndex(currentFileIndex);
                        if (nextIndex !== -1) setCurrentFileIndex(nextIndex);
                      }}
                      disabled={findNextImageIndex(currentFileIndex) === -1}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCropComplete}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply Crop
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}
