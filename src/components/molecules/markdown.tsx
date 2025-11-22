"use client";

import { useMemo } from "react";
import { marked } from "marked";
import type { IMarkdownLayoutItem } from "@/common/interfaces/formData";

export const Markdown = (props: IMarkdownLayoutItem) => {
  const htmlContent = useMemo(() => {
    try {
      return marked.parse(props.text);
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return props.text;
    }
  }, [props.text]);

  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
