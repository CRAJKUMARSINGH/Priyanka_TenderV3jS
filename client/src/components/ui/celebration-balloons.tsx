interface CelebrationBalloonsProps {
  show: boolean;
}

export function CelebrationBalloons({ show }: CelebrationBalloonsProps) {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-x-2">
      <div className="balloon text-4xl">🎈</div>
      <div className="balloon text-4xl">🎉</div>
      <div className="balloon text-4xl">🎊</div>
    </div>
  );
}
