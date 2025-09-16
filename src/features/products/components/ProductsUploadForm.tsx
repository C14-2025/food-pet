'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadProductsCsv } from '@/lib/api/product';
import { Upload } from 'lucide-react';

interface ProductsUploadFormProps {
  onSuccess: () => void;
}

export function ProductsUploadForm({ onSuccess }: ProductsUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecione um arquivo CSV');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadProductsCsv(file);
      setSuccess(`${result.inserted} produtos foram importados com sucesso!`);
      setFile(null);
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar produtos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Importar Produtos via CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='csvFile'>Arquivo CSV</Label>
            <Input id='csvFile' type='file' accept='.csv' onChange={handleFileChange} disabled={uploading} />
            <p className='text-sm text-muted-foreground'>O arquivo deve conter as colunas: name, price, image</p>
          </div>

          {error && <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>{error}</div>}

          {success && <div className='text-sm text-green-600 bg-green-50 p-3 rounded-md'>{success}</div>}

          <Button type='submit' disabled={!file || uploading} className='w-full'>
            {uploading ? 'Importando...' : 'Importar Produtos'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
