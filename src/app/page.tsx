import { Button } from '@/components/ui/button';
import { DiamondIcon } from '@/components/icons';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <DiamondIcon className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Welcome to Trickster</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          A modern, engaging digital experience for card game scoring.
        </p>
        <div className="space-y-4">
          <Link href="/setup">
            <Button size="lg" className="w-full">
              Start New Game
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="w-full">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}