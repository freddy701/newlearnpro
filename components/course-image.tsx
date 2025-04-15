"use client";

import { useState } from "react";

interface CourseImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CourseImage({ src, alt, className = "w-full h-full object-cover" }: CourseImageProps) {
  const [error, setError] = useState(false);
  
  // Couleurs pour les arrière-plans de remplacement
  const bgColors = [
    "bg-blue-600",
    "bg-purple-600",
    "bg-green-600",
    "bg-orange-600",
    "bg-red-600",
    "bg-indigo-600",
  ];
  
  // Sélectionner une couleur basée sur le nom du cours
  const getColorIndex = (text: string) => {
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      sum += text.charCodeAt(i);
    }
    return sum % bgColors.length;
  };
  
  const bgColor = bgColors[getColorIndex(alt)];
  
  if (error) {
    return (
      <div className={`${bgColor} ${className} flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">{alt.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}
