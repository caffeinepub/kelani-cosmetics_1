import { safeConvertToNumber } from './NumericConverter';
import type { Category, Product } from '../backend';

interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
  validatedData: {
    categories: Category[];
    products: Product[];
  };
}

/**
 * Validates and converts imported JSON data to proper ImportData format
 * @param data - Parsed JSON data from import file
 * @returns Validation result with converted data or error message
 */
export function validateImportData(data: any): ValidationResult {
  // Check if data exists
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Datos inválidos: El archivo no contiene un objeto JSON válido',
      validatedData: { categories: [], products: [] },
    };
  }

  // Check required fields
  if (!data.categories || !Array.isArray(data.categories)) {
    return {
      isValid: false,
      errorMessage: 'Campo requerido faltante: "categories" debe ser un array',
      validatedData: { categories: [], products: [] },
    };
  }

  if (!data.products || !Array.isArray(data.products)) {
    return {
      isValid: false,
      errorMessage: 'Campo requerido faltante: "products" debe ser un array',
      validatedData: { categories: [], products: [] },
    };
  }

  // Validate and convert categories
  const validatedCategories: Category[] = [];
  for (let i = 0; i < data.categories.length; i++) {
    const cat = data.categories[i];
    
    // Validate required fields
    if (!cat || typeof cat !== 'object') {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Formato inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (typeof cat.name !== 'string' || cat.name.trim() === '') {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Campo "name" requerido`,
        validatedData: { categories: [], products: [] },
      };
    }

    // Convert numeric fields
    const categoryId = safeConvertToNumber(cat.categoryId);
    const order = safeConvertToNumber(cat.order);
    const createdDate = safeConvertToNumber(cat.createdDate);
    const lastUpdatedDate = safeConvertToNumber(cat.lastUpdatedDate);

    if (categoryId === null || categoryId < 0) {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Campo "categoryId" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (order === null || order < 0) {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Campo "order" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (createdDate === null) {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Campo "createdDate" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (lastUpdatedDate === null) {
      return {
        isValid: false,
        errorMessage: `Categoría ${i + 1}: Campo "lastUpdatedDate" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    validatedCategories.push({
      categoryId: BigInt(categoryId),
      name: cat.name.trim(),
      order: BigInt(order),
      createdDate: BigInt(createdDate),
      lastUpdatedDate: BigInt(lastUpdatedDate),
    });
  }

  // Validate and convert products
  const validatedProducts: Product[] = [];
  for (let i = 0; i < data.products.length; i++) {
    const prod = data.products[i];

    // Validate required fields
    if (!prod || typeof prod !== 'object') {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1}: Formato inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (typeof prod.barcode !== 'string' || prod.barcode.trim() === '') {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1}: Campo "barcode" requerido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (typeof prod.name !== 'string' || prod.name.trim() === '') {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1}: Campo "name" requerido`,
        validatedData: { categories: [], products: [] },
      };
    }

    // Convert numeric fields
    const categoryId = safeConvertToNumber(prod.categoryId);
    const createdDate = safeConvertToNumber(prod.createdDate);
    const lastUpdatedDate = safeConvertToNumber(prod.lastUpdatedDate);

    if (categoryId === null || categoryId < 0) {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "categoryId" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (createdDate === null) {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "createdDate" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (lastUpdatedDate === null) {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "lastUpdatedDate" inválido`,
        validatedData: { categories: [], products: [] },
      };
    }

    // Validate boolean fields
    if (typeof prod.inStock !== 'boolean') {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "inStock" debe ser booleano`,
        validatedData: { categories: [], products: [] },
      };
    }

    if (typeof prod.isFeatured !== 'boolean') {
      return {
        isValid: false,
        errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "isFeatured" debe ser booleano`,
        validatedData: { categories: [], products: [] },
      };
    }

    // Convert optional price
    let price: number | null = null;
    if (prod.price !== null && prod.price !== undefined) {
      price = safeConvertToNumber(prod.price);
      if (price === null || price < 0) {
        return {
          isValid: false,
          errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "price" inválido`,
          validatedData: { categories: [], products: [] },
        };
      }
    }

    // Validate optional description
    let description: string | null = null;
    if (prod.description !== null && prod.description !== undefined) {
      if (typeof prod.description !== 'string') {
        return {
          isValid: false,
          errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "description" debe ser texto`,
          validatedData: { categories: [], products: [] },
        };
      }
      description = prod.description.trim() || null;
    }

    validatedProducts.push({
      barcode: prod.barcode.trim(),
      name: prod.name.trim(),
      categoryId: BigInt(categoryId),
      description: description ? description : undefined,
      price: price !== null ? price : undefined,
      inStock: prod.inStock,
      isFeatured: prod.isFeatured,
      photo: undefined, // Photos are not imported
      createdDate: BigInt(createdDate),
      lastUpdatedDate: BigInt(lastUpdatedDate),
    });
  }

  return {
    isValid: true,
    errorMessage: '',
    validatedData: {
      categories: validatedCategories,
      products: validatedProducts,
    },
  };
}
