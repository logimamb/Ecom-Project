import { ExportButton } from '@/components/export-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  exportOptions?: {
    all?: boolean;
    current?: string;
  };
}

export function PageHeader({ 
  title, 
  description,
  exportOptions 
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {exportOptions && (
        <div className="flex items-center gap-2">
          {exportOptions.current ? (
            <ExportButton 
              url={`/api/export/${exportOptions.current}`}
              label={`Export ${title}`}
            />
          ) : exportOptions.all ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/all'}>
                  Export All Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/customers'}>
                  Export Customers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/inventory'}>
                  Export Inventory
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/sales'}>
                  Export Sales
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/orders'}>
                  Export Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/export/suppliers'}>
                  Export Suppliers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      )}
    </div>
  );
}
