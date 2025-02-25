export const toast = ({
  title,
  description,
  duration,
}: {
  title: string;
  description: string;
  duration: number;
}) => {
  // In a real implementation, this would be a proper toast system
  console.log(`Toast: ${title} - ${description}`);
};
