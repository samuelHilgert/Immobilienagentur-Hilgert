// Unterschied util zu factory => kein komplexes Objekt was z.B. in firebase genutzt wird. Es ist nur einfach z.B. fürs Übersetzen eines Wertes. Gibt also nur einen Wert zurück

export function mapMarketingType(code: string): string {
  switch ((code || '').toUpperCase()) {
    case 'PURCHASE':
      return 'Kauf';
    case 'RENT':
      return 'Miete';
    case 'LEASEHOLD':
      return 'Erbpacht';
    default:
      return 'Kauf';
  }
}
