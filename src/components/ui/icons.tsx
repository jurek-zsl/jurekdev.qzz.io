import React from "react";
import { siGithub, siGo, siDocker, siLinux, siReact, siNextdotjs, siTypescript, siRust } from "simple-icons";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function Github({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d={siGithub.path} />
    </svg>
  );
}

export function GoIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d={siGo.path} />
    </svg>
  );
}

export function DockerIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d={siDocker.path} />
    </svg>
  );
}

export function LinuxIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d={siLinux.path} />
    </svg>
  );
}
