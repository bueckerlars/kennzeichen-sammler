interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'Lädt...',
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'text-center py-8';

  return (
    <div className={className || containerClass}>
      {fullScreen ? (
        <div>{message}</div>
      ) : (
        <>
          <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-muted-foreground">{message}</p>
        </>
      )}
    </div>
  );
}

