"use client";

import { useState } from "react";
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

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  totalGeneration: z.coerce.number().min(0, "Must be a positive number"),
  importGrid: z.coerce.number().min(0, "Must be a positive number"),
  exportGrid: z.coerce.number().min(0, "Must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyEntryFormProps {
  onSuccess?: () => void;
}

export function DailyEntryForm({ onSuccess }: DailyEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [unitUsed, setUnitUsed] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      totalGeneration: "" as unknown as number,
      importGrid: "" as unknown as number,
      exportGrid: "" as unknown as number,
    },
  });

  const handleCalculate = (values: Partial<FormValues>) => {
    const total =
      parseFloat(values.totalGeneration?.toString() || "0") +
      parseFloat(values.importGrid?.toString() || "0") -
      parseFloat(values.exportGrid?.toString() || "0");
    setUnitUsed(Math.max(0, total));
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await apiClient.createEntry({
        date: values.date,
        totalGeneration: values.totalGeneration,
        importGrid: values.importGrid,
        exportGrid: values.exportGrid,
      });
      toast.success("Entry created successfully!");
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        totalGeneration: "" as unknown as number,
        importGrid: "" as unknown as number,
        exportGrid: "" as unknown as number,
      });
      setUnitUsed(0);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none sm:border sm:shadow-sm py-0!">
      <CardHeader className="pb-3 px-4 sm:px-6 sm:pt-6">
        <CardTitle className="text-lg sm:text-xl">Add Entry</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Record solar readings for today
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="h-11 text-sm bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-green-500"
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
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Generation
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-green-500"
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
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Import
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-green-500"
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
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Export
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-11 text-sm bg-muted/30  focus-visible:ring-1 focus-visible:ring-green-500"
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

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Total Used
                  </span>
                  <p className="text-[10px] text-green-600/70 dark:text-green-400/70 mt-0.5">
                    Gen + Import - Export
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {unitUsed.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-1">
                    kWh
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 text-sm font-semibold shadow-lg bg-green-600 shadow-green-500/20"
              >
                {isLoading ? "Saving..." : "Save Entry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 text-sm bg-red-600 text-white"
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
