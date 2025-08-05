"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import React from "react";

interface Field {
  label: string;
  value: React.ReactNode;
}

interface TableColumn {
  label: string;
  render: (item: any) => React.ReactNode;
}

interface ViewDialogProps {
  title: string;
  fields: Field[];
  table?: {
    columns: TableColumn[];
    data: any[];
  };
  trigger?: React.ReactNode;
}

export function ViewDialog({ title, fields, table, trigger }: ViewDialogProps) {
  const [open, setOpen] = React.useState(false);
  const defaultTrigger = (
    <Button size="sm" variant="ghost" className="hover:bg-purple-50 hover:text-purple-600">
      <Eye className="h-4 w-4" />
    </Button>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-white/20" aria-describedby="view-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div id="view-dialog-description" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f, i) => (
              <div key={i}>
                <div className="font-semibold text-gray-700">{f.label}</div>
                <div>{f.value}</div>
              </div>
            ))}
          </div>
          {table && (
            <div>
              <div className="font-semibold text-gray-700 mb-2">Items</div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {table.columns.map((col, i) => (
                        <th key={i} className="p-2 text-left">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.data.map((item, idx) => (
                      <tr key={idx}>
                        {table.columns.map((col, i) => (
                          <td key={i} className="p-2">{col.render(item)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 