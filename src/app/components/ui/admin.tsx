import * as React from "react";
import { cn } from "./utils";
import { Card } from "./card";
import { TableHeader, TableRow } from "./table";
import { DialogContent } from "./dialog";
import { Badge } from "./badge";

export function AdminCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card {...props} className={cn("bg-white border-[#E6D4C3]", className)} />;
}

export function AdminTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader {...props} className={cn("bg-[#FFF8F3]", className)} />;
}

export function AdminTableRowHeader({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return <TableRow {...props} className={cn("border-b border-[#E6D4C3]", className)} />;
}

export function AdminTableRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      {...props}
      className={cn(
        "hover:bg-[#FFF8F3] transition-colors duration-200 border-b border-[#E6D4C3]",
        className
      )}
    />
  );
}

export function AdminDialogContent({ className, ...props }: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent {...props} className={cn("bg-white border-[#E6D4C3]", className)} />;
}

export function AdminBadgeSecondary({ className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      {...props}
      className={cn("bg-[#FFF8F3] text-[#9B8B7E] border border-[#E6D4C3]", className)}
    />
  );
}
