"use client";
import { toast as shadToast } from "sonner";

export const toast = ({
  title,
  description,
  duration,
  action,
}: {
  title: string;
  description: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) => {
  return shadToast(title, {
    description,
    duration,
    action,
  });
};
