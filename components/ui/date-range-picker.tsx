"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  from: Date;
  to?: Date;
}

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [startDate, setStartDate] = React.useState<string>(
    date?.from ? format(date.from, "yyyy-MM-dd") : ""
  );
  const [endDate, setEndDate] = React.useState<string>(
    date?.to ? format(date.to, "yyyy-MM-dd") : ""
  );

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    const value = e.target.value;
    if (type === "start") {
      setStartDate(value);
      onDateChange({
        from: new Date(value),
        to: endDate ? new Date(endDate) : undefined,
      });
    } else {
      setEndDate(value);
      if (startDate) {
        onDateChange({
          from: new Date(startDate),
          to: new Date(value),
        });
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              endDate ? (
                <>
                  {format(new Date(startDate), "LLL dd, y")} -{" "}
                  {format(new Date(endDate), "LLL dd, y")}
                </>
              ) : (
                format(new Date(startDate), "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e, "start")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleDateChange(e, "end")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
