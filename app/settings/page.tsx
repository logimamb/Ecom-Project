"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useSettings, Settings } from "@/contexts/settings-context";
import { useCurrencyConverter } from "@/hooks/use-currency-converter";

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings: globalSettings, isLoading: isLoadingSettings, updateSettings, convertCurrency } = useSettings();
  const { rates, loading: ratesLoading } = useCurrencyConverter();
  const [isLoading, setIsLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings>(globalSettings);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Update local settings when global settings change
  useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings(localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Backup failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Backup created',
        description: 'Your data has been backed up successfully.',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create backup.',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      setIsLoading(true);

      const oldCurrency = localSettings.businessInfo.currency;
      if (oldCurrency === newCurrency) {
        return;
      }

      // Create new settings object
      const newSettings = {
        ...localSettings,
        businessInfo: {
          ...localSettings.businessInfo,
          currency: newCurrency,
        },
      };

      // Update settings with currency conversion
      await updateSettings(newSettings, true);

      // Update local state
      setLocalSettings(newSettings);

      toast({
        title: 'Currency Updated',
        description: `Currency has been changed to ${newCurrency} and all values have been converted`,
      });

      // Reload the page after a short delay to ensure settings are saved
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: 'Error',
        description: 'Failed to update currency. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Your business details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Your Business Name"
                    value={localSettings.businessInfo.name}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      businessInfo: {
                        ...localSettings.businessInfo,
                        name: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@example.com"
                    value={localSettings.businessInfo.email}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      businessInfo: {
                        ...localSettings.businessInfo,
                        email: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 234 567 890"
                    value={localSettings.businessInfo.phone}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      businessInfo: {
                        ...localSettings.businessInfo,
                        phone: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Business St, City, Country"
                    value={localSettings.businessInfo.address}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      businessInfo: {
                        ...localSettings.businessInfo,
                        address: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={localSettings.businessInfo.currency}
                    onValueChange={handleCurrencyChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="currency" className="w-[180px]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF - Central African CFA</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                  {isLoading && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating currency...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>
                Language and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={localSettings.businessInfo.language}
                    onValueChange={(value) => setLocalSettings({
                      ...localSettings,
                      businessInfo: {
                        ...localSettings.businessInfo,
                        language: value
                      }
                    })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.email}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      email: checked
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications in browser
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.browser}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      browser: checked
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Notify when items are below reorder point
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.lowStock}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      lowStock: checked
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Orders</Label>
                  <p className="text-sm text-gray-500">
                    Notify about new orders
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.newOrders}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      newOrders: checked
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Notify about payment due dates
                  </p>
                </div>
                <Switch
                  checked={localSettings.notifications.paymentReminders}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      paymentReminders: checked
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display</CardTitle>
              <CardDescription>
                Customize the appearance of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={localSettings.appearance.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => setLocalSettings({
                      ...localSettings,
                      appearance: {
                        ...localSettings.appearance,
                        theme: value
                      }
                    })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="density">Display Density</Label>
                  <Select
                    value={localSettings.appearance.density}
                    onValueChange={(value: 'comfortable' | 'compact') => setLocalSettings({
                      ...localSettings,
                      appearance: {
                        ...localSettings.appearance,
                        density: value
                      }
                    })}
                  >
                    <SelectTrigger id="density">
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Collapsed Sidebar</Label>
                    <p className="text-sm text-gray-500">
                      Keep the sidebar collapsed by default
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => setLocalSettings({
                      ...localSettings,
                      appearance: {
                        ...localSettings.appearance,
                        sidebarCollapsed: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Download or restore your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create Backup</h3>
                <p className="text-sm text-gray-500">
                  Download a backup of all your data
                </p>
                <Button onClick={handleBackup} disabled={isBackingUp}>
                  {isBackingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    "Download Backup"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
