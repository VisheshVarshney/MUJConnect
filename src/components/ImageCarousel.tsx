import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: { url: string; type: 'image' | 'video' }[];
  onImageClick?: () => void;
  aspectRatio?: 'square' | '16:9';
  showControls?: boolean;
  autoplay?: boolean;
  interval?: number;
}

export default function ImageCarousel({
  images,
  onImageClick,
  aspectRatio = 'square',
  showControls = true,
  autoplay = false,
  interval = 5000
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimeoutRef = useRef<number>();

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: 'touches' in event ? event.touches[0].clientX : event.clientX,
      time: Date.now()
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const dragDistance = info.offset.x;
      const dragTime = Date.now() - dragStart.time;
      const velocity = Math.abs(dragDistance / dragTime);

      if (Math.abs(dragDistance) > 50 || velocity > 0.5) {
        if (dragDistance > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    },
    [handleNext, handlePrev, dragStart.time]
  );

  useEffect(() => {
    if (autoplay && !isHovered && !isDragging) {
      autoplayTimeoutRef.current = window.setTimeout(handleNext, interval);
    }
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [autoplay, currentIndex, handleNext, interval, isHovered, isDragging]);

  const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-full overflow-hidden rounded-lg ${aspectRatioClass} bg-black`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && onImageClick?.()}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            {images[currentIndex].type === 'image' ? (
              <img
                src={images[currentIndex].url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={images[currentIndex].url}
                className="w-full h-full object-cover"
                controls={false}
                autoPlay
                loop
                muted
                playsInline
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showControls && images.length > 1 && (
        <AnimatePresence>
          {(isHovered || isDragging) && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}