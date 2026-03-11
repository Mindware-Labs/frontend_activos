"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EmployeeDatePickerProps = {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"];

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromInputDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthGrid(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const leadingCells = (firstDayOfMonth.getDay() + 6) % 7;
  const cells: Array<Date | null> = Array.from<Date | null>({
    length: leadingCells,
  }).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }

  const trailingCells = (7 - (cells.length % 7)) % 7;
  for (let index = 0; index < trailingCells; index += 1) {
    cells.push(null);
  }

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLabel(date: Date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-DO", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function EmployeeDatePicker({
  id,
  value,
  disabled,
  onChange,
  className,
}: EmployeeDatePickerProps) {
  const selectedDate = useMemo(() => fromInputDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startOfMonth(selectedDate ?? new Date()),
  );

  const monthCells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  function handleDaySelect(day: Date) {
    onChange(toInputDate(day));
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-start rounded-xl border-gray-200 bg-white px-3 text-left text-sm font-normal text-gray-900 shadow-none transition-all focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20",
            !selectedDate && "text-gray-400",
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {selectedDate ? formatLabel(selectedDate) : "Selecciona una fecha"}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[260px] rounded-xl border border-gray-200 bg-white p-2.5 shadow-lg"
      >
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <p className="text-[11px] font-medium capitalize text-gray-700">
            {formatMonthLabel(visibleMonth)}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() =>
              setVisibleMonth(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((day) => (
            <span
              key={day}
              className="flex h-6 items-center justify-center text-[10px] font-medium text-gray-400"
            >
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthCells.map((day, index) => {
            if (!day) {
              return <span key={`empty-${index}`} className="h-8 w-8" />;
            }

            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <Button
                key={toInputDate(day)}
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "h-7 w-7 rounded-lg text-[11px] font-medium text-gray-700 hover:bg-gray-100",
                  isSelected &&
                    "bg-emerald-600 text-white hover:bg-emerald-700",
                )}
                onClick={() => handleDaySelect(day)}
              >
                {day.getDate()}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
