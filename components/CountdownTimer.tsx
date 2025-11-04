import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  simulatedHour?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ simulatedHour }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      if (simulatedHour !== undefined) {
        now.setHours(simulatedHour, 0, 0, 0);
      }

      const cutoff = new Date(now);
      cutoff.setHours(21, 0, 0, 0); // 9:00 PM

      if (now >= cutoff) {
        return 'Cutoff time has passed for today.';
      }

      const difference = cutoff.getTime() - now.getTime();
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (simulatedHour !== undefined) {
        return `${hours}h ${minutes}m`;
      }

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    if (simulatedHour === undefined) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      setTimeLeft(calculateTimeLeft()); // Initial call
      return () => clearInterval(timer);
    } else {
      setTimeLeft(calculateTimeLeft());
    }
  }, [simulatedHour]);

  return (
    <div className="bg-green-100 border-l-4 border-primary text-primary-dark p-4 rounded-r-lg" role="alert">
      <p className="font-bold">Meal Confirmation Deadline</p>
      <p>Please confirm your meals before 9:00 PM. Time remaining: <span className="font-mono">{timeLeft}</span></p>
    </div>
  );
};

export default CountdownTimer;