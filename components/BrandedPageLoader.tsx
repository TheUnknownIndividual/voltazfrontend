import React from 'react';

const BrandedPageLoader: React.FC = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-white"
    role="status"
    aria-label="Volt.az"
  >
    <img
      src="/volt-logo-test.png"
      alt="Volt.az"
      width="112"
      height="112"
      className="branded-page-loader-logo h-20 w-20 object-contain md:h-28 md:w-28"
    />
  </div>
);

export default BrandedPageLoader;
