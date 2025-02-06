# Product Management Frontend

A modern React-based frontend application for managing products, categories, and materials.

## Features

- Product Management (Create, Read, Update, Delete)
- Category and Material Management
- SKU Validation
- Responsive Design
- Statistics Dashboard
- Filtering and Pagination

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd product-management-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

## Available Scripts

- `npm start`: Run the development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Project Structure

```
src/
  ├── components/        # React components
  ├── redux/            # Redux state management
  │   ├── slices/       # Redux slices
  │   └── store.js      # Redux store configuration
  ├── styles/           # CSS styles
  ├── utils/            # Utility functions
  └── App.js            # Main application component
```

## Key Dependencies

- React
- Redux Toolkit
- Ant Design
- Axios
- Recharts

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |
| REACT_APP_DEFAULT_PAGE_SIZE | Default items per page | 10 |
| REACT_APP_DEFAULT_CURRENCY | Default currency symbol | ₹ |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
