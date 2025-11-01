import React from 'react';

export const CatIcon: React.FC<{ isJumping: boolean; className?: string }> = ({ isJumping, className }) => (
  <svg viewBox="0 0 200 180" className={className} style={{ transform: isJumping ? 'rotate(-10deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <g>
      <path fill="#6c757d" d="M100,20 C40,20 10,60 10,120 C10,180 40,180 100,180 C160,180 190,180 190,120 C190,60 160,20 100,20 Z" />
      <path fill="#adb5bd" d="M30,90 C10,90 0,110 0,130 C0,150 10,170 30,170 L30,90 Z" />
      <path fill="#adb5bd" d="M170,90 C190,90 200,110 200,130 C200,150 190,170 170,170 L170,90 Z" />
      <circle fill="#ffffff" cx="75" cy="80" r="15" />
      <circle fill="#ffffff" cx="125" cy="80" r="15" />
      <circle fill="#264653" cx="75" cy="80" r="7" />
      <circle fill="#264653" cx="125" cy="80" r="7" />
      <path fill="#e76f51" d="M100,110 Q100,120 110,115 L90,115 Q100,120 100,110 Z" />
      <path fill="none" stroke="#495057" strokeWidth="5" d="M80,130 Q100,140 120,130" />
      <path fill="#6c757d" d="M40,20 L60,0 L80,20 Z" />
      <path fill="#6c757d" d="M120,20 L140,0 L160,20 Z" />
    </g>
  </svg>
);

export const BushIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <g>
      <circle cx="50" cy="50" r="45" fill="#2a9d8f"/>
      <circle cx="25" cy="60" r="25" fill="#2a9d8f"/>
      <circle cx="75" cy="60" r="25" fill="#2a9d8f"/>
      <circle cx="50" cy="30" r="20" fill="#2a9d8f"/>
    </g>
  </svg>
);

export const FishIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 50 25" className={className}>
      <path d="M 5,12.5 C 15,0 35,0 45,12.5 C 35,25 15,25 5,12.5 Z" fill="#e9c46a"/>
      <path d="M 45,12.5 L 50,5 L 50,20 Z" fill="#e76f51"/>
      <circle cx="15" cy="10" r="2" fill="#264653"/>
    </svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#e76f51" stroke="#e76f51" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);