'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Globe, Plus, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PortfolioLink {
  id?: string;
  type: 'github' | 'linkedin' | 'website' | 'behance' | 'dribbble' | 'twitter';
  url: string;
  isVerified: boolean;
  lastSyncedAt?: string;
}

interface PortfolioIntegrationProps {
  links: PortfolioLink[];
  onAddLink: (link: Omit<PortfolioLink, 'id'>) => void;
  onRemoveLink: (id: string) => void;
  onSyncLink: (id: string) => void;
}

const linkTypeConfig = {
  github: { icon: Github, label: 'GitHub', color: 'bg-gray-800 text-white' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-600 text-white' },
  website: { icon: Globe, label: 'Website', color: 'bg-green-600 text-white' },
  behance: { icon: Globe, label: 'Behance', color: 'bg-blue-400 text-white' },
  dribbble: { icon: Globe, label: 'Dribbble', color: 'bg-pink-500 text-white' },
  twitter: { icon: Globe, label: 'Twitter', color: 'bg-blue-400 text-white' },
};

export default function PortfolioIntegration({
  links,
  onAddLink,
  onRemoveLink,
  onSyncLink,
}: PortfolioIntegrationProps) {
  const [newLinkType, setNewLinkType] = useState<PortfolioLink['type']>('github');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newLinkUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    // Check if this type already exists
    if (links.some(link => link.type === newLinkType)) {
      toast.error(`${linkTypeConfig[newLinkType].label} link already exists`);
      return;
    }

    setIsAdding(true);
    try {
      await onAddLink({
        type: newLinkType,
        url: newLinkUrl,
        isVerified: false,
      });
      setNewLinkUrl('');
      toast.success('Portfolio link added successfully!');
    } catch (error) {
      toast.error('Failed to add portfolio link');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      await onSyncLink(id);
      toast.success('Portfolio synced successfully!');
    } catch (error) {
      toast.error('Failed to sync portfolio');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Portfolio Integration
        </CardTitle>
        <CardDescription>
          Connect your professional profiles for real-time portfolio updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Links */}
        {links.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Connected Profiles</h4>
            <div className="space-y-2">
              {links.map((link) => {
                const config = linkTypeConfig[link.type];
                const Icon = config.icon;
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{config.label}</span>
                          {link.isVerified ? (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Verified
                            </Badge>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {link.url}
                        </a>
                        {link.lastSyncedAt && (
                          <p className="text-xs text-gray-500">
                            Last synced: {new Date(link.lastSyncedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(link.id!)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveLink(link.id!)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Link */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700">Add New Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link-type">Platform</Label>
              <select
                id="link-type"
                value={newLinkType}
                onChange={(e) => setNewLinkType(e.target.value as PortfolioLink['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(linkTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder={`https://${newLinkType}.com/yourusername`}
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleAddLink}
            disabled={isAdding}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add Profile'}
          </Button>
        </div>

        {/* Coming Soon OAuth */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Coming Soon: One-Click Integration</h4>
          <p className="text-sm text-blue-700">
            OAuth integration with GitHub, LinkedIn, and other platforms for automatic portfolio syncing and project updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}