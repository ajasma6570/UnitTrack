"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2 } from "lucide-react";
import { SolarEntry } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { EditEntryModal } from "./edit-entry-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoryTableProps {
  onDataChange?: () => void;
}

export function HistoryTable({ onDataChange }: HistoryTableProps) {
  const [entries, setEntries] = useState<SolarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<SolarEntry | null>(null);
  const limit = 10;

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.getEntries(page, limit);
      setEntries(result.entries);
      setTotal(result.total);
    } catch (error) {
      toast.error("Failed to fetch entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setPage(1);
      return;
    }

    try {
      const results = await apiClient.searchEntries(searchQuery);
      setEntries(results);
      setPage(1);
    } catch (error) {
      toast.error("Failed to search entries");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteEntry(id);
      toast.success("Entry deleted successfully");
      setEntries(entries.filter((e) => e.id !== id));
      setDeleteId(null);
      onDataChange?.();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const handleEdit = (entry: SolarEntry) => {
    setEditingEntry(entry);
  };

  const handleEditSuccess = () => {
    setEditingEntry(null);
    fetchEntries();
    onDataChange?.();
  };

  const hasMore = page * limit < total;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            View and manage your solar energy records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-col sm:flex-row gap-2"
          >
            <Input
              placeholder="Search by year (e.g., 2024)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="outline"
                className="text-sm h-9 flex-1 sm:flex-none"
              >
                Search
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm h-9"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                    fetchEntries();
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <Table className="text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 sm:pl-0">Date</TableHead>
                  <TableHead className="text-right">Gen</TableHead>
                  <TableHead className="text-right">Imp</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Exp
                  </TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right pr-6 sm:pr-0">Act</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6 sm:pl-0">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No entries
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium pl-6 sm:pl-0 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{entry.date}</span>
                          <span className="text-[9px] text-muted-foreground md:hidden">
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {(Number(entry.totalGeneration) || 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {(Number(entry.importGrid) || 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-xs hidden sm:table-cell">
                        {(Number(entry.exportGrid) || 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-600 text-xs">
                        {(Number(entry.unitUsed) || 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-[10px] text-muted-foreground hidden md:table-cell">
                        {new Date(entry.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6 sm:pr-0">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setDeleteId(entry.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / limit)} • {total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      {/* Edit Modal */}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}
