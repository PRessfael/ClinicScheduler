
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" };

function getItemConfig(payload, configs) {
  if (!configs || !payload?.dataKey) return null;
  return configs[payload.dataKey];
}

const ChartContent = React.forwardRef(({ className, configs = {}, indicator = "line", hideIndicator, nestLabel, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
});
ChartContent.displayName = "ChartContent";

export { ChartContent };
