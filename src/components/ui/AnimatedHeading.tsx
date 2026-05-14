"use client";

import { Fragment } from "react";

type Props = {
  text: string;
  className?: string;
  delayStep?: number;
  startDelay?: number;
};

export function AnimatedHeading({
  text,
  className,
  delayStep = 90,
  startDelay = 0,
}: Props) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span
            className="word-fade"
            style={{ animationDelay: `${startDelay + i * delayStep}ms` }}
          >
            {w}
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
