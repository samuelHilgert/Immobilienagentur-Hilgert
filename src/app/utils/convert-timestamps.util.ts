export function convertTimestampsToDates(obj: any): any {
    if (obj == null || typeof obj !== 'object') return obj;
  
    if (Array.isArray(obj)) {
      return obj.map(convertTimestampsToDates);
    }
  
    const result: any = {};
  
    for (const key of Object.keys(obj)) {
      const value = obj[key];
  
      if (value && typeof value.toDate === 'function') {
        result[key] = value.toDate();
      } else if (typeof value === 'object') {
        result[key] = convertTimestampsToDates(value);
      } else {
        result[key] = value;
      }
    }
  
    return result;
  }
  