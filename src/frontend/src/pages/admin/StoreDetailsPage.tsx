import React, { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import StoreDetailsForm from '../../components/admin/store-details/StoreDetailsForm';
import StoreDetailsPreview from '../../components/admin/store-details/StoreDetailsPreview';
import StoreDetailsActions from '../../components/admin/store-details/StoreDetailsActions';
import { useGetStoreDetails, useUpdateStoreDetails } from '../../hooks/useStoreDetailsQueries';
import type { StoreDetails } from '../../hooks/useStoreDetailsQueries';
import { validateStoreDetails } from '../../utils/storeDetailsValidation';
import { safeConvertToNumber } from '../../utils/NumericConverter';
import { reportErrorWithToast } from '../../utils/reportErrorWithToast';

export default function StoreDetailsPage() {
  const [activeTab, setActiveTab] = useState<'1' | '2'>('1');
  const [formData1, setFormData1] = useState<StoreDetails | null>(null);
  const [formData2, setFormData2] = useState<StoreDetails | null>(null);
  const [originalData1, setOriginalData1] = useState<StoreDetails | null>(null);
  const [originalData2, setOriginalData2] = useState<StoreDetails | null>(null);
  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [errors2, setErrors2] = useState<Record<string, string>>({});

  // Fetch store details
  const { data: store1Data, isLoading: isLoading1, isFetched: isFetched1 } = useGetStoreDetails(1);
  const { data: store2Data, isLoading: isLoading2, isFetched: isFetched2 } = useGetStoreDetails(2);

  // Update mutation
  const updateMutation = useUpdateStoreDetails();

  // Initialize form data when store data is loaded
  useEffect(() => {
    if (store1Data && !formData1) {
      setFormData1(store1Data);
      setOriginalData1(store1Data);
    }
  }, [store1Data, formData1]);

  useEffect(() => {
    if (store2Data && !formData2) {
      setFormData2(store2Data);
      setOriginalData2(store2Data);
    }
  }, [store2Data, formData2]);

  // Update original data after successful save
  useEffect(() => {
    if (updateMutation.isSuccess && updateMutation.data) {
      if (updateMutation.data.storeId === 1) {
        setOriginalData1(updateMutation.data);
      } else if (updateMutation.data.storeId === 2) {
        setOriginalData2(updateMutation.data);
      }
    }
  }, [updateMutation.isSuccess, updateMutation.data]);

  const handleFieldChange = (storeId: 1 | 2, field: string, value: any) => {
    const setFormData = storeId === 1 ? setFormData1 : setFormData2;
    const formData = storeId === 1 ? formData1 : formData2;

    if (!formData) return;

    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error for this field
    const setErrors = storeId === 1 ? setErrors1 : setErrors2;
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSave = async (storeId: 1 | 2) => {
    const formData = storeId === 1 ? formData1 : formData2;
    const setErrors = storeId === 1 ? setErrors1 : setErrors2;

    if (!formData) return;

    // Convert coordinates to numbers
    const latitude = safeConvertToNumber(formData.latitude);
    const longitude = safeConvertToNumber(formData.longitude);

    if (latitude === null || longitude === null) {
      reportErrorWithToast(
        new Error('Invalid coordinates'),
        'Las coordenadas deben ser números válidos'
      );
      return;
    }

    // Prepare data for validation
    const dataToValidate = {
      ...formData,
      latitude,
      longitude,
    };

    // Validate
    const validation = validateStoreDetails(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      reportErrorWithToast(
        new Error('Validation failed'),
        'Por favor, corrija los errores en el formulario'
      );
      return;
    }

    // Clear errors
    setErrors({});

    // Save
    await updateMutation.mutateAsync({
      ...formData,
      latitude,
      longitude,
    });
  };

  const handleRestore = (storeId: 1 | 2) => {
    const originalData = storeId === 1 ? originalData1 : originalData2;
    const setFormData = storeId === 1 ? setFormData1 : setFormData2;
    const setErrors = storeId === 1 ? setErrors1 : setErrors2;

    if (originalData) {
      setFormData({ ...originalData });
      setErrors({});
    }
  };

  const hasChanges = (storeId: 1 | 2): boolean => {
    const formData = storeId === 1 ? formData1 : formData2;
    const originalData = storeId === 1 ? originalData1 : originalData2;

    if (!formData || !originalData) return false;

    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const isLoading = isLoading1 || isLoading2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Datos de Tienda
          </h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus dos tiendas
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg text-muted-foreground">Cargando datos de las tiendas...</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isLoading && formData1 && formData2 && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '1' | '2')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="1">Tienda 1</TabsTrigger>
            <TabsTrigger value="2">Tienda 2</TabsTrigger>
          </TabsList>

          {/* Store 1 Tab */}
          <TabsContent value="1" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Form */}
              <div className="rounded-lg border border-border bg-card">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-6">
                    <StoreDetailsForm
                      formData={formData1}
                      onChange={(field, value) => handleFieldChange(1, field, value)}
                      errors={errors1}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-border bg-card">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-6">
                    <StoreDetailsPreview formData={formData1} />
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-border bg-card p-4">
              <StoreDetailsActions
                onSave={() => handleSave(1)}
                onRestore={() => handleRestore(1)}
                isSaving={updateMutation.isPending}
                hasChanges={hasChanges(1)}
              />
            </div>
          </TabsContent>

          {/* Store 2 Tab */}
          <TabsContent value="2" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Form */}
              <div className="rounded-lg border border-border bg-card">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-6">
                    <StoreDetailsForm
                      formData={formData2}
                      onChange={(field, value) => handleFieldChange(2, field, value)}
                      errors={errors2}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-border bg-card">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-6">
                    <StoreDetailsPreview formData={formData2} />
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-border bg-card p-4">
              <StoreDetailsActions
                onSave={() => handleSave(2)}
                onRestore={() => handleRestore(2)}
                isSaving={updateMutation.isPending}
                hasChanges={hasChanges(2)}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
