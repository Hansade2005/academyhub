'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Award,
  Send,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface Endorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserAvatar?: string;
  endorseeId: string;
  endorseeName: string;
  skillName: string;
  endorsementText: string;
  endorsementLevel: number; // 1-5 stars
  isVerified: boolean;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface EndorsementRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  requesteeId: string;
  requesteeName: string;
  skillName: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

interface EndorsementSystemProps {
  currentUserId: string;
  endorsementsReceived: Endorsement[];
  endorsementsGiven: Endorsement[];
  pendingRequests: EndorsementRequest[];
  sentRequests: EndorsementRequest[];
  onSendRequest: (requesteeId: string, skillName: string, message: string) => void;
  onRespondToRequest: (requestId: string, accept: boolean) => void;
  onWithdrawRequest: (requestId: string) => void;
}

export default function EndorsementSystem({
  currentUserId,
  endorsementsReceived,
  endorsementsGiven,
  pendingRequests,
  sentRequests,
  onSendRequest,
  onRespondToRequest,
  onWithdrawRequest,
}: EndorsementSystemProps) {
  const [newRequestSkill, setNewRequestSkill] = useState('');
  const [newRequestMessage, setNewRequestMessage] = useState('');
  const [newRequestUserId, setNewRequestUserId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSendRequest = () => {
    if (!newRequestUserId.trim() || !newRequestSkill.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSendRequest(newRequestUserId, newRequestSkill, newRequestMessage);
    setNewRequestSkill('');
    setNewRequestMessage('');
    setNewRequestUserId('');
    setIsDialogOpen(false);
    toast.success('Endorsement request sent!');
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'expired':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-xl font-bold">{endorsementsReceived.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Given</p>
                <p className="text-xl font-bold">{endorsementsGiven.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-xl font-bold">{sentRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Request Skill Endorsement</h3>
              <p className="text-sm text-gray-600">Ask colleagues or connections to endorse your skills</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Request Endorsement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Skill Endorsement</DialogTitle>
                  <DialogDescription>
                    Send a request to someone you know to endorse one of your skills.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestee-id">Person's User ID or Email</Label>
                    <Input
                      id="requestee-id"
                      placeholder="Enter user ID or email"
                      value={newRequestUserId}
                      onChange={(e) => setNewRequestUserId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-name">Skill to Endorse</Label>
                    <Input
                      id="skill-name"
                      placeholder="e.g., React Development, Project Management"
                      value={newRequestSkill}
                      onChange={(e) => setNewRequestSkill(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="request-message">Message (Optional)</Label>
                    <Textarea
                      id="request-message"
                      placeholder="Tell them why you're requesting their endorsement..."
                      value={newRequestMessage}
                      onChange={(e) => setNewRequestMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendRequest}>
                      Send Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Endorsement Requests
            </CardTitle>
            <CardDescription>
              People asking you to endorse their skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={request.requesterAvatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{request.requesterName}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Requests endorsement for: <strong>{request.skillName}</strong>
                        </p>
                        {request.message && (
                          <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-500">
                            <p className="text-sm italic">"{request.message}"</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(request.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onRespondToRequest(request.id, true)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRespondToRequest(request.id, false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Sent Endorsement Requests
            </CardTitle>
            <CardDescription>
              Requests you've sent to others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={request.requesterAvatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">To: {request.requesteeName}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          For skill: <strong>{request.skillName}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          Sent: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onWithdrawRequest(request.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Received Endorsements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Endorsements Received
          </CardTitle>
          <CardDescription>
            Skills endorsed by your professional network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {endorsementsReceived.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No endorsements yet</p>
              <p className="text-sm">Start building your professional network!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endorsementsReceived.map((endorsement) => (
                <div key={endorsement.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={endorsement.endorserAvatar} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium">{endorsement.endorserName}</p>
                        <div className="flex">{renderStars(endorsement.endorsementLevel)}</div>
                        {endorsement.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-blue-600 mb-1">{endorsement.skillName}</p>
                      {endorsement.endorsementText && (
                        <p className="text-sm text-gray-700 mb-2">"{endorsement.endorsementText}"</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Given Endorsements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Endorsements Given
          </CardTitle>
          <CardDescription>
            Skills you've endorsed for others
          </CardDescription>
        </CardHeader>
        <CardContent>
          {endorsementsGiven.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No endorsements given yet</p>
              <p className="text-sm">Help your network grow!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endorsementsGiven.map((endorsement) => (
                <div key={endorsement.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={endorsement.endorserAvatar} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium">Endorsed {endorsement.endorserName}</p>
                        <div className="flex">{renderStars(endorsement.endorsementLevel)}</div>
                      </div>
                      <p className="font-semibold text-blue-600 mb-1">{endorsement.skillName}</p>
                      {endorsement.endorsementText && (
                        <p className="text-sm text-gray-700 mb-2">"{endorsement.endorsementText}"</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(endorsement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}