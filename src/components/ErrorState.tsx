import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div id="error-state-card" className="bg-white border border-[#CBD5E1] rounded-[10px] p-6 text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F87171] text-[#C2413B] flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto">
        <h3 className="text-base font-bold text-[#C2413B]">Grievance Analysis Error</h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#C2413B] hover:bg-[#A8352F] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Analysis</span>
        </button>
      </div>
    </div>
  );
};

