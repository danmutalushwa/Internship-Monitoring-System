'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Copied
        </>
      ) : (
        <>
          <ClipboardIcon className="w-4 h-4" />
          Copy
        </>
      )}
    </button>
  );
}