"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Supplier } from '@/lib/types';

interface SupplierFormProps {
  onSuccess: (supplier: Supplier) => void;
  initialData?: Supplier;
  mode?: 'create' | 'edit';
}

export function SupplierForm({ onSuccess, initialData, mode = 'create' }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    platform: initialData?.platform || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    website: initialData?.website || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        platform: initialData.platform || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        website: initialData.website || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === 'create' ? '/api/suppliers' : `/api/suppliers/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mode === 'edit' ? { ...formData, id: initialData?.id } : formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} supplier`);
      }

      const supplier = await response.json();
      onSuccess(supplier);
      
      // Reset form if it's a create operation
      if (mode === 'create') {
        setFormData({
          name: '',
          platform: '',
          email: '',
          phone: '',
          address: '',
          website: '',
        });
      }
    } catch (error) {
      console.error(`Error ${mode}ing supplier:`, error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter supplier name"
          defaultValue={initialData?.name}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="platform">Platform</label>
        <Select
          value={formData.platform}
          onValueChange={(value) => setFormData({ ...formData, platform: value })}
          defaultValue={initialData?.platform}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alibaba">Alibaba</SelectItem>
            <SelectItem value="AliExpress">AliExpress</SelectItem>
            <SelectItem value="Amazon">Amazon</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="website">Website</label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
          defaultValue={initialData?.website}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="supplier@example.com"
          defaultValue={initialData?.email}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone">Phone</label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          placeholder="Enter phone number"
          defaultValue={initialData?.phone}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="address">Address</label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          placeholder="Enter address"
          defaultValue={initialData?.address}
        />
      </div>

      <Button type="submit" className="w-full">
        {mode === 'create' ? 'Add Supplier' : 'Save Changes'}
      </Button>
    </form>
  );
}