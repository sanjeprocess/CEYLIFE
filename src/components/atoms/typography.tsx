"use client";

import { CSSProperties } from "react";

import { cn } from "@/utils/shadcn.utils";

export function H1({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h1
      className="text-2xl font-bold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h2
      className="text-xl font-semibold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h3
      className="text-lg font-semibold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h4
      className="text-base font-semibold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h4>
  );
}

export function H5({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h5
      className="text-sm font-semibold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h5>
  );
}

export function H6({
  children,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <h6
      className="text-xs font-semibold"
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </h6>
  );
}

export function P({
  children,
  className,
  style,
  dangerouslySetInnerHTML,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  dangerouslySetInnerHTML?: { __html: string };
}) {
  return (
    <p
      className={cn("text-base", className)}
      style={style}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </p>
  );
}
