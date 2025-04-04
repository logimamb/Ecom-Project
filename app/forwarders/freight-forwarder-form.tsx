"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FreightForwarder } from "@/lib/types";
import { cn } from "@/lib/utils";

const transportModes = [
  { id: "sea", label: "Sea Freight", description: "Ocean shipping and maritime transport" },
  { id: "air", label: "Air Freight", description: "Air cargo and express delivery" },
  { id: "land", label: "Land Transport", description: "Road and rail transportation" },
] as const;

const forwarderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  depotAddress: z.string().min(5, "Address must be at least 5 characters"),
  transportModes: z.array(z.enum(["sea", "air", "land"])).min(1, "Select at least one transport mode"),
});

type ForwarderFormData = z.infer<typeof forwarderSchema>;

interface ForwarderFormProps {
  forwarder?: FreightForwarder;
  onSuccess: (forwarder: FreightForwarder) => void;
}

export function FreightForwarderForm({ forwarder, onSuccess }: ForwarderFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForwarderFormData>({
    resolver: zodResolver(forwarderSchema),
    defaultValues: forwarder ? {
      name: forwarder.name,
      contactPerson: forwarder.contactPerson,
      email: forwarder.email,
      phone: forwarder.phone,
      depotAddress: forwarder.depotAddress,
      transportModes: forwarder.transportModes as ("sea" | "air" | "land")[],
    } : {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      depotAddress: "",
      transportModes: [],
    },
  });

  const onSubmit = async (data: ForwarderFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        forwarder ? `/api/freight-forwarders/${forwarder.id}` : "/api/freight-forwarders",
        {
          method: forwarder ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save freight forwarder");
      }

      const savedForwarder = await response.json();
      onSuccess(savedForwarder);
    } catch (error) {
      console.error("Error saving freight forwarder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="depotAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depot Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter complete depot address"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transportModes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Transport Modes</FormLabel>
                <FormDescription>
                  Select the types of transport services offered
                </FormDescription>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {transportModes.map((mode) => (
                  <FormField
                    key={mode.id}
                    control={form.control}
                    name="transportModes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={mode.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(mode.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, mode.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== mode.id)
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium leading-none">
                              {mode.label}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {mode.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "min-w-[120px]",
              isLoading && "cursor-not-allowed opacity-60"
            )}
          >
            {isLoading ? "Saving..." : forwarder ? "Save Changes" : "Add Forwarder"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
