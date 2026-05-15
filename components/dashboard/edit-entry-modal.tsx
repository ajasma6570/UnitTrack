'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { SolarEntry } from '@/lib/types'

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  totalGeneration: z.coerce.number().min(0, 'Must be a positive number'),
  importGrid: z.coerce.number().min(0, 'Must be a positive number'),
  exportGrid: z.coerce.number().min(0, 'Must be a positive number'),
})

type FormValues = z.infer<typeof formSchema>

interface EditEntryModalProps {
  entry: SolarEntry
  onSuccess: () => void
  onCancel: () => void
}

export function EditEntryModal({
  entry,
  onSuccess,
  onCancel,
}: EditEntryModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: entry.date,
      totalGeneration: entry.totalGeneration,
      importGrid: entry.importGrid,
      exportGrid: entry.exportGrid,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)
      await apiClient.updateEntry(entry.id, {
        date: values.date,
        totalGeneration: values.totalGeneration,
        importGrid: values.importGrid,
        exportGrid: values.exportGrid,
      })
      toast.success('Entry updated successfully!')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update entry')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>
            Update the solar energy readings for this date
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalGeneration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Generation (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="importGrid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Import from Grid (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exportGrid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export to Grid (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
