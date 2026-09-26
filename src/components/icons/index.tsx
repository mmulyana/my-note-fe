export function AllNotesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c.13 0 .26-.03.38-.08s.23-.12.33-.22l7-7c.09-.09.15-.19.2-.29l.03-.09c.03-.08.05-.17.05-.26 0-.02.01-.04.01-.06V5c0-1.1-.9-2-2-2M5 5h14v7h-6c-.55 0-1 .45-1 1v6H5z"></path>
    </svg>
  );
}

export function TodoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M10.5 15.5c-.26 0-.51-.1-.71-.29l-2.5-2.5L8.7 11.3l1.79 1.79 4.79-4.79 1.41 1.41-5.5 5.5c-.2.2-.45.29-.71.29Z"></path>
      <path d="M19 21H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2M5 5v14h14V5z"></path>
    </svg>
  );
}

export function LabelsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M3 14v2h3.73l-.72 3.82 1.97.37.78-4.18h4.96L13 19.83l1.97.37.78-4.18h4.23v-2h-3.86l.75-4h4.11v-2h-3.73l.72-3.82L16 3.83l-.78 4.18h-4.96l.72-3.82-1.97-.37L8.23 8H4v2h3.86l-.75 4zm6.89-4h4.96l-.75 4H9.14z"></path>
    </svg>
  );
}

export function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m21.8 6.4-2.7-3.6c-.38-.5-.97-.8-1.6-.8h-11c-.63 0-1.23.3-1.6.8L2.2 6.4h.01c-.13.18-.21.37-.21.6v13c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-.23-.09-.42-.21-.59h.01ZM6.5 4h11L19 6H5zM4 20V8h16v12z"></path>
      <path d="M8 11h8v2H8z"></path>
    </svg>
  );
}

export function AppLogoIcon({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="10 9.5 155 155"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="30"
        y="16"
        width="130"
        height="142"
        rx="16"
        className="fill-[#258AF4] dark:fill-[#414246]"
      />
      <rect
        x="15"
        y="47"
        width="32"
        height="15"
        rx="7.5"
        className="fill-[#7DB9FA] dark:fill-[#D8D9DC]"
      />
      <rect
        x="15"
        y="81"
        width="32"
        height="15"
        rx="7.5"
        className="fill-[#7DB9FA] dark:fill-[#D8D9DC]"
      />
      <rect
        x="15"
        y="115"
        width="32"
        height="15"
        rx="7.5"
        className="fill-[#7DB9FA] dark:fill-[#D8D9DC]"
      />
      <rect
        x="67"
        y="56"
        width="64"
        height="12"
        rx="6"
        className="fill-[#D9ECFF] dark:fill-[#D8D9DC]"
      />
      <rect
        x="67"
        y="85"
        width="58"
        height="12"
        rx="6"
        className="fill-[#D9ECFF] dark:fill-[#D8D9DC]"
      />
      <rect
        x="67"
        y="114"
        width="50"
        height="12"
        rx="6"
        className="fill-[#D9ECFF] dark:fill-[#D8D9DC]"
      />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M6 22h12c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5S7 4.24 7 7v2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2M9 7c0-1.65 1.35-3 3-3s3 1.35 3 3v2H9zm-3 4h12v9H6z"></path>
    </svg>
  );
}

export function LockOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M6 22h12c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2H9V7c0-1.65 1.35-3 3-3s3 1.35 3 3h2c0-2.76-2.24-5-5-5S7 4.24 7 7v2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2m0-11h12v9H6z"></path>
    </svg>
  );
}

export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path>
      <path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path>
    </svg>
  );
}

export function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 17c-5.35 0-7.42-3.84-7.93-5 .2-.46.65-1.34 1.45-2.23l-1.4-1.4c-1.49 1.65-2.06 3.28-2.08 3.31-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68.91 0 1.73-.1 2.49-.26l-1.77-1.77c-.24.02-.47.03-.72.03Zm9.95-4.68c.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68-1.84 0-3.36.39-4.61.97L2.71 1.29 1.3 2.7l4.32 4.32 1.42 1.42 2.27 2.27 3.98 3.98 1.8 1.8 1.53 1.53 4.68 4.68 1.41-1.41-4.32-4.32c2.61-1.95 3.55-4.61 3.56-4.65m-7.25.97c.19-.39.3-.83.3-1.29 0-1.64-1.36-3-3-3-.46 0-.89.11-1.29.3l-1.8-1.8c.88-.31 1.9-.5 3.08-.5 5.35 0 7.42 3.85 7.93 5-.3.69-1.18 2.33-2.96 3.55z"></path>
    </svg>
  );
}

export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z"></path>
    </svg>
  );
}

export function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M20 4h-8.59L10 2.59C9.62 2.21 9.12 2 8.59 2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 14H4V6h16z"></path>
    </svg>
  );
}
