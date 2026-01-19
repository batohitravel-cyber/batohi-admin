'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { BULK_IMPORT_CONFIG } from '@/lib/bulk-import-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkImportDialogProps {
    configKey: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export default function BulkImportDialog({ configKey, onSuccess, trigger }: BulkImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<{ total: number; current: number; success: number; failed: number } | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const config = BULK_IMPORT_CONFIG[configKey];

    if (!config) {
        return null;
    }

    const handleDownloadTemplate = () => {
        const csv = Papa.unparse(config.demoData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${configKey}_template.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrors([]);
            setProgress(null);
        }
    };

    const processFile = () => {
        if (!file) return;

        setUploading(true);
        setErrors([]);
        setProgress({ total: 0, current: 0, success: 0, failed: 0 });

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;
                const total = rows.length;
                let successCount = 0;
                let failedCount = 0;
                const errorMessages: string[] = [];

                setProgress({ total, current: 0, success: 0, failed: 0 });

                // Process in batches of 10 to avoid overwhelming Supabase
                const batchSize = 10;
                for (let i = 0; i < total; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);

                    const recordsToInsert = batch.map((row: any) => {
                        try {
                            return config.transform ? config.transform(row) : row;
                        } catch (err: any) {
                            failedCount++;
                            errorMessages.push(`Row ${i + 1} transform error: ${err.message}`);
                            return null;
                        }
                    }).filter(Boolean);

                    if (recordsToInsert.length > 0) {
                        const { error } = await supabase.from(config.table).insert(recordsToInsert);

                        if (error) {
                            failedCount += recordsToInsert.length;
                            errorMessages.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
                        } else {
                            successCount += recordsToInsert.length;
                        }
                    }

                    setProgress({
                        total,
                        current: Math.min(i + batchSize, total),
                        success: successCount,
                        failed: failedCount
                    });
                }

                setUploading(false);
                setErrors(errorMessages);

                if (successCount > 0 && onSuccess) {
                    onSuccess();
                }

                if (failedCount === 0 && successCount > 0) {
                    // Auto close on full success after a short delay
                    setTimeout(() => {
                        setOpen(false);
                        setFile(null);
                        setProgress(null);
                    }, 2000);
                }
            },
            error: (error) => {
                setUploading(false);
                setErrors([`CSV Parse Error: ${error.message}`]);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Bulk Import
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import: {config.label}</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add multiple {config.label.toLowerCase()} at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <FileUp className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm text-foreground font-medium">
                                {file ? file.name : "Drag and drop or click to upload CSV"}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csv-upload"
                            />
                            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                                {file ? "Change File" : "Select File"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Need the format?</span>
                        <Button variant="link" size="sm" onClick={handleDownloadTemplate} className="h-auto p-0">
                            <Download className="mr-2 h-3 w-3" /> Download Template
                        </Button>
                    </div>

                    {progress && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                {progress.success} success, {progress.failed} failed
                            </p>
                        </div>
                    )}

                    {errors.length > 0 && (
                        <Alert variant="destructive" className="max-h-[150px] overflow-y-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Import Errors</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-4 text-xs">
                                    {errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {progress?.failed === 0 && progress?.success > 0 && !uploading && (
                        <Alert className="border-green-500 text-green-600">
                            <CheckCircle className="h-4 w-4" color="green" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>All records imported successfully!</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={processFile} disabled={!file || uploading}>
                        {uploading ? 'Importing...' : 'Start Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
