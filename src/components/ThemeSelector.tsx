'use client';

import React from 'react';
import { themes, type ThemeName, type Theme } from '@/lib/themes';

interface ThemeSelectorProps {
  selectedTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export default function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Choose Your Theme</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.entries(themes) as [ThemeName, Theme][]).map(([themeName, theme]) => (
          <button
            key={themeName}
            onClick={() => onThemeChange(themeName)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
              selectedTheme === themeName
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            }}
          >
            <div className="text-center">
              <div
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <h4 className="font-medium text-sm">{theme.label}</h4>
              <p className="text-xs opacity-75 mt-1">{theme.description}</p>
            </div>
            {selectedTheme === themeName && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}