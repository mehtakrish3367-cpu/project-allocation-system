import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Database } from "lucide-react";
import React, { useState, useMemo } from "react";
import type { Customer } from "../data/mallCustomers";
import { CLUSTER_COLORS } from "../utils/colorPalette";

type SortKey = keyof Customer;
type SortDir = "asc" | "desc";

interface CustomerTableProps {
  customers: Customer[];
  assignments: number[] | null;
}

const PAGE_SIZE = 20;

function SortIcon({
  column,
  sortKey,
  sortDir,
}: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey)
    return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
  return sortDir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-primary" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-primary" />
  );
}

export function CustomerTable({ customers, assignments }: CustomerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("customerID");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [customers, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedCustomers.length / PAGE_SIZE);
  const pageData = sortedCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const assignmentMap = useMemo(() => {
    if (!assignments) return null;
    const map = new Map<number, number>();
    customers.forEach((c, i) => map.set(c.customerID, assignments[i]));
    return map;
  }, [customers, assignments]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "customerID", label: "ID" },
    { key: "gender", label: "Gender" },
    { key: "age", label: "Age" },
    { key: "annualIncome", label: "Income (k$)" },
    { key: "spendingScore", label: "Score" },
  ];

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Customer Dataset
          </h2>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          {customers.length} records · Page {page}/{totalPages}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-muted-foreground font-medium"
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {col.label}
                    <SortIcon
                      column={col.key}
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </button>
                </TableHead>
              ))}
              {assignments && (
                <TableHead className="text-muted-foreground font-medium">
                  Cluster
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((customer) => {
              const clusterIdx = assignmentMap?.get(customer.customerID);
              const clusterColor =
                clusterIdx !== undefined
                  ? CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length]
                  : null;
              return (
                <TableRow
                  key={customer.customerID}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{customer.customerID}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        customer.gender === "Female"
                          ? "bg-pink-500/15 text-pink-400"
                          : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {customer.gender}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {customer.age}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {customer.annualIncome}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-[60px]">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${customer.spendingScore}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-sm text-foreground">
                        {customer.spendingScore}
                      </span>
                    </div>
                  </TableCell>
                  {assignments && (
                    <TableCell>
                      {clusterIdx !== undefined && clusterColor ? (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${clusterColor}20`,
                            color: clusterColor,
                          }}
                        >
                          C{clusterIdx + 1}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={
                page === 1
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer hover:bg-secondary"
              }
            />
          </PaginationItem>
          {getPageNumbers().map((p, i) =>
            p === "ellipsis" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis items have no stable key
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={
                page === totalPages
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer hover:bg-secondary"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
