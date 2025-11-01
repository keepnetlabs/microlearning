import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';

interface ScientificBasisConfig {
  scientific_basis?: string;
}

interface ScientificBasisInfoProps {
  config?: ScientificBasisConfig;
  sceneType?: string;
}

export function ScientificBasisInfo({ config, sceneType }: ScientificBasisInfoProps) {
  const { isViewMode } = useEditMode();
  const scientificBasis = config?.scientific_basis;
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!isViewMode || !scientificBasis || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed z-[2147483600] pointer-events-none"
      style={{ top: 124, left: 116 }}
    >
      <div className="glass-border-3 pointer-events-auto w-[min(90vw,_28rem)] sm:w-[24rem] bg-white/85 dark:bg-black/80 backdrop-blur-2xl shadow-2xl ring-1 ring-white/40 transition-all duration-300 dark:ring-white/10">
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <BookOpen size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 flex flex-wrap items-baseline gap-2">
              Scientific Basis
            </h3>
            <div className="max-h-[40vh] overflow-y-auto pr-1 text-sm leading-relaxed text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
              {scientificBasis}
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}