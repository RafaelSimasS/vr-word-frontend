import React from "react";

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div
      className={`font-extrabold tracking-tight text-lg sm:text-xl text-white select-none ${className}`}
      aria-label="VRWords Logo"
    >
      VRWords
    </div>
  );
};

export default Logo;
