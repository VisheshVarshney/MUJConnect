import React, { useState, useCallback, useRef } from 'react';
import { Camera } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ProfileImageProps {
  currentUser: any;
  profile: any;
  onUpdate: (url: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ProfileImage({ currentUser, profile, onUpdate }: ProfileImageProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
  };

  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    crop: PixelCrop,
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2D context');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  }, []);

  const handleSave = async () => {
    try {
      if (!imgRef.current || !completedCrop) {
        throw new Error('Crop not complete');
      }

      const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
      const fileName = `${profile.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImage, {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onUpdate(publicUrl);
      setShowCropper(false);
      setImage(null);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    }
  };

  return (
    <div className="relative">
      <img
        src={profile.avatar_url || `https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
        alt={profile.username}
        className="w-32 h-32 rounded-full border-4 border-white bg-white dark:border-gray-800"
      />
      {(currentUser?.id === profile.id || currentUser?.is_superadmin) && (
        <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer">
          <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {showCropper && image && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">
                Crop Profile Picture
              </h3>
            </div>
            <div className="relative h-[60vh] md:h-[70vh]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="h-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={image}
                  onLoad={onImageLoad}
                  className="h-full max-w-full mx-auto"
                />
              </ReactCrop>
            </div>
            <div className="p-4 flex justify-end space-x-2 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setImage(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}