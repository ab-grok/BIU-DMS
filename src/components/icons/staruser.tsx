import { Divide } from "lucide-react";
import React from "react";
import { GrUserAdmin } from "react-icons/gr";

export default function StarUser({ size = 20 }: { size: number }) {
  return (
    <div>
      <GrUserAdmin size={size} className={``} />;
    </div>
  );
}
