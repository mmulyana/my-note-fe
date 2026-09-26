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
