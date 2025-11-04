/**
 * ConfidenceBadge Component
 * Displays confidence scores with color-coded badges
 */

import React from 'react';
import { getConfidenceBadgeColor, formatConfidence } from '@/utils/analyzerUtils';

/**
 * ConfidenceBadge Component
 * @param {number} confidence - Confidence score (0-100 or 0-1)
 * @param {boolean} showLabel - Show confidence tier label (default: false)
 * @param {string} size - Badge size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} className - Additional CSS classes
 */
export const ConfidenceBadge = ({
  confidence,
  showLabel = false,
  size = 'md',
  className = ''
}) => {
  if (!confidence && confidence !== 0) return null;

  const { bg, text, border, label } = getConfidenceBadgeColor(confidence);
  const formattedConfidence = formatConfidence(confidence);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`
        ${bg} ${text} ${sizeClasses[size]}
        font-bold rounded-full border ${border}
        inline-flex items-center gap-1
        shadow-lg
        ${className}
      `}
    >
      <span>{formattedConfidence}</span>
      {showLabel && <span className="opacity-80">• {label}</span>}
    </span>
  );
};

/**
 * ConfidenceBar Component
 * Displays confidence as a progress bar
 * @param {number} confidence - Confidence score (0-100 or 0-1)
 * @param {boolean} showPercentage - Show percentage text (default: true)
 * @param {string} height - Bar height: 'sm', 'md', 'lg' (default: 'md')
 */
export const ConfidenceBar = ({
  confidence,
  showPercentage = true,
  height = 'md'
}) => {
  if (!confidence && confidence !== 0) return null;

  const confidenceValue = confidence > 1 ? confidence : confidence * 100;
  const { bg, label } = getConfidenceBadgeColor(confidence);

  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  return (
    <div className="w-full space-y-1">
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${bg} ${heightClasses[height]} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${confidenceValue}%` }}
        >
          {showPercentage && height !== 'sm' && (
            <span className="text-white text-xs font-bold">
              {confidenceValue.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span>{formatConfidence(confidence)}</span>
        </div>
      )}
    </div>
  );
};

/**
 * ConfidenceTier Component
 * Shows a colored tier indicator with icon
 * @param {number} confidence - Confidence score (0-100 or 0-1)
 */
export const ConfidenceTier = ({ confidence }) => {
  if (!confidence && confidence !== 0) return null;

  const { bg, text, label } = getConfidenceBadgeColor(confidence);
  const confidenceValue = confidence > 1 ? confidence : confidence * 100;

  const getIcon = () => {
    if (confidenceValue >= 85) return '🔥';
    if (confidenceValue >= 75) return '⭐';
    if (confidenceValue >= 65) return '✨';
    return '💡';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${bg} ${text} px-3 py-1 rounded-lg flex items-center gap-2 shadow-lg`}>
        <span className="text-lg">{getIcon()}</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
          <span className="text-sm font-bold">{formatConfidence(confidence)}</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceBadge;
