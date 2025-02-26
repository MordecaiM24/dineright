"use client";
import { toast as shadToast } from "sonner";
import { Button } from "@/components/ui/button";

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
