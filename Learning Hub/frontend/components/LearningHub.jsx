'use client';
import { useEffect } from 'react';

/**
 * Mounts the Learning Hub client app. Pages inside the app are addressed with
 * hash routes (/#courses, /#learn-c1-m1l2, /#verify-LH-2026-AB12CD, …) and rendered
 * by lib/hub.js from the API snapshot. Shareable links (/verify/:id, /wallet/:handle,
 * /cert/:id) are real Next.js routes that redirect into the app.
 */
export default function LearningHub() {
  useEffect(() => { import('../lib/hub'); }, []);
  return (
    <>
      <a className="sr" href="#main">Skip to content</a>
      <div id="root" />
    </>
  );
}
