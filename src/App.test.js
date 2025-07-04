import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  const signInElement = screen.getByText(/Sign In/i);
  expect(signInElement).toBeInTheDocument();
});