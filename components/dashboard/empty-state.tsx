'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sun } from 'lucide-react'

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Sun className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No data yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Start tracking your solar energy by recording your first daily entry above.
        </p>
      </CardContent>
    </Card>
  )
}
