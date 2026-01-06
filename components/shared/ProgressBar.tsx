import React from 'react';

export const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-lat-blue transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
