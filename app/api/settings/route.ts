import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db/json';

const SETTINGS_FILE = 'data/settings.json';

interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  browser: boolean;
  lowStock: boolean;
  newOrders: boolean;
  paymentReminders: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  sidebarCollapsed: boolean;
}

interface Settings {
  businessInfo: BusinessInfo;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

const defaultSettings: Settings = {
  businessInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'USD',
    language: 'en'
  },
  notifications: {
    email: false,
    browser: true,
    lowStock: true,
    newOrders: true,
    paymentReminders: true
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    sidebarCollapsed: false
  }
};

export async function GET() {
  try {
    const settings = await readJSON(SETTINGS_FILE);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();

    // Validate settings structure
    const validatedSettings = {
      ...defaultSettings,
      ...settings,
      businessInfo: {
        ...defaultSettings.businessInfo,
        ...settings.businessInfo
      },
      notifications: {
        ...defaultSettings.notifications,
        ...settings.notifications
      },
      appearance: {
        ...defaultSettings.appearance,
        ...settings.appearance
      }
    };

    // Save settings to file
    await writeJSON(SETTINGS_FILE, validatedSettings);

    return NextResponse.json({ 
      message: 'Settings saved successfully',
      settings: validatedSettings 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json();

    // Validate settings structure
    const validatedSettings = {
      ...defaultSettings,
      ...settings,
      businessInfo: {
        ...defaultSettings.businessInfo,
        ...settings.businessInfo
      },
      notifications: {
        ...defaultSettings.notifications,
        ...settings.notifications
      },
      appearance: {
        ...defaultSettings.appearance,
        ...settings.appearance
      }
    };

    // Save settings to file
    await writeJSON(SETTINGS_FILE, validatedSettings);

    return NextResponse.json({ 
      message: 'Settings saved successfully',
      settings: validatedSettings 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
