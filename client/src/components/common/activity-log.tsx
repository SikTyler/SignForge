import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
