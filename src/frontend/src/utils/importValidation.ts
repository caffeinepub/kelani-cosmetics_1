import { safeConvertToNumber } from './NumericConverter';
import { isValidBigIntString, safeStringToBigInt } from './BigIntSerializer';
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
 * Validates a timestamp field and converts it to BigInt
 * @param value - The timestamp value (bigint, number, or string)
 * @param fieldName - Name of the field for error messages
 * @param recordType - Type of record (e.g., "Categoría", "Producto")
 * @param recordIndex - Index of the record for error messages
 * @returns BigInt value or throws validation error
 */
function validateTimestamp(
  value: any,
  fieldName: string,
  recordType: string,
  recordIndex: number
): bigint {
  // Handle BigInt values
  if (typeof value === 'bigint') {
    if (value <= 0n) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" debe ser mayor que 0`
      );
    }
    return value;
  }

  // Handle number values - check for precision loss
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" es demasiado grande y puede perder precisión. ` +
        'Los timestamps deben representarse como strings en el JSON para evitar pérdida de precisión.'
      );
    }
    if (value <= 0) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" debe ser mayor que 0`
      );
    }
    return BigInt(Math.floor(value));
  }

  // Handle string values
  if (typeof value === 'string') {
    if (!isValidBigIntString(value)) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" contiene un valor no numérico: "${value}"`
      );
    }
    const bigIntValue = safeStringToBigInt(value);
    if (bigIntValue === null) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" no se puede convertir a timestamp`
      );
    }
    if (bigIntValue <= 0n) {
      throw new Error(
        `${recordType} ${recordIndex}: Campo "${fieldName}" debe ser mayor que 0`
      );
    }
    return bigIntValue;
  }

  // Invalid type
  throw new Error(
    `${recordType} ${recordIndex}: Campo "${fieldName}" tiene un tipo inválido (${typeof value})`
  );
}

/**
 * Validates and converts imported JSON data to proper ImportData format
 * @param data - Parsed JSON data from import file
 * @returns Validation result with converted data or error message
 */
export function validateImportData(data: any): ValidationResult {
  try {
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

      // Convert non-timestamp numeric fields (categoryId, order)
      const categoryId = safeConvertToNumber(cat.categoryId);
      const order = safeConvertToNumber(cat.order);

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

      // Validate timestamp fields as BigInt
      let createdDate: bigint;
      let lastUpdatedDate: bigint;

      try {
        createdDate = validateTimestamp(cat.createdDate, 'createdDate', 'Categoría', i + 1);
        lastUpdatedDate = validateTimestamp(cat.lastUpdatedDate, 'lastUpdatedDate', 'Categoría', i + 1);
      } catch (error: any) {
        return {
          isValid: false,
          errorMessage: error.message,
          validatedData: { categories: [], products: [] },
        };
      }

      validatedCategories.push({
        categoryId: BigInt(categoryId),
        name: cat.name.trim(),
        order: BigInt(order),
        createdDate,
        lastUpdatedDate,
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

      // Convert non-timestamp numeric field (categoryId)
      const categoryId = safeConvertToNumber(prod.categoryId);

      if (categoryId === null || categoryId < 0) {
        return {
          isValid: false,
          errorMessage: `Producto ${i + 1} (${prod.barcode}): Campo "categoryId" inválido`,
          validatedData: { categories: [], products: [] },
        };
      }

      // Validate timestamp fields as BigInt
      let createdDate: bigint;
      let lastUpdatedDate: bigint;

      try {
        createdDate = validateTimestamp(prod.createdDate, 'createdDate', 'Producto', i + 1);
        lastUpdatedDate = validateTimestamp(prod.lastUpdatedDate, 'lastUpdatedDate', 'Producto', i + 1);
      } catch (error: any) {
        return {
          isValid: false,
          errorMessage: error.message,
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

      // Convert optional price (non-timestamp numeric field)
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
        createdDate,
        lastUpdatedDate,
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
  } catch (error: any) {
    return {
      isValid: false,
      errorMessage: error.message || 'Error desconocido durante la validación',
      validatedData: { categories: [], products: [] },
    };
  }
}
