import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { SolarEntry } from "@/lib/types";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  totalGeneration: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Generation reading is required" })
      .min(0, "Must be a positive number"),
  ),
  importGrid: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Import reading is required" })
      .min(0, "Must be a positive number"),
  ),
  exportGrid: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Export reading is required" })
      .min(0, "Must be a positive number"),
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyEntryFormProps {
  onSuccess?: () => void;
}

export function DailyEntryForm({ onSuccess }: DailyEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [unitUsed, setUnitUsed] = useState(0);
  const [prevEntry, setPrevEntry] = useState<SolarEntry | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      totalGeneration: "" as unknown as number,
      importGrid: "" as unknown as number,
      exportGrid: "" as unknown as number,
    },
  });

  const selectedDate = form.watch("date");

  useEffect(() => {
    const fetchPrevEntry = async () => {
      try {
        const result = await apiClient.getEntries(1, 50);
        const entries = result.entries as SolarEntry[];

        const sorted = entries
          .filter((e) => e.date < selectedDate)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        setPrevEntry(sorted[0] || null);
      } catch (error) {
        console.error("Failed to fetch previous entry", error);
      }
    };

    fetchPrevEntry();
  }, [selectedDate]);

  const handleCalculate = (values: Partial<FormValues>) => {
    const todayTotal =
      parseFloat(values.totalGeneration?.toString() || "0") +
      parseFloat(values.importGrid?.toString() || "0") -
      parseFloat(values.exportGrid?.toString() || "0");

    if (prevEntry) {
      const yesterdayTotal =
        Number(prevEntry.totalGeneration) +
        Number(prevEntry.importGrid) -
        Number(prevEntry.exportGrid);

      setUnitUsed(Math.max(0, todayTotal - yesterdayTotal));
    } else {
      setUnitUsed(0);
    }
  };

  useEffect(() => {
    handleCalculate(form.getValues());
  }, [prevEntry]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await apiClient.createEntry({
        date: values.date,
        totalGeneration: values.totalGeneration,
        importGrid: values.importGrid,
        exportGrid: values.exportGrid,
        unitUsed: unitUsed,
      });
      toast.success("Entry saved successfully!");
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        totalGeneration: "" as unknown as number,
        importGrid: "" as unknown as number,
        exportGrid: "" as unknown as number,
      });
      setUnitUsed(0);
      onSuccess?.();
    } catch (error: any) {
      // Check for 409 Conflict which indicates a duplicate date
      if (error.message?.includes("already exists") || error.status === 409) {
        toast.error(
          `An entry for ${values.date} already exists. Please edit the existing entry or choose a different date.`,
        );
      } else {
        toast.error("Failed to save entry. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    // Show a toast for the first validation error found
    const firstError = Object.values(errors)[0] as any;
    if (firstError) {
      toast.error(firstError.message || "Please check your inputs");
    }
  };

  return (
    <Card className="border-none shadow-none sm:border sm:shadow-sm py-0!">
      <CardHeader className="pb-3 px-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg sm:text-xl">Add Entry</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Record meter readings for {selectedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="h-11 text-sm bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="totalGeneration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Gen Reading <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-blue-500"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCalculate({
                            ...form.getValues(),
                            totalGeneration: parseFloat(e.target.value) || 0,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importGrid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Import Reading <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-blue-500"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCalculate({
                            ...form.getValues(),
                            importGrid: parseFloat(e.target.value) || 0,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exportGrid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Export Reading <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-blue-500"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCalculate({
                            ...form.getValues(),
                            exportGrid: parseFloat(e.target.value) || 0,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Today's Unit Used
                  </span>
                  <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                    (Today Total) - (Prev Total)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {unitUsed.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 ml-1">
                    kWh
                  </span>
                </div>
              </div>
              {prevEntry && (
                <p className="text-[10px] text-muted-foreground mt-2 border-t pt-2 border-blue-200/50">
                  Comparing with readings from: {prevEntry.date}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 text-sm font-semibold shadow-lg bg-blue-600 shadow-blue-500/20"
              >
                {isLoading ? "Saving..." : "Save Entry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 text-sm"
                onClick={() => {
                  form.reset();
                  setUnitUsed(0);
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
