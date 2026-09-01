import { useState } from 'react';
import AppRouter from './AppRouter';
import DisclaimerPopup from './components/DisclaimerPopup';

export default function App() {
  const [agreed, setAgreed] = useState(false);

  if (!agreed) {
    return (
      <DisclaimerPopup
        onAgree={() => {
          setAgreed(true);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return <AppRouter />;
}
