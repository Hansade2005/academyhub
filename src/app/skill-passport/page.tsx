'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PDFViewer from '@/components/PDFViewer';

export default function SkillPassportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ passportHtml: string; data: any } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState('');

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/generate-skill-passport', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate skill passport');
      }

      const data = await response.json();
      setResult({ passportHtml: data.html, data: data.data });
      toast.success('Skill passport generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate skill passport');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualData.trim()) {
      toast.error('Please enter your information');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('manualData', manualData);

      const response = await fetch('/api/generate-skill-passport', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate skill passport');
      }

      const data = await response.json();
      setResult({ passportHtml: data.html, data: data.data });
      toast.success('Skill passport generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate skill passport');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(selectedFile.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const downloadPassport = () => {
    if (!result) return;

    const blob = new Blob([result.passportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-passport-${result.data.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3A Skill Passport™ Generator</h1>
          <p className="text-xl text-gray-600">Transform your CV into a professional skill passport</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Your Skill Passport
            </CardTitle>
            <CardDescription>
              Upload your CV (PDF or Word) or enter your information manually to create a professional skill passport.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload CV</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv-upload">Select your CV file</Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && (
                    <p className="text-sm text-gray-600">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                {file && file.type === 'application/pdf' && (
                  <div className="space-y-2">
                    <Label>PDF Preview</Label>
                    <PDFViewer file={file} />
                  </div>
                )}
                <Button
                  onClick={handleFileUpload}
                  disabled={!file || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Generate from CV
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-data">Enter your professional information</Label>
                  <Textarea
                    id="manual-data"
                    placeholder="Enter your name, skills, experience, education, and other relevant information..."
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    rows={10}
                    className="min-h-[200px]"
                  />
                </div>
                <Button
                  onClick={handleManualEntry}
                  disabled={!manualData.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Generate from Text
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Skill Passport</span>
                <Button onClick={downloadPassport} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={result.passportHtml}
                  className="w-full h-[600px] border-0"
                  title="Skill Passport Preview"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}