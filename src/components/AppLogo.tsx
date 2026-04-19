import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  imageClassName?: string;
}

export default function AppLogo({ className, imageClassName }: AppLogoProps) {
  return (
    <div className={cn('inline-flex items-center justify-center rounded-2xl overflow-hidden', className)}>
      <img
        src="/logo-192-transparent.png"
        alt="AuraTune logo"
        className={cn('h-full w-full object-contain', imageClassName)}
      />
    </div>
  );
}