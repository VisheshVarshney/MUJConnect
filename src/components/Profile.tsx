import React, { useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

interface ProfileImageProps {
  currentUser: any;
  profile: any;
  onUpdate: (url: string) => void;
}

export default function ProfileImage({ currentUser, profile, onUpdate }: ProfileImageProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!image || !croppedArea) return;

    try {
      // Create a canvas to draw the cropped image
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = croppedArea.width;
      canvas.height = croppedArea.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        img,
        croppedArea.x,
        croppedArea.y,
        croppedArea.width,
        croppedArea.height,
        0,
        0,
        croppedArea.width,
        croppedArea.height
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });

      const fileName = `${profile.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob);

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
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error('Error uploading avatar');
    }
  };

  return (
    <div className="relative">
      <img
        src={profile.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${profile.username}`}
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
            <div className="relative h-96">
              <Cropper
                image={image}
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
                onClick={() => {
                  setShowCropper(false);
                  setImage(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
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