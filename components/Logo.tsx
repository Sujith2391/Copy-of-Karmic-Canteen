import React from 'react';

const Logo: React.FC<{ className?: string; textColorClassName?: string }> = ({ className = 'h-10 w-auto', textColorClassName = 'text-primary' }) => (
  <div className="flex items-center space-x-3">
    <svg 
      className={className} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="100" fill="black"/>
      <g clipPath="url(#clip0_1_2)">
        <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="#1E2A4D"/>
        <path d="M36 36H164V164H36V36Z" fill="#1E2A4D"/>
        <path d="M36 36H44V164H36V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M52 36H60V164H52V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M68 36H76V164H68V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M84 36H92V164H84V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M100 36H108V164H100V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M116 36H124V164H116V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M132 36H140V164H132V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M148 36H156V164H148V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 36H164V44H36V36Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 52H164V60H36V52Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 68H164V76H36V68Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 84H164V92H36V84Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 100H164V108H36V100Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 116H164V124H36V116Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 132H164V140H36V132Z" fill="white" fillOpacity="0.1"/>
        <path d="M36 148H164V156H36V148Z" fill="white" fillOpacity="0.1"/>
        <path d="M92 48V152H84V48H92Z" fill="white"/>
        <path d="M92 96L144 48L150 58L106 100L152 144L142 152L92 96Z" fill="white"/>
        <path d="M92 44C94.2091 44 96 42.2091 96 40C96 37.7909 94.2091 36 92 36C89.7909 36 88 37.7909 88 40C88 42.2091 89.7909 44 92 44Z" fill="#F44336"/>
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="200" height="200" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <span className={`text-xl font-bold uppercase tracking-wider ${textColorClassName}`}>
      Karmic Design Pvt Ltd
    </span>
  </div>
);

export default Logo;