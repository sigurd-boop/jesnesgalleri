'use client';

import React from 'react';
import classNames from 'classnames';
import { useUiState, Tab } from './useUiState';

const tabs: { id: Tab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export default function ResumeUI() {
  const { activeTab, setActiveTab, scanlines, setScanlines, brightness, setBrightness } =
    useUiState();

  return (
    <div
      className="w-full h-full flex flex-col bg-gray-200 border border-gray-400"
      onPointerDown={stop}
      onPointerMove={stop}
      onWheel={stop}
      onClick={stop}
    >
      <div className="flex items-center justify-between bg-gray-300 px-2 py-1 border-b border-gray-400">
        <span className="text-xs font-mono">Your Name — Software Engineer</span>
        <div className="flex space-x-1">
          <button className="w-3 h-3 bg-red-500"></button>
          <button className="w-3 h-3 bg-yellow-500"></button>
          <button className="w-3 h-3 bg-green-500"></button>
        </div>
      </div>
      <div className="flex space-x-2 px-2 pt-1 text-xs font-mono">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={classNames(
              'px-2 py-1 border border-gray-400 border-b-0',
              activeTab === t.id ? 'bg-white' : 'bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-2 text-xs font-mono bg-white border-t border-gray-400">
        {activeTab === 'about' && (
          <p>
            Passionate software engineer with a love for retro aesthetics and
            3D interfaces.
          </p>
        )}
        {activeTab === 'experience' && (
          <ul className="list-disc ml-4">
            <li>
              <strong>Tech Corp</strong> — Developer (2020-2022)
              <ul className="list-disc ml-4">
                <li>Worked on web applications</li>
              </ul>
            </li>
            <li>
              <strong>Web Solutions</strong> — Intern (2019-2020)
              <ul className="list-disc ml-4">
                <li>Assisted in frontend development</li>
              </ul>
            </li>
          </ul>
        )}
        {activeTab === 'projects' && (
          <ul className="list-disc ml-4">
            <li>
              <a
                href="https://github.com/example/project1"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Project One
              </a>
              — A cool project.
            </li>
            <li>
              <a
                href="https://github.com/example/project2"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Project Two
              </a>
              — Another cool project.
            </li>
          </ul>
        )}
        {activeTab === 'contact' && (
          <ul className="list-disc ml-4">
            <li>Email: your.email@example.com</li>
            <li>
              <a href="https://linkedin.com" className="underline" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://github.com" className="underline" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        )}
      </div>
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-300 border-t border-gray-400 text-xs font-mono">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={scanlines}
            onChange={(e) => setScanlines(e.target.checked)}
          />
          Scanlines
        </label>
        <label className="flex items-center gap-1">
          Brightness
          <input
            type="range"
            min={0.5}
            max={1.4}
            step={0.1}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

