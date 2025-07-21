'use client';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';

export default function PublishSuccessBanner() {
  const { width, height } = useWindowSize();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timeout = setTimeout(() => setShow(false), 10000); // hide after 4 sec
    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />;
}
