# my-stad (WIP)

my-stad is a personal home dashboard designed to aggregate smart home controls and local information into a single interface. It provides real-time data on electricity prices, weather conditions, public transport schedules, and waste collection, alongside controls for smart lighting.

## Technologies

The project is built using this stack:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualization**: [Visx](https://airbnb.io/visx/) for data charts and graphs

## Integrations

This dashboard aggregates data and provides control via the following integrations:

### Smart Home

- **IKEA Dirigera**: Integration with the IKEA Dirigera hub for controlling smart lights.

### Local Services (Norway)

- **Electricity Prices**: Fetches real-time and historical electricity spot prices via the [Hva Koster Strømmen](https://www.hvakosterstrommen.no/) API.
- **Public Transport**: Real-time departure information and journey planning powered by the [Entur](https://developer.entur.org/) GraphQL API.
- **Weather**: Weather forecasts and precipitation data from [MET Norway](https://api.met.no/) (Meteorologisk institutt).
- **Waste Collection**: Trash pickup schedules with data from [Trondheim Renholdsverk](https://trv.no/).
