interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-8 w-8" }: LogoProps) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Box/Package shape */}
      <path
        d="M24 4L44 14V34L24 44L4 34V14L24 4Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.2"
      />
      <path
        d="M24 4L44 14L24 24L4 14L24 4Z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M4 14V34L24 44V24L4 14Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.6"
      />
      <path
        d="M44 14V34L24 44V24L44 14Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.8"
      />
      {/* Center line */}
      <path
        d="M24 4V24M24 24L4 14M24 24L44 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;
