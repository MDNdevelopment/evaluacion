interface Badge {
  type: string;
  text: string;
}

interface Props {
  badge: Badge;
}

export default function EvaluatedBadge({ badge }: Props) {
  let color = "";

  switch (badge.type) {
    case "success":
      return (
        <span
          className={`block text-center  bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-${color}-300`}
        >
          {badge.text}
        </span>
      );
    case "warning":
      return (
        <span
          className={`block text-center  bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-${color}-300`}
        >
          {badge.text}
        </span>
      );
    case "danger":
      return (
        <span
          className={`block text-center bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-${color}-300`}
        >
          {badge.text}
        </span>
      );
    default:
      return (
        <span
          className={`bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-${color}-300`}
        >
          {badge.text}
        </span>
      );
  }
}
