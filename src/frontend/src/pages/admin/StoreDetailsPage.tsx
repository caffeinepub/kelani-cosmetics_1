import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Store, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import StoreDetailsForm from '../../components/admin/store-details/StoreDetailsForm';
import StoreDetailsPreview from '../../components/admin/store-details/StoreDetailsPreview';
import StoreDetailsActions from '../../components/admin/store-details/StoreDetailsActions';
import { useGetStoreDetails, useUpdateStoreDetails } from '../../hooks/useStoreDetailsQueries';
import type { StoreDetails } from '../../hooks/useStoreDetailsQueries';
import { validateStoreDetails } from '../../utils/storeDetailsValidation';
import { safeConvertToNumber } from '../../utils/NumericConverter';
import { reportErrorWithToast } from '../../utils/reportErrorWithToast';
import { stringifyWithBigInt } from '../../utils/BigIntSerializer';

export default function StoreDetailsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'1' | '2'>('1');
  const [formData1, setFormData1] = useState<StoreDetails | null>(null);
  const [formData2, setFormData2] = useState<StoreDetails | null>(null);
  const [originalData1, setOriginalData1] = useState<StoreDetails | null>(null);
  const [originalData2, setOriginalData2] = useState<StoreDetails | null>(null);
  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [errors2, setErrors2] = useState<Record<string, string>>({});

  // Clear query cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['store-details'], exact: false });
    };
  }, [queryClient]);

  // Fetch store details with individual queries
  const store1Query = useGetStoreDetails(1);
  const store2Query = useGetStoreDetails(2);

  // Update mutation
  const updateMutation = useUpdateStoreDetails();

  // Show error toasts for fetch failures
  useEffect(() => {
    if (store1Query.isError && store1Query.error) {
      reportErrorWithToast(
        store1Query.error,
        'Error al cargar los datos de Tienda 1',
        { operation: 'fetchStore1', component: 'StoreDetailsPage' }
      );
    }
  }, [store1Query.isError, store1Query.error]);

  useEffect(() => {
    if (store2Query.isError && store2Query.error) {
      reportErrorWithToast(
        store2Query.error,
        'Error al cargar los datos de Tienda 2',
        { operation: 'fetchStore2', component: 'StoreDetailsPage' }
      );
    }
  }, [store2Query.isError, store2Query.error]);

  // Initialize form data when store data is loaded
  useEffect(() => {
    if (store1Query.data && !formData1) {
      setFormData1(store1Query.data);
      setOriginalData1(store1Query.data);
    }
  }, [store1Query.data, formData1]);

  useEffect(() => {
    if (store2Query.data && !formData2) {
      setFormData2(store2Query.data);
      setOriginalData2(store2Query.data);
    }
  }, [store2Query.data, formData2]);

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

    if (!formData) {
      reportErrorWithToast(
        new Error('No form data'),
        'No hay datos para guardar',
        { operation: 'save', component: 'StoreDetailsPage' }
      );
      return;
    }

    try {
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

      // Save with error handling
      await updateMutation.mutateAsync({
        ...formData,
        latitude,
        longitude,
      });
    } catch (error) {
      reportErrorWithToast(
        error,
        'Error al guardar los datos de la tienda',
        { operation: 'save', component: 'StoreDetailsPage', additionalInfo: { storeId } }
      );
    }
  };

  const handleRestore = (storeId: 1 | 2) => {
    try {
      const originalData = storeId === 1 ? originalData1 : originalData2;
      const setFormData = storeId === 1 ? setFormData1 : setFormData2;
      const setErrors = storeId === 1 ? setErrors1 : setErrors2;

      if (originalData) {
        setFormData({ ...originalData });
        setErrors({});
      }
    } catch (error) {
      reportErrorWithToast(
        error,
        'Error al restaurar los datos originales',
        { operation: 'restore', component: 'StoreDetailsPage', additionalInfo: { storeId } }
      );
    }
  };

  const hasChanges = (storeId: 1 | 2): boolean => {
    const formData = storeId === 1 ? formData1 : formData2;
    const originalData = storeId === 1 ? originalData1 : originalData2;

    if (!formData || !originalData) return false;

    try {
      // Use BigInt-safe serialization for comparison
      return stringifyWithBigInt(formData) !== stringifyWithBigInt(originalData);
    } catch (error) {
      // If serialization fails, report error and treat as no changes to prevent crashes
      reportErrorWithToast(
        error,
        'Error al comparar cambios en el formulario',
        { operation: 'hasChanges', component: 'StoreDetailsPage', additionalInfo: { storeId } }
      );
      return false;
    }
  };

  const handleRetry = (storeId: 1 | 2) => {
    if (storeId === 1) {
      store1Query.refetch();
    } else {
      store2Query.refetch();
    }
  };

  // Render store placeholder with retry
  const renderStorePlaceholder = (storeId: 1 | 2, storeName: string) => {
    const query = storeId === 1 ? store1Query : store2Query;
    const isLoading = query.isLoading;
    const isError = query.isError;

    if (isLoading) {
      return (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg text-muted-foreground">Cargando datos de {storeName}...</p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-card p-12 text-center">
          <div className="space-y-4">
            <p className="text-lg text-destructive">
              No se pudieron cargar los datos de {storeName}
            </p>
            <Button
              onClick={() => handleRetry(storeId)}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render store content
  const renderStoreContent = (storeId: 1 | 2) => {
    const formData = storeId === 1 ? formData1 : formData2;
    const errors = storeId === 1 ? errors1 : errors2;
    const query = storeId === 1 ? store1Query : store2Query;

    // Show placeholder if loading or error
    if (query.isLoading || query.isError) {
      return renderStorePlaceholder(storeId, `Tienda ${storeId}`);
    }

    // Show placeholder if no data
    if (!formData) {
      return (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No hay datos disponibles para Tienda {storeId}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-lg border border-border bg-card">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6">
                <StoreDetailsForm
                  formData={formData}
                  onChange={(field, value) => handleFieldChange(storeId, field, value)}
                  errors={errors}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-card">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6">
                <StoreDetailsPreview formData={formData} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-border bg-card p-4">
          <StoreDetailsActions
            onSave={() => handleSave(storeId)}
            onRestore={() => handleRestore(storeId)}
            isSaving={updateMutation.isPending}
            hasChanges={hasChanges(storeId)}
          />
        </div>
      </div>
    );
  };

  const anyLoading = store1Query.isLoading || store2Query.isLoading;
  const bothFailed = store1Query.isError && store2Query.isError;

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

      {/* Show loading state only if both are loading initially */}
      {anyLoading && !formData1 && !formData2 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg text-muted-foreground">Cargando datos de las tiendas...</p>
          </div>
        </div>
      )}

      {/* Show error state if both failed and no data */}
      {bothFailed && !formData1 && !formData2 && (
        <div className="rounded-lg border border-destructive/50 bg-card p-12 text-center">
          <div className="space-y-4">
            <p className="text-lg text-destructive">
              No se pudieron cargar los datos de las tiendas
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => handleRetry(1)}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar Tienda 1
              </Button>
              <Button
                onClick={() => handleRetry(2)}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar Tienda 2
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(formData1 || formData2) && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as '1' | '2')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="1">Tienda 1</TabsTrigger>
            <TabsTrigger value="2">Tienda 2</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="mt-6">
            {renderStoreContent(1)}
          </TabsContent>

          <TabsContent value="2" className="mt-6">
            {renderStoreContent(2)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
