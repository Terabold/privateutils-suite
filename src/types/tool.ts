import { ReactNode } from "react";

export interface Tool {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}
