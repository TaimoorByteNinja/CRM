# LoadingState Component

A reusable loading component that can be used across different pages and tabs in the application.

## Usage

```tsx
import LoadingState from '@/components/LoadingState';

// Basic spinner
<LoadingState text="Loading..." />

// Table skeleton loading
<LoadingState 
  type="table" 
  text="Loading data..." 
  rows={5} 
  columns={4}
/>

// Card skeleton loading
<LoadingState 
  type="cards" 
  text="Loading items..." 
  rows={3}
/>

// Simple skeleton loading
<LoadingState 
  type="skeleton" 
  text="Loading..." 
  rows={10}
/>
```

## Props

- `type`: 'spinner' | 'skeleton' | 'table' | 'cards' (default: 'spinner')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `text`: Loading text to display (default: 'Loading...')
- `className`: Additional CSS classes
- `rows`: Number of skeleton rows (for skeleton, table, cards types)
- `columns`: Number of skeleton columns (for table type)

## Examples

### Bank Page Implementation
The bank page uses LoadingState for all four tabs:
- Bank Accounts: Table skeleton with 5 rows, 5 columns
- Cash in Hand: Table skeleton with 5 rows, 5 columns  
- Cheques: Table skeleton with 5 rows, 6 columns
- Loan Accounts: Table skeleton with 5 rows, 7 columns

### Loading States
Each tab shows a loading skeleton while data is being fetched from the backend, providing a better user experience. 