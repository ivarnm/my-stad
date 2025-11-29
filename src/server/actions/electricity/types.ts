export interface HourlyElectricityPrice {
  time: Date; // for one hour period starting at this time
  pricePerKWh: number; // Price in NOK per kWh including VAT
  priceWithSubsidy: number; // Price after subsidy in NOK per kWh
}

export interface ElectricityPrices {
  today: HourlyElectricityPrice[];
  tomorrow?: HourlyElectricityPrice[];
}
