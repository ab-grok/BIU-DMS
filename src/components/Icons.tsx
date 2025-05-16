import { cn } from "@/lib/utils";
import {
  Eye,
  PencilLine,
  Tags,
  IdCard,
  Settings2,
  Text,
} from "lucide-react";

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div>
      {name == "Author" ? (
        <IdCard className={cn("size-5 text-blue-600", className)} />
      ) : name == "Viewers" ? (
        <Eye className={cn("size-5 text-emerald-700", className)} />
      ) : name == "Editors" ? (
        <PencilLine className={cn("size-5 text-amber-800", className)} />
      ) : name == "Database" ? (
        <Tags className={cn("text-bw/60 size-5", className)} />
      ) : name == "actions" ? (
        <Settings2 className={cn("text-bw/60 size-5", className)} />
      ) : (
        <Text className={cn("text-bw/60 size-5", className)} />
      )}
    </div>
  );
}
